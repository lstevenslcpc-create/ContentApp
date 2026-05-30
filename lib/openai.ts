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

type ParsedContentOpportunities = {
  opportunities: ContentOpportunity[];
  warnings: string[];
  debug: {
    openAiResponseReceived: boolean;
    rawResponsePreview: string;
    opportunitiesArrayParsed: boolean;
    opportunityCount: number;
    modelUsed?: string;
    openAiStatusCode?: number | string;
    openAiErrorType?: string;
    openAiErrorCode?: string;
    minimalTestSucceeded?: boolean;
    responseFormatUsed?: boolean;
  };
};

type SafeOpenAiError = {
  message: string;
  name?: string;
  status?: number | string;
  code?: string;
  type?: string;
  stackPreview?: string;
};

type ChatCompletionParams = Parameters<OpenAI["chat"]["completions"]["create"]>[0];

type OpenAiGenerationDebug = {
  modelUsed?: string;
  openAiStatusCode?: number | string;
  openAiErrorType?: string;
  openAiErrorCode?: string;
  minimalTestSucceeded: boolean;
  responseFormatUsed?: boolean;
};

type NonStreamingCompletion = {
  choices: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | null;
    } | null;
  }>;
};

function extractJsonObject(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced) as unknown;
    }
    throw new Error("OpenAI returned invalid JSON that could not be repaired.");
  }
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function safeOpenAiError(error: unknown): SafeOpenAiError {
  const maybe = typeof error === "object" && error !== null ? error as Record<string, unknown> : {};
  const message = error instanceof Error ? error.message : String(maybe.message || error || "Unknown OpenAI error");
  const stack = error instanceof Error ? error.stack : undefined;
  return {
    message,
    name: error instanceof Error ? error.name : typeof maybe.name === "string" ? maybe.name : undefined,
    status: typeof maybe.status === "number" || typeof maybe.status === "string" ? maybe.status : undefined,
    code: typeof maybe.code === "string" ? maybe.code : undefined,
    type: typeof maybe.type === "string" ? maybe.type : undefined,
    stackPreview: stack?.slice(0, 900)
  };
}

