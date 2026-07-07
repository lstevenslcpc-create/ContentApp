import { getResearchModel, logModelFallback, logModelSelection } from "./modelRouter";

export type ResearchProviderId = "openai" | "perplexity" | "gemini" | "claude" | "trusted_web" | "future_web_api";

export type ResearchSourceType =
  | "clinical_organization"
  | "government"
  | "academic"
  | "professional_association"
  | "peer_reviewed"
  | "expert_consensus"
  | "unknown";

export type ResearchFinding = {
  keyFinding: string;
  sourceType: ResearchSourceType;
  confidenceScore: number;
  provider: ResearchProviderId;
  sourceName?: string;
  sourceUrl?: string;
  retrievedAt: string;
};

export type ResearchEnrichmentInput = {
  topic: string;
  audience?: string;
  questions?: string[];
  provider?: ResearchProviderId;
  maxFindings?: number;
};

export type ResearchEnrichmentResult = {
  enabled: boolean;
  provider: ResearchProviderId;
  topic: string;
  findings: ResearchFinding[];
  warnings: string[];
  raw?: unknown;
};

type TrustedSource = {
  name: string;
  url: string;
  sourceType: ResearchSourceType;
  topics: string[];
  fallbackFinding: string;
};

type ResearchProvider = {
  id: ResearchProviderId;
  isConfigured: () => boolean;
  enrich: (input: Required<Pick<ResearchEnrichmentInput, "topic" | "maxFindings">> & ResearchEnrichmentInput) => Promise<ResearchEnrichmentResult>;
};

const trustedSources: TrustedSource[] = [
  {
    name: "National Institute of Mental Health",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    sourceType: "government",
    topics: ["anxiety", "teen anxiety", "high functioning anxiety", "perfectionism", "anxious attachment"],
    fallbackFinding: "Anxiety can include excessive worry, avoidance, sleep disruption, physical symptoms, and difficulty with daily functioning."
  },
  {
    name: "CDC Children's Mental Health",
    url: "https://www.cdc.gov/childrensmentalhealth/",
    sourceType: "government",
    topics: ["teen anxiety", "child anxiety", "school stress", "parenting"],
    fallbackFinding: "Child and teen mental health concerns can affect behavior, school, emotions, family life, and social functioning."
  },
  {
    name: "SAMHSA Mental Health",
    url: "https://www.samhsa.gov/mental-health",
    sourceType: "government",
    topics: ["trauma responses", "burnout", "emotional avoidance", "mental health"],
    fallbackFinding: "Mental health education should encourage support-seeking, safety awareness, and non-stigmatizing language."
  },
  {
    name: "American Psychological Association",
    url: "https://www.apa.org/topics/anxiety",
    sourceType: "professional_association",
    topics: ["anxiety", "stress", "perfectionism", "avoidance"],
    fallbackFinding: "Anxiety and stress responses are influenced by thoughts, behaviors, emotions, relationships, and body-based arousal."
  },
  {
    name: "CHADD",
    url: "https://chadd.org/for-adults/overview/",
    sourceType: "clinical_organization",
    topics: ["adhd in women", "adhd", "executive dysfunction"],
    fallbackFinding: "ADHD in adults can affect executive function, time management, emotion regulation, organization, and relationships."
  }
];

function isResearchEnabled() {
  return process.env.WEB_RESEARCH_ENABLED === "true";
}

function confidence(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeTopic(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchingTrustedSources(topic: string) {
  const normalized = normalizeTopic(topic);
  const words = normalized.split(" ").filter(Boolean);
  return trustedSources.filter((source) => {
    const sourceTopics = source.topics.map(normalizeTopic);
    return sourceTopics.some((sourceTopic) => normalized.includes(sourceTopic) || sourceTopic.includes(normalized) || words.some((word) => sourceTopic.includes(word)));
  });
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

async function fetchTrustedSourceText(source: TrustedSource) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AI Content Creator OS research enrichment"
      }
    });
    if (!response.ok) return "";
    const html = await response.text();
    return stripHtml(html);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function summarizeWithOpenAi(input: ResearchEnrichmentInput, source: TrustedSource, sourceText: string) {
  if (!process.env.OPENAI_API_KEY || !sourceText) return null;

  const route = getResearchModel();
  logModelSelection(route);
  let response: Response | null = null;

  for (let index = 0; index < route.candidates.length; index += 1) {
    const model = route.candidates[index];
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return strict JSON. Summarize only from the provided source excerpt. Do not invent citations, statistics, URLs, authors, dates, or claims. If the excerpt does not support a finding, return an empty findings array."
          },
          {
            role: "user",
            content: `
Topic: ${input.topic}
Audience: ${input.audience || "not specified"}
Source name: ${source.name}
Source type: ${source.sourceType}
Source URL: ${source.url}
Requested questions: ${(input.questions || []).join(" | ") || "supporting facts, statistics, recent findings, and expert consensus"}

Source excerpt:
${sourceText}

Return JSON:
{
  "findings": [
    {
      "keyFinding": "One concise summarized finding supported by the excerpt, no copied wording",
      "confidenceScore": 0
    }
  ]
}
`
          }
        ]
      })
    });

    if (response.ok) break;
    logModelFallback(route, model, route.candidates[index + 1]);
  }

  if (!response?.ok) return null;
  const json = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as { findings?: Array<{ keyFinding?: string; confidenceScore?: number }> };
    return parsed.findings || [];
  } catch {
    return null;
  }
}

