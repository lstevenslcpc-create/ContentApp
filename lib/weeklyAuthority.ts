import type { SupabaseClient } from "@supabase/supabase-js";
import { formatCompactBrandBrainForPrompt } from "./brandBrain/format";
import { formatGoldStandardExamplesForPrompt, getRelevantGoldStandardExamples } from "./goldStandardLibrary";
import {
  getClaudePromptBuilderModel,
  getContentRepurposingModel,
  getJsonExtractionModel,
  logModelFallback,
  logModelSelection,
  type ModelRoute
} from "./modelRouter";
import type { BrandBrain, CanvaTemplate, GoldStandardExample, StoryFramework } from "./types";

export type WeeklyAuthorityStatus =
  | "Topic Planned"
  | "Brief Ready"
  | "Claude Prompt Ready"
  | "Sent to Claude"
  | "Claude Draft Needed"
  | "Draft Pasted"
  | "Content DNA Generated"
  | "Weekly Assets Generated"
  | "Needs Review"
  | "Approved"
  | "Scheduled"
  | "Published on Shopify";

export type WeeklyAuthorityInput = {
  blogTopic: string;
  targetAudience: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  businessGoal: string;
  ctaFocus: string;
  shopifyBlogCategory: string;
  suggestedPublishDate: string;
};

export type SuggestedBlogTopic = {
  blogTitle: string;
  blogTopic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetAudience: string;
  whyWorthPublishingNow: string;
  bestCta: string;
  estimatedAssetOutput: string;
  shopifyBlogCategory: string;
  businessGoal: string;
  ctaFocus: string;
};

export type BlogCreativeBrief = {
  seoTitleOptions: string[];
  shopifyBlogTitle: string;
  suggestedUrlSlug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  searchIntent: string;
  readerPainPoint: string;
  emotionalHook: string;
  psychologicalTherapistInsight: string;
  outline: Array<{ heading: string; subheadings: string[] }>;
  faqSuggestions: string[];
  internalLinksToInclude: Array<{ anchorText: string; destinationPage: string; reason: string }>;
  productServiceCtaSuggestion: string;
  pinterestAngle: string;
  youtubeAngle: string;
  shortFormVideoAngles: string[];
  newsletterAngle: string;
  shopifyTags: string[];
  shopifyPublishingChecklist: string[];
};

export type ContentDna = {
  mainTopic: string;
  searchIntent: string;
  keywords: string[];
  headingStructure: string[];
  faqs: string[];
  quoteWorthyLines: string[];
  therapistInsights: string[];
  emotionalThemes: string[];
  teachingPoints: string[];
  storyMoments: string[];
  ctaOpportunities: string[];
  internalLinkOpportunities: Array<{ anchorText: string; destinationPage: string; reason: string; placementSuggestion: string }>;
  shopifyTagsCategories: string[];
  workbookMentionOpportunities: string[];
  therapyServiceMentionOpportunities: string[];
};

export type WeeklyAssets = {
  youtubeScript: {
    suggestedTitle: string;
    hook: string;
    intro: string;
    teachingPoints: string[];
    exampleLanguage: string[];
    cta: string;
    thumbnailText: string;
    description: string;
    seoTags: string[];
    timestampOutline: string[];
  };
  shortFormVideoScripts: Array<{
    hook: string;
    script: string;
    onScreenText: string;
    brollSuggestions: string[];
    visualCues: string[];
    caption: string;
    seoKeywords: string[];
    cta: string;
    recommendedPlatform: string;
  }>;
  instagramCarousel: {
    carouselTitle: string;
    slideOutline: string[];
    slideCopy: string[];
    canvaDesignBrief: string;
    seoInstagramCaption: string;
    keywords: string[];
    cta: string;
  };
  pinterestPackage: {
    pinTitles: string[];
    pinDescriptions: string[];
    textOverlayOptions: string[];
    canvaPinDesignBrief: string;
    blogUrlPlaceholder: string;
    suggestedBoardCategory: string;
  };
  emailNewsletter: {
    subjectLineOptions: string[];
    previewText: string;
    newsletterBody: string;
    cta: string;
  };
  threadsXContent: Array<{
    emotionalHook: string;
    therapistInsight: string;
    practicalTakeaway: string;
    conversationStarter: string;
  }>;
  facebookPost: {
    post: string;
    conversationQuestion: string;
    cta: string;
  };
  internalLinkingAssistant: Array<{
    anchorText: string;
    destinationPage: string;
    reason: string;
    placementSuggestion: string;
  }>;
  ctaAssistant: {
    recommendedCta: string;
    reason: string;
    optionsConsidered: string[];
  };
  shopifyMetadata: {
    shopifyBlogTitle: string;
    shopifyExcerpt: string;
    shopifySeoTitle: string;
    shopifyMetaDescription: string;
    shopifyUrlHandle: string;
    shopifyTags: string[];
    shopifyBlogUrlPlaceholder: string;
    shopifyProductCtaSuggestions: string[];
    shopifyInternalProductLinks: string[];
    shopifyPublishingChecklist: string[];
  };
};

