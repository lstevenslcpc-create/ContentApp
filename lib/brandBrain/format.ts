import type { BrandBrain } from "@/lib/types";

export function formatBrandBrainForPrompt(brandBrain?: BrandBrain | null) {
  if (!brandBrain) {
    return "No Brand Brain saved yet. Use the business profile only.";
  }

  const audiences = brandBrain.audience_profiles.map((audience) => `${audience.name}: pain points ${audience.pain_points.join(", ")}; hooks ${audience.resonant_hooks.join(" | ")}`).join("\n");
  const services = brandBrain.therapy_services.map((service) => `${service.name}: SEO ${service.seo_keywords.join(", ")}; CTA ${service.cta}`).join("\n");
  const products = brandBrain.product_catalog.map((product) => `${product.name}: audience ${product.audience}; outcome ${product.transformation_outcome}; CTA ${product.cta}`).join("\n");

  return `
Brand Brain:
- Brand name: ${brandBrain.brand_name}
- Tagline: ${brandBrain.tagline || "Not provided"}
- Mission: ${brandBrain.mission || "Not provided"}
- Personality sliders: clinical to relatable ${brandBrain.personality_sliders.clinical_relatable}/100, witty to serious ${brandBrain.personality_sliders.witty_serious}/100, educational to emotional ${brandBrain.personality_sliders.educational_emotional}/100, trendy to timeless ${brandBrain.personality_sliders.trendy_timeless}/100
- Emotional tone: ${brandBrain.voice_tone.emotional_tone}
- Sentence style: ${brandBrain.voice_tone.sentence_style}
- Formatting style: ${brandBrain.voice_tone.formatting_style}
- Emoji preferences: ${brandBrain.voice_tone.emoji_preferences}
- CTA tone: ${brandBrain.voice_tone.cta_tone}
- Preferred phrases: ${brandBrain.voice_tone.preferred_phrases.join(", ")}
- Avoid phrases: ${[...brandBrain.voice_tone.phrases_to_avoid, ...brandBrain.forbidden_ai_phrases].join(", ")}
- SEO priorities: ${brandBrain.seo_priorities.join(", ")}
- Preferred CTA styles: ${brandBrain.preferred_cta_styles.join(", ")}
- Preferred platforms: ${brandBrain.preferred_platforms.join(", ")}
- Content goals: ${brandBrain.content_goals.join(", ")}
- Conversion priorities: ${brandBrain.conversion_priorities.join(", ")}

Audience profiles:
${audiences}

Therapy services:
${services}

Products:
${products}

Visual identity:
- Colors: ${brandBrain.visual_identity.brand_colors.join(", ")}
- Fonts: ${brandBrain.visual_identity.fonts.join(", ")}
- Aesthetic: ${brandBrain.visual_identity.aesthetic_descriptors.join(", ")}
- Banned visual styles: ${brandBrain.visual_identity.banned_visual_styles.join(", ")}
- Content vibe: ${brandBrain.visual_identity.preferred_content_vibe}
- Canva categories: ${brandBrain.visual_identity.canva_template_categories.join(", ")}

Clinical safety:
- Required disclaimers: ${brandBrain.clinical_safety_rules.required_disclaimers.join(" | ")}
- Safety checks: ${brandBrain.clinical_safety_rules.safety_checks.join(", ")}
- Crisis reminders: ${brandBrain.clinical_safety_rules.crisis_resource_reminders.join(" | ")}
- Avoid diagnostic certainty: ${brandBrain.clinical_safety_rules.avoid_diagnostic_certainty}
- Avoid overpromising: ${brandBrain.clinical_safety_rules.avoid_overpromising}

Apply this Brand Brain to captions, hooks, video scripts, hashtags, SEO language, and Canva-ready visual directions.
`;
}
