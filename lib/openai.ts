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
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Return only valid JSON. Do not claim access to live trend APIs, live search volume, or real-time social data."
      },
      {
        role: "user",
        content: `
You are a content intelligence strategist for LionHeart Therapy. Generate 6 AI-assisted content strategy opportunities for the broad theme: "${theme}".

Important: These are AI-assisted strategy suggestions based on brand context, SEO reasoning, audience pain points, and content positioning. Do not present them as live trend data.

${formatBrandBrainForPrompt(brandBrain)}

Return strict JSON only:
{
  "opportunities": [
    {
      "topic": "Specific content topic title",
      "explanation": "2 sentence strategic explanation",
      "audience": "Target audience",
      "content_pillar": "Education | Trust-building | SEO | Product | Service | Story | Conversion",
      "platform_recommendations": {
        "tiktok_reels": "Short-form video angle",
        "instagram_carousel": "Carousel angle",
        "pinterest_pin": "Pinterest title/angle",
        "blog_seo_article": "SEO article angle",
        "threads_post": "Threads post angle",
        "email_newsletter": "Email newsletter angle"
      },
      "seo_keywords": ["keyword"],
      "seo_opportunity_score": 1-100,
      "emotional_engagement_score": 1-100,
      "emotional_angle": "Emotional reason this resonates",
      "product_tie_in": "Relevant product or empty string",
      "service_tie_in": "Relevant therapy service or empty string",
      "cta": "Recommended CTA",
      "clinical_sensitivity": "low | medium | high"
    }
  ]
}

Make the ideas specific to therapy, clinical safety, LionHeart Therapy, products/services, and the Brand Brain. Avoid generic wellness fluff.
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
    audience: String(opportunity.audience || "").trim(),
    content_pillar: String(opportunity.content_pillar || "").trim(),
    platform_recommendations: opportunity.platform_recommendations || {},
    seo_keywords: Array.isArray(opportunity.seo_keywords) ? opportunity.seo_keywords.map(String) : [],
    seo_opportunity_score: Number(opportunity.seo_opportunity_score || 0),
    emotional_engagement_score: Number(opportunity.emotional_engagement_score || 0),
    emotional_angle: String(opportunity.emotional_angle || "").trim(),
    product_tie_in: String(opportunity.product_tie_in || "").trim(),
    service_tie_in: String(opportunity.service_tie_in || "").trim(),
    cta: String(opportunity.cta || "").trim(),
    clinical_sensitivity: ["low", "medium", "high"].includes(opportunity.clinical_sensitivity) ? opportunity.clinical_sensitivity : "medium",
    status: "idea"
  }));
}