type Context = {
  brandBrain: BrandBrain | null;
  goldExamples: GoldStandardExample[];
  storyFrameworks: StoryFramework[];
  templates: CanvaTemplate[];
};

function removeEmDashes(value: string) {
  return value.replaceAll("—", ".").replace(/\s+\./g, ".").replace(/\.\s*\./g, ".");
}

function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") return removeEmDashes(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizeDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeDeep(item)])) as T;
  }
  return value;
}

function extractJson(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1)) as unknown;
    throw new Error("The AI response was not valid JSON.");
  }
}

function keywordList(value: string[] | string) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value;
}

function storyFrameworkSummary(storyFrameworks: StoryFramework[]) {
  if (!storyFrameworks.length) return "No saved Story Frameworks found. Use LionHeart storytelling defaults.";
  return storyFrameworks
    .slice(0, 8)
    .map((item) => `- ${item.framework_name}: ${item.purpose || item.when_to_use || "No description"}; best for ${(item.best_content_types || []).join(", ") || "flexible content"}`)
    .join("\n");
}

function templateSummary(templates: CanvaTemplate[]) {
  if (!templates.length) return "No approved Canva templates found. Recommend a manual Shopify blog and social asset format.";
  return templates
    .slice(0, 10)
    .map((item) => `- ${item.template_name}: ${item.format_type}; ${item.best_use_case || ""}; ${item.canva_template_link || ""}`)
    .join("\n");
}

function baseSystemPrompt(context: Context) {
  return `
You are the Weekly Authority Engine for LionHeart Therapy.
Claude writes the full long-form blog. This app plans the blog, builds the Claude prompt, analyzes the pasted Claude draft, and repurposes it.
Shopify is the only blog publishing platform. Do not mention WordPress.
Write in LionHeart Therapy voice: warm, direct, clinically grounded, practical, emotionally specific, therapist-safe, and non-generic.
Avoid overpromising, fear-based marketing, diagnostic certainty, and generic AI phrasing.
Avoid em dashes completely. Use periods, commas, colons, or shorter sentences instead.

${formatCompactBrandBrainForPrompt(context.brandBrain)}

Story Frameworks:
${storyFrameworkSummary(context.storyFrameworks)}

Approved Canva Templates:
${templateSummary(context.templates)}

${formatGoldStandardExamplesForPrompt(context.goldExamples)}
`;
}

async function callJsonModel<T>({
  route,
  system,
  user,
  maxTokens = 3500,
  temperature = 0.45
}: {
  route: ModelRoute;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  logModelSelection(route);

  let lastError = "";
  for (const model of route.candidates) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ]
        })
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text.slice(0, 700) || `OpenAI returned ${response.status}.`);
      const parsed = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
      const content = parsed.choices?.[0]?.message?.content || "";
      if (!content) throw new Error("OpenAI returned an empty response.");
      return sanitizeDeep(extractJson(content)) as T;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "OpenAI request failed.";
      const next = route.candidates[route.candidates.indexOf(model) + 1];
      logModelFallback(route, model, next);
    }
  }

  throw new Error(lastError || "All model candidates failed.");
}

