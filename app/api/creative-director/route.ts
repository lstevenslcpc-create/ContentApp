import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { buildCreativeBrief, briefToOpportunity, buildFastContentPack, buildWeeklyPlan, type CreativeBrief, type WeeklyPlanItem } from "@/lib/creativeDirector";
import { getRelevantGoldStandardExamples } from "@/lib/goldStandardLibrary";
import { generateContentPack } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BrandBrain, CanvaTemplate, ContentOpportunity, GoldStandardExample, StoryFramework } from "@/lib/types";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function isMissingOptionalTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || "");
}

async function loadContext(userId: string, topic: string) {
  const supabase = getSupabaseAdmin();
  const [brandBrainResult, templatesResult, storyResult] = await Promise.all([
    supabase
      .from("brand_brains")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("canva_templates")
      .select("*")
      .eq("user_id", userId)
      .eq("approval_status", "approved")
      .order("updated_at", { ascending: false }),
    supabase
      .from("story_frameworks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
  ]);

  const warnings: string[] = [];
  if (brandBrainResult.error) warnings.push(`Brand Brain unavailable: ${brandBrainResult.error.message}`);
  if (templatesResult.error && !isMissingOptionalTable(templatesResult.error)) warnings.push(`Canva templates unavailable: ${templatesResult.error.message}`);
  if (storyResult.error && !isMissingOptionalTable(storyResult.error)) warnings.push(`Story frameworks unavailable: ${storyResult.error.message}`);

  const goldExamples = await getRelevantGoldStandardExamples(supabase, {
    userId,
    topic,
    limit: 5
  });

  return {
    supabase,
    brandBrain: brandBrainResult.error ? null : brandBrainResult.data as BrandBrain | null,
    templates: templatesResult.error ? [] : templatesResult.data as CanvaTemplate[],
    storyFrameworks: storyResult.error ? [] : storyResult.data as StoryFramework[],
    goldExamples: goldExamples as GoldStandardExample[],
    warnings
  };
}

function packMetadata(brief: CreativeBrief, item?: WeeklyPlanItem, warnings: string[] = []) {
  return {
    generatedFrom: "creative_director",
    creativeBrief: brief,
    weeklyPlanItem: item || null,
    warnings,
    selectedCanvaTemplateName: brief.recommendedCanvaTemplate.name,
    selectedCanvaTemplateLink: brief.recommendedCanvaTemplate.link,
    selectedCanvaTemplateId: brief.recommendedCanvaTemplate.id,
    canvaTemplateMatchScore: brief.voiceConfidence,
    canvaTemplateMatchReason: brief.why.canvaTemplate,
    canvaPrepStatus: "ready_for_canva",
    aiMediaPrompts: {
      image: brief.aiImagePrompt,
      advertisement: `Create a calm LionHeart Therapy ad visual for ${brief.idea}. Use ${brief.recommendedVisualStyle}`,
      quoteGraphic: `Create a quote graphic using the emotional destination: ${brief.emotionalDestination}`,
      productPromotion: `Create a product promo visual tied to ${brief.contentMission}. Keep it warm, not salesy.`,
      servicePromotion: `Create a therapy service promo visual for ${brief.idea}. Keep it ethical, clear, and calm.`,
      workbookMockup: `Create a workbook or journal mockup concept for ${brief.idea}.`,
      pinterestPin: brief.pinterestAngle,
      reelCover: brief.reelAngle,
      storyGraphic: `Create a story graphic that prompts reflection around ${brief.idea}.`
    },
    platformVariations: {
      primary: brief.primaryPlatform,
      supporting: brief.supportingPlatforms,
      angles: brief.platformAngles,
      reelAngle: brief.reelAngle,
      pinterestAngle: brief.pinterestAngle,
      emailAngle: brief.emailAngle
    },
    scheduleRecommendation: item ? { day: item.day, time: item.time, reason: item.why } : brief.scheduleRecommendation
  };
}

function contentPackRow(userId: string, brief: CreativeBrief, opportunity: ContentOpportunity, pack: Record<string, string>, item?: WeeklyPlanItem, warnings: string[] = []) {
  return {
    user_id: userId,
    opportunity_id: null,
    title: item?.topic || brief.idea,
    status: "needs_review",
    source_topic: item?.topic || brief.idea,
    audience: opportunity.audience,
    content_pillar: item?.contentMission || brief.contentMission,
    product_tie_in: opportunity.product_tie_in || null,
    service_tie_in: opportunity.service_tie_in || null,
    clinical_sensitivity: opportunity.clinical_sensitivity || "medium",
    design_status: "ready_for_canva",
    canva_template_id: brief.recommendedCanvaTemplate.id,
    pack,
    metadata: packMetadata(brief, item, warnings)
  };
}

async function insertPack(userId: string, brief: CreativeBrief, opportunity: ContentOpportunity, pack: Record<string, string>, item?: WeeklyPlanItem, warnings: string[] = []) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_packs")
    .insert(contentPackRow(userId, brief, opportunity, pack, item, warnings))
    .select("*")
    .single();

  if (error && /canva_template_id|design_status|schema cache/i.test(error.message || "")) {
    const fallbackRow = contentPackRow(userId, brief, opportunity, pack, item, warnings);
    const { canva_template_id: _canvaTemplateId, design_status: _designStatus, ...withoutOptionalColumns } = fallbackRow;
    const fallback = await supabase
      .from("content_packs")
      .insert(withoutOptionalColumns)
      .select("*")
      .single();
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }

  if (error) throw error;
  return data;
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    const action = String(body.action || "brief");
    const idea = String(body.idea || "").trim();

    if (action !== "week" && !idea) {
      return NextResponse.json({ ok: false, error: "Enter one idea first." }, { status: 400 });
    }

    if (action === "week") {
      const weeklyFocus = String(body.weeklyFocus || body.idea || "").trim();
      if (!weeklyFocus) return NextResponse.json({ ok: false, error: "Enter a weekly focus first." }, { status: 400 });
      const context = await loadContext(user.id, weeklyFocus);
      const plan = buildWeeklyPlan({
        weeklyFocus,
        productOrService: String(body.productOrService || "").trim(),
        desiredPosts: Number(body.desiredPosts || 7),
        templates: context.templates,
        goldExamples: context.goldExamples,
        storyFrameworks: context.storyFrameworks,
        brandBrain: context.brandBrain
      });

      const created = [];
      for (const item of plan) {
        const brief = buildCreativeBrief({
          idea: item.topic,
          mission: item.contentMission,
          templates: context.templates,
          goldExamples: context.goldExamples,
          storyFrameworks: context.storyFrameworks,
          brandBrain: context.brandBrain
        });
        const opportunity = briefToOpportunity(brief, {
          topic: item.topic,
          content_pillar: item.contentMission,
          platform_recommendations: [item.platform],
          cta: item.cta,
          visual_direction: item.visualStyle
        });
        const pack = buildFastContentPack(brief, item);
        const data = await insertPack(user.id, brief, opportunity, pack, item, context.warnings);
        created.push(data);
      }

      return NextResponse.json({ ok: true, plan, packs: created, warnings: context.warnings });
    }

    const context = await loadContext(user.id, idea);
    const brief = buildCreativeBrief({
      idea,
      mission: String(body.mission || "Auto"),
      templates: context.templates,
      goldExamples: context.goldExamples,
      storyFrameworks: context.storyFrameworks,
      brandBrain: context.brandBrain
    });

    if (action === "brief") {
      return NextResponse.json({ ok: true, brief, warnings: context.warnings });
    }

    if (action === "generate") {
      const editedBrief = body.brief && typeof body.brief === "object" ? body.brief as CreativeBrief : brief;
      const opportunity = briefToOpportunity(editedBrief);
      let generated;
      try {
        generated = await generateContentPack(opportunity, context.brandBrain);
      } catch (error) {
        console.warn("[creative-director][generate-fallback]", { message: errorMessage(error) });
        generated = {
          pack: buildFastContentPack(editedBrief),
          warnings: [`OpenAI pack generation failed, so a fast Creative Director draft was created: ${errorMessage(error)}`]
        };
      }
      const data = await insertPack(user.id, editedBrief, opportunity, generated.pack, undefined, [...context.warnings, ...(generated.warnings || [])]);
      return NextResponse.json({ ok: true, brief: editedBrief, pack: data, warnings: [...context.warnings, ...(generated.warnings || [])] });
    }

    return NextResponse.json({ ok: false, error: "Unsupported Creative Director action." }, { status: 400 });
  } catch (error) {
    console.error("[creative-director][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
