import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

const futureCanvaFields = [
  "canva_template_id",
  "content_type",
  "platform_size",
  "number_of_slides",
  "visual_style_notes",
  "slide_structure_rules",
  "canva_design_id",
  "canva_design_url",
  "canva_autofill_enabled",
  "placeholder_mapping"
];

function isMissingFutureColumn(error: unknown) {
  const message = errorMessage(error).toLowerCase();
  return futureCanvaFields.some((field) => message.includes(field.toLowerCase())) || message.includes("schema cache");
}

function withoutFutureFields(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !futureCanvaFields.includes(key)));
}

function templateRow(body: Record<string, unknown>, userId: string) {
  const numberOfSlides = Number(body.number_of_slides || body.numberOfSlides || 0);
  return {
    user_id: userId,
    canva_template_id: String(body.canva_template_id || body.canvaTemplateId || "").trim() || null,
    template_name: String(body.template_name || body.templateName || "").trim(),
    canva_template_link: String(body.canva_template_link || body.canvaTemplateLink || "").trim(),
    content_type: String(body.content_type || body.contentType || "").trim() || null,
    format_type: String(body.format_type || body.formatType || "Instagram carousel").trim(),
    dimensions: String(body.dimensions || "").trim() || null,
    platform_size: String(body.platform_size || body.platformSize || body.dimensions || "").trim() || null,
    number_of_slides: Number.isFinite(numberOfSlides) && numberOfSlides > 0 ? numberOfSlides : null,
    aesthetic_vibe: String(body.aesthetic_vibe || body.aestheticVibe || "").trim() || null,
    visual_style_notes: String(body.visual_style_notes || body.visualStyleNotes || "").trim() || null,
    color_palette: String(body.color_palette || body.colorPalette || "").trim() || null,
    font_style: String(body.font_style || body.fontStyle || "").trim() || null,
    graphic_style: String(body.graphic_style || body.graphicStyle || "").trim() || null,
    best_use_case: String(body.best_use_case || body.bestUseCase || "").trim() || null,
    audience_fit: String(body.audience_fit || body.audienceFit || "").trim() || null,
    content_pillar_fit: String(body.content_pillar_fit || body.contentPillarFit || "").trim() || null,
    slide_structure_rules: typeof body.slide_structure_rules === "object" && body.slide_structure_rules !== null ? body.slide_structure_rules : {},
    canva_design_id: String(body.canva_design_id || body.canvaDesignId || "").trim() || null,
    canva_design_url: String(body.canva_design_url || body.canvaDesignUrl || "").trim() || null,
    canva_autofill_enabled: Boolean(body.canva_autofill_enabled || body.canvaAutofillEnabled),
    placeholder_mapping: typeof body.placeholder_mapping === "object" && body.placeholder_mapping !== null ? body.placeholder_mapping : {},
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

    if (error && isMissingFutureColumn(error)) {
      const fallback = await supabase
        .from("canva_templates")
        .insert({ ...withoutFutureFields(row), notes: String(body.notes || "").trim() || null })
        .select("*")
        .single();
      if (fallback.error) throw fallback.error;
      return NextResponse.json({
        ok: true,
        template: fallback.data,
        warning: "Template saved, but the latest Canva metadata columns are missing in Supabase. Run the Canva template migration to store API-ready fields."
      });
    }

    if (error) throw error;
    return NextResponse.json({ ok: true, template: data });
  } catch (error) {
    console.error("[canva-templates][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
