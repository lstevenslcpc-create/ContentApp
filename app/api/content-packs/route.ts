import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { scanContentRisk } from "@/lib/brandBrain/riskScan";
import { generateContentPack } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentOpportunity, GeneratedContent } from "@/lib/types";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

async function loadBrandBrain(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("brand_brains")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[content-packs][brand-brain-load-failed]", { message: error.message });
    return null;
  }

  return data;
}

async function loadOpportunity(userId: string, opportunityId?: string, fallback?: ContentOpportunity) {
  if (!opportunityId) return fallback;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_opportunities")
    .select("*")
    .eq("user_id", userId)
    .eq("id", opportunityId)
    .single();

  if (error) throw new Error(`Unable to load selected content opportunity: ${error.message}`);
  return data as ContentOpportunity;
}

function contentPackRow(userId: string, opportunity: ContentOpportunity, pack: Record<string, string>, opportunityId?: string | null, warnings?: string[]) {
  return {
    user_id: userId,
    opportunity_id: opportunityId || opportunity.id || null,
    title: opportunity.topic || "Untitled content pack",
    status: "draft",
    source_topic: opportunity.topic || null,
    audience: opportunity.audience || null,
    content_pillar: opportunity.content_pillar || null,
    product_tie_in: opportunity.product_tie_in || null,
    service_tie_in: opportunity.service_tie_in || null,
    clinical_sensitivity: opportunity.clinical_sensitivity || "medium",
    pack,
    metadata: {
      generatedFrom: "content_intelligence",
      contentTopic: opportunity.topic || null,
      warnings: warnings || [],
      emotionalTriggerCategory: opportunity.emotional_trigger_category || null,
      seoKeywords: opportunity.seo_keywords || []
    }
  };
}

function titleFromGeneratedContent(item: GeneratedContent) {
  return item.topic || item.hook || `${item.platform || "Social"} ${item.content_type || "content"}`;
}

function generatedContentPackBody(item: GeneratedContent) {
  const topic = titleFromGeneratedContent(item);
  const whyThisWorks = item.why_this_works;
  const brief = item.content_intelligence_brief;
  const caption = item.caption || "";
  const hashtags = item.hashtags?.length ? item.hashtags.join(" ") : "";
  const visual = item.visual_idea || "Use a calm LionHeart Therapy Canva layout with soft cream, muted navy, sage, and emotionally grounded spacing.";
  const script = item.script || `${item.hook || topic}\n\nUse the caption as talking points and close with the CTA.`;
  const cta = "Review, approve, and prepare this for manual posting.";
  const carouselCopy = item.content_type === "carousel"
    ? [
        `Slide 1: ${item.hook || topic}`,
        `Slide 2: ${brief?.hidden_signs?.[0] || "Name the moment or pattern the audience recognizes."}`,
        `Slide 3: ${brief?.psychological_explanation || "Explain what may be happening internally."}`,
        `Slide 4: ${brief?.therapist_insight || "Offer a grounded reframe."}`,
        `Slide 5: ${brief?.practical_takeaway || "Give one small reflection or next step."}`,
        `Slide 6: ${cta}`
      ].join("\n")
    : "";

  return {
    tiktok_reels_script: script,
    instagram_carousel_outline: item.content_type === "carousel" ? `Carousel for ${topic}${item.content_angle ? ` using the ${item.content_angle} angle` : ""}: strong hook, recognition, emotional context, gentle reframe, CTA.` : "",
    slide_by_slide_carousel_copy: carouselCopy,
    instagram_caption: [caption, hashtags].filter(Boolean).join("\n\n"),
    pinterest_pin_title: `${topic}: therapist-informed reflection`,
    pinterest_description: caption || `A LionHeart Therapy post about ${topic}, created for review and manual publishing.`,
    threads_post: caption ? caption.split("\n").filter(Boolean).slice(0, 2).join("\n") : item.hook || topic,
    blog_outline: `H1: ${topic}\nSection 1: What this can look like\nSection 2: ${whyThisWorks?.psychological_angle || "Why it can feel so intense"}\nSection 3: ${brief?.practical_takeaway || "A grounded next step"}\nCTA: ${cta}`,
    email_newsletter_blurb: caption || `A short therapist-authored note about ${topic}.`,
    canva_visual_direction: visual,
    product_cta: "",
    therapy_service_cta: item.content_goal === "therapy-inquiries" || item.content_goal === "leads" ? "If this feels familiar and you want support, reach out to LionHeart Therapy to explore next steps." : "",
    safety_disclaimer: "Educational content only. This is not therapy advice, diagnosis, or a substitute for care from a licensed professional."
  };
}

