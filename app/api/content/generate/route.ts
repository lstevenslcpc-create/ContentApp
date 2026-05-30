import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateStructuredContent } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentGenerationRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as ContentGenerationRequest;
    const numberOfPosts = Number(body.numberOfPosts || 1);

    if (!body.platform || !body.contentType || !body.contentGoal || ![1, 7, 30].includes(numberOfPosts)) {
      return NextResponse.json({ error: "platform, contentType, contentGoal, and numberOfPosts are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return NextResponse.json({ error: "Complete your Business Profile first so content can match your business." }, { status: 400 });
    }

    const { data: brandBrain, error: brandBrainError } = await supabase
      .from("brand_brains")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (brandBrainError) throw brandBrainError;

    const posts = await generateStructuredContent(profile, { ...body, numberOfPosts }, brandBrain);
    const rows = posts.map((post) => ({
      business_profile_id: profile.id,
      user_id: user.id,
      platform: body.platform,
      content_type: body.contentType,
      content_goal: body.contentGoal,
      hook: post.hook,
      caption: post.caption,
      hashtags: post.hashtags,
      visual_idea: post.visual_idea,
      script: post.script || null,
      status: "needs_review",
      media_status: "not_started"
    }));

    const { data, error } = await supabase.from("generated_content").insert(rows).select("*");
    if (error) throw error;
    return NextResponse.json({ posts: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate content." }, { status: 500 });
  }
}
