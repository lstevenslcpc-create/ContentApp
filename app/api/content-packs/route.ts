import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateContentPack } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentOpportunity } from "@/lib/types";

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
