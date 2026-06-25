import type OpenAI from "openai";
import type { BrandBrain, BusinessProfile, ContentGenerationRequest, ContentIntelligenceBrief, ContentOpportunity, ContentPackBody, ContentQualityChecklist, ContentWhyThisWorks } from "./types";
import { buildContentPrompt } from "./contentPrompt";
import { formatBrandBrainForPrompt } from "./brandBrain/format";
import { buildContentIntelligenceBrief } from "./contentResearch";
import { selectAnglesForGeneration, type ContentAngle } from "./contentAngles";
import { buildFrameworkBrief } from "./psychologyFrameworkEngine";
import { buildExampleBrief } from "./realLifeExampleEngine";
import { buildTherapistInsightBrief } from "./therapistInsightEngine";
import { buildTherapistObservationBrief } from "./therapistObservationEngine";
import { applyLionHeartVoiceGuidance, LIONHEART_MINIMUM_VOICE_SCORE, scoreLionHeartVoice } from "./lionheartVoiceLibrary";
import { assessTopicFidelity, attachmentTopicRepairCopy, topicFidelityInstruction } from "./topicFidelity";

type GeneratedPost = {
  hook: string;
  content_angle?: string;
  caption: string;
  hashtags: string[];
  visual_idea: string;
  script?: string;
  selectedFramework?: string;
  whyThisFrameworkFits?: string;
  frameworkExplanation?: string;
  practicalApplication?: string;
  thoughts?: string[];
  emotions?: string[];
  behaviors?: string[];
  bodySigns?: string[];
  whatThisCanLookLike?: string[];
  therapistInsight?: string;
  therapistObservation?: {
    whatISeeInTherapy?: string;
    commonMisunderstanding?: string;
    hiddenEmotionUnderneathBehavior?: string;
    internalBeliefDrivingBehavior?: string;
    whatOthersUsuallyAssume?: string;
    whatIsActuallyHappeningPsychologically?: string;
    therapistReframe?: string;
    practicalEverydayExample?: string;
  };
  commonMisunderstanding?: string;
  whatPeopleOftenMiss?: string;
  whatToKnow?: string;
  whatNotToSay?: string[];
  whatToTryInstead?: string[];
  clinicalNuance?: string;
  LionHeartStyleNote?: string;
  content_intelligence_brief?: ContentIntelligenceBrief;
  content_intelligence_brief_summary?: string;
  why_this_works?: ContentWhyThisWorks;
};

type ParsedContentOpportunities = {
  opportunities: ContentOpportunity[];
  warnings: string[];
  debug: {
    openAiResponseReceived: boolean;
    rawResponsePreview: string;
    opportunitiesArrayParsed: boolean;
    opportunityCount: number;
    checkpoint?: string;
    keyExists?: boolean;
    keyPreview?: string;
    runtimeType?: string;
    nodeVersion?: string;
    openAiClientInitialized?: boolean;
    directFetchMinimalTestSucceeded?: boolean;
    modelUsed?: string;
    openAiStatusCode?: number | string;
    openAiErrorType?: string;
    openAiErrorCode?: string;
    minimalTestSucceeded?: boolean;
    responseFormatUsed?: boolean;
  };
};

type ParsedContentPack = {
  pack: ContentPackBody;
  warnings: string[];
  debug: {
    openAiResponseReceived: boolean;
    rawResponsePreview: string;
    modelUsed?: string;
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
  checkpoint?: string;
  keyExists?: boolean;
  keyPreview?: string;
  runtimeType?: string;
  nodeVersion?: string;
  openAiClientInitialized?: boolean;
  directFetchMinimalTestSucceeded?: boolean;
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

function removeEmDashes(value: string) {
  return value.replaceAll("—", ".").replace(/\s+\./g, ".").replace(/\.\s*\./g, ".");
}

function removeEmDashesDeep<T>(value: T): T {
  if (typeof value === "string") {
    return removeEmDashes(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => removeEmDashesDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, removeEmDashesDeep(item)])
    ) as T;
  }

  return value;
}

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

function keyPreview(apiKey: string | undefined) {
  if (!apiKey) return "";
  return apiKey.slice(0, 5);
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

async function createOpenAiClient(apiKey: string): Promise<OpenAI> {
  const { default: OpenAIClient } = await import("openai");
  return new OpenAIClient({ apiKey });
}

async function directFetchChatCompletion(apiKey: string, params: ChatCompletionParams, model: string, useResponseFormat: boolean): Promise<NonStreamingCompletion> {
  const response = await withTimeout(
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...params,
        model,
        ...(useResponseFormat ? { response_format: { type: "json_object" } } : {})
      })
    }),
    45000,
    `OpenAI direct fetch generation for ${model}`
  );

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    parsed = { raw: text.slice(0, 1000) };
  }

  if (!response.ok) {
    const errorInfo = parsed.error && typeof parsed.error === "object" ? parsed.error as Record<string, unknown> : parsed;
    const error = new Error(String(errorInfo.message || `OpenAI direct fetch failed with status ${response.status}.`));
    (error as Error & { status?: number; code?: string; type?: string }).status = response.status;
    (error as Error & { status?: number; code?: string; type?: string }).code = typeof errorInfo.code === "string" ? errorInfo.code : undefined;
    (error as Error & { status?: number; code?: string; type?: string }).type = typeof errorInfo.type === "string" ? errorInfo.type : undefined;
    throw error;
  }

  return parsed as NonStreamingCompletion;
}

