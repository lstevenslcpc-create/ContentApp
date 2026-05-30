"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { ArrowRight, BookmarkPlus, Brain, Lightbulb, Loader2, Mail, Newspaper, Pin, Search, Sparkles, Video } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import type { ContentOpportunity, PlatformAngles } from "@/lib/types";
import { SaveToLibraryButton } from "@/components/media-library/SaveToLibraryButton";

const starterOpportunities: ContentOpportunity[] = [
  {
    topic: "What high-functioning anxiety looks like when nobody can tell",
    explanation: "A trust-building topic that validates capable clients who feel internally overwhelmed. Strong fit for carousels, short scripts, and SEO language around high-functioning anxiety.",
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
    emotional_angle: "Helps people feel seen without shame.",
    product_tie_in: "Anxious AF Workbook",
    service_tie_in: "Anxiety Therapy",
    cta: "Save this and schedule a consultation if anxiety is running the show behind the scenes.",
    clinical_sensitivity: "medium",
    status: "idea"
  },
  {
    topic: "How to talk to your teen when anxiety comes out as attitude",
    explanation: "A parent-facing idea that reframes behavior with empathy and clinical nuance. Useful for Facebook, Instagram, and service pages around teen therapy.",
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
    emotional_angle: "Reduces parent blame and teen shame.",
    product_tie_in: "Teen Mental Health Workbook",
    service_tie_in: "Teen Therapy",
    cta: "Reach out to explore therapy support for your teen.",
    clinical_sensitivity: "medium",
    status: "idea"
  },
  {
    topic: "A Sunday reset for people who are tired of starting over every Monday",
    explanation: "A gentle product and email-friendly idea that connects burnout, routines, and low-pressure reset rituals. Strong tie-in for toolkit content without sounding salesy.",
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
    emotional_angle: "Offers relief without demanding a full life overhaul.",
    product_tie_in: "Reset Ritual Toolkit",
    service_tie_in: "Anxiety Therapy",
    cta: "Try one small reset and explore the toolkit when you want more structure.",
    clinical_sensitivity: "low",
    status: "idea"
  }
];

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

export function ContentIntelligenceClient() {
  const [theme, setTheme] = useState("teen anxiety");
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>(starterOpportunities);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyTopic, setBusyTopic] = useState("");

  const topScores = useMemo(() => {
    const seo = Math.round(opportunities.reduce((sum, item) => sum + (item.seo_opportunity_score || 0), 0) / Math.max(opportunities.length, 1));
    const emotional = Math.round(opportunities.reduce((sum, item) => sum + (item.emotional_engagement_score || 0), 0) / Math.max(opportunities.length, 1));
    return { seo, emotional };
  }, [opportunities]);

  async function generate() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch("/api/content-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", theme })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to generate content opportunities.");
      return;
    }
    setOpportunities(data.opportunities || []);
    setMessage(data.disclaimer || "AI-assisted content strategy suggestions generated.");
  }

  async function saveIdea(opportunity: ContentOpportunity) {
    setBusyTopic(opportunity.topic);
    setMessage("");
    const response = await authedFetch("/api/content-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", opportunity })
    });
    const data = await response.json();
    setBusyTopic("");
    if (!response.ok) {
      setMessage(data.error || "Unable to save idea.");
      return;
    }
    setSaved((current) => ({ ...current, [opportunity.topic]: true }));
    setMessage("Idea saved as a draft content opportunity.");
  }

  async function generatePack(opportunity: ContentOpportunity) {
    setBusyTopic(opportunity.topic);
    setMessage("");
    const platform = pickPrimaryPlatform(opportunity);
    const response = await authedFetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        contentType: platform === "Pinterest" ? "post" : "carousel",
        contentGoal: opportunity.content_pillar || "education",
        numberOfPosts: 7,
        intelligenceBrief: {
          topic: opportunity.topic,
          audience: opportunity.audience,
          content_pillar: opportunity.content_pillar,
          seo_keywords: opportunity.seo_keywords,
          emotional_angle: opportunity.emotional_angle,
          product_tie_in: opportunity.product_tie_in,
          service_tie_in: opportunity.service_tie_in,
          cta: opportunity.cta,
          clinical_sensitivity: opportunity.clinical_sensitivity
        }
      })
    });
    const data = await response.json();
    setBusyTopic("");
    if (!response.ok) {
      setMessage(data.error || "Unable to generate content pack. Make sure your Business Profile, Brand Brain, OpenAI key, and Supabase session are configured.");
      return;
    }
    setMessage(`Generated ${data.posts?.length || 0} content drafts from "${opportunity.topic}". Open Content Generator or Calendar to review them.`);
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Brain size={14} />
              Content Intelligence Engine
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Know what LionHeart Therapy should create next.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">AI-assisted strategy suggestions based on Brand Brain, SEO reasoning, audience pain points, products, services, and clinical safety. Live trend APIs are not connected yet.</p>
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
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#172a3a]">Weekly Content Opportunities</h2>
            <p className="mt-1 text-sm text-[#6f766f]">Editorial ideas ranked by strategic fit, emotional resonance, and conversion tie-in.</p>
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
              onSave={() => saveIdea(opportunity)}
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

  return (
    <article className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{opportunity.content_pillar}</Pill>
            <Sensitivity level={opportunity.clinical_sensitivity} />
          </div>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-[#172a3a]">{opportunity.topic}</h3>
          <p className="mt-3 text-sm leading-6 text-[#5f675f]">{opportunity.explanation}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Detail label="Target audience" value={opportunity.audience} />
            <Detail label="Product/service tie-in" value={[opportunity.product_tie_in, opportunity.service_tie_in].filter(Boolean).join(" · ") || "None"} />
            <Detail label="Emotional angle" value={opportunity.emotional_angle} />
            <Detail label="Recommended CTA" value={opportunity.cta} />
          </div>

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
                  opportunity.explanation,
                  `Audience: ${opportunity.audience}`,
                  `CTA: ${opportunity.cta}`,
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
              Generate Content Pack
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f8f3ea] p-4">
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard label="SEO" value={opportunity.seo_opportunity_score || 0} compact />
            <ScoreCard label="Emotion" value={opportunity.emotional_engagement_score || 0} compact />
          </div>
          <h4 className="mt-5 text-sm font-bold uppercase tracking-wide text-[#77633c]">Platform Angle Cards</h4>
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

function Sensitivity({ level }: { level: ContentOpportunity["clinical_sensitivity"] }) {
  const styles = {
    low: "bg-[#eef3ec] text-[#4f6f5a]",
    medium: "bg-[#fff4d8] text-[#8a6926]",
    high: "bg-rose-50 text-rose-700"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[level]}`}>Clinical sensitivity: {level}</span>;
}

function pickPrimaryPlatform(opportunity: ContentOpportunity) {
  const text = JSON.stringify(opportunity.platform_recommendations).toLowerCase();
  if (text.includes("pinterest")) return "Pinterest";
  if (text.includes("blog")) return "LinkedIn";
  if (text.includes("tiktok")) return "TikTok";
  return "Instagram";
}
