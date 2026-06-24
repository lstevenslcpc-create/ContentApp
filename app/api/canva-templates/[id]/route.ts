import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const allowedStatuses = new Set(["draft", "approved", "archived"]);

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const fields = [
      "canva_template_id",
      "template_name",
      "canva_template_link",
      "content_type",
      "format_type",
      "dimensions",
      "platform_size",
      "aesthetic_vibe",
      "visual_style_notes",
      "color_palette",
      "font_style",
      "graphic_style",
      "best_use_case",
      "audience_fit",
      "content_pillar_fit",
      "canva_design_id",
      "canva_design_url",
      "notes"
    ];

    fields.forEach((field) => {
      if (field in body) updates[field] = String(body[field] || "").trim() || null;
    });

    if (Array.isArray(body.recommended_for)) updates.recommended_for = body.recommended_for.map(String);
    if ("number_of_slides" in body) {
      const numberOfSlides = Number(body.number_of_slides || 0);
      updates.number_of_slides = Number.isFinite(numberOfSlides) && numberOfSlides > 0 ? numberOfSlides : null;
    }
    if ("slide_structure_rules" in body && typeof body.slide_structure_rules === "object" && body.slide_structure_rules !== null) {
      updates.slide_structure_rules = body.slide_structure_rules;
    }
    if ("placeholder_mapping" in body && typeof body.placeholder_mapping === "object" && body.placeholder_mapping !== null) {
      updates.placeholder_mapping = body.placeholder_mapping;
    }
    if ("canva_autofill_enabled" in body) updates.canva_autofill_enabled = Boolean(body.canva_autofill_enabled);
    if (body.approval_status) {
      if (!allowedStatuses.has(String(body.approval_status))) return NextResponse.json({ ok: false, error: "Unsupported template status." }, { status: 400 });
      updates.approval_status = body.approval_status;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("canva_templates")
      .update(updates)
      .eq("user_id", user.id)
      .eq("id", id)
      .select("*")
      .single();

    if (error && isMissingFutureColumn(error)) {
      const fallback = await supabase
        .from("canva_templates")
        .update(withoutFutureFields(updates))
        .eq("user_id", user.id)
        .eq("id", id)
        .select("*")
        .single();
      if (fallback.error) throw fallback.error;
      return NextResponse.json({
        ok: true,
        template: fallback.data,
        warning: "Template updated, but the latest Canva metadata columns are missing in Supabase. Run the Canva template migration to store API-ready fields."
      });
    }

    if (error) throw error;
    return NextResponse.json({ ok: true, template: data });
  } catch (error) {
    console.error("[canva-templates][PATCH]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
