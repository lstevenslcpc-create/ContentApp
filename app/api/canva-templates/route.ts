import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function templateRow(body: Record<string, unknown>, userId: string) {
  return {
    user_id: userId,
    template_name: String(body.template_name || body.templateName || "").trim(),
    canva_template_link: String(body.canva_template_link || body.canvaTemplateLink || "").trim(),
    format_type: String(body.format_type || body.formatType || "Instagram carousel").trim(),
    dimensions: String(body.dimensions || "").trim() || null,
    aesthetic_vibe: String(body.aesthetic_vibe || body.aestheticVibe || "").trim() || null,
    color_palette: String(body.color_palette || body.colorPalette || "").trim() || null,
    font_style: String(body.font_style || body.fontStyle || "").trim() || null,
    graphic_style: String(body.graphic_style || body.graphicStyle || "").trim() || null,
    best_use_case: String(body.best_use_case || body.bestUseCase || "").trim() || null,
    audience_fit: String(body.audience_fit || body.audienceFit || "").trim() || null,
    content_pillar_fit: String(body.content_pillar_fit || body.contentPillarFit || "").trim() || null,
    recommended_for: Array.isArray(body.recommended_for) ? body.recommended_for.map(String) : Array.isArray(body.recommendedFor) ? body.recommendedFor.map(String) : [],
    approval_status: String(body.approval_status || body.approvalStatus || "draft")
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("canva_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (status && status !== "all") query = query.eq("approval_status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true, templates: data || [] });
  } catch (error) {
    console.error("[canva-templates][GET]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    const row = templateRow(body, user.id);
    if (!row.template_name || !row.canva_template_link) {
      return NextResponse.json({ ok: false, error: "Template name and Canva template link are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("canva_templates")
      .insert({ ...row, notes: String(body.notes || "").trim() || null })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, template: data });
  } catch (error) {
    console.error("[canva-templates][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
