import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { GoldStandardExample } from "@/lib/types";

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await params;
    const body = (await request.json()) as Partial<GoldStandardExample>;
    const updates: Record<string, unknown> = {};
    for (const key of ["title", "platform", "topic", "subtopic", "audience", "content_type", "hook", "full_content", "cta", "collection", "why_gold_standard", "notes", "status", "metadata"]) {
      if (key in body) updates[key] = (body as Record<string, unknown>)[key];
    }
    if ("tags" in body) updates.tags = asStringArray(body.tags);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("gold_standard_examples")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ example: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update Gold Standard example." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("gold_standard_examples").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete Gold Standard example." }, { status: 500 });
  }
}
