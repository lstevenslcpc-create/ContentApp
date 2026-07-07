export type ModelSource = "feature_env" | "openai_model" | "feature_default" | "final_fallback";

export type ResolutionStep = {
  label: string;
  envVar?: string;
  status: "selected" | "not_configured" | "available";
  value?: string;
};

export type CostProfile = {
  quality: number;
  speed: number;
  cost: "$" | "$$" | "$$$" | "$$$$";
};

export type ModelRoute = {
  feature: string;
  envVar: string;
  model: string;
  source: ModelSource;
  sourceLabel: string;
  statusLabel: string;
  statusTone: "blue" | "purple" | "yellow" | "red";
  description: string;
  defaultModel: string;
  recommendedModel: string;
  candidates: string[];
  resolutionPath: ResolutionStep[];
  costProfile: CostProfile;
};

type RouteConfig = {
  feature: string;
  envVar: string;
  defaultModel: string;
  alternates?: string[];
  description: string;
  costProfile: CostProfile;
};

const FINAL_FALLBACK_MODEL = "gpt-4o-mini";

function cleanModel(value: unknown) {
  return String(value || "").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(cleanModel).filter(Boolean)));
}

function sourceMetadata(source: ModelSource, envVar: string) {
  if (source === "feature_env") {
    return {
      sourceLabel: envVar,
      statusLabel: "🟢 Environment Override",
      statusTone: "blue" as const
    };
  }

  if (source === "openai_model") {
    return {
      sourceLabel: "OPENAI_MODEL",
      statusLabel: "🟣 OPENAI_MODEL",
      statusTone: "purple" as const
    };
  }

  if (source === "feature_default") {
    return {
      sourceLabel: "Feature Default",
      statusLabel: "🟡 Feature Default",
      statusTone: "yellow" as const
    };
  }

  return {
    sourceLabel: "Final Fallback",
    statusLabel: "🔴 Final Fallback",
    statusTone: "red" as const
  };
}

function selectRoute(config: RouteConfig): ModelRoute {
  const specific = cleanModel(process.env[config.envVar]);
  const global = cleanModel(process.env.OPENAI_MODEL);
  const featureDefault = cleanModel(config.defaultModel);
  const model = specific || global || featureDefault || FINAL_FALLBACK_MODEL;
  const source: ModelSource = specific
    ? "feature_env"
    : global
      ? "openai_model"
      : featureDefault
        ? "feature_default"
        : "final_fallback";
  const resolutionPath: ResolutionStep[] = [];

  resolutionPath.push({
    label: config.envVar,
    envVar: config.envVar,
    status: specific ? "selected" : "not_configured",
    value: specific || undefined
  });

  if (!specific) {
    resolutionPath.push({
      label: "OPENAI_MODEL",
      envVar: "OPENAI_MODEL",
      status: global ? "selected" : "not_configured",
      value: global || undefined
    });
  }

  if (!specific && !global) {
    resolutionPath.push({
      label: "Feature Default",
      status: featureDefault ? "selected" : "not_configured",
      value: featureDefault || undefined
    });
  }

  if (!specific && !global && !featureDefault) {
    resolutionPath.push({
      label: "Final Fallback",
      status: "selected",
      value: FINAL_FALLBACK_MODEL
    });
  }

  const candidates = unique([
    specific,
    global,
    featureDefault,
    ...(config.alternates || []),
    FINAL_FALLBACK_MODEL
  ]);
  const metadata = sourceMetadata(source, config.envVar);

  return {
    feature: config.feature,
    envVar: config.envVar,
    model,
    source,
    ...metadata,
    description: config.description,
    defaultModel: featureDefault || FINAL_FALLBACK_MODEL,
    recommendedModel: featureDefault || FINAL_FALLBACK_MODEL,
    candidates,
    resolutionPath,
    costProfile: config.costProfile
  };
}

export function logModelSelection(route: ModelRoute) {
  if (process.env.NODE_ENV !== "development") return;
  console.info("[model-router][selected]", {
    feature: route.feature,
    model: route.model,
    source: route.source,
    fallbackUsed: route.source === "final_fallback"
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
    description: "High-level strategy, SEO planning, emotional positioning, CTA recommendations, and content direction.",
    costProfile: { quality: 5, speed: 4, cost: "$$$" }
  });
}

