"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookmarkPlus, Brain, Lightbulb, Loader2, Mail, Newspaper, Pin, Search, Sparkles, Video } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import type { ContentOpportunity, PlatformAngles } from "@/lib/types";
import { SaveToLibraryButton } from "@/components/media-library/SaveToLibraryButton";

const starterOpportunities: ContentOpportunity[] = [
  {
    topic: "What high-functioning anxiety looks like when nobody can tell",
    explanation: "A trust-building topic that validates capable clients who feel internally overwhelmed. Strong fit for carousels, short scripts, and SEO language around high-functioning anxiety.",
    strongest_emotional_hook: "If everyone thinks you are calm, but your brain is running a private emergency meeting...",
    curiosity_angle: "Names the gap between outside competence and inside panic.",
    save_worthy_angle: "Gives high achievers language for a pattern they may not know how to explain.",
    share_worthy_angle: "Easy to send to a friend who looks fine but is quietly overwhelmed.",
    comment_bait_potential: "What is one anxiety behavior people mistake for being responsible?",
    emotional_trigger_category: "hidden symptom recognition",
    audience: "high-achieving anxious women",
    content_pillar: "Trust-building",
    platform_recommendations: {
      tiktok_reels: "Three signs your nervous system is working overtime even when you look calm.",
      instagram_carousel: "Slide-by-slide contrast between outside presentation and internal anxiety.",
      pinterest_pin: "High-Functioning Anxiety Signs You Might Be Missing",
      blog_seo_article: "What Is High-Functioning Anxiety?",
      threads_post: "A concise validating post about capability and overwhelm coexisting.",
      email_newsletter: "A gentle note on why achievement does not cancel out anxiety."
    },
    seo_keywords: ["high-functioning anxiety", "anxiety therapy", "therapy for anxious women"],
    seo_opportunity_score: 86,
    emotional_engagement_score: 91,
    virality_score: 82,
    emotional_resonance_score: 93,
    save_potential_score: 90,
    trust_building_score: 88,
    conversion_score: 76,
    seo_score: 86,
    pinterest_potential_score: 78,
    ai_search_potential_score: 84,
    emotional_angle: "Helps people feel seen without shame.",
    visual_direction: "Notebook-style carousel with a calm navy margin, handwritten inner-dialogue lines, and soft cream backgrounds.",
    product_tie_in: "Anxious AF Workbook",
    service_tie_in: "Anxiety Therapy",
    cta: "Save this and schedule a consultation if anxiety is running the show behind the scenes.",
    clinical_sensitivity: "medium",
    status: "idea"
  },
  {
    topic: "How to talk to your teen when anxiety comes out as attitude",
    explanation: "A parent-facing idea that reframes behavior with empathy and clinical nuance. Useful for Facebook, Instagram, and service pages around teen therapy.",
    strongest_emotional_hook: "Your teen may not be giving you attitude. Their anxiety may be out of words.",
    curiosity_angle: "Reframes a common parent-teen conflict in a way that lowers defensiveness.",
    save_worthy_angle: "Parents can save it as a conversation reset before the next blowup.",
    share_worthy_angle: "Highly shareable among parents who feel worried and rejected.",
    comment_bait_potential: "What behavior in your teen is hardest not to take personally?",
    emotional_trigger_category: "relationship tension",
    audience: "parents of anxious teen girls",
    content_pillar: "Education",
    platform_recommendations: {
      tiktok_reels: "A therapist explains what may be underneath teen shutdown or irritability.",
      instagram_carousel: "What parents see vs. what anxiety may be communicating.",
      pinterest_pin: "Teen Anxiety: When It Looks Like Attitude",
      blog_seo_article: "How Teen Anxiety Can Show Up at Home",
      threads_post: "Short reminder that behavior is communication, not a character flaw.",
      email_newsletter: "A parent note with one supportive conversation starter."
    },
    seo_keywords: ["teen anxiety", "teen therapy", "therapy for teen girls"],
    seo_opportunity_score: 82,
    emotional_engagement_score: 88,
    virality_score: 79,
    emotional_resonance_score: 89,
    save_potential_score: 86,
    trust_building_score: 91,
    conversion_score: 82,
    seo_score: 82,
    pinterest_potential_score: 75,
    ai_search_potential_score: 80,
    emotional_angle: "Reduces parent blame and teen shame.",
    visual_direction: "Text-message style carousel contrasting parent interpretation with teen inner dialogue, using sage accents.",
    product_tie_in: "Teen Mental Health Workbook",
    service_tie_in: "Teen Therapy",
    cta: "Reach out to explore therapy support for your teen.",
    clinical_sensitivity: "medium",
    status: "idea"
  },
  {
    topic: "A Sunday reset for people who are tired of starting over every Monday",
    explanation: "A gentle product and email-friendly idea that connects burnout, routines, and low-pressure reset rituals. Strong tie-in for toolkit content without sounding salesy.",
    strongest_emotional_hook: "You do not need a new personality by Monday. You may just need a softer reset.",
    curiosity_angle: "Challenges the all-or-nothing reset culture that burnt-out women are tired of.",
    save_worthy_angle: "A low-pressure ritual people can return to on Sunday nights.",
    share_worthy_angle: "Useful for friends who keep trying to overhaul their life every week.",
    comment_bait_potential: "What part of Sunday makes your nervous system tense up?",
    emotional_trigger_category: "validation",
    audience: "overwhelmed moms and high-achieving anxious women",
    content_pillar: "Product",
    platform_recommendations: {
      tiktok_reels: "A calm 20-second reset ritual with three doable steps.",
      instagram_carousel: "A Sunday reset that does not require reinventing your life.",
      pinterest_pin: "Sunday Reset Ritual for Anxiety and Burnout",
      blog_seo_article: "How to Create a Gentle Weekly Reset Ritual",
      threads_post: "A soft reminder that reset does not mean perfection.",
      email_newsletter: "A Sunday evening reset note with a product mention."
    },
    seo_keywords: ["reset ritual", "burnout toolkit", "anxiety reset"],
    seo_opportunity_score: 74,
    emotional_engagement_score: 84,
    virality_score: 76,
    emotional_resonance_score: 87,
    save_potential_score: 92,
    trust_building_score: 80,
    conversion_score: 83,
    seo_score: 74,
    pinterest_potential_score: 88,
    ai_search_potential_score: 76,
    emotional_angle: "Offers relief without demanding a full life overhaul.",
    visual_direction: "Cozy desk scene with journal, muted gold pen, warm lamp, and clean Pinterest infographic overlay.",
    product_tie_in: "Reset Ritual Toolkit",
    service_tie_in: "Anxiety Therapy",
    cta: "Try one small reset and explore the toolkit when you want more structure.",
    clinical_sensitivity: "low",
    status: "idea"
  }
];