export async function loadWeeklyAuthorityContext(supabase: SupabaseClient, userId: string, topic: string): Promise<Context> {
  const [brandResult, templateResult, storyResult] = await Promise.all([
    supabase.from("brand_brains").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("canva_templates").select("*").eq("user_id", userId).eq("approval_status", "approved").order("updated_at", { ascending: false }),
    supabase.from("story_frameworks").select("*").eq("user_id", userId).eq("status", "active").order("updated_at", { ascending: false })
  ]);
  const goldExamples = await getRelevantGoldStandardExamples(supabase, {
    userId,
    topic,
    platform: "Blog",
    contentType: "Shopify blog",
    limit: 5
  });

  return {
    brandBrain: brandResult.data as BrandBrain | null,
    templates: (templateResult.data || []) as CanvaTemplate[],
    storyFrameworks: (storyResult.data || []) as StoryFramework[],
    goldExamples: goldExamples as GoldStandardExample[]
  };
}

export async function generateBlogCreativeBrief(input: WeeklyAuthorityInput, context: Context) {
  return callJsonModel<{ brief: BlogCreativeBrief }>({
    route: getContentRepurposingModel(),
    system: baseSystemPrompt(context),
    user: `
Create a Shopify blog creative brief for this weekly authority project.

Input:
- Blog topic: ${input.blogTopic}
- Target audience: ${input.targetAudience}
- Primary keyword: ${input.primaryKeyword}
- Secondary keywords: ${keywordList(input.secondaryKeywords)}
- Business goal: ${input.businessGoal}
- CTA focus: ${input.ctaFocus}
- Shopify blog category/tag: ${input.shopifyBlogCategory}
- Suggested publish date: ${input.suggestedPublishDate || "Not selected"}

Return JSON only:
{
  "brief": {
    "seoTitleOptions": ["..."],
    "shopifyBlogTitle": "...",
    "suggestedUrlSlug": "...",
    "metaTitle": "...",
    "metaDescription": "...",
    "excerpt": "...",
    "searchIntent": "...",
    "readerPainPoint": "...",
    "emotionalHook": "...",
    "psychologicalTherapistInsight": "...",
    "outline": [{"heading":"H2: ...","subheadings":["H3: ..."]}],
    "faqSuggestions": ["..."],
    "internalLinksToInclude": [{"anchorText":"...","destinationPage":"Shopify blog/product/service URL placeholder","reason":"..."}],
    "productServiceCtaSuggestion": "...",
    "pinterestAngle": "...",
    "youtubeAngle": "...",
    "shortFormVideoAngles": ["..."],
    "newsletterAngle": "...",
    "shopifyTags": ["..."],
    "shopifyPublishingChecklist": ["..."]
  }
}
`
  });
}

export async function generateWeeklyBlogIdeas(context: Context) {
  return callJsonModel<{ ideas: SuggestedBlogTopic[] }>({
    route: getContentRepurposingModel(),
    system: baseSystemPrompt(context),
    maxTokens: 2400,
    user: `
Suggest exactly 3 Shopify blog topics for this week for LionHeart Therapy.
The topics should support SEO authority, Pinterest discovery, trust building, and product/service CTA opportunities.
Do not write the full blog. Do not mention WordPress.

Return JSON only:
{
  "ideas": [
    {
      "blogTitle": "...",
      "blogTopic": "...",
      "primaryKeyword": "...",
      "secondaryKeywords": ["..."],
      "targetAudience": "...",
      "whyWorthPublishingNow": "...",
      "bestCta": "Teen workbook, therapy services, email list, product, freebie, or related blog",
      "estimatedAssetOutput": "1 Shopify blog, 1 YouTube video, 5 short videos, 1 carousel, 3 Pinterest pins, 1 email, 2 to 3 Threads posts, 1 Facebook post",
      "shopifyBlogCategory": "...",
      "businessGoal": "therapy referrals, teen workbook sales, email list growth, Pinterest traffic, SEO traffic, or trust building",
      "ctaFocus": "therapy services, teen workbook, freebie, email list, product, or related blog"
    }
  ]
}
`
  });
}

