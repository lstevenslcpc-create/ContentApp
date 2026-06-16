import type { BrandBrain } from "@/lib/types";
import { defaultBrandBrain } from "./defaults";

function mergeBrandBrain(brandBrain: Partial<BrandBrain>): BrandBrain {
  return {
    id: brandBrain.id || "brand-brain-fallback",
    user_id: brandBrain.user_id,
    brand_name: brandBrain.brand_name || defaultBrandBrain.brand_name,
    tagline: brandBrain.tagline || defaultBrandBrain.tagline,
    mission: brandBrain.mission || defaultBrandBrain.mission,
    personality_sliders: { ...defaultBrandBrain.personality_sliders, ...brandBrain.personality_sliders },
    voice_tone: { ...defaultBrandBrain.voice_tone, ...brandBrain.voice_tone },
    forbidden_ai_phrases: brandBrain.forbidden_ai_phrases || defaultBrandBrain.forbidden_ai_phrases,
    audience_profiles: brandBrain.audience_profiles || defaultBrandBrain.audience_profiles,
    therapy_services: brandBrain.therapy_services || defaultBrandBrain.therapy_services,
    product_catalog: brandBrain.product_catalog || defaultBrandBrain.product_catalog,
    visual_identity: { ...defaultBrandBrain.visual_identity, ...brandBrain.visual_identity },
    clinical_safety_rules: { ...defaultBrandBrain.clinical_safety_rules, ...brandBrain.clinical_safety_rules },
    ai_instruction_layer: { ...defaultBrandBrain.ai_instruction_layer, ...brandBrain.ai_instruction_layer },
    seo_priorities: brandBrain.seo_priorities || defaultBrandBrain.seo_priorities,
    preferred_cta_styles: brandBrain.preferred_cta_styles || defaultBrandBrain.preferred_cta_styles,
    preferred_platforms: brandBrain.preferred_platforms || defaultBrandBrain.preferred_platforms,
    content_goals: brandBrain.content_goals || defaultBrandBrain.content_goals,
    conversion_priorities: brandBrain.conversion_priorities || defaultBrandBrain.conversion_priorities,
    created_at: brandBrain.created_at,
    updated_at: brandBrain.updated_at
  };
}

export function formatBrandBrainForPrompt(brandBrain?: BrandBrain | null) {
  if (!brandBrain) {
    return "No Brand Brain saved yet. Use the business profile only.";
  }

  const safeBrandBrain = mergeBrandBrain(brandBrain);
  const audiences = safeBrandBrain.audience_profiles.map((audience) => `${audience.name}: pain points ${audience.pain_points.join(", ")}; hooks ${audience.resonant_hooks.join(" | ")}`).join("\n");
  const services = safeBrandBrain.therapy_services.map((service) => `${service.name}: SEO ${service.seo_keywords.join(", ")}; CTA ${service.cta}`).join("\n");
  const products = safeBrandBrain.product_catalog.map((product) => `${product.name}: audience ${product.audience}; outcome ${product.transformation_outcome}; CTA ${product.cta}`).join("\n");

  return `
Brand Brain:
- Brand name: ${safeBrandBrain.brand_name}
- Tagline: ${safeBrandBrain.tagline || "Not provided"}
- Mission: ${safeBrandBrain.mission || "Not provided"}
- Personality sliders: clinical to relatable ${safeBrandBrain.personality_sliders.clinical_relatable}/100, witty to serious ${safeBrandBrain.personality_sliders.witty_serious}/100, educational to emotional ${safeBrandBrain.personality_sliders.educational_emotional}/100, trendy to timeless ${safeBrandBrain.personality_sliders.trendy_timeless}/100
- Emotional tone: ${safeBrandBrain.voice_tone.emotional_tone}
- Sentence style: ${safeBrandBrain.voice_tone.sentence_style}
- Formatting style: ${safeBrandBrain.voice_tone.formatting_style}
- Emoji preferences: ${safeBrandBrain.voice_tone.emoji_preferences}
- CTA tone: ${safeBrandBrain.voice_tone.cta_tone}
- Preferred phrases: ${safeBrandBrain.voice_tone.preferred_phrases.join(", ")}
- Avoid phrases: ${[...safeBrandBrain.voice_tone.phrases_to_avoid, ...safeBrandBrain.forbidden_ai_phrases].join(", ")}
- Punctuation rule: Avoid em dashes completely. Do not use — in captions, scripts, emails, blogs, Canva copy, or any generated content. Replace em dashes with periods, commas, colons, or shorter sentences.
- SEO priorities: ${safeBrandBrain.seo_priorities.join(", ")}
- Preferred CTA styles: ${safeBrandBrain.preferred_cta_styles.join(", ")}
- Preferred platforms: ${safeBrandBrain.preferred_platforms.join(", ")}
- Content goals: ${safeBrandBrain.content_goals.join(", ")}
- Conversion priorities: ${safeBrandBrain.conversion_priorities.join(", ")}

Audience profiles:
${audiences}

Therapy services:
${services}

Products:
${products}

Visual identity:
- Colors: ${safeBrandBrain.visual_identity.brand_colors.join(", ")}
- Fonts: ${safeBrandBrain.visual_identity.fonts.join(", ")}
- Aesthetic: ${safeBrandBrain.visual_identity.aesthetic_descriptors.join(", ")}
- Banned visual styles: ${safeBrandBrain.visual_identity.banned_visual_styles.join(", ")}
- Content vibe: ${safeBrandBrain.visual_identity.preferred_content_vibe}
- Canva categories: ${safeBrandBrain.visual_identity.canva_template_categories.join(", ")}

Clinical safety:
- Required disclaimers: ${safeBrandBrain.clinical_safety_rules.required_disclaimers.join(" | ")}
- Safety checks: ${safeBrandBrain.clinical_safety_rules.safety_checks.join(", ")}
- Crisis reminders: ${safeBrandBrain.clinical_safety_rules.crisis_resource_reminders.join(" | ")}
- Avoid diagnostic certainty: ${safeBrandBrain.clinical_safety_rules.avoid_diagnostic_certainty}
- Avoid overpromising: ${safeBrandBrain.clinical_safety_rules.avoid_overpromising}

Apply this Brand Brain to captions, hooks, video scripts, hashtags, SEO language, and Canva-ready visual directions.
`;
}

