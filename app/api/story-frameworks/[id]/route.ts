import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { StoryFramework } from "@/lib/types";

function asArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await params;
    const body = await request.json() as Partial<StoryFramework>;
    const updates: Record<string, unknown> = {};
    for (const key of ["framework_name", "purpose", "when_to_use", "writing_rhythm", "psychological_goal", "emotional_destination", "paragraph_rhythm", "sentence_rhythm", "education_level", "emotion_level", "curiosity_level", "story_level", "therapist_insight_level", "saveability_score", "shareability_score", "status"]) {
      if (key in body) updates[key] = (body as Record<string, unknown>)[key];
    }
    for (const key of ["best_platforms", "best_content_types", "typical_hook_styles", "example_gold_standard_posts"]) {
      if (key in body) updates[key] = asArray((body as Record<string, unknown>)[key]);
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("story_frameworks").update(updates).eq("id", id).eq("user_id", user.id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ framework: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update Story Framework." }, { status: 500 });
  }
}
