export type ModelSource = "specific env var" | "OPENAI_MODEL" | "fallback";

export type ModelRoute = {
  feature: string;
  envVar: string;
  model: string;
  source: ModelSource;
  description: string;
  candidates: string[];
};

type RouteConfig = {
  feature: string;
  envVar: string;
  defaultModel: string;
  alternates?: string[];
  description: string;
};

const FINAL_FALLBACK_MODEL = "gpt-4o-mini";

function cleanModel(value: unknown) {
  return String(value || "").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(cleanModel).filter(Boolean)));
}

function selectRoute(config: RouteConfig): ModelRoute {
  const specific = cleanModel(process.env[config.envVar]);
  const global = cleanModel(process.env.OPENAI_MODEL);
  const model = specific || global || config.defaultModel;
  const source: ModelSource = specific ? "specific env var" : global ? "OPENAI_MODEL" : "fallback";
  const candidates = unique([
    specific,
    global,
    config.defaultModel,
    ...(config.alternates || []),
    FINAL_FALLBACK_MODEL
  ]);

  return {
    feature: config.feature,
    envVar: config.envVar,
    model,
    source,
    description: config.description,
    candidates
  };
}

export function logModelSelection(route: ModelRoute) {
  if (process.env.NODE_ENV !== "development") return;
  console.info("[model-router][selected]", {
    feature: route.feature,
    model: route.model,
    source: route.source,
    fallbackUsed: route.source === "fallback"
  });
}

export function logModelFallback(route: ModelRoute, failedModel: string, nextModel?: string) {
  if (process.env.NODE_ENV !== "development") return;
  console.warn("[model-router][fallback]", {
    feature: route.feature,
    failedModel,
    nextModel: nextModel || null
  });
}

export function getCreativeDirectorModel() {
  return selectRoute({
    feature: "Creative Director",
    envVar: "CREATIVE_DIRECTOR_MODEL",
    defaultModel: "gpt-4.1",
    description: "Strategic creative briefs, platform choices, CTAs, and high-level creative direction."
  });
}

export function getWeeklyPlannerModel() {
  return selectRoute({
    feature: "Weekly Planner",
    envVar: "WEEKLY_PLANNER_MODEL",
    defaultModel: "gpt-4.1",
    description: "Autonomous weekly planning, varied content mix, platform strategy, and scheduling recommendations."
  });
}

export function getClaudePromptBuilderModel() {
  return selectRoute({
    feature: "Claude Blog Prompt Builder",
    envVar: "CLAUDE_PROMPT_BUILDER_MODEL",
    defaultModel: "gpt-4.1",
    description: "Future blog prompt construction and long-form prompt strategy."
  });
}

export function getContentRepurposingModel() {
  return selectRoute({
    feature: "Content Repurposing",
    envVar: "CONTENT_REPURPOSING_MODEL",
    defaultModel: "gpt-4.1",
    description: "Cross-platform adaptation and content repurposing."
  });
}

export function getStoryFrameworkModel() {
  return selectRoute({
    feature: "Story Framework Selection",
    envVar: "STORY_FRAMEWORK_MODEL",
    defaultModel: "gpt-4.1",
    description: "Story framework selection, emotional destination, and strategy reasoning."
  });
}

export function getContentPackModel() {
  return selectRoute({
    feature: "Content Pack Generation",
    envVar: "CONTENT_PACK_MODEL",
    defaultModel: "gpt-4.1",
    description: "Complete multi-platform content pack generation."
  });
}

export function getVoiceRewriteModel() {
  return selectRoute({
    feature: "Voice Rewrite",
    envVar: "VOICE_REWRITE_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o"],
    description: "LionHeart voice rewrite, emotional specificity, and targeted tone improvements."
  });
}

export function getCanvaBriefModel() {
  return selectRoute({
    feature: "Canva Briefs",
    envVar: "CANVA_BRIEF_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o"],
    description: "Canva slide copy, Canva briefs, and concise design-ready copy."
  });
}

export function getResearchModel() {
  return selectRoute({
    feature: "Research Summarization",
    envVar: "RESEARCH_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o-mini"],
    description: "Summarizing vetted source excerpts into safe research findings."
  });
}

export function getJsonExtractionModel() {
  return selectRoute({
    feature: "JSON Extraction",
    envVar: "JSON_EXTRACTION_MODEL",
    defaultModel: FINAL_FALLBACK_MODEL,
    description: "Structured extraction, metadata parsing, and low-risk JSON cleanup."
  });
}

export function getFallbackModel() {
  return selectRoute({
    feature: "Minimal OpenAI Test",
    envVar: "OPENAI_MODEL",
    defaultModel: FINAL_FALLBACK_MODEL,
    description: "Minimal connection tests and final fallback model."
  });
}

export function getModelRoutes() {
  return [
    getCreativeDirectorModel(),
    getWeeklyPlannerModel(),
    getClaudePromptBuilderModel(),
    getContentRepurposingModel(),
    getStoryFrameworkModel(),
    getContentPackModel(),
    getVoiceRewriteModel(),
    getCanvaBriefModel(),
    getResearchModel(),
    getJsonExtractionModel(),
    getFallbackModel()
  ];
}

export async function testOpenAiModelAvailability(options: {
  model: string;
  apiKey?: string;
  timeoutMs?: number;
}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "OPENAI_API_KEY is missing." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 12000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        max_tokens: 8,
        temperature: 0,
        messages: [{ role: "user", content: "Reply OK." }]
      })
    });
    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: text.slice(0, 500) || `OpenAI returned ${response.status}.` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Model availability test failed." };
  } finally {
    clearTimeout(timeout);
  }
}
