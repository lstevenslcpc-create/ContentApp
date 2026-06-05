import type { BrandBrain, BusinessProfile, ContentGenerationRequest } from "./types";
import { formatBrandBrainForPrompt } from "./brandBrain/format";

const goalStrategies: Record<string, { hook: string; cta: string; template: string }> = {
  leads: {
    hook: "Use a problem-aware hook that names the audience's current pain and builds trust quickly.",
    cta: "Use a soft inquiry CTA that invites the reader to book, message, or take the next step without pressure.",
    template: "Choose a trust-building carousel, service explainer, or simple consultation CTA layout."
  },
  education: {
    hook: "Use a clear teaching hook that answers a question, explains a pattern, or corrects a misconception.",
    cta: "Use a save-for-later or learn-more CTA.",
    template: "Choose an educational carousel, infographic, blog graphic, or nervous-system explainer template."
  },
  "trust-building": {
    hook: "Use a validating hook that helps the audience feel understood before teaching.",
    cta: "Use a gentle relationship-building CTA that invites reflection, saving, sharing, or reaching out when ready.",
    template: "Choose an emotional hook carousel, therapist education carousel, or calm quote-style template."
  },
  promotion: {
    hook: "Use a benefit-led hook that connects the offer to a specific emotional or practical problem.",
    cta: "Use a clear product, service, or booking CTA while keeping the tone ethical and non-pushy.",
    template: "Choose a product promo, workbook promo, service promo, or offer-focused layout."
  },
  testimonials: {
    hook: "Use a credibility hook focused on transformation, reassurance, or what support can make possible.",
    cta: "Use a trust-forward CTA that invites the reader to explore whether the support fits them.",
    template: "Choose a testimonial-style card, story post, quote post, or trust-building carousel."
  },
  awareness: {
    hook: "Use an accessible recognition hook that introduces the topic to people who may not have named it yet.",
    cta: "Use a share, save, or learn-more CTA.",
    template: "Choose a broad awareness carousel, infographic, or platform-native short-form layout."
  },
  "follower-growth": {
    hook: "Use an emotionally specific, social-native recognition hook that names a tiny lived moment, body reaction, inner dialogue, or relationship trigger. Avoid broad questions.",
    cta: "Prioritize saves, shares, comments, and following before any therapy or service promotion.",
    template: "Choose an Emotional Hook Carousel, creator-native carousel, text-message style post, Reel cover, or recognition-based Canva template."
  },
  engagement: {
    hook: "Use a conversational hook with a tension, question, or inner-dialogue moment that invites response.",
    cta: "Use a comment CTA that is clinically safe and easy to answer.",
    template: "Choose a discussion-style carousel, Threads prompt, poll-style story, or short Reel cover."
  },
  saves: {
    hook: "Use a practical, list-based, or recognition hook that feels worth keeping.",
    cta: "Use an explicit save-this CTA connected to future use.",
    template: "Choose a checklist, symptom list, coping tool, carousel, or Pinterest infographic template."
  },
  shares: {
    hook: "Use a 'send this to someone who...' hook or a shared-experience hook with emotional specificity.",
    cta: "Use a share/send CTA that feels supportive, not performative.",
    template: "Choose a quote post, recognition carousel, emotional hook carousel, or text-message style layout."
  },
  "reach-awareness": {
    hook: "Use a broad but emotionally sharp hook that can travel beyond the existing audience.",
    cta: "Use a low-friction CTA such as share, save, follow, or read more.",
    template: "Choose a visually simple awareness post, Reel cover, Pinterest pin, or infographic."
  },
  "community-building": {
    hook: "Use a belonging-focused hook that names a shared experience without overgeneralizing.",
    cta: "Use a gentle community CTA such as 'tell me if this resonates' or 'save for a steadier moment.'",
    template: "Choose a warm carousel, Threads post, story prompt, or therapist-authored reflection template."
  },
  "thought-leadership": {
    hook: "Use a nuanced perspective hook that challenges a common assumption with clinical clarity.",
    cta: "Use a credibility-building CTA that invites deeper reading, newsletter signup, or consultation.",
    template: "Choose an editorial carousel, blog/SEO pin, LinkedIn-style post, or therapist education template."
  },
  "email-list-growth": {
    hook: "Use a resource-led hook that gives the audience a reason to want a deeper guide or download.",
    cta: "Use a lead magnet or newsletter signup CTA.",
    template: "Choose a lead magnet promo, workbook preview, Pinterest pin, or newsletter graphic template."
  },
  "therapy-inquiries": {
    hook: "Use a service-fit hook that names when therapy support may be helpful without diagnosing.",
    cta: "Use a soft therapy inquiry CTA for consultation, contact, or learning about services.",
    template: "Choose a service promo, therapist education carousel, or consultation CTA layout."
  },
  "product-sales": {
    hook: "Use a problem-to-support hook that connects the product to a specific emotional need or daily use case.",
    cta: "Use a clear product CTA that explains the next step and keeps claims realistic.",
    template: "Choose a workbook/product promo, Pinterest product pin, carousel, or clean product feature layout."
  }
};