function logOpenAiError(label: string, error: unknown) {
  const safe = safeOpenAiError(error);
  console.error(label, safe);
  return safe;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function modelCandidates() {
  return Array.from(new Set([
    process.env.OPENAI_MODEL,
    "gpt-4o-mini",
    "gpt-4o"
  ].filter(Boolean) as string[]));
}

async function minimalOpenAiTest(client: OpenAI, model: string) {
  return withTimeout(
    client.chat.completions.create({
      model,
      max_tokens: 24,
      temperature: 0,
      messages: [
        { role: "user", content: "Reply with one short sentence confirming the connection works." }
      ]
    }),
    15000,
    `OpenAI minimal test for ${model}`
  );
}

async function createJsonCompletion(client: OpenAI, params: ChatCompletionParams, model: string, useResponseFormat: boolean) {
  const request = {
    ...params,
    model,
    ...(useResponseFormat ? { response_format: { type: "json_object" as const } } : {})
  };

  return withTimeout(
    client.chat.completions.create(request),
    45000,
    `OpenAI JSON generation for ${model}`
  );
}

function asNumber(value: unknown, fallback = 72) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizePlatformRecommendations(value: unknown) {
  const fallback = {
    tiktok_reels: "Lead with a direct inner-dialogue hook and one emotionally specific example.",
    instagram_carousel: "Build a save-worthy carousel around hidden signs, then end with a gentle CTA.",
    pinterest_pin: "Use a searchable symptom-list title with a clean infographic layout.",
    blog_seo_article: "Turn the idea into a long-tail, AI-search-friendly article with clinical nuance.",
    threads_post: "Write a concise observation that names the tension and invites reflection.",
    email_newsletter: "Frame it as a therapist-authored note with one grounded takeaway."
  };

  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  return { ...fallback, ...(value as Record<string, string>) };
}

function normalizeClinicalSensitivity(value: unknown): "low" | "medium" | "high" {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") return normalized;
  return "medium";
}

function fallbackContentOpportunities(theme: string): ContentOpportunity[] {
  const baseTopic = theme.trim() || "therapy content";
  return [
    {
      topic: `What ${baseTopic} can look like when it is easy to hide`,
      explanation: `A fallback content angle about ${baseTopic} that names hidden emotional patterns in a clinically safe, human way.`,
      strongest_emotional_hook: `If ${baseTopic} looks quiet from the outside but loud on the inside...`,
      curiosity_angle: "Names a private experience people may recognize before they have language for it.",
      save_worthy_angle: "Gives the audience a simple phrase to come back to later.",
      share_worthy_angle: "Easy to send to someone who feels the same pattern but has not named it yet.",
      comment_bait_potential: "What part of this feels most familiar?",
      emotional_trigger_category: "hidden symptom recognition",
      audience: "emotionally overwhelmed women",
      content_pillar: "Trust-building",
      platform_recommendations: normalizePlatformRecommendations({}),
      seo_keywords: [baseTopic, `${baseTopic} therapy`, `signs of ${baseTopic}`],
      virality_score: 68,
      emotional_resonance_score: 78,
      save_potential_score: 76,
      trust_building_score: 82,
      conversion_score: 62,
      seo_score: 70,
      pinterest_potential_score: 70,
      ai_search_potential_score: 70,
      seo_opportunity_score: 70,
      emotional_engagement_score: 78,
      emotional_angle: "Validates a subtle internal experience without overpromising or diagnosing.",
      visual_direction: "Soft notebook-style carousel with muted navy text, cream background, and one inner-dialogue pull quote.",
      product_tie_in: "",
      service_tie_in: "Anxiety Therapy",
      cta: "Save this for later, and reach out when you are ready for support.",
      clinical_sensitivity: "medium",
      status: "idea"
    }
  ];
}

function normalizeOpportunity(opportunity: Partial<ContentOpportunity>, theme: string, index: number): ContentOpportunity {
  const topic = String(opportunity.topic || `${theme} content angle ${index + 1}`).trim();
  const emotionalHook = String(opportunity.strongest_emotional_hook || `The part of ${theme} people rarely say out loud`).trim();
  const seoScore = asNumber(opportunity.seo_score || opportunity.seo_opportunity_score);
  const resonanceScore = asNumber(opportunity.emotional_resonance_score || opportunity.emotional_engagement_score, 78);

  if (!topic) {
    throw new Error(`Opportunity ${index + 1} is missing a topic.`);
  }

  return {
    topic,
    explanation: String(opportunity.explanation || `A humanized LionHeart Therapy content angle about ${theme}, built around emotional specificity and clinical nuance.`).trim(),
    strongest_emotional_hook: emotionalHook,
    curiosity_angle: String(opportunity.curiosity_angle || "The hidden emotional pattern makes people want to keep reading.").trim(),
    save_worthy_angle: String(opportunity.save_worthy_angle || "Gives the audience language they can return to later.").trim(),
    share_worthy_angle: String(opportunity.share_worthy_angle || "Easy to send to someone who feels this but has not named it yet.").trim(),
    comment_bait_potential: String(opportunity.comment_bait_potential || "What version of this shows up for you?").trim(),
    emotional_trigger_category: String(opportunity.emotional_trigger_category || "hidden symptom recognition").trim(),
    audience: String(opportunity.audience || "emotionally overwhelmed women").trim(),
    content_pillar: String(opportunity.content_pillar || "Trust-building").trim(),
    platform_recommendations: normalizePlatformRecommendations(opportunity.platform_recommendations),
    seo_keywords: asStringArray(opportunity.seo_keywords).length ? asStringArray(opportunity.seo_keywords) : [theme, `${theme} therapy`, `signs of ${theme}`],
    virality_score: asNumber(opportunity.virality_score, 74),
    emotional_resonance_score: resonanceScore,
    save_potential_score: asNumber(opportunity.save_potential_score, 80),
    trust_building_score: asNumber(opportunity.trust_building_score, 82),
    conversion_score: asNumber(opportunity.conversion_score, 70),
    seo_score: seoScore,
    pinterest_potential_score: asNumber(opportunity.pinterest_potential_score, 76),
    ai_search_potential_score: asNumber(opportunity.ai_search_potential_score, 76),
    seo_opportunity_score: asNumber(opportunity.seo_opportunity_score || seoScore),
    emotional_engagement_score: asNumber(opportunity.emotional_engagement_score || resonanceScore),
    emotional_angle: String(opportunity.emotional_angle || "Names a private emotional experience with compassion and clinical grounding.").trim(),
    visual_direction: String(opportunity.visual_direction || "Clean notebook-style visual with soft cream background, muted navy text, and a specific inner-dialogue pull quote.").trim(),
    product_tie_in: String(opportunity.product_tie_in || "").trim(),
    service_tie_in: String(opportunity.service_tie_in || "").trim(),
    cta: String(opportunity.cta || "Save this for later, and reach out when you are ready for support.").trim(),
    clinical_sensitivity: normalizeClinicalSensitivity(opportunity.clinical_sensitivity),
    status: "idea"
  };
}

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

  const parsed = extractJsonObject(raw) as { posts?: GeneratedPost[] };
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

export async function generateContentOpportunities(theme: string, brandBrain?: BrandBrain | null): Promise<ParsedContentOpportunities> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content intelligence.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let completion: NonStreamingCompletion | null = null;
  const openAiDebug: OpenAiGenerationDebug = {
    minimalTestSucceeded: false
  };

  const baseParams: ChatCompletionParams = {
    model: "gpt-4o-mini",
      temperature: 0.82,
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
      "virality_score": 84,
      "emotional_resonance_score": 91,
      "save_potential_score": 88,
      "trust_building_score": 86,
      "conversion_score": 74,
      "seo_score": 82,
      "pinterest_potential_score": 79,
      "ai_search_potential_score": 81,
      "seo_opportunity_score": 82,
      "emotional_engagement_score": 91,
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
  };

  const errors: SafeOpenAiError[] = [];

  for (const model of modelCandidates()) {
    openAiDebug.modelUsed = model;

    try {
      const minimal = await minimalOpenAiTest(client, model);
      openAiDebug.minimalTestSucceeded = true;
      console.info("[openai][content-intelligence][minimal-test-succeeded]", {
        model,
        responseLength: minimal.choices[0]?.message?.content?.length || 0
      });
    } catch (error) {
      const safe = logOpenAiError("[openai][content-intelligence][minimal-test-failed]", error);
      errors.push(safe);
      openAiDebug.openAiStatusCode = safe.status;
      openAiDebug.openAiErrorType = safe.type;
      openAiDebug.openAiErrorCode = safe.code;
      continue;
    }

    for (const useResponseFormat of [true, false]) {
      openAiDebug.responseFormatUsed = useResponseFormat;

      try {
        completion = await createJsonCompletion(client, baseParams, model, useResponseFormat) as NonStreamingCompletion;
        openAiDebug.modelUsed = model;
        console.info("[openai][content-intelligence][generation-request-succeeded]", {
          model,
          responseFormatUsed: useResponseFormat
        });
        break;
      } catch (error) {
        const safe = logOpenAiError("[openai][content-intelligence][generation-request-failed]", error);
        errors.push(safe);
        openAiDebug.openAiStatusCode = safe.status;
        openAiDebug.openAiErrorType = safe.type;
        openAiDebug.openAiErrorCode = safe.code;

        const looksResponseFormatRelated = `${safe.message} ${safe.code || ""} ${safe.type || ""}`.toLowerCase().includes("response_format");
        if (!useResponseFormat || !looksResponseFormatRelated) {
          break;
        }
      }
    }

    if (completion) break;
  }

  if (!completion) {
    const first = errors[0];
    const summary = first
      ? `${first.message}${first.status ? ` (status ${first.status})` : ""}${first.code ? ` code ${first.code}` : ""}${first.type ? ` type ${first.type}` : ""}`
      : "OpenAI request failed before returning a response.";
    const error = new Error(`OpenAI request failed: ${summary}`);
    (error as Error & { openAiDebug?: OpenAiGenerationDebug; openAiErrors?: SafeOpenAiError[] }).openAiDebug = openAiDebug;
    (error as Error & { openAiDebug?: OpenAiGenerationDebug; openAiErrors?: SafeOpenAiError[] }).openAiErrors = errors;
    throw error;
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    const error = new Error("OpenAI returned an empty content intelligence response.");
    (error as Error & { openAiDebug?: OpenAiGenerationDebug }).openAiDebug = openAiDebug;
    throw error;
  }

  console.info("[openai][content-intelligence][response-received]", {
    finishReason: completion.choices[0]?.finish_reason,
    contentLength: raw.length
  });
  console.info("[openai][content-intelligence][raw-response]", raw.slice(0, 4000));

  let parsed: { opportunities?: Partial<ContentOpportunity>[] } | Partial<ContentOpportunity>[];
  const warnings: string[] = [];

  try {
    parsed = extractJsonObject(raw) as { opportunities?: Partial<ContentOpportunity>[] } | Partial<ContentOpportunity>[];
  } catch (error) {
    console.error("[openai][content-intelligence][json-parse-failed]", {
      message: safeErrorMessage(error),
      preview: raw.slice(0, 500)
    });

    return {
      opportunities: fallbackContentOpportunities(theme),
      warnings: [`OpenAI returned malformed JSON, so a safe fallback idea was generated instead. Parser detail: ${safeErrorMessage(error)}`],
      debug: {
        openAiResponseReceived: true,
        rawResponsePreview: raw.slice(0, 1200),
        opportunitiesArrayParsed: false,
        opportunityCount: 1,
        ...openAiDebug
      }
    };
  }

  const rawOpportunities = Array.isArray(parsed) ? parsed : parsed.opportunities;

  if (!Array.isArray(rawOpportunities)) {
    console.error("[openai][content-intelligence][validation-failed]", {
      parsedType: Array.isArray(parsed) ? "array" : typeof parsed,
      keys: typeof parsed === "object" && parsed !== null ? Object.keys(parsed) : []
    });

    return {
      opportunities: fallbackContentOpportunities(theme),
      warnings: ["OpenAI response did not include an opportunities array, so a safe fallback idea was generated instead."],
      debug: {
        openAiResponseReceived: true,
        rawResponsePreview: raw.slice(0, 1200),
        opportunitiesArrayParsed: false,
        opportunityCount: 1,
        ...openAiDebug
      }
    };
  }

  const normalized = rawOpportunities.flatMap((opportunity, index) => {
    try {
      return [normalizeOpportunity(opportunity, theme, index)];
    } catch (error) {
      const message = safeErrorMessage(error);
      console.warn("[openai][content-intelligence][opportunity-validation-failed]", {
        index,
        message
      });
      warnings.push(`Skipped malformed opportunity ${index + 1}: ${message}`);
      return [];
    }
  });

  if (!normalized.length) {
    warnings.push("All OpenAI opportunities were malformed, so a safe fallback idea was generated instead.");
    return {
      opportunities: fallbackContentOpportunities(theme),
      warnings,
      debug: {
        openAiResponseReceived: true,
        rawResponsePreview: raw.slice(0, 1200),
        opportunitiesArrayParsed: true,
        opportunityCount: 1,
        ...openAiDebug
      }
    };
  }

  console.info("[openai][content-intelligence][parsed]", {
    opportunitiesArrayParsed: true,
    opportunityCount: normalized.length,
    skippedCount: warnings.length
  });

  return {
    opportunities: normalized,
    warnings,
    debug: {
      openAiResponseReceived: true,
      rawResponsePreview: raw.slice(0, 1200),
      opportunitiesArrayParsed: true,
      opportunityCount: normalized.length,
      ...openAiDebug
    }
  };
}