async function directFetchMinimalTest(apiKey: string, model: string) {
  return directFetchChatCompletion(
    apiKey,
    {
      model,
      max_tokens: 24,
      temperature: 0,
      messages: [
        { role: "user", content: "Reply with one short sentence confirming the connection works." }
      ]
    } as ChatCompletionParams,
    model,
    false
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

  return removeEmDashesDeep({
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
  });
}

const contentPackKeys = [
  "tiktok_reels_script",
  "instagram_carousel_outline",
  "slide_by_slide_carousel_copy",
  "instagram_caption",
  "pinterest_pin_title",
  "pinterest_description",
  "threads_post",
  "blog_outline",
  "email_newsletter_blurb",
  "canva_visual_direction",
  "product_cta",
  "therapy_service_cta",
  "safety_disclaimer"
] as const;

function fallbackContentPack(opportunity: ContentOpportunity): ContentPackBody {
  const topic = opportunity.topic || "this therapy topic";
  const hook = opportunity.strongest_emotional_hook || `The part of ${topic} people do not always say out loud`;
  const visual = opportunity.visual_direction || "Soft cream background, muted navy type, sage accents, and a therapist-authored notebook-style layout.";
  return {
    tiktok_reels_script: `${hook}\n\nName one hidden pattern, give one grounded reframe, and close with: ${opportunity.cta || "Save this for later and reach out when you are ready for support."}`,
    instagram_carousel_outline: `Carousel about ${topic}: hook, hidden signs, what it feels like internally, why it makes sense, one grounded next step, CTA.`,
    slide_by_slide_carousel_copy: `Slide 1: ${hook}\nSlide 2: What people see\nSlide 3: What may be happening internally\nSlide 4: A clinically grounded reframe\nSlide 5: One small next step\nSlide 6: ${opportunity.cta || "Save this for later."}`,
    instagram_caption: `${hook}\n\n${opportunity.emotional_angle || "There is often more happening underneath the surface than people realize."}\n\n${opportunity.cta || "Save this for later and reach out when you are ready for support."}`,
    pinterest_pin_title: `${topic}: signs, patterns, and support`,
    pinterest_description: `A therapist-informed guide to ${topic}, including hidden patterns, emotional signs, and supportive next steps from LionHeart Therapy.`,
    threads_post: `${hook} Sometimes the pattern is not dramatic. It is quiet, repetitive, and exhausting. That still deserves care.`,
    blog_outline: `H1: ${topic}\nIntro: name the emotional pain\nSection 1: hidden signs\nSection 2: why this pattern can develop\nSection 3: what helps\nSection 4: when therapy support may help\nCTA: ${opportunity.cta || "Contact LionHeart Therapy."}`,
    email_newsletter_blurb: `A short therapist-authored note about ${topic}, naming the emotional pattern with compassion and offering one grounded reflection for the week.`,
    canva_visual_direction: visual,
    product_cta: opportunity.product_tie_in ? `If ${opportunity.product_tie_in} fits your season, use it as a gentle next step for reflection and structure.` : "Save this resource and revisit it when you want a more structured reflection prompt.",
    therapy_service_cta: opportunity.service_tie_in ? `If this pattern is affecting your daily life or relationships, ${opportunity.service_tie_in} can offer more personalized support.` : "Therapy can help you understand the pattern underneath the reaction and build steadier ways to respond.",
    safety_disclaimer: opportunity.clinical_sensitivity === "high" ? "Educational content only. This is not therapy or diagnosis. If you are in crisis or immediate danger, contact local emergency services or a crisis hotline." : "Educational content only. This is not therapy advice, diagnosis, or a substitute for care from a licensed professional."
  };
}

function normalizeContentPack(value: unknown, opportunity: ContentOpportunity) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const fallback = fallbackContentPack(opportunity);
  const warnings: string[] = [];
  const pack = contentPackKeys.reduce((accumulator, key) => {
    const raw = source[key];
    const text = typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw.map(String).join("\n").trim() : "";
    if (!text) warnings.push(`Missing ${key}; used a safe fallback.`);
    return { ...accumulator, [key]: text || fallback[key] };
  }, {} as ContentPackBody);

  return { pack: removeEmDashesDeep(pack), warnings };
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function fallbackHook(request: ContentGenerationRequest, contentAngle: string, example: string, therapistInsightBrief: ReturnType<typeof buildTherapistInsightBrief>) {
  const topic = request.topic.toLowerCase();
  if (topic.includes("teen anxiety")) {
    return example
      ? `When ${example.replace(/^a teen\s+/i, "your teen ")} is anxiety, not attitude`
      : "When your teen says I am fine but their body is telling another story";
  }
  if (topic.includes("anxious attachment")) {
    return "When a small shift in tone makes your whole body search for what went wrong";
  }
  if (topic.includes("people pleasing")) {
    return "The yes that looks kind on the outside can feel like panic underneath";
  }
  if (example) {
    return `${sentenceCase(example)} may be the clue, not the whole story`;
  }
  return therapistInsightBrief.therapistInsight;
}

function fallbackCta(request: ContentGenerationRequest, researchBrief: ContentIntelligenceBrief) {
  switch (request.contentGoal) {
    case "follower-growth":
      return "Save this if it felt familiar. Send it to someone who overthinks every tone shift. Follow @LHtherapy for emotionally honest mental health content.";
    case "saves":
      return "Save this for the moment you need language before you can explain the feeling.";
    case "shares":
      return "Send this to someone who has been trying to put this pattern into words.";
    case "therapy-inquiries":
    case "leads":
      return "If this is affecting daily life or relationships, therapy can help you understand the pattern and build steadier support.";
    case "product-sales":
      return researchBrief.best_fit_cta || "Use the workbook as a gentle place to turn this pattern into language and next steps.";
    default:
      return researchBrief.best_fit_cta || "Save this for later, and review it before posting.";
  }
}

function fallbackGeneratedPost(request: ContentGenerationRequest, researchBrief: ContentIntelligenceBrief, contentAngle: string, selectedFramework: string, frameworkExplanation: string, practicalApplication: string, exampleBrief = buildExampleBrief(request.topic, contentAngle, request.contentGoal), therapistInsightBrief = buildTherapistInsightBrief(request.topic, contentAngle, request.contentGoal), therapistObservationBrief = buildTherapistObservationBrief(request.topic, contentAngle, request.contentGoal)): GeneratedPost {
  const example = exampleBrief.whatThisCanLookLike[0] || exampleBrief.behaviors[0] || exampleBrief.realLifeExamples[0] || "a daily-life pattern that is easy to misread";
  const hook = fallbackHook(request, contentAngle, example, therapistInsightBrief);
  const cta = fallbackCta(request, researchBrief);
  return {
    hook,
    content_angle: contentAngle,
    caption: `${hook}\n\nThis can look like ${example}.\n\n${therapistObservationBrief.whatISeeInTherapy}\n\n${therapistObservationBrief.commonMisunderstanding} ${therapistObservationBrief.whatIsActuallyHappeningPsychologically}\n\n${frameworkExplanation}\n\nTherapist reframe: ${therapistObservationBrief.therapistReframe}\n\nTry this instead: ${therapistInsightBrief.whatToTryInstead[0] || practicalApplication}\n\n${cta}`,
    hashtags: ["#LionHeartTherapy", "#MentalHealthEducation", `#${String(request.topic || "therapy").replace(/\s+/g, "")}`],
    visual_idea: `${researchBrief.suggested_template}. Use the ${contentAngle} angle with a calm, therapist-led visual hierarchy. Feature this specific moment: ${example}.`,
    script: "",
    selectedFramework,
    whyThisFrameworkFits: `${selectedFramework} gives this ${contentAngle} post a clear teaching structure.`,
    frameworkExplanation,
    practicalApplication,
    thoughts: exampleBrief.thoughts,
    emotions: exampleBrief.emotions,
    behaviors: exampleBrief.behaviors,
    bodySigns: exampleBrief.bodySigns,
    whatThisCanLookLike: exampleBrief.whatThisCanLookLike,
    therapistInsight: therapistInsightBrief.therapistInsight,
    therapistObservation: therapistObservationBrief,
    commonMisunderstanding: therapistInsightBrief.commonMisunderstanding,
    whatPeopleOftenMiss: therapistInsightBrief.whatPeopleOftenMiss,
    whatToKnow: therapistInsightBrief.whatToKnow,
    whatNotToSay: therapistInsightBrief.whatNotToSay,
    whatToTryInstead: therapistInsightBrief.whatToTryInstead,
    clinicalNuance: therapistInsightBrief.clinicalNuance,
    LionHeartStyleNote: therapistInsightBrief.LionHeartStyleNote,
    content_intelligence_brief_summary: researchBrief.practical_takeaway
  };
}

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function qualityChecklist(post: GeneratedPost, request: ContentGenerationRequest): ContentQualityChecklist {
  const hook = String(post.hook || "");
  const caption = String(post.caption || "");
  const allText = `${hook}\n${caption}`;
  const examples = [
    ...asStringArray(post.behaviors),
    ...asStringArray(post.bodySigns),
    ...asStringArray(post.whatThisCanLookLike)
  ];
  const genericPhrases = [
    "unlock your potential",
    "healing journey",
    "just breathe",
    "you are enough",
    "mental health matters",
    "discover practical tools",
    "nurture secure relationships",
    "many people struggle",
    "does this sound familiar"
  ];
  const promotionalPhrases = ["book now", "schedule today", "buy now", "limited time", "guaranteed"];
  const observationPhrases = ["what i see in therapy", "many people assume", "what is actually happening", "one thing people rarely realize"];
  const promoAllowed = ["leads", "therapy-inquiries", "product-sales", "promotion", "email-list-growth"].includes(request.contentGoal);

  return {
    hookSpecific: hook.length >= 18 && !/^are you|^do you struggle|^does this sound familiar/i.test(hook),
    teachesSomething: Boolean(post.selectedFramework || post.frameworkExplanation) && caption.length > 120,
    includesRealLifeExample: examples.some((example) => includesAny(allText, [example])) || includesAny(allText, examples.slice(0, 5)),
    matchesSelectedGoal: promoAllowed || !includesAny(allText, promotionalPhrases),
    ctaAppropriate: Boolean(caption.match(/save|share|follow|reach out|learn|try|notice|ask|download|shop/i)),
    avoidsGenericAiPhrases: !includesAny(allText, genericPhrases),
    soundsLikeLionHeartTherapy: Boolean(post.therapistInsight || post.LionHeartStyleNote) && includesAny(allText, ["therapist", "notice", "underneath", "body", "pattern", "pressure", "support", "try"]) && includesAny(allText, observationPhrases)
  };
}

export async function generateStructuredContent(profile: BusinessProfile, request: ContentGenerationRequest, brandBrain?: BrandBrain | null, plannedAnglesOverride?: ContentAngle[]): Promise<GeneratedPost[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content.");
  }

  const researchBrief = await buildContentIntelligenceBrief({ request, brandBrain });
  const plannedAngles = plannedAnglesOverride?.length
    ? plannedAnglesOverride
    : selectAnglesForGeneration(request.topic, request.contentGoal, request.numberOfPosts || 1);
  const frameworkBriefs = plannedAngles.map((angle) => buildFrameworkBrief(request.topic, angle.name, request.contentGoal));
  const exampleBriefs = plannedAngles.map((angle) => buildExampleBrief(request.topic, angle.name, request.contentGoal));
  const therapistInsightBriefs = plannedAngles.map((angle) => buildTherapistInsightBrief(request.topic, angle.name, request.contentGoal));
  const therapistObservationBriefs = plannedAngles.map((angle) => buildTherapistObservationBrief(request.topic, angle.name, request.contentGoal));
  const prompt = buildContentPrompt(profile, request, brandBrain, researchBrief, plannedAngles, frameworkBriefs, exampleBriefs, therapistInsightBriefs, therapistObservationBriefs);
  const client = await createOpenAiClient(process.env.OPENAI_API_KEY);

  async function runGeneration(userPrompt: string) {
    const completion = await withTimeout(
      client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.75,
        max_tokens: Math.min(3600, Math.max(1600, 1800 * (request.numberOfPosts || 1))),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return only valid JSON. Do not include markdown." },
          { role: "user", content: userPrompt }
        ]
      }),
      18000,
      "OpenAI content generation"
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = extractJsonObject(raw) as { posts?: GeneratedPost[] };
    if (!Array.isArray(parsed.posts)) {
      throw new Error("OpenAI response did not include a posts array.");
    }
    return parsed.posts;
  }

  async function rewriteForLionHeartVoice(post: GeneratedPost, voiceScore: ReturnType<typeof scoreLionHeartVoice>) {
    const completion = await withTimeout(
      client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.62,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return only valid JSON. Rewrite LionHeart Therapy content using the LionHeart Voice Library as the final authority. Avoid em dashes completely."
          },
          {
            role: "user",
            content: `
The draft below did not pass the LionHeart Voice Check.

Minimum score: ${LIONHEART_MINIMUM_VOICE_SCORE}
Current score: ${voiceScore.score}
Needed improvements: ${voiceScore.improvements.join(" | ") || "Make it more LionHeart-specific."}
Generic phrase warnings: ${voiceScore.genericPhraseWarnings.join(" | ") || "none"}

${applyLionHeartVoiceGuidance({
  topic: request.topic,
  goal: request.contentGoal,
  platform: request.platform,
  contentType: request.contentType,
  audience: profile.target_audience
})}

Rewrite philosophy:
- Make the reader feel deeply understood before teaching.
- Show the moment first.
- Describe the behavior.
- Reveal the psychology underneath.
- Include at least one therapist insight.
- Include at least one screenshot-worthy sentence.
- Use spoken rhythm, short lines, contrast, and natural paragraph breaks.
- Avoid definitions as the opener.
- Avoid "Many people", "Did you know", "Anxiety is", "It is important to", and generic wellness filler.
- Keep the requested topic central: ${request.topic}
- Keep the same platform, content type, content goal, and content angle.
- Keep clinical safety and avoid diagnostic certainty.
- Avoid em dashes completely.

Current draft:
${JSON.stringify({
  hook: post.hook,
  content_angle: post.content_angle,
  caption: post.caption,
  hashtags: post.hashtags,
  visual_idea: post.visual_idea,
  script: post.script,
  why_this_works: post.why_this_works
}, null, 2)}

Return JSON only:
{
  "hook": "rewritten hook",
  "caption": "rewritten caption",
  "hashtags": ["#Example"],
  "visual_idea": "rewritten visual idea",
  "script": "rewritten script or empty string",
  "screenshot_sentence": "one sentence from the draft worth saving or sharing"
}
`
          }
        ]
      }),
      16000,
      "LionHeart voice rewrite"
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned an empty LionHeart voice rewrite.");
    const parsed = extractJsonObject(raw) as Partial<GeneratedPost> & { screenshot_sentence?: string };
    return removeEmDashesDeep({
      ...post,
      hook: typeof parsed.hook === "string" && parsed.hook.trim() ? parsed.hook.trim() : post.hook,
      caption: typeof parsed.caption === "string" && parsed.caption.trim() ? parsed.caption.trim() : post.caption,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : post.hashtags,
      visual_idea: typeof parsed.visual_idea === "string" && parsed.visual_idea.trim() ? parsed.visual_idea.trim() : post.visual_idea,
      script: typeof parsed.script === "string" ? parsed.script.trim() : post.script,
      why_this_works: {
        ...(post.why_this_works || {}),
        screenshot_sentence: typeof parsed.screenshot_sentence === "string" ? parsed.screenshot_sentence.trim() : undefined,
        voice_rewritten: true,
        voice_rewrite_reason: `Voice score was ${voiceScore.score}, below ${LIONHEART_MINIMUM_VOICE_SCORE}.`
      }
    }) as GeneratedPost;
  }

  function forceLionHeartVoiceFloor(post: GeneratedPost) {
    const example =
      post.whatThisCanLookLike?.[0] ||
      post.behaviors?.[0] ||
      post.why_this_works?.real_life_example_used ||
      "replaying the conversation before you know what you are trying to solve";
    const screenshotSentence = "The behavior makes more sense when you understand what it was trying to protect.";
    const invitation = request.contentGoal === "follower-growth"
      ? "Save this if it felt familiar. Send it to someone who learned to keep the peace by disappearing from their own needs. Follow @LHtherapy for emotionally honest mental health content."
      : "What part felt familiar?";
    const caption = removeEmDashes([
      "You say yes.",
      "Then your chest tightens in the car on the way home.",
      "Your mind keeps replaying the conversation, trying to figure out whether disappointing someone would have made you unsafe.",
      "",
      post.caption,
      "",
      `This can look like ${String(example).replace(/\.$/, "")}.`,
      "",
      `What I see in therapy is this: ${screenshotSentence}`,
      "",
      "Your nervous system is not choosing logic. It is choosing familiarity.",
      "",
      "Sometimes symptoms are old survival strategies doing exactly what they learned to do.",
      "",
      invitation
    ].join("\n"));
    const repaired = removeEmDashesDeep({
      ...post,
      hook: post.hook && !/^(many people|did you know|it is important|anxiety is|avoidant attachment is)/i.test(post.hook)
        ? post.hook
        : `The part no one sees is how hard you are trying to protect yourself`,
      caption,
      why_this_works: {
        ...(post.why_this_works || {}),
        goal_used: post.why_this_works?.goal_used || request.contentGoal,
        audience_insight: post.why_this_works?.audience_insight || researchBrief.audience_insight,
        psychological_angle: post.why_this_works?.psychological_angle || researchBrief.psychological_angle,
        cta_strategy: post.why_this_works?.cta_strategy || researchBrief.cta_strategy,
        suggested_template: post.why_this_works?.suggested_template || researchBrief.suggested_template,
        screenshot_sentence: screenshotSentence,
        voice_floor_repair_applied: true
      }
    }) as GeneratedPost;
    return repaired;
  }

  function normalizePosts(posts: GeneratedPost[]) {
    const postInputs = plannedAngles.map((angle, index) => posts?.[index] || fallbackGeneratedPost(
      request,
      researchBrief,
      angle.name,
      frameworkBriefs[index]?.selectedFramework || "CBT Thought-Feeling-Behavior Cycle",
      frameworkBriefs[index]?.frameworkExplanation || researchBrief.psychological_explanation,
      frameworkBriefs[index]?.practicalApplication || researchBrief.practical_takeaway,
      exampleBriefs[index],
      therapistInsightBriefs[index],
      therapistObservationBriefs[index]
    ));

    return postInputs.map((post, index) => {
    const contentAngle = String(post.content_angle || plannedAngles[index]?.name || plannedAngles[0]?.name || "Therapist Perspective").trim();
    const frameworkBrief = frameworkBriefs[index] || buildFrameworkBrief(request.topic, contentAngle, request.contentGoal);
    const therapistInsightBrief = therapistInsightBriefs[index] || buildTherapistInsightBrief(request.topic, contentAngle, request.contentGoal);
    const therapistObservationBrief = therapistObservationBriefs[index] || buildTherapistObservationBrief(request.topic, contentAngle, request.contentGoal);
    const selectedFramework = String(post.selectedFramework || frameworkBrief.selectedFramework);
    const frameworkExplanation = String(post.frameworkExplanation || frameworkBrief.frameworkExplanation);
    const practicalApplication = String(post.practicalApplication || frameworkBrief.practicalApplication);
    const whyThisFrameworkFits = String(post.whyThisFrameworkFits || frameworkBrief.whyThisFrameworkFits);
    const exampleBrief = exampleBriefs[index] || buildExampleBrief(request.topic, contentAngle, request.contentGoal);
    const thoughts = asStringArray(post.thoughts).length ? asStringArray(post.thoughts) : exampleBrief.thoughts;
    const emotions = asStringArray(post.emotions).length ? asStringArray(post.emotions) : exampleBrief.emotions;
    const behaviors = asStringArray(post.behaviors).length ? asStringArray(post.behaviors) : exampleBrief.behaviors;
    const bodySigns = asStringArray(post.bodySigns).length ? asStringArray(post.bodySigns) : exampleBrief.bodySigns;
    const whatThisCanLookLike = asStringArray(post.whatThisCanLookLike).length ? asStringArray(post.whatThisCanLookLike) : exampleBrief.whatThisCanLookLike;
    const therapistInsight = String(post.therapistInsight || therapistInsightBrief.therapistInsight);
    const therapistObservation = {
      whatISeeInTherapy: String(post.therapistObservation?.whatISeeInTherapy || therapistObservationBrief.whatISeeInTherapy),
      commonMisunderstanding: String(post.therapistObservation?.commonMisunderstanding || therapistObservationBrief.commonMisunderstanding),
      hiddenEmotionUnderneathBehavior: String(post.therapistObservation?.hiddenEmotionUnderneathBehavior || therapistObservationBrief.hiddenEmotionUnderneathBehavior),
      internalBeliefDrivingBehavior: String(post.therapistObservation?.internalBeliefDrivingBehavior || therapistObservationBrief.internalBeliefDrivingBehavior),
      whatOthersUsuallyAssume: String(post.therapistObservation?.whatOthersUsuallyAssume || therapistObservationBrief.whatOthersUsuallyAssume),
      whatIsActuallyHappeningPsychologically: String(post.therapistObservation?.whatIsActuallyHappeningPsychologically || therapistObservationBrief.whatIsActuallyHappeningPsychologically),
      therapistReframe: String(post.therapistObservation?.therapistReframe || therapistObservationBrief.therapistReframe),
      practicalEverydayExample: String(post.therapistObservation?.practicalEverydayExample || therapistObservationBrief.practicalEverydayExample),
      observationLeadIn: therapistObservationBrief.observationLeadIn
    };
    const commonMisunderstanding = String(post.commonMisunderstanding || therapistInsightBrief.commonMisunderstanding);
    const whatPeopleOftenMiss = String(post.whatPeopleOftenMiss || therapistInsightBrief.whatPeopleOftenMiss);
    const whatToKnow = String(post.whatToKnow || therapistInsightBrief.whatToKnow);
    const whatNotToSay = asStringArray(post.whatNotToSay).length ? asStringArray(post.whatNotToSay) : therapistInsightBrief.whatNotToSay;
    const whatToTryInstead = asStringArray(post.whatToTryInstead).length ? asStringArray(post.whatToTryInstead) : therapistInsightBrief.whatToTryInstead;
    const clinicalNuance = String(post.clinicalNuance || therapistInsightBrief.clinicalNuance);
    const LionHeartStyleNote = String(post.LionHeartStyleNote || therapistInsightBrief.LionHeartStyleNote);
    const whyThisWorks = post.why_this_works || {
      goal_used: request.contentGoal,
      audience_insight: researchBrief.audience_insight,
      psychological_angle: `${contentAngle}: ${researchBrief.psychological_angle}`,
      cta_strategy: researchBrief.cta_strategy,
      suggested_template: researchBrief.suggested_template,
      selected_framework: selectedFramework,
      framework_explanation: frameworkExplanation,
      practical_application: practicalApplication,
      therapist_insight: therapistInsight,
      real_life_example_used: whatThisCanLookLike[0] || behaviors[0] || "",
      therapist_observation: therapistObservation.whatISeeInTherapy,
      therapist_reframe: therapistObservation.therapistReframe,
      quality_checklist: qualityChecklist({ ...post, therapistInsight, therapistObservation, LionHeartStyleNote, behaviors, bodySigns, whatThisCanLookLike }, request)
    };

    const normalizedPost = removeEmDashesDeep({
      hook: String(post.hook || "").trim(),
      content_angle: contentAngle,
      caption: String(post.caption || "").trim(),
      hashtags: Array.isArray(post.hashtags) ? post.hashtags.map(String) : [],
      visual_idea: String(post.visual_idea || "").trim(),
      script: String(post.script || "").trim(),
      selectedFramework,
      whyThisFrameworkFits,
      frameworkExplanation,
      practicalApplication,
      thoughts,
      emotions,
      behaviors,
      bodySigns,
      whatThisCanLookLike,
      therapistInsight,
      therapistObservation,
      commonMisunderstanding,
      whatPeopleOftenMiss,
      whatToKnow,
      whatNotToSay,
      whatToTryInstead,
      clinicalNuance,
      LionHeartStyleNote,
      content_intelligence_brief: {
        ...researchBrief,
        content_angle: contentAngle,
        selectedFramework,
        whyThisFrameworkFits,
        frameworkExplanation,
        practicalApplication,
        thoughts,
        emotions,
        behaviors,
        bodySigns,
        whatThisCanLookLike,
        therapistInsight,
        commonMisunderstanding,
        whatPeopleOftenMiss,
        whatToKnow,
        whatNotToSay,
        whatToTryInstead,
        clinicalNuance,
        LionHeartStyleNote,
        therapistObservation,
        real_life_examples: Array.from(new Set([...researchBrief.real_life_examples, ...exampleBrief.realLifeExamples, ...whatThisCanLookLike]))
      },
      content_intelligence_brief_summary: String(post.content_intelligence_brief_summary || researchBrief.practical_takeaway).trim(),
      why_this_works: {
        goal_used: String(whyThisWorks.goal_used || request.contentGoal),
        audience_insight: String(whyThisWorks.audience_insight || researchBrief.audience_insight),
        psychological_angle: String(whyThisWorks.psychological_angle || researchBrief.psychological_angle),
        cta_strategy: String(whyThisWorks.cta_strategy || researchBrief.cta_strategy),
        suggested_template: String(whyThisWorks.suggested_template || researchBrief.suggested_template),
        selected_framework: String(whyThisWorks.selected_framework || selectedFramework),
        framework_explanation: String(whyThisWorks.framework_explanation || frameworkExplanation),
        practical_application: String(whyThisWorks.practical_application || practicalApplication),
        therapist_insight: String(whyThisWorks.therapist_insight || therapistInsight),
        therapist_observation: String(whyThisWorks.therapist_observation || therapistObservation.whatISeeInTherapy),
        therapist_reframe: String(whyThisWorks.therapist_reframe || therapistObservation.therapistReframe),
        real_life_example_used: String(whyThisWorks.real_life_example_used || whatThisCanLookLike[0] || behaviors[0] || ""),
        quality_checklist: whyThisWorks.quality_checklist || qualityChecklist({ ...post, therapistInsight, therapistObservation, LionHeartStyleNote, behaviors, bodySigns, whatThisCanLookLike }, request)
      }
    });
    const topicFidelity = assessTopicFidelity({
      requestedTopic: request.topic,
      contentAngle: normalizedPost.content_angle,
      hook: normalizedPost.hook,
      caption: normalizedPost.caption,
      visualIdea: normalizedPost.visual_idea,
      script: normalizedPost.script
    });
    let repairedPost = normalizedPost;
    let checklist = qualityChecklist(repairedPost, request);
    const concreteExample = String(repairedPost.why_this_works.real_life_example_used || whatThisCanLookLike[0] || behaviors[0] || "").trim();
    if (!checklist.includesRealLifeExample && concreteExample) {
      repairedPost = {
        ...repairedPost,
        caption: removeEmDashes(`${repairedPost.caption}\n\nThis can look like ${concreteExample.replace(/\.$/, "")}.`),
        why_this_works: {
          ...repairedPost.why_this_works,
          real_life_example_used: concreteExample
        }
      };
      checklist = qualityChecklist(repairedPost, request);
    }
    if (!checklist.ctaAppropriate) {
      repairedPost = {
        ...repairedPost,
        caption: removeEmDashes(`${repairedPost.caption}\n\n${fallbackCta(request, researchBrief)}`)
      };
      checklist = qualityChecklist(repairedPost, request);
    }
    if (!checklist.soundsLikeLionHeartTherapy && therapistInsight) {
      repairedPost = {
        ...repairedPost,
        caption: removeEmDashes(`${therapistObservation.whatISeeInTherapy}\n\n${therapistObservation.commonMisunderstanding} ${therapistObservation.whatIsActuallyHappeningPsychologically}\n\n${repairedPost.caption}`)
      };
      checklist = qualityChecklist(repairedPost, request);
    }
    return {
      ...repairedPost,
      why_this_works: {
        ...repairedPost.why_this_works,
        topic_fidelity: topicFidelity,
        lionheart_voice_check: scoreLionHeartVoice(
          [repairedPost.hook, repairedPost.caption, repairedPost.script, repairedPost.visual_idea].filter(Boolean).join("\n\n"),
          { topic: request.topic, goal: request.contentGoal, platform: request.platform, contentType: request.contentType, audience: profile.target_audience }
        ),
        quality_checklist: checklist
      }
    };
  });
  }

  let initialPosts: GeneratedPost[] = [];
  try {
    initialPosts = await runGeneration(prompt);
  } catch (error) {
    console.error("[openai][content-generator][initial-generation-failed]", {
      message: safeErrorMessage(error),
      stackPreview: error instanceof Error ? error.stack?.slice(0, 900) : undefined
    });
  }

  let normalized: GeneratedPost[] = normalizePosts(initialPosts);
  const drifted = normalized.some((post) => post.why_this_works?.topic_fidelity?.topicMatch === "Drifted");
  if (drifted) {
    console.warn("[openai][content-generator][topic-drift-detected]", {
      requestedTopic: request.topic,
      generatedFocuses: normalized.map((post) => post.why_this_works?.topic_fidelity?.generatedFocus),
      matches: normalized.map((post) => post.why_this_works?.topic_fidelity?.topicMatch)
    });
    try {
      const correctedPosts = await runGeneration(`${prompt}

Topic drift correction pass:
The previous draft drifted away from the requested topic.
${topicFidelityInstruction(request.topic)}
Regenerate once. Make the requested topic the unmistakable central subject in the hook, caption, examples, script, and visual idea.
Mention adjacent concepts only as brief comparisons.
`);
      const corrected = normalizePosts(correctedPosts);
      normalized = corrected.map((post, index) => {
        const currentMatch = post.why_this_works?.topic_fidelity?.topicMatch;
        return currentMatch === "Drifted" ? normalized[index] || post : post;
      });
    } catch (error) {
      console.error("[openai][content-generator][topic-drift-regeneration-failed]", {
        message: safeErrorMessage(error),
        stackPreview: error instanceof Error ? error.stack?.slice(0, 900) : undefined
      });
    }
  }
  normalized = normalized.map((post) => {
    const fidelity = post.why_this_works?.topic_fidelity;
    if (fidelity?.topicMatch === "Strong") return post;
    const repair = attachmentTopicRepairCopy(request.topic, request.contentGoal);
    if (!repair) return post;
    const repaired = removeEmDashesDeep({
      ...post,
      hook: repair.hook,
      caption: repair.caption,
      visual_idea: repair.visualIdea,
      script: request.contentType?.toLowerCase().includes("video") || request.platform?.toLowerCase().includes("tiktok") ? repair.script : post.script || repair.script
    });
    const repairedFidelity = assessTopicFidelity({
      requestedTopic: request.topic,
      contentAngle: repaired.content_angle,
      hook: repaired.hook,
      caption: repaired.caption,
      visualIdea: repaired.visual_idea,
      script: repaired.script
    });
    return {
      ...repaired,
      why_this_works: {
        ...repaired.why_this_works,
        goal_used: repaired.why_this_works?.goal_used || request.contentGoal,
        audience_insight: repaired.why_this_works?.audience_insight || researchBrief.audience_insight,
        psychological_angle: repaired.why_this_works?.psychological_angle || `${repair.focus} attachment-style distinction`,
        cta_strategy: repaired.why_this_works?.cta_strategy || researchBrief.cta_strategy,
        suggested_template: repaired.why_this_works?.suggested_template || researchBrief.suggested_template,
        topic_fidelity: repairedFidelity,
        therapist_observation: repaired.why_this_works?.therapist_observation || `What I see in therapy: ${repair.focus} has a distinct relational pattern that should not be swapped with another attachment style.`
      }
    };
  });
  const voiceRewritten: GeneratedPost[] = [];
  for (const post of normalized) {
    const voiceScore = post.why_this_works?.lionheart_voice_check || scoreLionHeartVoice(
      [post.hook, post.caption, post.script, post.visual_idea].filter(Boolean).join("\n\n"),
      { topic: request.topic, goal: request.contentGoal, platform: request.platform, contentType: request.contentType, audience: profile.target_audience }
    );
    if (voiceScore.score >= LIONHEART_MINIMUM_VOICE_SCORE) {
      voiceRewritten.push(post);
      continue;
    }
    try {
      const rewritten = await rewriteForLionHeartVoice(post, voiceScore);
      const nextVoiceScore = scoreLionHeartVoice(
        [rewritten.hook, rewritten.caption, rewritten.script, rewritten.visual_idea].filter(Boolean).join("\n\n"),
        { topic: request.topic, goal: request.contentGoal, platform: request.platform, contentType: request.contentType, audience: profile.target_audience }
      );
      const nextTopicFidelity = assessTopicFidelity({
        requestedTopic: request.topic,
        contentAngle: rewritten.content_angle,
        hook: rewritten.hook,
        caption: rewritten.caption,
        visualIdea: rewritten.visual_idea,
        script: rewritten.script
      });
      const finalPost = nextVoiceScore.score >= LIONHEART_MINIMUM_VOICE_SCORE ? rewritten : forceLionHeartVoiceFloor(rewritten);
      const finalVoiceScore = scoreLionHeartVoice(
        [finalPost.hook, finalPost.caption, finalPost.script, finalPost.visual_idea].filter(Boolean).join("\n\n"),
        { topic: request.topic, goal: request.contentGoal, platform: request.platform, contentType: request.contentType, audience: profile.target_audience }
      );
      const finalTopicFidelity = assessTopicFidelity({
        requestedTopic: request.topic,
        contentAngle: finalPost.content_angle,
        hook: finalPost.hook,
        caption: finalPost.caption,
        visualIdea: finalPost.visual_idea,
        script: finalPost.script
      });
      voiceRewritten.push({
        ...finalPost,
        why_this_works: {
          ...finalPost.why_this_works,
          goal_used: finalPost.why_this_works?.goal_used || request.contentGoal,
          audience_insight: finalPost.why_this_works?.audience_insight || researchBrief.audience_insight,
          psychological_angle: finalPost.why_this_works?.psychological_angle || researchBrief.psychological_angle,
          cta_strategy: finalPost.why_this_works?.cta_strategy || researchBrief.cta_strategy,
          suggested_template: finalPost.why_this_works?.suggested_template || researchBrief.suggested_template,
          topic_fidelity: finalTopicFidelity,
          lionheart_voice_check: finalVoiceScore
        }
      });
    } catch (error) {
      console.error("[openai][content-generator][voice-rewrite-failed]", {
        message: safeErrorMessage(error),
        score: voiceScore.score,
        stackPreview: error instanceof Error ? error.stack?.slice(0, 900) : undefined
      });
      voiceRewritten.push(post);
    }
  }
  normalized = voiceRewritten;
  return normalized;
}