function contentGoalStrategy(goal: string) {
  return goalStrategies[goal] || {
    hook: "Use a goal-aligned hook that feels specific, human, and platform-native.",
    cta: "Use a CTA that directly supports the selected content goal.",
    template: "Choose the Canva or visual template that best supports the selected goal."
  };
}

function followerGrowthInstructions(request: ContentGenerationRequest) {
  if (request.contentGoal !== "follower-growth") return "";

  return `
Follower-growth rules:
- Write for relatability, saves, shares, comments, and follows before therapy/service promotion.
- Hooks must be emotionally specific and social-native. Name the tiny moment, inner dialogue, body reaction, or relationship cue.
- Bad hook style: "Does it feel like your relationships are a constant source of stress?"
- Good hook style: "When their tone changes and your whole body starts looking for what went wrong"
- Use this CTA family when it fits naturally:
  - "save this if it felt familiar"
  - "send this to someone who overthinks every tone shift"
  - "follow @LHtherapy for emotionally honest mental health content"
- Use at least one of those follower-growth CTAs verbatim, and prefer two when the caption has room.
- Do not use salesy or generic clinical phrases for follower-growth, including "discover practical tools", "nurture secure relationships", or "explore therapy options".
- Also avoid generic wellness filler such as "does this sound familiar", "you are not alone", "take a moment to pause and breathe", "mental health matters", or broad hashtags like "#MentalHealthMatters".
- Captions should stay anchored in the same specific moment as the hook. Use concrete examples, inner dialogue, body cues, and one gentle reframe before the CTA.
- Hashtags should be niche-specific and topic-specific, not broad awareness filler.
- Keep the voice emotionally intelligent, warm, relatable, trauma-informed, non-generic, social-native, and not salesy.
- For Instagram carousel content, include a stronger hook, carousel slide idea, caption, hashtags, and suggested Canva template in the generated fields.
- If topic is anxious attachment, aim for the emotional specificity of: "When their tone changes and your whole body starts looking for what went wrong."
`;
}

export function buildContentPrompt(profile: BusinessProfile, request: ContentGenerationRequest, brandBrain?: BrandBrain | null) {
  const strategy = contentGoalStrategy(request.contentGoal);

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

Primary content topic: ${request.topic}
Content goal: ${request.contentGoal}
Goal strategy:
- Hook style: ${strategy.hook}
- CTA style: ${strategy.cta}
- Template selection direction: ${strategy.template}
${followerGrowthInstructions(request)}

${request.intelligenceBrief ? `
Content Intelligence Brief:
- Topic: ${request.intelligenceBrief.topic}
- Audience: ${request.intelligenceBrief.audience}
- Content pillar: ${request.intelligenceBrief.content_pillar}
- SEO keywords: ${request.intelligenceBrief.seo_keywords.join(", ")}
- Emotional angle: ${request.intelligenceBrief.emotional_angle}
- Strongest hook: ${request.intelligenceBrief.strongest_emotional_hook || "Not provided"}
- Curiosity angle: ${request.intelligenceBrief.curiosity_angle || "Not provided"}
- Save-worthy angle: ${request.intelligenceBrief.save_worthy_angle || "Not provided"}
- Share-worthy angle: ${request.intelligenceBrief.share_worthy_angle || "Not provided"}
- Emotional trigger category: ${request.intelligenceBrief.emotional_trigger_category || "Not provided"}
- Visual direction: ${request.intelligenceBrief.visual_direction || "Not provided"}
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
- Avoid em dashes completely. Do not use — in any generated content. Replace em dashes with periods, commas, colons, or shorter sentences.
- Avoid diagnostic certainty, crisis-baiting, fear-based urgency, guaranteed outcomes, and graphic trauma details.
- Include clinical nuance and a gentle review-before-posting mindset.
- Canva visual directions must follow the Brand Brain visual rules.
- Let the selected content goal guide the hook style, CTA style, and Canva/template recommendation.
- Let the primary topic guide the emotional angle, examples, hook wording, SEO language, visual direction, and template recommendation.
- Include the recommended Canva/template direction inside visual_idea so it can be used during design prep.
- For follower-growth, keep service or therapy promotion secondary unless the user explicitly selected leads or therapy-inquiries.
- For follower-growth, captions should feel like a therapist creator naming a familiar emotional pattern, then inviting saves, shares, comments, or follows.

Return strict JSON only with this shape:
{
  "posts": [
    {
      "hook": "Strong opening line. For follower-growth, make this a specific lived-moment hook, not a broad question.",
      "caption": "Platform-specific caption with clear value, simple explanation, and CTA. For follower-growth, prioritize relatability, saves, shares, comments, and follows before therapy promotion. Avoid generic filler and guaranteed lead claims.",
      "hashtags": ["#Example"],
      "visual_idea": "Specific visual or Canva-ready creative direction, including suggested Canva template when relevant",
      "script": "Short script for Reels/TikTok/Shorts, or empty string for non-video formats"
    }
  ]
}

Every post must be client-focused, specific to the business, clinically safe, and ready for manual posting after review.
`;
}
