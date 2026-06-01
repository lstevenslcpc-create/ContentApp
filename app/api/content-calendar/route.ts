import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const allowedStatuses = new Set(["idea", "draft", "needs_review", "approved", "scheduled", "posted", "failed"]);

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function dateOrToday(value: unknown) {
  const text = String(value || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);

    const [generatedContent, packs, plans, focuses] = await Promise.all([
      supabase
        .from("generated_content")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("content_packs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(80),
      supabase
        .from("content_calendar_plans")
        .select("*, content_pack:content_packs(*)")
        .eq("user_id", user.id)
        .gte("planned_date", from)
        .lte("planned_date", to)
        .order("planned_date", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("content_calendar_focuses")
        .select("*")
        .eq("user_id", user.id)
        .gte("week_start", from)
        .lte("week_start", to)
        .order("week_start", { ascending: true })
    ]);

    if (generatedContent.error) throw generatedContent.error;

    const warnings = [packs.error, plans.error, focuses.error]
      .filter(Boolean)
      .map((error) => error?.message || "Calendar planner table is not available yet.");

    return NextResponse.json({
      items: generatedContent.data || [],
      packs: packs.error ? [] : packs.data || [],
      plans: plans.error ? [] : plans.data || [],
      focuses: focuses.error ? [] : focuses.data || [],
      warnings
    });
  } catch (error) {
    console.error("[content-calendar][GET]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: errorMessage(error) || "Unable to load calendar." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    const action = body.action || "plan";
    const supabase = getSupabaseAdmin();

    if (action === "focus") {
      const weekStart = dateOrToday(body.weekStart);
      const focus = String(body.focus || "").trim();
      const { data, error } = await supabase
        .from("content_calendar_focuses")
        .upsert({
          user_id: user.id,
          week_start: weekStart,
          focus
        }, { onConflict: "user_id,week_start" })
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, focus: data });
    }

    if (action === "status") {
      const planId = String(body.planId || "");
      const status = String(body.status || "");
      if (!planId) return NextResponse.json({ ok: false, error: "Calendar plan id is required." }, { status: 400 });
      if (!allowedStatuses.has(status)) return NextResponse.json({ ok: false, error: "Unsupported calendar status." }, { status: 400 });

      const { data, error } = await supabase
        .from("content_calendar_plans")
        .update({ status })
        .eq("user_id", user.id)
        .eq("id", planId)
        .select("*, content_pack:content_packs(*)")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, plan: data });
    }

    const contentPackId = String(body.contentPackId || "");
    const plannedDate = dateOrToday(body.plannedDate);
    const status = String(body.status || "idea");
    if (!contentPackId) return NextResponse.json({ ok: false, error: "Choose a saved content pack to add to the calendar." }, { status: 400 });
    if (!allowedStatuses.has(status)) return NextResponse.json({ ok: false, error: "Unsupported calendar status." }, { status: 400 });

    const { data, error } = await supabase
      .from("content_calendar_plans")
      .insert({
        user_id: user.id,
        content_pack_id: contentPackId,
        planned_date: plannedDate,
        status,
        campaign_label: String(body.campaignLabel || "").trim() || null,
        focus_label: String(body.focusLabel || "").trim() || null,
        seasonal_prompt: String(body.seasonalPrompt || "").trim() || null,
        notes: String(body.notes || "").trim() || null
      })
      .select("*, content_pack:content_packs(*)")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, plan: data });
  } catch (error) {
    console.error("[content-calendar][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) || "Unable to save calendar plan." }, { status: 500 });
  }
}
