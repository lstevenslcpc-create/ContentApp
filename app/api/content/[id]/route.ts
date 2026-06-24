import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

async function paramsId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const body = await request.json();

    if (typeof body.archived !== "boolean") {
      return NextResponse.json({ ok: false, error: "archived boolean is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("generated_content")
      .update({ archived: body.archived })
      .eq("user_id", user.id)
      .eq("id", id)
      .select("*")
      .single();

    if (error && /archived/i.test(error.message || "")) {
      const fallback = await supabase
        .from("generated_content")
        .update({ canva_template_id: body.archived ? "__archived__" : null })
        .eq("user_id", user.id)
        .eq("id", id)
        .select("*")
        .single();

      if (fallback.error) throw fallback.error;
      return NextResponse.json({
        ok: true,
        item: { ...fallback.data, archived: body.archived },
        warning: "Using compatibility archive storage. Add generated_content.archived in Supabase for the permanent schema."
      });
    }

    if (error) throw error;
    return NextResponse.json({ ok: true, item: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const supabase = getSupabaseAdmin();

    const { data: generatedItem } = await supabase
      .from("generated_content")
      .select("content_pack_id")
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();

    const { data: relatedPacks, error: relatedError } = await supabase
      .from("content_packs")
      .select("id")
      .eq("user_id", user.id)
      .contains("metadata", { generatedContentId: id });

    if (relatedError) throw relatedError;
    const directPackId = typeof generatedItem?.content_pack_id === "string" ? generatedItem.content_pack_id : "";
    const relatedPackIds = Array.from(new Set([
      directPackId,
      ...(relatedPacks || []).map((pack) => pack.id)
    ].filter(Boolean)));

    if (relatedPackIds.length) {
      const { error: calendarError } = await supabase
        .from("content_calendar_plans")
        .update({ content_pack_id: null })
        .eq("user_id", user.id)
        .in("content_pack_id", relatedPackIds);

      if (calendarError) throw calendarError;

      const { error: packDeleteError } = await supabase
        .from("content_packs")
        .delete()
        .eq("user_id", user.id)
        .in("id", relatedPackIds);

      if (packDeleteError) throw packDeleteError;
    }

    const { error } = await supabase
      .from("generated_content")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true, deletedRelatedContentPacks: relatedPackIds.length });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
