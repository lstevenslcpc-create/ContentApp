import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { StoryFramework } from "@/lib/types";

function asArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function payload(body: Partial<StoryFramework>, userId: string) {
  if (!body.framework_name?.trim()) throw new Error("Framework name is required.");
  return {
    user_id: userId,
    framework_name: body.framework_name.trim(),
    purpose: body.purpose || null,
    when_to_use: body.when_to_use || null,
    best_platforms: asArray(body.best_platforms),
    best_content_types: asArray(body.best_content_types),
    writing_rhythm: body.writing_rhythm || null,
    psychological_goal: body.psychological_goal || null,
    emotional_destination: body.emotional_destination || null,
    typical_hook_styles: asArray(body.typical_hook_styles),
    paragraph_rhythm: body.paragraph_rhythm || null,
    sentence_rhythm: body.sentence_rhythm || null,
    education_level: body.education_level ?? null,
    emotion_level: body.emotion_level ?? null,
    curiosity_level: body.curiosity_level ?? null,
    story_level: body.story_level ?? null,
    therapist_insight_level: body.therapist_insight_level ?? null,
    saveability_score: body.saveability_score ?? null,
    shareability_score: body.shareability_score ?? null,
    example_gold_standard_posts: asArray(body.example_gold_standard_posts),
    status: body.status || "active"
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const supabase = getSupabaseAdmin();
    let query = supabase.from("story_frameworks").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (!includeArchived) query = query.eq("status", "active");
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ frameworks: data || [] });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message = error instanceof Error ? error.message : "Unable to load Story Frameworks.";
    const setupMessage = /story_frameworks|schema cache|PGRST205/i.test(message)
      ? "Story Frameworks table is missing. Run the Supabase migration for story_frameworks first."
      : message;
    return NextResponse.json({ error: setupMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json() as Partial<StoryFramework>;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("story_frameworks").insert(payload(body, user.id)).select("*").single();
    if (error) throw error;
    return NextResponse.json({ framework: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message = error instanceof Error ? error.message : "Unable to save Story Framework.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
