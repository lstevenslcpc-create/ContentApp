export type CanvaTemplateRegistryItem = {
  id: string;
  name: string;
  type: string;
  platforms: string[];
  best_for: string[];
  audience: string[];
  content_pillars: string[];
  template_url: string;
  description: string;
  fields: string[];
};

export const CANVA_TEMPLATES: CanvaTemplateRegistryItem[] = [
  {
    id: "emotional-hook-carousel",
    name: "Emotional Hook Carousel",
    type: "Instagram carousel",
    platforms: ["Instagram", "Pinterest", "Threads"],
    best_for: ["anxious attachment", "burnout", "people pleasing", "trauma responses"],
    audience: ["emotionally overwhelmed women", "anxious high achievers", "burnt-out millennial moms", "women navigating emotional labor"],
    content_pillars: ["emotional insight", "attachment patterns", "burnout education", "trust-building"],
    template_url: "https://canva.link/cy2tn3g7d4ptpbt",
    description: "A slide-by-slide carousel for emotionally specific recognition posts that help clients feel seen before moving into gentle clinical insight and a grounded CTA.",
    fields: [
      "slide1_hook",
      "slide1_subhook",
      "slide2_recognition",
      "slide3_nervous_system_explanation",
      "slide4_examples",
      "slide5_reframe",
      "slide6_healing_message",
      "slide7_cta"
    ]
  },
  {
    id: "teen-mental-health-carousel",
    name: "Teen Mental Health Carousel",
    type: "Instagram carousel",
    platforms: ["Instagram", "Pinterest"],
    best_for: ["teen anxiety", "school stress", "self-esteem", "friendships"],
    audience: ["anxious teen girls", "college-age women", "parents of anxious teens"],
    content_pillars: ["teen mental health", "school stress", "self-esteem support", "therapy education"],
    template_url: "https://canva.link/9z5upp0t97uase5",
    description: "A warm carousel structure for teen-focused psychoeducation, school stress validation, friendship pressure, and workbook or therapy CTAs.",
    fields: [
      "slide1_teen_hook",
      "slide2_school_or_social_pressure",
      "slide3_what_it_can_feel_like",
      "slide4_normalizing_context",
      "slide5_coping_skill",
      "slide6_parent_or_teen_reflection",
      "slide7_cta"
    ]
  },
  {
    id: "therapist-education-carousel",
    name: "Therapist Education Carousel",
    type: "Instagram carousel",
    platforms: ["Instagram", "LinkedIn", "Pinterest"],
    best_for: ["therapy myths", "coping skills", "nervous system education"],
    audience: ["therapy-curious clients", "anxious high achievers", "emotionally exhausted caregivers"],
    content_pillars: ["therapy education", "nervous system education", "clinical clarity", "trust-building"],
    template_url: "https://canva.link/zmhh9b7la0cqok1",
    description: "A clean educational carousel for explaining clinical concepts in plain language without sounding textbook or overly inspirational.",
    fields: [
      "slide1_myth_or_question",
      "slide2_plain_language_answer",
      "slide3_clinical_context",
      "slide4_real_life_example",
      "slide5_coping_or_reflection_prompt",
      "slide6_when_to_seek_support",
      "slide7_cta_or_disclaimer"
    ]
  },
  {
    id: "pinterest-infographic-pin",
    name: "Pinterest Infographic Pin",
    type: "Pinterest pin",
    platforms: ["Pinterest"],
    best_for: ["SEO traffic", "workbook sales", "coping tips"],
    audience: ["Pinterest searchers", "workbook buyers", "anxious women", "parents of anxious teens"],
    content_pillars: ["SEO education", "coping tips", "product funnel", "workbook promotion"],
    template_url: "https://canva.link/3bn083koc2jngda",
    description: "A search-friendly infographic pin for symptom lists, coping steps, workbook tie-ins, and save-worthy mental health education.",
    fields: [
      "pin_title",
      "pin_subtitle",
      "section1_heading",
      "section1_points",
      "section2_heading",
      "section2_points",
      "workbook_or_service_tie_in",
      "pin_cta"
    ]
  },
  {
    id: "blog-seo-pin",
    name: "Blog/SEO Pin",
    type: "Blog graphic",
    platforms: ["Pinterest", "Blog"],
    best_for: ["sending traffic to the website/blog"],
    audience: ["SEO searchers", "therapy-curious clients", "parents", "anxious high achievers"],
    content_pillars: ["blog SEO", "AI search", "therapy education", "website traffic"],
    template_url: "https://canva.link/h7y6pe2h3t21ej1",
    description: "A website-traffic pin template for long-tail SEO topics, blog promotion, AI-search-friendly content, and therapy service education.",
    fields: [
      "seo_title",
      "seo_subtitle",
      "blog_category",
      "key_question",
      "three_takeaways",
      "service_or_product_tie_in",
      "website_cta"
    ]
  },
  {
    id: "reel-tiktok-cover",
    name: "Reel/TikTok Cover",
    type: "Reel cover",
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    best_for: ["talking videos", "therapist POVs", "guided meditations"],
    audience: ["anxious teens", "college-age women", "overwhelmed moms", "emotionally overwhelmed women"],
    content_pillars: ["short-form video", "therapist POV", "guided support", "emotional recognition"],
    template_url: "https://canva.link/b7gngqim4oryszt",
    description: "A short-form video cover template for punchy therapist POV hooks, relatable inner-dialogue videos, and calming guided support.",
    fields: [
      "cover_hook",
      "cover_subhook",
      "video_series_label",
      "therapist_pov_line",
      "visual_mood",
      "cta_microcopy"
    ]
  },
  {
    id: "workbook-product-promo-template",
    name: "Workbook/Product Promo Template",
    type: "Workbook promo",
    platforms: ["Instagram", "Pinterest", "Facebook", "Email"],
    best_for: ["teen workbook", "anxiety workbook", "journals", "coloring books"],
    audience: ["workbook buyers", "parents of anxious teens", "anxious women", "journal users"],
    content_pillars: ["product promotion", "workbook funnel", "self-guided support", "seasonal marketing"],
    template_url: "https://canva.link/vamp5uty17yuvm7",
    description: "A product promo template for workbooks, journals, coloring books, and toolkits that keeps the offer warm, grounded, and visually on-brand.",
    fields: [
      "product_name",
      "product_hook",
      "pain_point",
      "transformation_outcome",
      "inside_the_product",
      "best_for",
      "seasonal_angle",
      "product_cta"
    ]
  }
];