export async function generateClaudePrompt(input: WeeklyAuthorityInput, brief: BlogCreativeBrief, context: Context) {
  const result = await callJsonModel<{ prompt: string }>({
    route: getClaudePromptBuilderModel(),
    system: baseSystemPrompt(context),
    maxTokens: 2600,
    user: `
Build one copy-ready Claude prompt. Claude will write the full Shopify blog post.
The prompt must ask Claude for a 1,500 to 2,500 word SEO blog post in LionHeart Therapy voice.
It must request Shopify-friendly formatting, H2/H3 headings, FAQ section, meta title, meta description, excerpt, suggested slug, internal link placeholders, CTA placeholders, natural primary and secondary keyword usage, and no keyword stuffing.
It must warn Claude not to overpromise, diagnose the reader or child, use generic AI phrasing, use fear-based marketing, or use em dashes.

Project:
${JSON.stringify(input)}

Creative brief:
${JSON.stringify(brief)}

Return JSON only: { "prompt": "..." }
`
  });
  return result.prompt;
}

export async function analyzeClaudeDraft(input: WeeklyAuthorityInput, draft: string, context: Context) {
  return callJsonModel<{ contentDna: ContentDna }>({
    route: getJsonExtractionModel(),
    system: baseSystemPrompt(context),
    maxTokens: 3200,
    temperature: 0.2,
    user: `
Analyze this pasted Claude Shopify blog draft and extract its Content DNA. Do not rewrite the blog.
Return structured JSON only.

Project:
${JSON.stringify(input)}

Claude draft:
${draft.slice(0, 18000)}

Return JSON only:
{
  "contentDna": {
    "mainTopic": "...",
    "searchIntent": "...",
    "keywords": ["..."],
    "headingStructure": ["..."],
    "faqs": ["..."],
    "quoteWorthyLines": ["..."],
    "therapistInsights": ["..."],
    "emotionalThemes": ["..."],
    "teachingPoints": ["..."],
    "storyMoments": ["..."],
    "ctaOpportunities": ["..."],
    "internalLinkOpportunities": [{"anchorText":"...","destinationPage":"...","reason":"...","placementSuggestion":"..."}],
    "shopifyTagsCategories": ["..."],
    "workbookMentionOpportunities": ["..."],
    "therapyServiceMentionOpportunities": ["..."]
  }
}
`
  });
}