const trustedWebProvider: ResearchProvider = {
  id: "trusted_web",
  isConfigured: () => true,
  async enrich(input) {
    const sources = matchingTrustedSources(input.topic);
    const warnings: string[] = [];
    const findings: ResearchFinding[] = [];
    const selectedSources = sources.length ? sources : trustedSources.slice(0, 3);

    for (const source of selectedSources) {
      if (findings.length >= input.maxFindings) break;
      const sourceText = await fetchTrustedSourceText(source);
      const summarized = await summarizeWithOpenAi(input, source, sourceText);

      if (summarized?.length) {
        summarized.slice(0, input.maxFindings - findings.length).forEach((finding) => {
          if (!finding.keyFinding) return;
          findings.push({
            keyFinding: finding.keyFinding,
            sourceType: source.sourceType,
            confidenceScore: confidence(finding.confidenceScore || 82),
            provider: "trusted_web",
            sourceName: source.name,
            sourceUrl: source.url,
            retrievedAt: new Date().toISOString()
          });
        });
      } else {
        findings.push({
          keyFinding: source.fallbackFinding,
          sourceType: source.sourceType,
          confidenceScore: sourceText ? 72 : 60,
          provider: "trusted_web",
          sourceName: source.name,
          sourceUrl: source.url,
          retrievedAt: new Date().toISOString()
        });
        if (!sourceText) warnings.push(`Could not fetch ${source.name}; used vetted fallback summary metadata.`);
      }
    }

    return {
      enabled: true,
      provider: "trusted_web",
      topic: input.topic,
      findings: findings.slice(0, input.maxFindings),
      warnings
    };
  }
};

const openAiProvider: ResearchProvider = {
  id: "openai",
  isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
  async enrich(input) {
    const webResult = await trustedWebProvider.enrich(input);
    return {
      ...webResult,
      provider: "openai",
      findings: webResult.findings.map((finding) => ({ ...finding, provider: "openai" }))
    };
  }
};

function unimplementedProvider(id: Exclude<ResearchProviderId, "openai" | "trusted_web">, envKey: string): ResearchProvider {
  return {
    id,
    isConfigured: () => Boolean(process.env[envKey]),
    async enrich(input) {
      return {
        enabled: true,
        provider: id,
        topic: input.topic,
        findings: [],
        warnings: [`${id} research provider is architected but not implemented yet. Add provider API logic before enabling it.`]
      };
    }
  };
}

const providers: Record<ResearchProviderId, ResearchProvider> = {
  openai: openAiProvider,
  trusted_web: trustedWebProvider,
  perplexity: unimplementedProvider("perplexity", "PERPLEXITY_API_KEY"),
  gemini: unimplementedProvider("gemini", "GEMINI_API_KEY"),
  claude: unimplementedProvider("claude", "ANTHROPIC_API_KEY"),
  future_web_api: unimplementedProvider("future_web_api", "WEB_RESEARCH_API_KEY")
};

export function getResearchProvider(provider?: ResearchProviderId) {
  const selected = provider || (process.env.RESEARCH_PROVIDER as ResearchProviderId | undefined) || "trusted_web";
  return providers[selected] || providers.trusted_web;
}

export async function enrichResearch(input: ResearchEnrichmentInput): Promise<ResearchEnrichmentResult> {
  const provider = getResearchProvider(input.provider);
  const maxFindings = input.maxFindings || 5;

  if (!isResearchEnabled()) {
    return {
      enabled: false,
      provider: provider.id,
      topic: input.topic,
      findings: [],
      warnings: ["WEB_RESEARCH_ENABLED is false. Research enrichment skipped."]
    };
  }

  if (!provider.isConfigured()) {
    return {
      enabled: true,
      provider: provider.id,
      topic: input.topic,
      findings: [],
      warnings: [`${provider.id} research provider is not configured.`]
    };
  }

  try {
    return await provider.enrich({ ...input, maxFindings, topic: input.topic || "mental health" });
  } catch (error) {
    return {
      enabled: true,
      provider: provider.id,
      topic: input.topic,
      findings: [],
      warnings: [error instanceof Error ? error.message : "Research enrichment failed."]
    };
  }
}

export function formatResearchFindingsForBrief(findings: ResearchFinding[]) {
  if (!findings.length) return "No external research findings were added.";
  return findings
    .map((finding) => `- ${finding.keyFinding} Source type: ${finding.sourceType}. Confidence: ${finding.confidenceScore}/100.`)
    .join("\n");
}