export function getWeeklyPlannerModel() {
  return selectRoute({
    feature: "Weekly Planner",
    envVar: "WEEKLY_PLANNER_MODEL",
    defaultModel: "gpt-4.1",
    description: "Autonomous weekly planning, varied content mix, platform strategy, and scheduling recommendations.",
    costProfile: { quality: 5, speed: 4, cost: "$$$" }
  });
}

export function getClaudePromptBuilderModel() {
  return selectRoute({
    feature: "Claude Blog Prompt Builder",
    envVar: "CLAUDE_PROMPT_BUILDER_MODEL",
    defaultModel: "gpt-4.1",
    description: "Future blog prompt construction and long-form prompt strategy.",
    costProfile: { quality: 5, speed: 4, cost: "$$$" }
  });
}

export function getContentRepurposingModel() {
  return selectRoute({
    feature: "Content Repurposing",
    envVar: "CONTENT_REPURPOSING_MODEL",
    defaultModel: "gpt-4.1",
    description: "Cross-platform adaptation, content generation, and platform-native rewrites.",
    costProfile: { quality: 5, speed: 4, cost: "$$$" }
  });
}

export function getStoryFrameworkModel() {
  return selectRoute({
    feature: "Story Framework Selection",
    envVar: "STORY_FRAMEWORK_MODEL",
    defaultModel: "gpt-4.1",
    description: "Story framework selection, emotional destination, and strategy reasoning.",
    costProfile: { quality: 5, speed: 4, cost: "$$$" }
  });
}

export function getContentPackModel() {
  return selectRoute({
    feature: "Content Pack Generation",
    envVar: "CONTENT_PACK_MODEL",
    defaultModel: "gpt-4.1",
    description: "Complete multi-platform content pack generation.",
    costProfile: { quality: 5, speed: 3, cost: "$$$" }
  });
}

export function getVoiceRewriteModel() {
  return selectRoute({
    feature: "Voice Rewrite",
    envVar: "VOICE_REWRITE_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o"],
    description: "Editing existing content into LionHeart voice while preserving structure.",
    costProfile: { quality: 4, speed: 4, cost: "$$" }
  });
}

export function getCanvaBriefModel() {
  return selectRoute({
    feature: "Canva Briefs",
    envVar: "CANVA_BRIEF_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o"],
    description: "Canva slide copy, Canva briefs, and concise design-ready copy.",
    costProfile: { quality: 4, speed: 4, cost: "$$" }
  });
}

export function getResearchModel() {
  return selectRoute({
    feature: "Research Summarization",
    envVar: "RESEARCH_MODEL",
    defaultModel: "gpt-4.1-mini",
    alternates: ["gpt-4o-mini"],
    description: "Summarizes research before generation.",
    costProfile: { quality: 4, speed: 4, cost: "$$" }
  });
}

export function getJsonExtractionModel() {
  return selectRoute({
    feature: "JSON Extraction",
    envVar: "JSON_EXTRACTION_MODEL",
    defaultModel: FINAL_FALLBACK_MODEL,
    description: "Structured parsing where low cost and deterministic output are preferred.",
    costProfile: { quality: 3, speed: 5, cost: "$" }
  });
}

export function getFallbackModel() {
  return selectRoute({
    feature: "Minimal OpenAI Test",
    envVar: "OPENAI_MODEL",
    defaultModel: FINAL_FALLBACK_MODEL,
    description: "Tiny model availability checks and the final app-wide fallback.",
    costProfile: { quality: 3, speed: 5, cost: "$" }
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

export function getModelEnvironmentStatuses() {
  return getModelRoutes().map((route) => ({
    envVar: route.envVar,
    configured: Boolean(cleanModel(process.env[route.envVar])),
    currentValue: cleanModel(process.env[route.envVar]) || "",
    recommendedModel: route.recommendedModel,
    feature: route.feature
  }));
}

export function getModelConfigurationSummary() {
  const routes = getModelRoutes();
  return {
    configuredVariables: getModelEnvironmentStatuses().filter((item) => item.configured).length,
    usingDefaults: routes.filter((route) => route.source === "feature_default").length,
    usingOpenAiModel: routes.filter((route) => route.source === "openai_model").length,
    usingEmergencyFallback: routes.filter((route) => route.source === "final_fallback").length
  };
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