export async function generateWeeklyAssets(input: WeeklyAuthorityInput, brief: BlogCreativeBrief, contentDna: ContentDna, draft: string, context: Context) {
  return callJsonModel<{ assets: WeeklyAssets }>({
    route: getContentRepurposingModel(),
    system: baseSystemPrompt(context),
    maxTokens: 7000,
    user: `
Repurpose this Claude-written Shopify blog into a complete weekly asset package.
Do not reuse identical copy across platforms. Make each platform native.
Keep every asset connected to the blog's Content DNA.
Include Shopify-specific metadata and a Shopify publishing checklist. Do not mention WordPress.

Project:
${JSON.stringify(input)}

Creative brief:
${JSON.stringify(brief)}

Content DNA:
${JSON.stringify(contentDna)}

Claude draft excerpt:
${draft.slice(0, 12000)}

Return JSON only with this exact shape:
{
  "assets": {
    "youtubeScript": {
      "suggestedTitle": "...",
      "hook": "...",
      "intro": "...",
      "teachingPoints": ["3 to 5 teaching points"],
      "exampleLanguage": ["..."],
      "cta": "...",
      "thumbnailText": "...",
      "description": "...",
      "seoTags": ["..."],
      "timestampOutline": ["00:00 ..."]
    },
    "shortFormVideoScripts": [{"hook":"...","script":"...","onScreenText":"...","brollSuggestions":["..."],"visualCues":["..."],"caption":"...","seoKeywords":["..."],"cta":"...","recommendedPlatform":"Instagram Reels"}],
    "instagramCarousel": {"carouselTitle":"...","slideOutline":["..."],"slideCopy":["..."],"canvaDesignBrief":"...","seoInstagramCaption":"...","keywords":["..."],"cta":"..."},
    "pinterestPackage": {"pinTitles":["..."],"pinDescriptions":["..."],"textOverlayOptions":["..."],"canvaPinDesignBrief":"...","blogUrlPlaceholder":"Shopify blog URL after publishing","suggestedBoardCategory":"..."},
    "emailNewsletter": {"subjectLineOptions":["..."],"previewText":"...","newsletterBody":"...","cta":"..."},
    "threadsXContent": [{"emotionalHook":"...","therapistInsight":"...","practicalTakeaway":"...","conversationStarter":"..."}],
    "facebookPost": {"post":"...","conversationQuestion":"...","cta":"..."},
    "internalLinkingAssistant": [{"anchorText":"...","destinationPage":"...","reason":"...","placementSuggestion":"..."}],
    "ctaAssistant": {"recommendedCta":"...","reason":"...","optionsConsidered":["Teen Mental Health Workbook","Teen Therapy","Anxiety Therapy","Parenting and mental health","Parent/Teen resource","Email list/freebie","Related blog post"]},
    "shopifyMetadata": {"shopifyBlogTitle":"...","shopifyExcerpt":"...","shopifySeoTitle":"...","shopifyMetaDescription":"...","shopifyUrlHandle":"...","shopifyTags":["..."],"shopifyBlogUrlPlaceholder":"...","shopifyProductCtaSuggestions":["..."],"shopifyInternalProductLinks":["..."],"shopifyPublishingChecklist":["..."]}
  }
}
`
  });
}

export function weeklyAssetsToContentPack(input: WeeklyAuthorityInput, brief: BlogCreativeBrief, assets: WeeklyAssets) {
  const shortScripts = assets.shortFormVideoScripts
    .map((script, index) => `Short ${index + 1} (${script.recommendedPlatform})\nHook: ${script.hook}\nScript: ${script.script}\nOn-screen text: ${script.onScreenText}\nCTA: ${script.cta}`)
    .join("\n\n");

  return {
    tiktok_reels_script: shortScripts || assets.youtubeScript.hook,
    instagram_carousel_outline: assets.instagramCarousel.slideOutline.join("\n"),
    slide_by_slide_carousel_copy: assets.instagramCarousel.slideCopy.map((slide, index) => `Slide ${index + 1}: ${slide}`).join("\n"),
    instagram_caption: assets.instagramCarousel.seoInstagramCaption,
    pinterest_pin_title: assets.pinterestPackage.pinTitles.join(" | "),
    pinterest_description: assets.pinterestPackage.pinDescriptions.join("\n\n"),
    threads_post: assets.threadsXContent.map((thread) => `${thread.emotionalHook}\n${thread.therapistInsight}\n${thread.practicalTakeaway}\n${thread.conversationStarter}`).join("\n\n"),
    blog_outline: brief.outline.map((section) => `${section.heading}\n${section.subheadings.join("\n")}`).join("\n\n"),
    email_newsletter_blurb: `${assets.emailNewsletter.subjectLineOptions.join(" / ")}\n\n${assets.emailNewsletter.newsletterBody}`,
    canva_visual_direction: `${assets.instagramCarousel.canvaDesignBrief}\n\nPinterest: ${assets.pinterestPackage.canvaPinDesignBrief}`,
    product_cta: input.ctaFocus === "product" || input.ctaFocus.includes("workbook") ? assets.ctaAssistant.recommendedCta : "",
    therapy_service_cta: input.ctaFocus.includes("therapy") || input.businessGoal.includes("therapy") ? assets.ctaAssistant.recommendedCta : "",
    safety_disclaimer: "Educational content only. This does not diagnose, replace therapy, or provide crisis care."
  };
}
