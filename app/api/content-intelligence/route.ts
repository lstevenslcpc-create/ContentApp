import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateContentOpportunities } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentOpportunity } from "@/lib/types";

function errorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    };
  }

  if (typeof error === "object" && error !== null) {
    return error;
  }

  return { message: String(error) };
}

function clientError(error: unknown, fallback: string) {
  const details = errorDetails(error);
  const message = typeof details === "object" && details && "message" in details ? String(details.message) : fallback;
  return {
    error: message || fallback,
    details: process.env.NODE_ENV === "development" ? details : undefined
  };
}

function toOpportunityRow(opportunity: ContentOpportunity, userId: string) {
  return {
    user_id: userId,
    topic: opportunity.topic,
    explanation: opportunity.explanation || null,
    strongest_emotional_hook: opportunity.strongest_emotional_hook || null,
    curiosity_angle: opportunity.curiosity_angle || null,
    save_worthy_angle: opportunity.save_worthy_angle || null,
    share_worthy_angle: opportunity.share_worthy_angle || null,
    comment_bait_potential: opportunity.comment_bait_potential || null,
    emotional_trigger_category: opportunity.emotional_trigger_category || null,
    audience: opportunity.audience,
    content_pillar: opportunity.content_pillar,
    platform_recommendations: opportunity.platform_recommendations || {},
    seo_keywords: opportunity.seo_keywords || [],
    virality_score: opportunity.virality_score || null,
    emotional_resonance_score: opportunity.emotional_resonance_score || null,
    save_potential_score: opportunity.save_potential_score || null,
    trust_building_score: opportunity.trust_building_score || null,
    conversion_score: opportunity.conversion_score || null,
    seo_score: opportunity.seo_score || opportunity.seo_opportunity_score || null,
    pinterest_potential_score: opportunity.pinterest_potential_score || null,
    ai_search_potential_score: opportunity.ai_search_potential_score || null,
    emotional_angle: opportunity.emotional_angle,
    visual_direction: opportunity.visual_direction || null,
    product_tie_in: opportunity.product_tie_in || null,
    service_tie_in: opportunity.service_tie_in || null,
    cta: opportunity.cta,
    clinical_sensitivity: opportunity.clinical_sensitivity || "medium",
    status: opportunity.status || "idea"
  };
}

function toLegacyOpportunityRow(opportunity: ContentOpportunity, userId: string) {
  return {
    user_id: userId,
    topic: opportunity.topic,
    audience: opportunity.audience,
    content_pillar: opportunity.content_pillar,
    platform_recommendations: opportunity.platform_recommendations || {},
    seo_keywords: opportunity.seo_keywords || [],
    emotional_angle: opportunity.emotional_angle,
    product_tie_in: opportunity.product_tie_in || null,
    service_tie_in: opportunity.service_tie_in || null,
    cta: opportunity.cta,
    clinical_sensitivity: opportunity.clinical_sensitivity || "medium",
    status: opportunity.status || "idea"
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_opportunities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) throw error;
    return NextResponse.json({ opportunities: data || [] });
  } catch (error) {
    console.error("[content-intelligence][GET]", errorDetails(error));
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(clientError(error, "Unable to load content opportunities."), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    const action = body.action || "generate";
    if (!process.env.OPENAI_API_KEY && action === "generate") {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing. Add it in Netlify environment variables and redeploy." }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();

    if (action === "generate") {
      const theme = String(body.theme || "").trim();
      if (!theme) {
        return NextResponse.json({ error: "Enter a theme to generate content opportunities." }, { status: 400 });
      }

      const { data: brandBrain, error: brandBrainError } = await supabase
        .from("brand_brains")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (brandBrainError) {
        console.warn("[content-intelligence][brand-brain-fallback]", errorDetails(brandBrainError));
      }

      const opportunities = await generateContentOpportunities(theme, brandBrainError ? null : brandBrain);
      return NextResponse.json({
        opportunities,
        disclaimer: "AI-assisted content strategy suggestions. Live search and social trend APIs are not connected yet."
      });
    }

    if (action === "save") {
      const opportunity = body.opportunity as ContentOpportunity | undefined;
      if (!opportunity?.topic) {
        return NextResponse.json({ error: "A content opportunity is required." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("content_opportunities")
        .insert(toOpportunityRow(opportunity, user.id))
        .select("*")
        .single();

      if (error) {
        console.warn("[content-intelligence][save-full-row-failed]", errorDetails(error));
        const { data: legacyData, error: legacyError } = await supabase
          .from("content_opportunities")
          .insert(toLegacyOpportunityRow(opportunity, user.id))
          .select("*")
          .single();

        if (legacyError) {
          console.error("[content-intelligence][save-legacy-row-failed]", errorDetails(legacyError));
          return NextResponse.json(
            {
              error: legacyError.message || error.message || "Unable to save idea.",
              details: process.env.NODE_ENV === "development" ? { fullRowError: error, legacyRowError: legacyError } : undefined
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          opportunity: legacyData,
          warning: "Saved with legacy content_opportunities columns. Run the latest Supabase SQL migration to store the upgraded Content Intelligence fields."
        });
      }
      return NextResponse.json({ opportunity: data });
    }

    return NextResponse.json({ error: "Unsupported content intelligence action." }, { status: 400 });
  } catch (error) {
    console.error("[content-intelligence][POST]", errorDetails(error));
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(clientError(error, "Unable to process content intelligence request."), { status: 500 });
  }
}
