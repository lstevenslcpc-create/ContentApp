import type { BrandBrain } from "@/lib/types";

export const defaultForbiddenPhrases = [
  "healing journey",
  "just breathe",
  "you are enough",
  "unlock your potential",
  "trauma dump style content",
  "guru-style language",
  "generic wellness fluff"
];

export const defaultBrandBrain: Omit<BrandBrain, "id" | "user_id" | "created_at" | "updated_at"> = {
  brand_name: "LionHeart Therapy",
  tagline: "Calm, grounded support for anxious minds and tender hearts.",
  mission: "Create clinically thoughtful, emotionally safe therapy content that helps people feel understood while guiding them toward appropriate support.",
  personality_sliders: {
    clinical_relatable: 58,
    witty_serious: 68,
    educational_emotional: 52,
    trendy_timeless: 72
  },
  voice_tone: {
    example_captions: [
      "Anxiety can make everyday decisions feel heavier than they look from the outside. Therapy can help you understand the pattern without shaming yourself for having it.",
      "If your teen seems distant, reactive, or overwhelmed, it may not be attitude. It may be a nervous system asking for support."
    ],
    preferred_phrases: ["gentle clarity", "practical tools", "emotionally safe", "support that meets you where you are"],
    phrases_to_avoid: defaultForbiddenPhrases,
    emotional_tone: "Warm, grounded, validating, clinically informed, never patronizing.",
    humor_level: "Light and human only when appropriate. No sarcasm about pain.",
    sentence_style: "Clear, concise, emotionally intelligent sentences with occasional soft rhythm.",
    formatting_style: "Short paragraphs, readable hooks, no walls of text, minimal list clutter.",
    emoji_preferences: "Use rarely. Prefer none unless the platform needs a warmer touch.",
    cta_tone: "Gentle, consent-based, supportive, never fear-driven."
  },
  forbidden_ai_phrases: defaultForbiddenPhrases,
  audience_profiles: [
    {
      name: "anxious teen girls",
      pain_points: ["school pressure", "friendship stress", "body image worries", "panic symptoms"],
      emotional_triggers: ["feeling judged", "not being believed", "being told they are dramatic"],
      goals: ["feel calmer", "communicate better", "understand anxiety", "feel less alone"],
      language_style: "Direct, gentle, validating, not childish.",
      preferred_platforms: ["Instagram", "TikTok", "YouTube Shorts"],
      resonant_hooks: ["If your teen says she's fine but everything feels harder lately...", "Anxiety in teen girls does not always look like panic."],
      buying_behavior: "Parents usually initiate care; teens need to feel respected and not pathologized."
    },
    {
      name: "college women",
      pain_points: ["perfectionism", "identity pressure", "relationship anxiety", "academic overwhelm"],
      emotional_triggers: ["falling behind", "disappointing family", "being perceived as too much"],
      goals: ["stabilize routines", "reduce spiraling", "build self-trust"],
      language_style: "Smart, warm, modern, emotionally precise.",
      preferred_platforms: ["Instagram", "TikTok", "Pinterest"],
      resonant_hooks: ["High-functioning anxiety can look like having it all together.", "Your nervous system may be tired of performing calm."],
      buying_behavior: "Looks for privacy, convenience, and a therapist who understands high-achieving anxiety."
    },
    {
      name: "overwhelmed moms",
      pain_points: ["emotional load", "guilt", "burnout", "family conflict"],
      emotional_triggers: ["feeling like a bad mom", "not having space for themselves"],
      goals: ["feel regulated", "reduce guilt", "set boundaries", "reconnect with self"],
      language_style: "Tender, practical, never blaming.",
      preferred_platforms: ["Facebook", "Instagram", "Pinterest"],
      resonant_hooks: ["You can love your family and still need support.", "Burnout is not a personal failure."],
      buying_behavior: "Responds to trust, clarity, and reassurance that therapy is a practical support."
    },
    {
      name: "perfectionists",
      pain_points: ["overthinking", "fear of mistakes", "people pleasing", "control"],
      emotional_triggers: ["failure", "criticism", "uncertainty"],
      goals: ["soften self-criticism", "take action without spiraling", "rest without guilt"],
      language_style: "Insightful, precise, compassionate.",
      preferred_platforms: ["Instagram", "LinkedIn", "Pinterest"],
      resonant_hooks: ["Perfectionism often starts as protection.", "Being hard on yourself is not the same as being responsible."],
      buying_behavior: "Needs intellectually credible content and emotionally safe invitations."
    },
    {
      name: "trauma survivors",
      pain_points: ["hypervigilance", "emotional flooding", "trust issues", "shame"],
      emotional_triggers: ["being rushed", "minimized experiences", "graphic content"],
      goals: ["feel safer", "understand responses", "build coping skills", "restore agency"],
      language_style: "Trauma-informed, careful, non-graphic, empowering without overpromising.",
      preferred_platforms: ["Instagram", "Pinterest", "Blog"],
      resonant_hooks: ["Trauma responses are adaptations, not character flaws.", "Safety is built in small, repeatable moments."],
      buying_behavior: "Requires trust, clear boundaries, and safety-forward language."
    },
    {
      name: "high-achieving anxious women",
      pain_points: ["burnout", "imposter feelings", "constant pressure", "difficulty resting"],
      emotional_triggers: ["losing control", "slowing down", "being seen as weak"],
      goals: ["feel steady", "perform without panic", "create sustainable ambition"],
      language_style: "Polished, emotionally intelligent, sophisticated.",
      preferred_platforms: ["LinkedIn", "Instagram", "Pinterest"],
      resonant_hooks: ["Success does not always mean your nervous system feels safe.", "You can be capable and still need support."],
      buying_behavior: "Invests when the offer feels premium, discreet, and clinically credible."
    }
  ],
  therapy_services: [
    {
      name: "Anxiety Therapy",
      seo_keywords: ["anxiety therapy", "therapy for anxiety", "high-functioning anxiety therapist"],
      cta: "Schedule a consultation for anxiety support.",
      target_audience: "Teens, women, parents, and high-achieving anxious clients.",
      internal_links: ["/services/anxiety-therapy"],
      common_faqs: ["How do I know if anxiety therapy is right for me?", "Can therapy help with panic attacks?"]
    },
    {
      name: "Teen Therapy",
      seo_keywords: ["teen therapy", "therapy for teen girls", "teen anxiety therapist"],
      cta: "Reach out to explore teen therapy options.",
      target_audience: "Teen girls and their parents.",
      internal_links: ["/services/teen-therapy"],
      common_faqs: ["Will parents be involved?", "What if my teen does not want therapy?"]
    },
    {
      name: "Trauma Therapy",
      seo_keywords: ["trauma therapy", "trauma-informed therapist", "therapy for trauma survivors"],
      cta: "Connect with a trauma-informed therapist.",
      target_audience: "Adults and teens seeking careful trauma-informed support.",
      internal_links: ["/services/trauma-therapy"],
      common_faqs: ["Do I have to talk about everything right away?", "What does trauma-informed therapy mean?"]
    },
    {
      name: "Clinical Supervision",
      seo_keywords: ["clinical supervision", "therapy supervision", "supervision for therapists"],
      cta: "Inquire about clinical supervision.",
      target_audience: "Pre-licensed and growing clinicians.",
      internal_links: ["/services/clinical-supervision"],
      common_faqs: ["What supervision style do you use?", "Do you offer consultation?"]
    },
    {
      name: "Family Therapy",
      seo_keywords: ["family therapy", "family therapist", "therapy for family conflict"],
      cta: "Contact us about family therapy support.",
      target_audience: "Families navigating conflict, communication strain, or transitions.",
      internal_links: ["/services/family-therapy"],
      common_faqs: ["Who attends family therapy?", "Can family therapy help communication?"]
    }
  ],
  product_catalog: [
    {
      name: "Anxious AF Workbook",
      audience: "High-achieving anxious women and college women.",
      emotional_pain_points: ["spiraling thoughts", "constant pressure", "feeling tense even when things are fine"],
      transformation_outcome: "Understand anxiety patterns and practice grounded coping tools.",
      cta: "Download the workbook and start with one small reset.",
      preferred_visuals: ["clean workbook mockup", "desk scene", "soft navy and cream flat lay"],
      seo_keywords: ["anxiety workbook", "anxiety coping workbook", "high-functioning anxiety tools"],
      seasonal_marketing_opportunities: ["back to school", "new year reset", "mental health awareness month"]
    },
    {
      name: "Teen Mental Health Workbook",
      audience: "Teen girls and parents.",
      emotional_pain_points: ["feeling misunderstood", "school stress", "friendship anxiety"],
      transformation_outcome: "Give teens language and tools for emotions.",
      cta: "Get the teen workbook for practical support at home.",
      preferred_visuals: ["soft journal spread", "teen-friendly stationery", "calming color blocks"],
      seo_keywords: ["teen mental health workbook", "teen anxiety workbook", "coping skills for teens"],
      seasonal_marketing_opportunities: ["back to school", "exam season", "summer transition"]
    },
    {
      name: "Coloring Books",
      audience: "Anxious teens, women, and overwhelmed moms.",
      emotional_pain_points: ["racing thoughts", "need for screen-free calm", "stress"],
      transformation_outcome: "A calming sensory reset with low pressure.",
      cta: "Choose a coloring book for a quiet reset.",
      preferred_visuals: ["gentle page previews", "cozy desk setup", "sage and cream scenes"],
      seo_keywords: ["anxiety coloring book", "mental health coloring book", "calming coloring pages"],
      seasonal_marketing_opportunities: ["holiday gifting", "self-care season", "stress awareness month"]
    },
    {
      name: "Journals",
      audience: "Therapy clients, perfectionists, and reflective women.",
      emotional_pain_points: ["mental clutter", "emotional overwhelm", "difficulty naming feelings"],
      transformation_outcome: "Create a steady reflection practice.",
      cta: "Start with one honest page.",
      preferred_visuals: ["journal closeups", "muted gold pen", "minimal calming workspace"],
      seo_keywords: ["therapy journal", "anxiety journal", "mental health journal"],
      seasonal_marketing_opportunities: ["new year", "fall routines", "Mother's Day"]
    },
    {
      name: "Reset Ritual Toolkit",
      audience: "Overwhelmed moms and high-achieving anxious women.",
      emotional_pain_points: ["burnout", "decision fatigue", "no time to reset"],
      transformation_outcome: "Build a short, repeatable calming ritual.",
      cta: "Try the Reset Ritual Toolkit when your day feels too full.",
      preferred_visuals: ["ritual cards", "soft checklist", "clean calming product bundle"],
      seo_keywords: ["reset ritual", "burnout toolkit", "anxiety reset tools"],
      seasonal_marketing_opportunities: ["Sunday reset", "holiday stress", "spring cleaning"]
    }
  ],
  visual_identity: {
    brand_colors: ["muted navy", "soft cream", "sage", "muted gold", "warm white"],
    fonts: ["clean serif for warmth", "simple sans-serif for readability"],
    aesthetic_descriptors: ["calming", "premium", "feminine-neutral", "warm clinical", "soft editorial"],
    banned_visual_styles: ["neon gradients", "AI robot imagery", "stock-photo panic faces", "loud hustle graphics"],
    preferred_content_vibe: "Gentle authority with clean space, soft contrast, grounded visuals, and high readability.",
    canva_template_categories: ["Instagram carousel", "Pinterest pin", "therapy quote card", "workbook promo", "Reels cover"],
    logo_url: "",
    moodboard_urls: [],
    reference_post_urls: [],
    aesthetic_screenshot_urls: []
  },
  clinical_safety_rules: {
    required_disclaimers: ["Educational content only. This is not therapy advice.", "If you are in immediate danger or crisis, contact local emergency services or a crisis hotline."],
    safety_checks: ["avoid diagnostic certainty", "avoid overpromising", "avoid graphic trauma details", "avoid shame-based urgency", "do not imply guaranteed outcomes"],
    crisis_resource_reminders: ["If you may hurt yourself or someone else, seek immediate crisis support."],
    avoid_diagnostic_certainty: true,
    avoid_overpromising: true
  },
  ai_instruction_layer: {
    captions: true,
    blogs: true,
    pinterest_titles: true,
    video_scripts: true,
    emails: true,
    hashtags: true,
    seo: true,
    canva_directions: true,
    content_hooks: true,
    tone_consistency: true
  },
  seo_priorities: ["anxiety therapy", "teen therapy", "trauma-informed therapy", "therapy for high-achieving women", "mental health workbooks"],
  preferred_cta_styles: ["gentle invitation", "consultation request", "save/share prompt", "product download prompt"],
  preferred_platforms: ["Instagram", "TikTok", "Pinterest", "Facebook", "LinkedIn", "YouTube Shorts"],
  content_goals: ["education", "trust-building", "lead generation", "product sales", "SEO visibility", "clinical credibility"],
  conversion_priorities: ["therapy consultation", "workbook purchase", "email list signup", "Canva-ready social post", "Pinterest traffic"]
};