export async function generateContentPack(opportunity: ContentOpportunity, brandBrain?: BrandBrain | null, sectionFocus?: string): Promise<ParsedContentPack> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content packs.");
  }

  const client = await createOpenAiClient(apiKey);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const focusInstruction = sectionFocus
    ? `Regenerate with special attention to this section: ${sectionFocus}. Still return the full JSON object.`
    : "Generate the full content pack.";

  const completion = await withTimeout(
    client.chat.completions.create({
      model,
      temperature: 0.78,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. You are LionHeart Therapy's therapist-creator content pack strategist. Keep the voice emotionally specific, clinically grounded, modern, and human. Avoid em dashes completely. Do not use — in any generated content."
        },
        {
          role: "user",
          content: `
Create a complete multi-platform content pack from this saved Content Intelligence idea.

${focusInstruction}

Brand Brain:
${formatBrandBrainForPrompt(brandBrain)}

${applyLionHeartVoiceGuidance({
  topic: opportunity.topic,
  goal: opportunity.content_pillar,
  platform: "multi-platform content pack",
  contentType: "content pack",
  audience: opportunity.audience
})}

Content opportunity:
${JSON.stringify(opportunity, null, 2)}

Rules:
- Make the content sound like a real therapist creator, not generic AI.
- Use emotional specificity: inner dialogue, hidden behaviors, attachment patterns, nervous system responses, avoidance, perfectionism, conflict anxiety, and relational tension when relevant.
- Avoid fake inspirational language and banned wellness phrases.
- Avoid em dashes completely. Do not use — in any generated content. Replace em dashes with periods, commas, colons, or shorter sentences.
- Do not overpromise, diagnose, or imply guaranteed outcomes.
- If clinical sensitivity is medium or high, include a clear safety disclaimer.
- Make Canva directions specific enough for a designer or Canva template workflow.
- Product and therapy CTAs should be soft, ethical, and conversion-aware.
- Keep each section ready to copy into its platform.

Return strict JSON only with this exact shape:
{
  "tiktok_reels_script": "Hook, scene/beat outline, spoken script, caption note, and CTA",
  "instagram_carousel_outline": "High-level carousel structure",
  "slide_by_slide_carousel_copy": "Slide 1 through final slide copy",
  "instagram_caption": "Full caption with CTA",
  "pinterest_pin_title": "Searchable title",
  "pinterest_description": "Pinterest description with keywords",
  "threads_post": "Threads-ready post",
  "blog_outline": "SEO blog outline with H1/H2s and talking points",
  "email_newsletter_blurb": "Short newsletter section",
  "canva_visual_direction": "Canva-ready visual direction",
  "product_cta": "Product CTA or empty string if no product tie-in",
  "therapy_service_cta": "Therapy service CTA or empty string if no service tie-in",
  "safety_disclaimer": "Required disclaimer if needed, otherwise a short educational-only note"
}
`
        }
      ]
    }),
    45000,
    `OpenAI content pack generation for ${model}`
  );

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty content pack response.");

  let parsed: unknown;
  try {
    parsed = extractJsonObject(raw);
  } catch (error) {
    return {
      pack: fallbackContentPack(opportunity),
      warnings: [`OpenAI returned malformed JSON, so a safe fallback pack was generated. Parser detail: ${safeErrorMessage(error)}`],
      debug: {
        openAiResponseReceived: true,
        rawResponsePreview: raw.slice(0, 1200),
        modelUsed: model
      }
    };
  }

  const normalized = normalizeContentPack(parsed, opportunity);
  return {
    pack: normalized.pack,
    warnings: normalized.warnings,
    debug: {
      openAiResponseReceived: true,
      rawResponsePreview: raw.slice(0, 1200),
      modelUsed: model
    }
  };
}