export function formatCompactBrandBrainForPrompt(brandBrain?: BrandBrain | null) {
  if (!brandBrain) {
    return "No Brand Brain saved yet. Use the business profile only.";
  }

  const safeBrandBrain = mergeBrandBrain(brandBrain);
  const audienceNames = safeBrandBrain.audience_profiles.map((audience) => audience.name).slice(0, 8).join(", ");
  const audiencePainPoints = Array.from(new Set(safeBrandBrain.audience_profiles.flatMap((audience) => audience.pain_points))).slice(0, 14).join(", ");
  const services = safeBrandBrain.therapy_services.map((service) => `${service.name}: ${service.cta}`).slice(0, 8).join(" | ");
  const products = safeBrandBrain.product_catalog.map((product) => `${product.name}: ${product.transformation_outcome}`).slice(0, 8).join(" | ");

  return `
Brand Brain Summary:
- Brand: ${safeBrandBrain.brand_name}
- Mission: ${safeBrandBrain.mission || "Not provided"}
- Emotional tone: ${safeBrandBrain.voice_tone.emotional_tone}
- Sentence style: ${safeBrandBrain.voice_tone.sentence_style}
- CTA tone: ${safeBrandBrain.voice_tone.cta_tone}
- Preferred phrases: ${safeBrandBrain.voice_tone.preferred_phrases.slice(0, 10).join(", ")}
- Avoid phrases: ${[...safeBrandBrain.voice_tone.phrases_to_avoid, ...safeBrandBrain.forbidden_ai_phrases].slice(0, 18).join(", ")}
- Punctuation rule: Avoid em dashes completely.
- Primary audiences: ${audienceNames}
- Audience pain points: ${audiencePainPoints}
- Therapy services: ${services}
- Products: ${products}
- SEO priorities: ${safeBrandBrain.seo_priorities.slice(0, 12).join(", ")}
- CTA styles: ${safeBrandBrain.preferred_cta_styles.slice(0, 10).join(", ")}
- Visual style: ${safeBrandBrain.visual_identity.aesthetic_descriptors.slice(0, 10).join(", ")}
- Required disclaimers: ${safeBrandBrain.clinical_safety_rules.required_disclaimers.slice(0, 5).join(" | ")}
- Safety: avoid diagnostic certainty ${safeBrandBrain.clinical_safety_rules.avoid_diagnostic_certainty}; avoid overpromising ${safeBrandBrain.clinical_safety_rules.avoid_overpromising}.
`;
}
