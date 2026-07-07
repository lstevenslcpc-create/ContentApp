"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenText, CalendarDays, CheckCircle2, ClipboardCopy, FileText, Loader2, Send, Sparkles } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CopyButton } from "@/components/CopyButton";

type Project = {
  id: string;
  blog_topic: string;
  target_audience?: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
  business_goal?: string;
  cta_focus?: string;
  shopify_blog_category?: string;
  suggested_publish_date?: string;
  status: string;
  creative_brief?: Record<string, any>;
  claude_prompt?: string;
  claude_draft?: string;
  content_dna?: Record<string, any>;
  weekly_assets?: Record<string, any>;
  shopify_metadata?: Record<string, any>;
  content_pack_id?: string | null;
  updated_at?: string;
};

const goals = ["therapy referrals", "teen workbook sales", "email list growth", "Pinterest traffic", "SEO traffic", "trust building"];
const ctas = ["therapy services", "teen workbook", "freebie", "email list", "product", "related blog"];

function textList(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  return String(value || "");
}

function pretty(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function statusIndex(status: string) {
  return [
    "Topic Planned",
    "Brief Ready",
    "Claude Prompt Ready",
    "Sent to Claude",
    "Claude Draft Needed",
    "Draft Pasted",
    "Content DNA Generated",
    "Weekly Assets Generated",
    "Needs Review",
    "Approved",
    "Scheduled",
    "Published on Shopify"
  ].indexOf(status);
}

function StepPill({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${active ? "bg-[#172a3a] text-white ring-[#172a3a]" : done ? "bg-[#eef3ec] text-[#33533c] ring-[#cbdcc7]" : "bg-white text-[#6f766f] ring-[#eadfc8]"}`}>
      {label}
    </span>
  );
}

export function WeeklyAuthorityClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({
    blogTopic: "",
    targetAudience: "emotionally overwhelmed parents and teens",
    primaryKeyword: "",
    secondaryKeywords: "",
    businessGoal: "trust building",
    ctaFocus: "related blog",
    shopifyBlogCategory: "Mental Health",
    suggestedPublishDate: ""
  });

  const selected = useMemo(() => projects.find((project) => project.id === selectedId) || projects[0], [projects, selectedId]);
  const currentStep = statusIndex(selected?.status || "");

  const loadProjects = useCallback(async () => {
    const response = await authedFetch("/api/weekly-authority");
    const data = await response.json();
    if (data.ok) {
      setProjects(data.projects || []);
      if (!selectedId && data.projects?.[0]?.id) setSelectedId(data.projects[0].id);
    } else {
      setError(data.error || "Unable to load Weekly Authority projects.");
    }
  }, [selectedId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function runAction(action: string, payload: Record<string, unknown> = {}) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await authedFetch("/api/weekly-authority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, projectId: selected?.id, ...payload })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Weekly Authority action failed.");
      setMessage(action === "plan" ? "Blog creative brief and Claude prompt are ready." : "Workflow updated.");
      if (data.project?.id) setSelectedId(data.project.id);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weekly Authority action failed.");
    } finally {
      setLoading(false);
    }
  }

  async function planBlog() {
    await runAction("plan", form);
  }

  async function importDraft() {
    await runAction("import-draft", { draft });
    setDraft("");
  }

  const brief = selected?.creative_brief || {};
  const assets = selected?.weekly_assets || {};
  const shopify = selected?.shopify_metadata || {};

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[2rem] bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <BookOpenText size={14} />
          Shopify Blog Workflow
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">Weekly Authority Engine</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f3ecdf]">
          Plan 2 to 3 SEO authority blogs, generate a Claude-ready prompt, paste the finished Claude draft, then repurpose it into platform-native weekly assets and Approval Review content packs.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-7">
        {["Plan Blog", "Review Brief", "Copy Claude Prompt", "Paste Claude Blog", "Generate Weekly Assets", "Review + Approve", "Shopify Checklist"].map((label, index) => (
          <StepPill key={label} label={label} active={index === Math.min(Math.max(currentStep, 0), 6)} done={currentStep > index} />
        ))}
      </section>

      {message ? <div className="rounded-2xl border border-[#cbdcc7] bg-[#eef3ec] p-4 text-sm font-semibold text-[#33533c]">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#172a3a]">Step 1: Plan Blog</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-bold text-[#172a3a]">Blog topic</label>
              <input className="input" value={form.blogTopic} onChange={(event) => setForm({ ...form, blogTopic: event.target.value })} placeholder="teen anxiety and stomach aches before school" />
              <label className="block text-sm font-bold text-[#172a3a]">Target audience</label>
              <input className="input" value={form.targetAudience} onChange={(event) => setForm({ ...form, targetAudience: event.target.value })} />
              <label className="block text-sm font-bold text-[#172a3a]">Primary keyword</label>
              <input className="input" value={form.primaryKeyword} onChange={(event) => setForm({ ...form, primaryKeyword: event.target.value })} placeholder="teen anxiety symptoms" />
              <label className="block text-sm font-bold text-[#172a3a]">Secondary keywords</label>
              <input className="input" value={form.secondaryKeywords} onChange={(event) => setForm({ ...form, secondaryKeywords: event.target.value })} placeholder="school anxiety, anxious teen, parent tips" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-[#172a3a]">Business goal</label>
                  <select className="input" value={form.businessGoal} onChange={(event) => setForm({ ...form, businessGoal: event.target.value })}>
                    {goals.map((goal) => <option key={goal}>{goal}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#172a3a]">CTA focus</label>
                  <select className="input" value={form.ctaFocus} onChange={(event) => setForm({ ...form, ctaFocus: event.target.value })}>
                    {ctas.map((cta) => <option key={cta}>{cta}</option>)}
                  </select>
                </div>
              </div>
              <label className="block text-sm font-bold text-[#172a3a]">Shopify blog category/tag</label>
              <input className="input" value={form.shopifyBlogCategory} onChange={(event) => setForm({ ...form, shopifyBlogCategory: event.target.value })} />
              <label className="block text-sm font-bold text-[#172a3a]">Suggested publish date</label>
              <input className="input" type="date" value={form.suggestedPublishDate} onChange={(event) => setForm({ ...form, suggestedPublishDate: event.target.value })} />
              <button className="btn-primary w-full" onClick={planBlog} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Generate Brief + Claude Prompt
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#172a3a]">Weekly Dashboard</h2>
            <div className="mt-4 space-y-2">
              {projects.length ? projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full rounded-2xl border p-3 text-left text-sm transition ${selected?.id === project.id ? "border-[#172a3a] bg-[#f8f2e8]" : "border-[#eadfc8] bg-white hover:bg-[#fffdf8]"}`}
                >
                  <span className="block font-bold text-[#172a3a]">{project.blog_topic}</span>
                  <span className="mt-1 block text-xs text-[#6f766f]">{project.status}</span>
                </button>
              )) : (
                <p className="text-sm leading-6 text-[#6f766f]">Your weekly Shopify blog projects will appear here after you plan a topic.</p>
              )}
            </div>
          </section>
        </aside>

        <main className="space-y-5">
          {!selected ? (
            <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[#172a3a]">Start with one Shopify blog topic.</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f766f]">The engine will create the SEO brief and Claude prompt first. Claude writes the long-form blog.</p>
            </section>
          ) : (
            <>
              <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{selected.status}</p>
                    <h2 className="mt-2 text-2xl font-bold text-[#172a3a]">{selected.blog_topic}</h2>
                    <p className="mt-2 text-sm text-[#6f766f]">Keyword: {selected.primary_keyword || "Not set"} | Shopify category: {selected.shopify_blog_category || "Not set"}</p>
                  </div>
                  {selected.content_pack_id ? (
                    <Link className="btn-primary" href="/approval-review">
                      Open Approval Review <ArrowRight size={16} />
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
                <h3 className="text-xl font-bold text-[#172a3a]">Step 2: Blog Creative Brief</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoCard title="Shopify blog title" value={brief.shopifyBlogTitle} />
                  <InfoCard title="URL handle" value={brief.suggestedUrlSlug} />
                  <InfoCard title="Meta title" value={brief.metaTitle} />
                  <InfoCard title="Meta description" value={brief.metaDescription} />
                  <InfoCard title="Search intent" value={brief.searchIntent} />
                  <InfoCard title="Reader pain point" value={brief.readerPainPoint} />
                  <InfoCard title="Therapist insight" value={brief.psychologicalTherapistInsight} />
                  <InfoCard title="Product/service CTA" value={brief.productServiceCtaSuggestion} />
                </div>
                <details className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]" open>
                  <summary className="cursor-pointer font-bold text-[#172a3a]">Outline, FAQs, and angles</summary>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f665f]">{pretty({
                    seoTitleOptions: brief.seoTitleOptions,
                    outline: brief.outline,
                    faqSuggestions: brief.faqSuggestions,
                    pinterestAngle: brief.pinterestAngle,
                    youtubeAngle: brief.youtubeAngle,
                    shortFormVideoAngles: brief.shortFormVideoAngles,
                    newsletterAngle: brief.newsletterAngle
                  })}</pre>
                </details>
              </section>

              <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-[#172a3a]">Step 3: Copy Claude Prompt</h3>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={selected.claude_prompt || ""} label="Copy Claude Prompt" />
                    <button className="btn-secondary" onClick={() => runAction("mark-sent")} disabled={loading}><Send size={16} />Mark Sent to Claude</button>
                    <button className="btn-secondary" onClick={() => runAction("mark-draft-ready")} disabled={loading}><CheckCircle2 size={16} />Mark Claude Draft Ready</button>
                  </div>
                </div>
                <textarea className="mt-4 min-h-72 w-full rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#172a3a]" readOnly value={selected.claude_prompt || ""} />
              </section>

              <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-[#172a3a]">Step 4: Paste Claude Blog</h3>
                <p className="mt-1 text-sm leading-6 text-[#6f766f]">Paste the finished Claude blog draft here. The app will analyze it into Content DNA before repurposing.</p>
                <textarea className="mt-4 min-h-64 w-full rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#172a3a]" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Paste Claude's finished Shopify blog draft here..." />
                <button className="btn-primary mt-3" onClick={importDraft} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  Analyze Content DNA
                </button>
                {selected.content_dna ? (
                  <details className="mt-4 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]" open>
                    <summary className="cursor-pointer font-bold text-[#172a3a]">Content DNA</summary>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f665f]">{pretty(selected.content_dna)}</pre>
                  </details>
                ) : null}
              </section>

              <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#172a3a]">Step 5: Generate Weekly Assets</h3>
                    <p className="mt-1 text-sm leading-6 text-[#6f766f]">Creates YouTube, short-form video, carousel, Pinterest, email, Threads/X, Facebook, internal links, CTA guidance, and Shopify metadata.</p>
                  </div>
                  <button className="btn-primary" onClick={() => runAction("generate-assets")} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Generate Weekly Assets
                  </button>
                </div>

                {assets && Object.keys(assets).length ? (
                  <div className="mt-5 grid gap-4">
                    <AssetCard title="YouTube Script" value={assets.youtubeScript} />
                    <AssetCard title="Short-Form Video Scripts" value={assets.shortFormVideoScripts} />
                    <AssetCard title="Instagram Carousel" value={assets.instagramCarousel} />
                    <AssetCard title="Pinterest Package" value={assets.pinterestPackage} />
                    <AssetCard title="Email Newsletter" value={assets.emailNewsletter} />
                    <AssetCard title="Threads/X Content" value={assets.threadsXContent} />
                    <AssetCard title="Facebook Post" value={assets.facebookPost} />
                  </div>
                ) : null}
              </section>

              <section className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
                <h3 className="text-xl font-bold text-[#172a3a]">Step 7: Shopify Posting Checklist</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoCard title="Shopify title" value={shopify.shopifyBlogTitle || brief.shopifyBlogTitle} />
                  <InfoCard title="Shopify URL handle" value={shopify.shopifyUrlHandle || brief.suggestedUrlSlug} />
                  <InfoCard title="Shopify SEO title" value={shopify.shopifySeoTitle || brief.metaTitle} />
                  <InfoCard title="Shopify meta description" value={shopify.shopifyMetaDescription || brief.metaDescription} />
                  <InfoCard title="Tags/categories" value={textList(shopify.shopifyTags || brief.shopifyTags)} />
                  <InfoCard title="Blog URL placeholder" value={shopify.shopifyBlogUrlPlaceholder || "Paste final Shopify blog URL after publishing."} />
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#5f665f]">
                  {(shopify.shopifyPublishingChecklist || brief.shopifyPublishingChecklist || []).map((item: string) => (
                    <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 text-[#4f6f5a]" size={16} />{item}</li>
                  ))}
                </ul>
                {selected.content_pack_id ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link className="btn-primary" href="/approval-review">Review Content Pack</Link>
                    <Link className="btn-secondary" href="/content-calendar"><CalendarDays size={16} />Schedule Assets</Link>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: unknown }) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#172a3a]">{textList(value) || "Not generated yet"}</p>
    </article>
  );
}

function AssetCard({ title, value }: { title: string; value: unknown }) {
  const text = pretty(value);
  return (
    <details className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4" open>
      <summary className="cursor-pointer font-bold text-[#172a3a]">{title}</summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={text} label={`Copy ${title}`} />
      </div>
      <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-6 text-[#5f665f] ring-1 ring-[#eadfc8]">{text}</pre>
    </details>
  );
}
