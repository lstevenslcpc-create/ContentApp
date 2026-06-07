export type ContentStatus = "draft" | "needs_review" | "approved" | "scheduled" | "posted" | "failed";
export type MediaStatus = "not_started" | "processing" | "completed" | "failed";
export type MediaProvider = "fal" | "higgsfield" | "openai" | "replicate" | "runway";

export type BrandBrain = {
  id: string;
  user_id?: string | null;
  brand_name: string;
  tagline?: string | null;
  mission?: string | null;
  personality_sliders: {
    clinical_relatable: number;
    witty_serious: number;
    educational_emotional: number;
    trendy_timeless: number;
  };
  voice_tone: {
    example_captions: string[];
    preferred_phrases: string[];
    phrases_to_avoid: string[];
    emotional_tone: string;
    humor_level: string;
    sentence_style: string;
    formatting_style: string;
    emoji_preferences: string;
    cta_tone: string;
  };
  forbidden_ai_phrases: string[];
  audience_profiles: Array<{
    name: string;
    pain_points: string[];
    emotional_triggers: string[];
    goals: string[];
    language_style: string;
    preferred_platforms: string[];
    resonant_hooks: string[];
    buying_behavior: string;
  }>;
  therapy_services: Array<{
    name: string;
    seo_keywords: string[];
    cta: string;
    target_audience: string;
    internal_links: string[];
    common_faqs: string[];
  }>;
  product_catalog: Array<{
    name: string;
    audience: string;
    emotional_pain_points: string[];
    transformation_outcome: string;
    cta: string;
    preferred_visuals: string[];
    seo_keywords: string[];
    seasonal_marketing_opportunities: string[];
  }>;
  visual_identity: {
    brand_colors: string[];
    fonts: string[];
    aesthetic_descriptors: string[];
    banned_visual_styles: string[];
    preferred_content_vibe: string;
    canva_template_categories: string[];
    logo_url?: string;
    moodboard_urls: string[];
    reference_post_urls: string[];
    aesthetic_screenshot_urls: string[];
  };
  clinical_safety_rules: {
    required_disclaimers: string[];
    safety_checks: string[];
    crisis_resource_reminders: string[];
    avoid_diagnostic_certainty: boolean;
    avoid_overpromising: boolean;
  };
  ai_instruction_layer: {
    captions: boolean;
    blogs: boolean;
    pinterest_titles: boolean;
    video_scripts: boolean;
    emails: boolean;
    hashtags: boolean;
    seo: boolean;
    canva_directions: boolean;
    content_hooks: boolean;
    tone_consistency: boolean;
  };
  seo_priorities: string[];
  preferred_cta_styles: string[];
  preferred_platforms: string[];
  content_goals: string[];
  conversion_priorities: string[];
  created_at?: string;
  updated_at?: string;
};