function generatedContentPackRow(userId: string, item: GeneratedContent) {
  const title = titleFromGeneratedContent(item);
  return {
    user_id: userId,
    opportunity_id: null,
    title,
    status: "needs_review",
    source_topic: item.topic || title,
    audience: null,
    content_pillar: item.content_goal || null,
    product_tie_in: null,
    service_tie_in: item.content_goal === "therapy-inquiries" || item.content_goal === "leads" ? "Therapy inquiries" : null,
    clinical_sensitivity: "medium",
    pack: generatedContentPackBody(item),
    metadata: {
      generatedFrom: "content_generator",
      generatedContentId: item.id,
      contentTopic: item.topic || title,
      platform: item.platform || null,
      contentType: item.content_type || null,
      contentGoal: item.content_goal || null,
      contentAngle: item.content_angle || null,
      originalStatus: item.status || null,
      contentIntelligenceBrief: item.content_intelligence_brief || null,
      whyThisWorks: item.why_this_works || null
    }
  };
}

async function createPackFromGeneratedContent(userId: string, generatedContentId: string) {
  const supabase = getSupabaseAdmin();
  const { data: item, error: itemError } = await supabase
    .from("generated_content")
    .select("*")
    .eq("user_id", userId)
    .eq("id", generatedContentId)
    .single();

  if (itemError) throw new Error(`Unable to load generated content: ${itemError.message}`);
  const generatedContent = item as GeneratedContent;

  const brandBrain = await loadBrandBrain(userId);
  const risk = scanContentRisk(generatedContent, brandBrain);
  if (!risk.passed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Clinical safety scan blocked approval. Edit the content before sending it to Approval Review.",
        issues: risk.issues
      },
      { status: 400 }
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("content_packs")
    .select("*")
    .eq("user_id", userId)
    .contains("metadata", { generatedContentId })
    .maybeSingle();

  if (existingError) throw new Error(`Unable to check existing content pack: ${existingError.message}`);

  await supabase
    .from("generated_content")
    .update({ status: "approved" })
    .eq("user_id", userId)
    .eq("id", generatedContentId);

  if (existing) {
    return NextResponse.json({ ok: true, pack: existing, alreadyExists: true });
  }

  const { data, error } = await supabase
    .from("content_packs")
    .insert(generatedContentPackRow(userId, generatedContent))
    .select("*")
    .single();

  if (error) throw new Error(`Unable to create Approval Review content pack: ${error.message}`);
  return NextResponse.json({ ok: true, pack: data });
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_packs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json({ ok: true, packs: data || [] });
  } catch (error) {
    console.error("[content-packs][GET]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    const generatedContentId = typeof body.generatedContentId === "string" ? body.generatedContentId : "";
    if (generatedContentId) {
      return createPackFromGeneratedContent(user.id, generatedContentId);
    }

    const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId : undefined;
    const opportunity = await loadOpportunity(user.id, opportunityId, body.opportunity as ContentOpportunity | undefined);

    if (!opportunity?.topic) {
      return NextResponse.json({ ok: false, error: "Choose a saved content opportunity before creating a content pack." }, { status: 400 });
    }

    const brandBrain = await loadBrandBrain(user.id);
    const generated = await generateContentPack(opportunity, brandBrain);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_packs")
      .insert(contentPackRow(user.id, opportunity, generated.pack, opportunityId || opportunity.id || null, generated.warnings))
      .select("*")
      .single();

    if (error) {
      console.error("[content-packs][insert-failed]", { message: error.message });
      return NextResponse.json({
        ok: true,
        unsaved: true,
        warning: `Content pack was generated, but Supabase could not save it yet: ${error.message}`,
        pack: {
          id: `temporary-${Date.now()}`,
          ...contentPackRow(user.id, opportunity, generated.pack, null, generated.warnings),
          persisted: false
        },
        warnings: generated.warnings
      });
    }

    return NextResponse.json({
      ok: true,
      pack: data,
      warnings: generated.warnings,
      debug: generated.debug
    });
  } catch (error) {
    console.error("[content-packs][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