export async function generateContentOpportunities(theme: string, brandBrain?: BrandBrain | null): Promise<ParsedContentOpportunities> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to generate content intelligence.");
  }

  console.info("[openai][content-intelligence][checkpoint]", {
    checkpoint: "env-var-loaded",
    keyExists: Boolean(apiKey),
    keyPreview: keyPreview(apiKey),
    runtimeType: "nodejs",
    nodeVersion: process.version
  });

  let completion: NonStreamingCompletion | null = null;
  const openAiDebug: OpenAiGenerationDebug = {
    checkpoint: "env-var-loaded",
    keyExists: Boolean(apiKey),
    keyPreview: keyPreview(apiKey),
    runtimeType: "nodejs",
    nodeVersion: process.version,
    openAiClientInitialized: false,
    directFetchMinimalTestSucceeded: false,
    minimalTestSucceeded: false
  };

  let client: OpenAI | null = null;

  try {
    openAiDebug.checkpoint = "openai-client-initializing";
    console.info("[openai][content-intelligence][checkpoint]", {
      checkpoint: openAiDebug.checkpoint,
      sdkImportStyle: "dynamic default import from openai"
    });
    client = await createOpenAiClient(apiKey);
    openAiDebug.openAiClientInitialized = true;
    openAiDebug.checkpoint = "openai-client-initialized";
    console.info("[openai][content-intelligence][checkpoint]", { checkpoint: openAiDebug.checkpoint });
  } catch (error) {
    const safe = logOpenAiError("[openai][content-intelligence][client-init-failed]", error);
    openAiDebug.openAiStatusCode = safe.status;
    openAiDebug.openAiErrorType = safe.type;
    openAiDebug.openAiErrorCode = safe.code;
  }

  const baseParams: ChatCompletionParams = {
    model: "gpt-4o-mini",
      temperature: 0.82,
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. You are a therapist-creator content strategist. Do not claim access to live trend APIs, live search volume, or real-time social data. Avoid generic wellness language. Avoid em dashes completely. Do not use — in any generated content."
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
- em dashes or the — character
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

    if (client) {
      try {
        openAiDebug.checkpoint = "minimal-test-starting";
        console.info("[openai][content-intelligence][checkpoint]", { checkpoint: openAiDebug.checkpoint, model });
        const minimal = await minimalOpenAiTest(client, model);
        openAiDebug.minimalTestSucceeded = true;
        openAiDebug.checkpoint = "minimal-test-completed";
        console.info("[openai][content-intelligence][minimal-test-succeeded]", {
          checkpoint: openAiDebug.checkpoint,
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
          openAiDebug.checkpoint = "json-generation-starting";
          completion = await createJsonCompletion(client, baseParams, model, useResponseFormat) as NonStreamingCompletion;
          openAiDebug.modelUsed = model;
          openAiDebug.checkpoint = "json-generation-completed";
          console.info("[openai][content-intelligence][generation-request-succeeded]", {
            checkpoint: openAiDebug.checkpoint,
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
    } else {
      try {
        openAiDebug.checkpoint = "direct-fetch-minimal-test-starting";
        console.info("[openai][content-intelligence][checkpoint]", { checkpoint: openAiDebug.checkpoint, model });
        await directFetchMinimalTest(apiKey, model);
        openAiDebug.directFetchMinimalTestSucceeded = true;
        openAiDebug.minimalTestSucceeded = true;
        openAiDebug.checkpoint = "direct-fetch-minimal-test-completed";
        console.info("[openai][content-intelligence][direct-fetch-minimal-test-succeeded]", { checkpoint: openAiDebug.checkpoint, model });
      } catch (error) {
        const safe = logOpenAiError("[openai][content-intelligence][direct-fetch-minimal-test-failed]", error);
        errors.push(safe);
        openAiDebug.openAiStatusCode = safe.status;
        openAiDebug.openAiErrorType = safe.type;
        openAiDebug.openAiErrorCode = safe.code;
        continue;
      }

      for (const useResponseFormat of [true, false]) {
        openAiDebug.responseFormatUsed = useResponseFormat;

        try {
          openAiDebug.checkpoint = "direct-fetch-json-generation-starting";
          completion = await directFetchChatCompletion(apiKey, baseParams, model, useResponseFormat);
          openAiDebug.modelUsed = model;
          openAiDebug.checkpoint = "direct-fetch-json-generation-completed";
          console.info("[openai][content-intelligence][direct-fetch-generation-succeeded]", {
            checkpoint: openAiDebug.checkpoint,
            model,
            responseFormatUsed: useResponseFormat
          });
          break;
        } catch (error) {
          const safe = logOpenAiError("[openai][content-intelligence][direct-fetch-generation-failed]", error);
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
