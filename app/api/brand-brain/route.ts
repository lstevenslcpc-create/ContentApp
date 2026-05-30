import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { defaultBrandBrain } from "@/lib/brandBrain/defaults";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BrandBrain } from "@/lib/types";

function normalizeBrandBrain(body: Partial<BrandBrain>, userId: string) {
  return {
    user_id: userId,
    brand_name: body.brand_name?.trim() || defaultBrandBrain.brand_name,
    tagline: body.tagline || "",
    mission: body.mission || "",
    personality_sliders: body.personality_sliders || defaultBrandBrain.personality_sliders,
    voice_tone: body.voice_tone || defaultBrandBrain.voice_tone,
    forbidden_ai_phrases: body.forbidden_ai_phrases || defaultBrandBrain.forbidden_ai_phrases,
    audience_profiles: body.audience_profiles || defaultBrandBrain.audience_profiles,
    therapy_services: body.therapy_services || defaultBrandBrain.therapy_services,
    product_catalog: body.product_catalog || defaultBrandBrain.product_catalog,
    visual_identity: body.visual_identity || defaultBrandBrain.visual_identity,
    clinical_safety_rules: body.clinical_safety_rules || defaultBrandBrain.clinical_safety_rules,
    ai_instruction_layer: body.ai_instruction_layer || defaultBrandBrain.ai_instruction_layer,
    seo_priorities: body.seo_priorities || defaultBrandBrain.seo_priorities,
    preferred_cta_styles: body.preferred_cta_styles || defaultBrandBrain.preferred_cta_styles,
    preferred_platforms: body.preferred_platforms || defaultBrandBrain.preferred_platforms,
    content_goals: body.content_goals || defaultBrandBrain.content_goals,
    conversion_priorities: body.conversion_priorities || defaultBrandBrain.conversion_priorities
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("brand_brains").select("*").eq("user_id", user.id).maybeSingle();

    if (error) throw error;
    if (data) return NextResponse.json({ brandBrain: data });

    const { data: seeded, error: seedError } = await supabase
      .from("brand_brains")
      .insert(normalizeBrandBrain(defaultBrandBrain, user.id))
      .select("*")
      .single();

    if (seedError) throw seedError;
    return NextResponse.json({ brandBrain: seeded });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Brand Brain." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as Partial<BrandBrain>;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("brand_brains")
      .upsert(normalizeBrandBrain(body, user.id), { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ brandBrain: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save Brand Brain." }, { status: 500 });
  }
}
