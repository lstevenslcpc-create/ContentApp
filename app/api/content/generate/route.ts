import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { selectAnglesForGeneration } from "@/lib/contentAngles";
import { generateStructuredContent } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BusinessProfile, BrandBrain, ContentGenerationRequest } from "@/lib/types";

const MAX_BATCH_SIZE = 3;

function chunkAngles<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function generateAndSaveBatch({
  supabase,
  profile,
  brandBrain,
  body,
  topic,
  userId,
  numberOfPosts,
  angleOffset
}: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  profile: BusinessProfile;
  brandBrain: BrandBrain | null;
  body: ContentGenerationRequest;
  topic: string;
  userId: string;
  numberOfPosts: number;
  angleOffset: number;
}) {
  const plannedAngles = selectAnglesForGeneration(topic, body.contentGoal, angleOffset + numberOfPosts).slice(angleOffset, angleOffset + numberOfPosts);
  const posts = await generateStructuredContent(profile, { ...body, topic, numberOfPosts, angleOffset }, brandBrain, plannedAngles);
  const rows = posts.map((post) => ({
    business_profile_id: profile.id,
    user_id: userId,
    topic,
    platform: body.platform,
    content_type: body.contentType,
    content_goal: body.contentGoal,
    content_angle: post.content_angle || null,
    hook: post.hook,
    caption: post.caption,
    hashtags: post.hashtags,
    visual_idea: post.visual_idea,
    script: post.script || null,
    content_intelligence_brief: post.content_intelligence_brief || null,
    why_this_works: post.why_this_works || null,
    status: "needs_review",
    media_status: "not_started"
  }));

  const { data, error } = await supabase.from("generated_content").insert(rows).select("*");
  if (error && /(topic|content_angle|content_intelligence_brief|why_this_works)/i.test(error.message || "")) {
    const fallbackRows = rows.map((row) => {
      const {
        topic: _topic,
        content_angle: _contentAngle,
        content_intelligence_brief: _contentIntelligenceBrief,
        why_this_works: _whyThisWorks,
        ...fallbackRow
      } = row;
      return fallbackRow;
    });
    const retry = await supabase.from("generated_content").insert(fallbackRows).select("*");
    if (retry.error) throw retry.error;
    return {
      posts: (retry.data || []).map((post, index) => ({
        ...post,
        topic,
        content_angle: posts[index]?.content_angle || null,
        content_intelligence_brief: posts[index]?.content_intelligence_brief || null,
        why_this_works: posts[index]?.why_this_works || null
      })),
      warning: `Content generated, but Supabase is missing one of the latest generated_content columns: ${error.message}`
    };
  }
  if (error) throw error;
  return {
    posts: (data || []).map((post, index) => ({
      ...post,
      content_angle: post.content_angle || posts[index]?.content_angle || null,
      content_intelligence_brief: post.content_intelligence_brief || posts[index]?.content_intelligence_brief || null,
      why_this_works: post.why_this_works || posts[index]?.why_this_works || null
    })),
    warning: ""
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as ContentGenerationRequest;
    const numberOfPosts = Number(body.numberOfPosts || 1);
    const angleOffset = Math.max(0, Number(body.angleOffset || 0));
    const topic = String(body.topic || "").trim();

    if (!topic || !body.platform || !body.contentType || !body.contentGoal || !Number.isInteger(numberOfPosts) || numberOfPosts < 1 || numberOfPosts > 30) {
      return NextResponse.json({ error: "topic, platform, contentType, contentGoal, and numberOfPosts are required." }, { status: 400 });
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

    const batches = chunkAngles(Array.from({ length: numberOfPosts }), MAX_BATCH_SIZE);
    const savedPosts = [];
    const warnings: string[] = [];
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
      const batchOffset = angleOffset + batchIndex * MAX_BATCH_SIZE;
      const result = await generateAndSaveBatch({
        supabase,
        profile,
        brandBrain,
        body,
        topic,
        userId: user.id,
        numberOfPosts: batches[batchIndex].length,
        angleOffset: batchOffset
      });
      savedPosts.push(...result.posts);
      if (result.warning) warnings.push(result.warning);
    }

    return NextResponse.json({
      posts: savedPosts,
      batching: {
        batchSize: MAX_BATCH_SIZE,
        batchCount: batches.length,
        angleOffset
      },
      warning: warnings.join(" ")
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate content." }, { status: 500 });
  }
}
