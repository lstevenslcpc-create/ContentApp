import OpenAI from "openai";
import type { BrandBrain, BusinessProfile, ContentGenerationRequest, ContentOpportunity } from "./types";
import { buildContentPrompt } from "./contentPrompt";
import { formatBrandBrainForPrompt } from "./brandBrain/format";

type GeneratedPost = {
  hook: string;
  caption: string;
  hashtags: string[];
  visual_idea: string;
  script?: string;
};

export async function generateStructuredContent(profile: BusinessProfile, request: ContentGenerationRequest, brandBrain?: BrandBrain | null): Promise<GeneratedPost[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.75,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return only valid JSON. Do not include markdown." },
      { role: "user", content: buildContentPrompt(profile, request, brandBrain) }
    ]
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(raw) as { posts?: GeneratedPost[] };
  if (!Array.isArray(parsed.posts)) {
    throw new Error("OpenAI response did not include a posts array.");
  }

  return parsed.posts.map((post) => ({
    hook: String(post.hook || "").trim(),
    caption: String(post.caption || "").trim(),
    hashtags: Array.isArray(post.hashtags) ? post.hashtags.map(String) : [],
    visual_idea: String(post.visual_idea || "").trim(),
    script: String(post.script || "").trim()
  }));
}

export async function generateContentOpportunities(theme: string, brandBrain?: BrandBrain | null): Promise<ContentOpportunity[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content intelligence.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.82,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Return only valid JSON. You are a therapist-creator content strategist. Do not claim access to live trend APIs, live search volume, or real-time social data. Avoid generic wellness language."
      },
      {
        role: "user",
        content: `
You are the Humanized Content Intelligence Engine for LionHeart Therapy.

Generate 6 AI-assisted content strategy opportunities for the broad theme: "${theme}".

Important: These are AI-assisted strategy suggestions based on brand context, SEO reasoning, audience pain points, and content positioning. Do not present them as live trend data.

${formatBrandBrainForPrompt(brandBrain)}

Content must feel like a real therapist creator wrote it: emotionally specific, psychologically insightful, modern, relatable, socially engaging, clinically grounded, and optimized for saves/shares/searches.

Prioritize emotionally specific material such as:
- hidden anxiety behaviors
- inner dialogue
- emotional contradictions
- nervous system responses
- subtle burnout signs
- attachment patterns
- people pleasing behaviors
- emotional avoidance
- perfectionism and conflict avoidance
- high-functioning anxiety
- emotionally immature family dynamics
- overstimulation and emotional shutdown
- functional depression and masking behaviors
- therapy misconceptions

Optimize for LionHeart audiences:
- anxious teens
- emotionally overwhelmed women
- burnt-out millennial moms
- college-age women
- anxious high achievers
- emotionally exhausted caregivers
- women navigating emotional labor

Every idea must connect to one funnel path when relevant:
- therapy services
- anxiety workbook
- teen workbook
- coloring books
- journals
- lead magnets
- newsletter
- blog posts

Avoid:
- corporate AI tone
- textbook summaries
- generic wellness influencer phrasing
- excessive positivity
- fake inspirational wording
- "healing journey"
- "just breathe"
- "you are enough"
- "unlock your potential"
- broad phrases like "mental health matters" unless made sharply specific

Platform strategy requirements:
- TikTok: emotionally direct hooks, inner dialogue, short punchy wording, confessional but clinically safe
- Instagram carousel: save-worthy frames, identity recognition, practical self-awareness
- Pinterest: searchable titles, symptom lists, workbook/infographic tie-ins
- Blogs: AI-search optimized, long-tail SEO, emotionally readable education
- Threads: concise tension, comment-worthy nuance, conversational phrasing
- Newsletters: warm therapist-authored reflection with a grounded CTA

Visual direction should be specific and creator-ready, using aesthetics like notebook style, moody burnout visuals, mirror selfie, nervous system infographic, cozy therapy office, realistic lifestyle imagery, text-message style, clean Pinterest infographic, or Gen Z classroom aesthetic when appropriate.

Return strict JSON only:
{
  "opportunities": [
    {
      "topic": "Emotionally specific topic title, not broad",
      "explanation": "2 sentence strategic explanation that names the hidden emotional pain and why it would perform",
      "strongest_emotional_hook": "A social-first hook that sounds human and emotionally specific",
      "curiosity_angle": "What makes someone need to click/watch/read",
      "save_worthy_angle": "Why someone would save this",
      "share_worthy_angle": "Why someone would send/share this",
      "comment_bait_potential": "A clinically safe question or tension likely to invite comments",
      "emotional_trigger_category": "validation | identity recognition | hidden symptom recognition | self-awareness shock | relationship tension | nervous system education",
      "audience": "One LionHeart audience persona",
      "content_pillar": "Education | Trust-building | SEO | Product | Service | Story | Conversion",
      "platform_recommendations": {
        "tiktok_reels": "Platform-native TikTok/Reels hook and execution",
        "instagram_carousel": "Save-worthy carousel frame sequence",
        "pinterest_pin": "Searchable Pinterest title and infographic angle",
        "blog_seo_article": "Long-tail SEO article angle with emotionally readable promise",
        "threads_post": "Short Threads angle with conversational tension",
        "email_newsletter": "Therapist-authored newsletter angle"
      },
      "seo_keywords": ["long-tail keyword"],
      "virality_score": 1-100,
      "emotional_resonance_score": 1-100,
      "save_potential_score": 1-100,
      "trust_building_score": 1-100,
      "conversion_score": 1-100,
      "seo_score": 1-100,
      "pinterest_potential_score": 1-100,
      "ai_search_potential_score": 1-100,
      "seo_opportunity_score": 1-100,
      "emotional_engagement_score": 1-100,
      "emotional_angle": "Emotional reason this resonates",
      "visual_direction": "Specific Canva/photo/video aesthetic direction",
      "product_tie_in": "Relevant product or empty string",
      "service_tie_in": "Relevant therapy service or empty string",
      "cta": "Recommended CTA",
      "clinical_sensitivity": "low | medium | high"
    }
  ]
}

Make the ideas specific to therapy, clinical safety, LionHeart Therapy, products/services, and the Brand Brain. Every output should feel less educational-generic and more like a therapist creator naming the thing the audience has felt but not had words for.
`
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty content intelligence response.");

  const parsed = JSON.parse(raw) as { opportunities?: ContentOpportunity[] };
  if (!Array.isArray(parsed.opportunities)) {
    throw new Error("OpenAI response did not include an opportunities array.");
  }

  return parsed.opportunities.map((opportunity) => ({
    topic: String(opportunity.topic || "").trim(),
    explanation: String(opportunity.explanation || "").trim(),
    strongest_emotional_hook: String(opportunity.strongest_emotional_hook || "").trim(),
    curiosity_angle: String(opportunity.curiosity_angle || "").trim(),
    save_worthy_angle: String(opportunity.save_worthy_angle || "").trim(),
    share_worthy_angle: String(opportunity.share_worthy_angle || "").trim(),
    comment_bait_potential: String(opportunity.comment_bait_potential || "").trim(),
    emotional_trigger_category: String(opportunity.emotional_trigger_category || "").trim(),
    audience: String(opportunity.audience || "").trim(),
    content_pillar: String(opportunity.content_pillar || "").trim(),
    platform_recommendations: opportunity.platform_recommendations || {},
    seo_keywords: Array.isArray(opportunity.seo_keywords) ? opportunity.seo_keywords.map(String) : [],
    virality_score: Number(opportunity.virality_score || 0),
    emotional_resonance_score: Number(opportunity.emotional_resonance_score || opportunity.emotional_engagement_score || 0),
    save_potential_score: Number(opportunity.save_potential_score || 0),
    trust_building_score: Number(opportunity.trust_building_score || 0),
    conversion_score: Number(opportunity.conversion_score || 0),
    seo_score: Number(opportunity.seo_score || opportunity.seo_opportunity_score || 0),
    pinterest_potential_score: Number(opportunity.pinterest_potential_score || 0),
    ai_search_potential_score: Number(opportunity.ai_search_potential_score || 0),
    seo_opportunity_score: Number(opportunity.seo_opportunity_score || opportunity.seo_score || 0),
    emotional_engagement_score: Number(opportunity.emotional_engagement_score || opportunity.emotional_resonance_score || 0),
    emotional_angle: String(opportunity.emotional_angle || "").trim(),
    visual_direction: String(opportunity.visual_direction || "").trim(),
    product_tie_in: String(opportunity.product_tie_in || "").trim(),
    service_tie_in: String(opportunity.service_tie_in || "").trim(),
    cta: String(opportunity.cta || "").trim(),
    clinical_sensitivity: ["low", "medium", "high"].includes(opportunity.clinical_sensitivity) ? opportunity.clinical_sensitivity : "medium",
    status: "idea"
  }));
}
