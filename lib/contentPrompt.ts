import type { BrandBrain, BusinessProfile, ContentGenerationRequest } from "./types";
import { formatBrandBrainForPrompt } from "./brandBrain/format";

export function buildContentPrompt(profile: BusinessProfile, request: ContentGenerationRequest, brandBrain?: BrandBrain | null) {
  return `
You are an expert small-business content strategist. Generate ${request.numberOfPosts} ready-to-review ${request.contentType} idea(s) for ${request.platform}.

Business:
- Name: ${profile.business_name}
- Industry: ${profile.industry || "Not provided"}
- Services: ${profile.services_offered || "Not provided"}
- Target audience: ${profile.target_audience || "Not provided"}
- Location served: ${profile.location_served || "Not provided"}
- Brand voice: ${profile.brand_voice || "clear, helpful, credible"}
- Main goal: ${profile.main_goal || request.contentGoal}
- Offer/promotion: ${profile.offer_promotion || "None"}
- Preferred CTA: ${profile.call_to_action || "Contact us today"}

Content goal: ${request.contentGoal}

${request.intelligenceBrief ? `
Content Intelligence Brief:
- Topic: ${request.intelligenceBrief.topic}
- Audience: ${request.intelligenceBrief.audience}
- Content pillar: ${request.intelligenceBrief.content_pillar}
- SEO keywords: ${request.intelligenceBrief.seo_keywords.join(", ")}
- Emotional angle: ${request.intelligenceBrief.emotional_angle}
- Product tie-in: ${request.intelligenceBrief.product_tie_in || "None"}
- Service tie-in: ${request.intelligenceBrief.service_tie_in || "None"}
- Required CTA direction: ${request.intelligenceBrief.cta}
- Clinical sensitivity: ${request.intelligenceBrief.clinical_sensitivity}

Build the content pack around this brief. Keep each post distinct, but make the whole pack feel like a strategic campaign.
` : ""}

${formatBrandBrainForPrompt(brandBrain)}

Content rules:
- Make outputs feel deeply customized to ${brandBrain?.brand_name || profile.business_name}, never generic wellness AI.
- Use the Brand Brain's audience profiles, therapy services, product catalog, SEO priorities, safety rules, visual identity, and CTA preferences.
- Do not use forbidden AI phrases or generic therapy clichés.
- Avoid diagnostic certainty, crisis-baiting, fear-based urgency, guaranteed outcomes, and graphic trauma details.
- Include clinical nuance and a gentle review-before-posting mindset.
- Canva visual directions must follow the Brand Brain visual rules.

Return strict JSON only with this shape:
{
  "posts": [
    {
      "hook": "Strong opening line",
      "caption": "Platform-specific caption with clear value, simple explanation, and CTA. Sound like the owner speaking to a potential client. Avoid generic filler and guaranteed lead claims.",
      "hashtags": ["#Example"],
      "visual_idea": "Specific visual or Canva-ready creative direction",
      "script": "Short script for Reels/TikTok/Shorts, or empty string for non-video formats"
    }
  ]
}

Every post must be client-focused, specific to the business, clinically safe, and ready for manual posting after review.
`;
}