export type BusinessProfile = {
  id: string;
  user_id?: string | null;
  business_name: string;
  industry?: string | null;
  services_offered?: string | null;
  target_audience?: string | null;
  location_served?: string | null;
  brand_voice?: string | null;
  main_goal?: string | null;
  website_link?: string | null;
  social_handles?: Record<string, string>;
  offer_promotion?: string | null;
  call_to_action?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GeneratedContent = {
  id: string;
  user_id?: string | null;
  business_profile_id?: string | null;
  topic?: string | null;
  platform?: string | null;
  content_type?: string | null;
  content_goal?: string | null;
  content_angle?: string | null;
  hook?: string | null;
  caption?: string | null;
  hashtags?: string[];
  visual_idea?: string | null;
  script?: string | null;
  status: ContentStatus;
  scheduled_for?: string | null;
  posted_at?: string | null;
  media_url?: string | null;
  media_provider?: string | null;
  media_job_id?: string | null;
  media_status?: MediaStatus | null;
  canva_design_url?: string | null;
  canva_template_id?: string | null;
  archived?: boolean | null;
  content_intelligence_brief?: ContentIntelligenceBrief | null;
  why_this_works?: ContentWhyThisWorks | null;
  created_at?: string;
  updated_at?: string;
};

export type ContentIntelligenceBrief = {
  content_angle?: string;
  selectedFramework?: string;
  whyThisFrameworkFits?: string;
  frameworkExplanation?: string;
  practicalApplication?: string;
  topic_definition: string;
  psychological_explanation: string;
  common_symptoms: string[];
  hidden_signs: string[];
  emotional_experience: string;
  real_life_examples: string[];
  behavioral_patterns: string[];
  nervous_system_signs: string[];
  common_myths: string[];
  therapist_insight: string;
  observer_notes: string;
  practical_takeaway: string;
  best_fit_cta: string;
  audience_insight: string;
  psychological_angle: string;
  cta_strategy: string;
  suggested_template: string;
  source_notes?: string[];
};

export type ContentWhyThisWorks = {
  goal_used: string;
  audience_insight: string;
  psychological_angle: string;
  cta_strategy: string;
  suggested_template: string;
  selected_framework?: string;
  framework_explanation?: string;
  practical_application?: string;
};

export type PlatformAngles = {
  tiktok_reels: string;
  instagram_carousel: string;
  pinterest_pin: string;
  blog_seo_article: string;
  threads_post: string;
  email_newsletter: string;
};

export type ContentOpportunity = {
  id?: string;
  user_id?: string | null;
  topic: string;
  explanation?: string;
  strongest_emotional_hook?: string;
  curiosity_angle?: string;
  save_worthy_angle?: string;
  share_worthy_angle?: string;
  comment_bait_potential?: string;
  emotional_trigger_category?:
    | "validation"
    | "identity recognition"
    | "hidden symptom recognition"
    | "self-awareness shock"
    | "relationship tension"
    | "nervous system education"
    | string;
  audience: string;
  content_pillar: string;
  platform_recommendations: string[] | PlatformAngles | Record<string, unknown>;
  seo_keywords: string[];
  seo_opportunity_score?: number;
  emotional_engagement_score?: number;
  virality_score?: number;
  emotional_resonance_score?: number;
  save_potential_score?: number;
  trust_building_score?: number;
  conversion_score?: number;
  seo_score?: number;
  pinterest_potential_score?: number;
  ai_search_potential_score?: number;
  emotional_angle: string;
  visual_direction?: string;
  product_tie_in?: string | null;
  service_tie_in?: string | null;
  cta: string;
  clinical_sensitivity: "low" | "medium" | "high";
  status?: "idea" | "draft" | "generated" | "archived";
  created_at?: string;
  updated_at?: string;
};

export type ContentPackSectionKey =
  | "tiktok_reels_script"
  | "instagram_carousel_outline"
  | "slide_by_slide_carousel_copy"
  | "instagram_caption"
  | "pinterest_pin_title"
  | "pinterest_description"
  | "threads_post"
  | "blog_outline"
  | "email_newsletter_blurb"
  | "canva_visual_direction"
  | "product_cta"
  | "therapy_service_cta"
  | "safety_disclaimer";

export type ContentPackBody = Record<ContentPackSectionKey, string>;

export type ContentPack = {
  id: string;
  user_id?: string | null;
  opportunity_id?: string | null;
  title: string;
  status: ContentStatus;
  source_topic?: string | null;
  audience?: string | null;
  content_pillar?: string | null;
  product_tie_in?: string | null;
  service_tie_in?: string | null;
  clinical_sensitivity?: "low" | "medium" | "high" | string | null;
  design_status?: "not_started" | "ready_for_canva" | "designed_in_canva" | string | null;
  canva_template_id?: string | null;
  pack: ContentPackBody;
  canva_brief?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  archived?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type CanvaTemplate = {
  id: string;
  user_id?: string | null;
  template_name: string;
  canva_template_link: string;
  format_type: "Instagram carousel" | "Pinterest pin" | "Reel cover" | "Story" | "Workbook promo" | "Blog graphic" | "Quote post" | string;
  dimensions?: string | null;
  aesthetic_vibe?: string | null;
  color_palette?: string | null;
  font_style?: string | null;
  graphic_style?: string | null;
  best_use_case?: string | null;
  audience_fit?: string | null;
  content_pillar_fit?: string | null;
  recommended_for?: string[];
  approval_status: "draft" | "approved" | "archived";
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CalendarPlanStatus = "idea" | ContentStatus;

export type ContentCalendarPlan = {
  id: string;
  user_id?: string | null;
  content_pack_id?: string | null;
  planned_date: string;
  status: CalendarPlanStatus;
  campaign_label?: string | null;
  focus_label?: string | null;
  seasonal_prompt?: string | null;
  notes?: string | null;
  content_pack?: ContentPack | null;
  created_at?: string;
  updated_at?: string;
};

export type ContentCalendarFocus = {
  id: string;
  user_id?: string | null;
  week_start: string;
  focus: string;
  created_at?: string;
  updated_at?: string;
};

export type MediaLibraryStatus = "draft" | "saved" | "approved" | "used" | "archived";

export type MediaLibraryAsset = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  description?: string | null;
  asset_type:
    | "image"
    | "video"
    | "caption"
    | "carousel"
    | "blog outline"
    | "Pinterest pin"
    | "TikTok script"
    | "email"
    | "Canva direction"
    | "product promo"
    | "therapy service promo";
  source?: "ai_media_generator" | "content_generator" | "content_intelligence" | "manual_upload" | string | null;
  platform?: string | null;
  content_pillar?: string | null;
  product_tie_in?: string | null;
  service_tie_in?: string | null;
  campaign_id?: string | null;
  linked_content_id?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  text_content?: string | null;
  prompt?: string | null;
  tags?: string[];
  status: MediaLibraryStatus;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type IntegrationProvider = "canva" | "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";

export type IntegrationConnection = {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  account_name?: string | null;
  status: "not_connected" | "prepared" | "connected" | "expired" | "revoked";
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type MediaProviderResponse = {
  provider: string;
  status: "completed" | "processing" | "failed";
  mediaUrl?: string;
  jobId?: string;
  message?: string;
  raw?: unknown;
  error?: string;
};

export type ContentGenerationRequest = {
  topic: string;
  platform: string;
  contentType: string;
  contentGoal: string;
  numberOfPosts: number;
  intelligenceBrief?: {
    topic: string;
    audience: string;
    content_pillar: string;
    seo_keywords: string[];
    emotional_angle: string;
    strongest_emotional_hook?: string;
    curiosity_angle?: string;
    save_worthy_angle?: string;
    share_worthy_angle?: string;
    emotional_trigger_category?: string;
    visual_direction?: string;
    product_tie_in?: string | null;
    service_tie_in?: string | null;
    cta: string;
    clinical_sensitivity: "low" | "medium" | "high";
  };
};

export type MediaGenerationRequest = {
  contentId?: string;
  prompt: string;
  mediaType: "image" | "video";
  aspectRatio?: "1:1" | "9:16" | "16:9";
  style?: string;
};