const showDeveloperDiagnostics = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEBUG === "true";

const angleIcons = {
  tiktok_reels: Video,
  instagram_carousel: Sparkles,
  pinterest_pin: Pin,
  blog_seo_article: Newspaper,
  threads_post: Lightbulb,
  email_newsletter: Mail
};

const prettyAngleLabels = {
  tiktok_reels: "TikTok/Reels",
  instagram_carousel: "Instagram carousel",
  pinterest_pin: "Pinterest pin",
  blog_seo_article: "Blog/SEO article",
  threads_post: "Threads post",
  email_newsletter: "Email newsletter"
};

type DiagnosticsState = {
  authHeaderReceived?: boolean;
  authCookieReceived?: boolean;
  userDetected?: boolean;
  OPENAI_API_KEY?: boolean;
  SUPABASE_URL?: boolean;
  SUPABASE_SERVICE_ROLE_KEY?: boolean;
  OAUTH_TOKEN_ENCRYPTION_KEY?: boolean;
  contentOpportunitiesSchemaFieldsExist?: boolean;
  brandBrainsSchemaFieldsExist?: boolean;
};

type ApiDebugState = {
  statusCode?: number;
  rawJson?: unknown;
  checkpoint?: string;
  keyExists?: boolean;
  keyPreview?: string;
  runtimeType?: string;
  nodeVersion?: string;
  openAiClientInitialized?: boolean;
  directFetchMinimalTestSucceeded?: boolean;
  openAiResponseReceived?: boolean;
  opportunitiesArrayParsed?: boolean;
  opportunityCount?: number;
  modelUsed?: string;
  openAiStatusCode?: number | string;
  openAiErrorType?: string;
  openAiErrorCode?: string;
  minimalTestSucceeded?: boolean;
};

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}): ${text.slice(0, 240)}` };
  }
}

function formatApiError(data: Record<string, unknown>, fallback: string) {
  const error = typeof data.error === "string" ? data.error : fallback;
  const warning = typeof data.warning === "string" ? data.warning : "";
  const warnings = Array.isArray(data.warnings) ? data.warnings.map(String).join(" ") : "";
  const details = typeof data.details === "string"
    ? data.details
    : data.details && typeof data.details === "object" && "message" in data.details
      ? String((data.details as { message?: unknown }).message || "")
      : "";
  const env = data.env && typeof data.env === "object"
    ? Object.entries(data.env as Record<string, boolean>)
      .filter(([, present]) => !present)
      .map(([name]) => `${name} missing`)
      .join("; ")
    : "";
  return [error, warning, warnings, details, env].filter(Boolean).join(" ");
}

function diagnosticsFailureReason(diagnostics: DiagnosticsState | null) {
  if (!diagnostics) return "";
  if (!diagnostics.authHeaderReceived && !diagnostics.authCookieReceived) return "No Supabase access token reached the API. Sign out, sign back in, then try again.";
  if (!diagnostics.userDetected) return "The API received a token, but Supabase did not validate the user session. Please sign in again.";
  if (!diagnostics.OPENAI_API_KEY) return "OPENAI_API_KEY is missing in production.";
  if (!diagnostics.SUPABASE_URL) return "SUPABASE_URL is missing in production.";
  if (!diagnostics.SUPABASE_SERVICE_ROLE_KEY) return "SUPABASE_SERVICE_ROLE_KEY is missing in production.";
  if (!diagnostics.contentOpportunitiesSchemaFieldsExist) return "The content_opportunities table is missing required upgraded fields.";
  if (!diagnostics.brandBrainsSchemaFieldsExist) return "The brand_brains table is missing required upgraded fields.";
  return "";
}

export function ContentIntelligenceClient() {
  const router = useRouter();
  const [theme, setTheme] = useState("teen anxiety");
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>(starterOpportunities);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [savedOpportunities, setSavedOpportunities] = useState<Record<string, ContentOpportunity>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyTopic, setBusyTopic] = useState("");
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState | null>(null);
  const [apiDebug, setApiDebug] = useState<ApiDebugState | null>(null);

  async function refreshDiagnostics() {
    try {
      const response = await authedFetch("/api/content-intelligence/diagnostics");
      const data = await readApiResponse(response);
      setDiagnostics(data as DiagnosticsState);
      return data as DiagnosticsState;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    void refreshDiagnostics();
  }, []);

  const topScores = useMemo(() => {
    const seo = Math.round(opportunities.reduce((sum, item) => sum + (item.seo_score || item.seo_opportunity_score || 0), 0) / Math.max(opportunities.length, 1));
    const emotional = Math.round(opportunities.reduce((sum, item) => sum + (item.emotional_resonance_score || item.emotional_engagement_score || 0), 0) / Math.max(opportunities.length, 1));
    return { seo, emotional };
  }, [opportunities]);

  async function generate() {
    setLoading(true);
    setMessage("");
    try {
      const response = await authedFetch("/api/content-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", theme })
      });
      const data = await readApiResponse(response);
      setApiDebug({
        statusCode: response.status,
        rawJson: data,
        checkpoint: typeof (data.debug as { checkpoint?: unknown } | undefined)?.checkpoint === "string" ? (data.debug as { checkpoint: string }).checkpoint : undefined,
        keyExists: Boolean((data.debug as { keyExists?: boolean } | undefined)?.keyExists),
        keyPreview: typeof (data.debug as { keyPreview?: unknown } | undefined)?.keyPreview === "string" ? (data.debug as { keyPreview: string }).keyPreview : undefined,
        runtimeType: typeof (data.debug as { runtimeType?: unknown } | undefined)?.runtimeType === "string" ? (data.debug as { runtimeType: string }).runtimeType : undefined,
        nodeVersion: typeof (data.debug as { nodeVersion?: unknown } | undefined)?.nodeVersion === "string" ? (data.debug as { nodeVersion: string }).nodeVersion : undefined,
        openAiClientInitialized: Boolean((data.debug as { openAiClientInitialized?: boolean } | undefined)?.openAiClientInitialized),
        directFetchMinimalTestSucceeded: Boolean((data.debug as { directFetchMinimalTestSucceeded?: boolean } | undefined)?.directFetchMinimalTestSucceeded),
        openAiResponseReceived: Boolean((data.debug as { openAiResponseReceived?: boolean } | undefined)?.openAiResponseReceived),
        opportunitiesArrayParsed: Boolean((data.debug as { opportunitiesArrayParsed?: boolean } | undefined)?.opportunitiesArrayParsed),
        opportunityCount: typeof (data.debug as { opportunityCount?: unknown } | undefined)?.opportunityCount === "number"
          ? (data.debug as { opportunityCount: number }).opportunityCount
          : Array.isArray(data.opportunities) ? data.opportunities.length : 0,
        modelUsed: typeof (data.debug as { modelUsed?: unknown } | undefined)?.modelUsed === "string" ? (data.debug as { modelUsed: string }).modelUsed : undefined,
        openAiStatusCode: typeof (data.debug as { openAiStatusCode?: unknown } | undefined)?.openAiStatusCode === "number" || typeof (data.debug as { openAiStatusCode?: unknown } | undefined)?.openAiStatusCode === "string" ? (data.debug as { openAiStatusCode: number | string }).openAiStatusCode : undefined,
        openAiErrorType: typeof (data.debug as { openAiErrorType?: unknown } | undefined)?.openAiErrorType === "string" ? (data.debug as { openAiErrorType: string }).openAiErrorType : undefined,
        openAiErrorCode: typeof (data.debug as { openAiErrorCode?: unknown } | undefined)?.openAiErrorCode === "string" ? (data.debug as { openAiErrorCode: string }).openAiErrorCode : undefined,
        minimalTestSucceeded: Boolean((data.debug as { minimalTestSucceeded?: boolean } | undefined)?.minimalTestSucceeded)
      });
      setLoading(false);
      if (!response.ok) {
        const latestDiagnostics = await refreshDiagnostics();
        const reason = diagnosticsFailureReason(latestDiagnostics);
        const backendMessage = data.details && typeof data.details === "object" && "message" in data.details
          ? String((data.details as { message?: unknown }).message || "")
          : "";
        setMessage([backendMessage || formatApiError(data, "Unable to generate content opportunities."), reason].filter(Boolean).join(" "));
        return;
      }
      setOpportunities(Array.isArray(data.opportunities) ? data.opportunities as ContentOpportunity[] : []);
      void refreshDiagnostics();
      const warnings = Array.isArray(data.warnings) ? ` ${data.warnings.map(String).join(" ")}` : "";
      setMessage(`${typeof data.disclaimer === "string" ? data.disclaimer : "AI-assisted content strategy suggestions generated."}${warnings}`);
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Network error while generating content opportunities.");
    }
  }

  async function saveIdea(opportunity: ContentOpportunity): Promise<ContentOpportunity | null> {
    setBusyTopic(opportunity.topic);
    setMessage("");
    try {
      const response = await authedFetch("/api/content-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", opportunity })
      });
      const data = await readApiResponse(response);
      setBusyTopic("");
      if (!response.ok) {
        setMessage(formatApiError(data, "Unable to save idea."));
        return null;
      }
      const savedOpportunity = data.opportunity && typeof data.opportunity === "object" ? data.opportunity as ContentOpportunity : opportunity;
      setSaved((current) => ({ ...current, [opportunity.topic]: true }));
      setSavedOpportunities((current) => ({ ...current, [opportunity.topic]: savedOpportunity }));
      setMessage(typeof data.warning === "string" ? data.warning : "Idea saved as a draft content opportunity.");
      return savedOpportunity;
    } catch (error) {
      setBusyTopic("");
      setMessage(error instanceof Error ? error.message : "Network error while saving idea.");
      return null;
    }
  }

  async function generatePack(opportunity: ContentOpportunity) {
    setBusyTopic(opportunity.topic);
    setMessage("");
    try {
      let selectedOpportunity: ContentOpportunity | null = savedOpportunities[opportunity.topic] || (opportunity.id ? opportunity : null);
      if (!selectedOpportunity) {
        selectedOpportunity = await saveIdea(opportunity);
      }

      if (!selectedOpportunity) {
        setBusyTopic("");
        return;
      }

      setMessage("Creating a complete multi-platform content pack...");
      setBusyTopic(opportunity.topic);
      const response = await authedFetch("/api/content-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: selectedOpportunity.id,
          opportunity: selectedOpportunity
        })
      });
      const data = await readApiResponse(response);
      setBusyTopic("");
      if (!response.ok) {
        setMessage(formatApiError(data, "Unable to create content pack. Make sure Brand Brain, OpenAI, Supabase, and the content_packs table are configured."));
        return;
      }
      const pack = data.pack && typeof data.pack === "object" ? data.pack as { id?: string } : {};
      if (pack.id) {
        if (String(pack.id).startsWith("temporary-")) {
          window.sessionStorage.setItem(`content-pack:${pack.id}`, JSON.stringify(pack));
        }
        router.push(`/content-packs/${pack.id}`);
        return;
      }
      setMessage("Content pack created, but the preview link was missing from the response.");
    } catch (error) {
      setBusyTopic("");
      setMessage(error instanceof Error ? error.message : "Network error while generating content pack.");
    }
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Brain size={14} />
              Humanized Content Intelligence Engine
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Create from the exact feeling your audience has not found words for yet.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">AI-assisted strategy suggestions based on Brand Brain, hidden anxiety behaviors, emotional contradictions, social-native hooks, SEO, products, services, and clinical safety. Live trend APIs are not connected yet.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ScoreCard label="Avg SEO opportunity" value={topScores.seo} />
            <ScoreCard label="Avg emotional engagement" value={topScores.emotional} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e9dfcf] bg-white/85 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9dfcf] text-[#172a3a]"><Search size={18} /></span>
          <div>
            <h2 className="text-xl font-bold text-[#172a3a]">Search & Trend Input</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">Enter a broad theme. Suggestions are AI-assisted until real search and social trend APIs are connected.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            className="min-h-12 flex-1 rounded-xl border border-[#e6ddcf] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            placeholder="teen anxiety, burnout, anxious attachment..."
          />
          <button className="btn-primary bg-[#c9b7ee] px-5 text-[#2f2550] hover:bg-[#bba5e8]" onClick={generate} disabled={loading}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            Generate Opportunities
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["teen anxiety", "high-functioning anxiety", "burnout", "people pleasing", "nervous system regulation", "therapy first session", "anxious attachment", "teen mental health workbook"].map((sample) => (
            <button key={sample} className="rounded-full bg-[#f7f1e6] px-3 py-1.5 text-xs font-bold text-[#77633c]" onClick={() => setTheme(sample)}>{sample}</button>
          ))}
        </div>
        {message && <p className="mt-4 rounded-xl bg-[#eef3ec] p-3 text-sm font-semibold leading-6 text-[#4f6f5a]">{message}</p>}
        {diagnostics && (
          <p className="mt-3 rounded-xl bg-[#fffdf8] p-3 text-xs font-semibold leading-5 text-[#77633c]">
            Session diagnostics: token sent {diagnostics.authHeaderReceived || diagnostics.authCookieReceived ? "yes" : "no"} · user detected {diagnostics.userDetected ? "yes" : "no"} · OpenAI {diagnostics.OPENAI_API_KEY ? "ready" : "missing"} · Supabase {diagnostics.SUPABASE_URL && diagnostics.SUPABASE_SERVICE_ROLE_KEY ? "ready" : "missing"} · Content schema {diagnostics.contentOpportunitiesSchemaFieldsExist ? "ready" : "missing"} · Brand Brain schema {diagnostics.brandBrainsSchemaFieldsExist ? "ready" : "missing"}
          </p>
        )}
        {apiDebug && showDeveloperDiagnostics && (
          <details className="mt-3 rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-3 text-xs leading-5 text-[#77633c]">
            <summary className="cursor-pointer font-bold text-[#172a3a]">Developer Diagnostics</summary>
            <div className="mt-3">
              <p>API status code: {apiDebug.statusCode ?? "unknown"}</p>
              <p>Current checkpoint: {apiDebug.checkpoint || "unknown"}</p>
              <p>Runtime: {apiDebug.runtimeType || "unknown"} · Node: {apiDebug.nodeVersion || "unknown"}</p>
              <p>OpenAI key present: {apiDebug.keyExists ? "yes" : "no"}</p>
              <p>OpenAI client initialized: {apiDebug.openAiClientInitialized ? "yes" : "no"}</p>
              <p>Direct fetch minimal test succeeded: {apiDebug.directFetchMinimalTestSucceeded ? "yes" : "no"}</p>
              <p>OpenAI response received: {apiDebug.openAiResponseReceived ? "yes" : "no"}</p>
              <p>Model used: {apiDebug.modelUsed || "unknown"}</p>
              <p>OpenAI status code: {apiDebug.openAiStatusCode ?? "unknown"}</p>
              <p>OpenAI error type/code: {[apiDebug.openAiErrorType, apiDebug.openAiErrorCode].filter(Boolean).join(" / ") || "none"}</p>
              <p>Minimal OpenAI test succeeded: {apiDebug.minimalTestSucceeded ? "yes" : "no"}</p>
              <p>Opportunities array parsed: {apiDebug.opportunitiesArrayParsed ? "yes" : "no"}</p>
              <p>Opportunity count: {apiDebug.opportunityCount ?? 0}</p>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-[#172a3a] p-3 text-[11px] leading-5 text-[#f3ecdf]">
                {JSON.stringify(apiDebug.rawJson, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#172a3a]">Weekly Content Opportunities</h2>
            <p className="mt-1 text-sm text-[#6f766f]">Editorial ideas ranked by emotional resonance, save/share potential, trust, search, and conversion fit.</p>
          </div>
          <span className="hidden rounded-full bg-[#f7f1e6] px-3 py-1.5 text-xs font-bold text-[#77633c] sm:inline-flex">AI-assisted strategy</span>
        </div>
        <div className="grid gap-5">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.topic}
              opportunity={opportunity}
              saved={Boolean(saved[opportunity.topic])}
              busy={busyTopic === opportunity.topic}
              onSave={() => void saveIdea(opportunity)}
              onGenerate={() => generatePack(opportunity)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function OpportunityCard({ opportunity, saved, busy, onSave, onGenerate }: { opportunity: ContentOpportunity; saved: boolean; busy: boolean; onSave: () => void; onGenerate: () => void }) {
  const angles = opportunity.platform_recommendations as PlatformAngles;
  const scoreItems = [
    ["Viral", opportunity.virality_score],
    ["Resonance", opportunity.emotional_resonance_score || opportunity.emotional_engagement_score],
    ["Save", opportunity.save_potential_score],
    ["Trust", opportunity.trust_building_score],
    ["Convert", opportunity.conversion_score],
    ["SEO", opportunity.seo_score || opportunity.seo_opportunity_score],
    ["Pinterest", opportunity.pinterest_potential_score],
    ["AI search", opportunity.ai_search_potential_score]
  ];

  return (
    <article className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{opportunity.content_pillar}</Pill>
            <Sensitivity level={opportunity.clinical_sensitivity} />
            {opportunity.emotional_trigger_category && <TriggerBadge>{opportunity.emotional_trigger_category}</TriggerBadge>}
          </div>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-[#172a3a]">{opportunity.topic}</h3>
          {opportunity.strongest_emotional_hook && (
            <div className="mt-4 rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#b89b5e]">Strongest emotional hook</p>
              <p className="mt-2 text-lg font-bold leading-7 text-[#172a3a]">“{opportunity.strongest_emotional_hook}”</p>
            </div>
          )}
          <p className="mt-3 text-sm leading-6 text-[#5f675f]">{opportunity.explanation}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Detail label="Target audience" value={opportunity.audience} />
            <Detail label="Product/service tie-in" value={[opportunity.product_tie_in, opportunity.service_tie_in].filter(Boolean).join(" · ") || "None"} />
            <Detail label="Emotional angle" value={opportunity.emotional_angle} />
            <Detail label="Recommended CTA" value={opportunity.cta} />
          </div>

          <details className="mt-5 rounded-2xl border border-[#eadfc8] bg-[#f8f3ea] p-4" open>
            <summary className="cursor-pointer text-sm font-bold text-[#172a3a]">Viral psychology layer</summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Detail label="Curiosity angle" value={opportunity.curiosity_angle || "Add a curiosity gap after generation."} />
              <Detail label="Save-worthy angle" value={opportunity.save_worthy_angle || "Add a practical save reason after generation."} />
              <Detail label="Share-worthy angle" value={opportunity.share_worthy_angle || "Add a share reason after generation."} />
              <Detail label="Comment bait potential" value={opportunity.comment_bait_potential || "Add a clinically safe comment prompt after generation."} />
            </div>
          </details>

          {opportunity.visual_direction && (
            <div className="mt-5 rounded-2xl bg-[#eef3ec] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#4f6f5a]">Visual direction</p>
              <p className="mt-2 text-sm leading-6 text-[#20313f]">{opportunity.visual_direction}</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(opportunity.seo_keywords || []).map((keyword) => <span key={keyword} className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{keyword}</span>)}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn-secondary border-[#d8c28a] text-[#172a3a]" onClick={onSave} disabled={busy || saved}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <BookmarkPlus size={16} />}
              {saved ? "Saved" : "Save Idea"}
            </button>
            <SaveToLibraryButton
              payload={{
                title: opportunity.topic,
                description: opportunity.explanation || null,
                asset_type: "Canva direction",
                source: "content_intelligence",
                platform: "Multi-platform",
                content_pillar: opportunity.content_pillar,
                product_tie_in: opportunity.product_tie_in || null,
                service_tie_in: opportunity.service_tie_in || null,
                text_content: [
                  opportunity.topic,
                  opportunity.strongest_emotional_hook,
                  opportunity.explanation,
                  `Audience: ${opportunity.audience}`,
                  `Trigger: ${opportunity.emotional_trigger_category || ""}`,
                  `CTA: ${opportunity.cta}`,
                  `Visual: ${opportunity.visual_direction || ""}`,
                  `Angles: ${JSON.stringify(opportunity.platform_recommendations)}`
                ].filter(Boolean).join("\n\n"),
                tags: [opportunity.audience, opportunity.content_pillar, ...(opportunity.seo_keywords || [])].filter(Boolean),
                status: "saved",
                metadata: {
                  seoOpportunityScore: opportunity.seo_opportunity_score,
                  emotionalEngagementScore: opportunity.emotional_engagement_score,
                  clinicalSensitivity: opportunity.clinical_sensitivity
                }
              }}
            />
            <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={onGenerate} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              Create Content Pack
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f8f3ea] p-4">
          <div className="grid grid-cols-2 gap-2">
            {scoreItems.map(([label, value]) => (
              <MiniScore key={label as string} label={label as string} value={Number(value || 0)} />
            ))}
          </div>
          <details className="mt-5" open>
            <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-[#77633c]">Platform-native strategy</summary>
            <div className="mt-3 grid gap-3">
              {Object.entries(prettyAngleLabels).map(([key, label]) => {
                const Icon = angleIcons[key as keyof typeof angleIcons];
                return (
                  <div key={key} className="rounded-xl border border-[#eadfc8] bg-white/80 p-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#172a3a]"><Icon size={14} />{label}</p>
                    <p className="mt-2 text-sm leading-5 text-[#5f675f]">{angles?.[key as keyof PlatformAngles] || "Angle will be refined after generation."}</p>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function ScoreCard({ label, value, compact }: { label: string; value: number; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/20 ${compact ? "bg-white" : "bg-white/10"} p-4`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${compact ? "text-[#77633c]" : "text-[#eadfc8]"}`}>{label}</p>
      <p className={`mt-2 text-3xl font-bold ${compact ? "text-[#172a3a]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-[#eadfc8]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xl font-bold text-[#172a3a]">{value}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f1e8d8]">
          <span className="block h-full rounded-full bg-[#c9b7ee]" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
        </span>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#7b7468]">{label}</p>
      <p className="mt-2 text-sm leading-5 text-[#20313f]">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold text-[#77633c]">{children}</span>;
}

function TriggerBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]">{children}</span>;
}

function Sensitivity({ level }: { level: ContentOpportunity["clinical_sensitivity"] }) {
  const styles = {
    low: "bg-[#eef3ec] text-[#4f6f5a]",
    medium: "bg-[#fff4d8] text-[#8a6926]",
    high: "bg-rose-50 text-rose-700"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[level]}`}>Clinical sensitivity: {level}</span>;
}
