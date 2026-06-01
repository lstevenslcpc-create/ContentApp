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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const fields = [
      "template_name",
      "canva_template_link",
      "format_type",
      "dimensions",
      "aesthetic_vibe",
      "color_palette",
      "font_style",
      "graphic_style",
      "best_use_case",
      "audience_fit",
      "content_pillar_fit",
      "notes"
    ];

    fields.forEach((field) => {
      if (field in body) updates[field] = String(body[field] || "").trim() || null;
    });

    if (Array.isArray(body.recommended_for)) updates.recommended_for = body.recommended_for.map(String);
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

    if (error) throw error;
    return NextResponse.json({ ok: true, template: data });
  } catch (error) {
    console.error("[canva-templates][PATCH]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
