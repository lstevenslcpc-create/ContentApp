import { requireApiUser } from "./auth";
import { getSupabaseAdmin, getSupabaseEnvStatus } from "./supabaseAdmin";

const contentOpportunityFields = [
  "id",
  "user_id",
  "topic",
  "explanation",
  "strongest_emotional_hook",
  "curiosity_angle",
  "save_worthy_angle",
  "share_worthy_angle",
  "comment_bait_potential",
  "emotional_trigger_category",
  "audience",
  "content_pillar",
  "platform_recommendations",
  "seo_keywords",
  "emotional_angle",
  "product_tie_in",
  "service_tie_in",
  "cta",
  "clinical_sensitivity",
  "virality_score",
  "emotional_resonance_score",
  "save_potential_score",
  "trust_building_score",
  "conversion_score",
  "seo_score",
  "pinterest_potential_score",
  "ai_search_potential_score",
  "visual_direction",
  "status",
  "created_at",
  "updated_at"
];

const brandBrainFields = [
  "id",
  "user_id",
  "brand_name",
  "tagline",
  "mission",
  "personality_sliders",
  "voice_tone",
  "forbidden_ai_phrases",
  "audience_profiles",
  "therapy_services",
  "product_catalog",
  "visual_identity",
  "clinical_safety_rules",
  "ai_instruction_layer",
  "seo_priorities",
  "preferred_cta_styles",
  "preferred_platforms",
  "content_goals",
  "conversion_priorities",
  "created_at",
  "updated_at"
];

async function schemaFieldsExist(table: string, fields: string[]) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(table).select(fields.join(",")).limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function getContentIntelligenceDiagnostics(request: Request) {
  let userDetected = false;
  const authHeaderReceived = Boolean(request.headers.get("authorization")?.startsWith("Bearer "));
  const authCookieReceived = request.headers.get("cookie")?.includes("lh_supabase_access_token=") || false;

  try {
    const user = await requireApiUser(request);
    userDetected = Boolean(user.id);
  } catch {
    userDetected = false;
  }

  const env = getSupabaseEnvStatus();
  const contentOpportunitiesSchemaFieldsExist = await schemaFieldsExist("content_opportunities", contentOpportunityFields);
  const brandBrainsSchemaFieldsExist = await schemaFieldsExist("brand_brains", brandBrainFields);

  return {
    authHeaderReceived,
    authCookieReceived,
    userDetected,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    OAUTH_TOKEN_ENCRYPTION_KEY: env.OAUTH_TOKEN_ENCRYPTION_KEY,
    contentOpportunitiesSchemaFieldsExist,
    brandBrainsSchemaFieldsExist
  };
}
