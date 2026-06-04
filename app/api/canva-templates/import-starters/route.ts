import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { CANVA_TEMPLATES, type CanvaTemplateRegistryItem } from "@/lib/canvaTemplates";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function registryNotes(template: CanvaTemplateRegistryItem) {
  return [
    template.description,
    "",
    `Registry ID: ${template.id}`,
    `Platforms: ${template.platforms.join(", ")}`,
    `Template fields: ${template.fields.join(", ")}`
  ].join("\n");
}

function rowFromTemplate(template: CanvaTemplateRegistryItem, userId: string) {
  return {
    user_id: userId,
    template_name: template.name,
    canva_template_link: template.template_url,
    format_type: template.type,
    dimensions: template.type === "Reel cover" ? "1080x1920" : template.type === "Pinterest pin" || template.type === "Blog graphic" ? "1000x1500" : "1080x1350",
    aesthetic_vibe: "LionHeart-approved, calming, premium, emotionally intelligent",
    color_palette: "muted navy, soft cream, sage, muted gold",
    font_style: "clean readable body type with warm editorial headings",
    graphic_style: "soft rounded layouts, minimal clutter, therapy-informed visual hierarchy",
    best_use_case: template.best_for.join(", "),
    audience_fit: template.audience.join(", "),
    content_pillar_fit: template.content_pillars.join(", "),
    recommended_for: template.best_for,
    approval_status: "approved",
    notes: registryNotes(template)
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("canva_templates")
      .select("id, template_name, canva_template_link")
      .eq("user_id", user.id);

    if (existingError) throw existingError;

    const existingKeys = new Set((existing || []).flatMap((template) => [
      String(template.canva_template_link || "").trim(),
      String(template.template_name || "").trim()
    ]));

    const rows = CANVA_TEMPLATES
      .filter((template) => !existingKeys.has(template.template_url) && !existingKeys.has(template.name))
      .map((template) => rowFromTemplate(template, user.id));

    if (!rows.length) {
      return NextResponse.json({
        ok: true,
        imported: 0,
        skipped: CANVA_TEMPLATES.length,
        templates: [],
        message: "All approved starter templates are already in your Canva Template Library."
      });
    }

    const { data, error } = await supabase
      .from("canva_templates")
      .insert(rows)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      imported: data?.length || 0,
      skipped: CANVA_TEMPLATES.length - (data?.length || 0),
      templates: data || [],
      message: `Imported ${data?.length || 0} approved starter template${(data?.length || 0) === 1 ? "" : "s"}.`
    });
  } catch (error) {
    console.error("[canva-templates][import-starters]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
