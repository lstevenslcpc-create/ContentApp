"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Lightbulb,
  Loader2,
  Lock,
  Send,
  Sparkles
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { authedFetch } from "@/lib/apiClient";

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

type SuggestedTopic = {
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

const workflowSteps = [
  "Topic Planned",
  "Creative Brief Ready",
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
];

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

function normalizeStep(status: string) {
  if (status === "Brief Ready") return "Creative Brief Ready";
  return status || "Topic Planned";
}

function statusIndex(status: string) {
  const index = workflowSteps.indexOf(normalizeStep(status));
  return index >= 0 ? index : 0;
}

function nextBestAction(project?: Project) {
  if (!project) return "Start with a blog idea or generate suggested topics.";
  const status = normalizeStep(project.status);
  if (status === "Claude Prompt Ready") return "Copy the Claude prompt and send it to Claude.";
  if (status === "Sent to Claude" || status === "Claude Draft Needed") return "Paste the finished Claude blog draft.";
  if (status === "Content DNA Generated") return "Generate weekly assets from the Claude blog.";
  if (status === "Needs Review") return "Review the generated content pack in Approval Review.";
  if (status === "Approved") return "Schedule the repurposed assets on the calendar.";
  if (status === "Scheduled") return "Prepare final manual posting.";
  return "Review the creative brief and Claude prompt.";
}

function getChecklistItems(project?: Project) {
  const brief = project?.creative_brief || {};
  const shopify = project?.shopify_metadata || {};
  return [
    ["blogTitle", `Blog title: ${shopify.shopifyBlogTitle || brief.shopifyBlogTitle || "Not generated yet"}`],
    ["slug", `URL handle/slug: ${shopify.shopifyUrlHandle || brief.suggestedUrlSlug || "Not generated yet"}`],
    ["metaTitle", `Meta title: ${shopify.shopifySeoTitle || brief.metaTitle || "Not generated yet"}`],
    ["metaDescription", `Meta description: ${shopify.shopifyMetaDescription || brief.metaDescription || "Not generated yet"}`],
    ["excerpt", `Excerpt: ${shopify.shopifyExcerpt || brief.excerpt || "Not generated yet"}`],
    ["tags", `Shopify tags: ${textList(shopify.shopifyTags || brief.shopifyTags) || "Not generated yet"}`],
    ["internalLinks", "Internal links added"],
    ["productCta", "Product CTA added"],
    ["serviceCta", "Service CTA added"],
    ["pinterestImage", "Pinterest image created"],
    ["published", "Blog published"],
    ["urlPasted", "Blog URL pasted back into app"]
  ] as Array<[string, string]>;
}

export function WeeklyAuthorityClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState<"continue" | "own" | "ideas">("continue");
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
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
  const assets = selected?.weekly_assets || {};
  const hasAssets = Boolean(assets && Object.keys(assets).length);

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

  useEffect(() => {
    const completion = selected?.shopify_metadata?.checklistCompletion;
    setChecklist(completion && typeof completion === "object" ? completion : {});
  }, [selected?.id, selected?.shopify_metadata]);

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
      if (data.ideas) setSuggestedTopics(data.ideas);
      setMessage(action === "plan" ? "Creative brief and Claude prompt are ready." : action === "suggest-topics" ? "Three blog ideas are ready." : "Workflow updated.");
      if (data.project?.id) setSelectedId(data.project.id);
      await loadProjects();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weekly Authority action failed.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function planBlog(override?: Partial<typeof form>) {
    await runAction("plan", { ...form, ...override });
    setMode("continue");
  }

  async function generateIdeas() {
    setMode("ideas");
    await runAction("suggest-topics");
  }

  async function importDraft() {
    await runAction("import-draft", { draft });
    setDraft("");
  }

  async function toggleChecklist(key: string) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    await runAction("update-checklist", { checklistCompletion: next });
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[2rem] bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <BookOpenText size={14} />
          Shopify Blog Workflow
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">What should we publish this week?</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f3ecdf]">
          Plan a Shopify authority blog, send the long-form writing to Claude, paste the finished draft back here, then turn it into a full week of platform-native assets.
        </p>
        {selected ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">Resume project</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-bold">Continue: {selected.blog_topic}</p>
                <p className="mt-1 text-sm text-[#f3ecdf]">Next step: {nextBestAction(selected)}</p>
              </div>
              <button className="btn-secondary bg-white text-[#172a3a]" onClick={() => setMode("continue")}>Continue Project</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <OpeningOption active={mode === "own"} icon={<FileText size={18} />} title="Start with my own blog idea" description="Enter the topic, keyword, CTA, and Shopify category yourself." onClick={() => setMode("own")} />
        <OpeningOption active={mode === "ideas"} icon={<Lightbulb size={18} />} title="Generate 3 blog ideas for this week" description="Let the AI suggest Shopify blog topics based on your Brand Brain and content systems." onClick={generateIdeas} loading={loading && mode === "ideas"} />
        <OpeningOption active={mode === "continue"} icon={<BookOpenText size={18} />} title="Continue an existing Weekly Authority project" description="Pick up where you left off with Claude handoff, Content DNA, or asset generation." onClick={() => setMode("continue")} />
      </section>

      {message ? <div className="rounded-2xl border border-[#cbdcc7] bg-[#eef3ec] p-4 text-sm font-semibold text-[#33533c]">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div> : null}

      {mode === "ideas" ? (
        <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#172a3a]">Recommended Shopify Blog Topics</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {suggestedTopics.length ? suggestedTopics.map((idea) => (
              <article key={idea.blogTitle} className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{idea.primaryKeyword}</p>
                <h3 className="mt-2 text-xl font-bold text-[#172a3a]">{idea.blogTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6f766f]">{idea.whyWorthPublishingNow}</p>
                <div className="mt-4 space-y-2 text-sm text-[#172a3a]">
                  <p><strong>Audience:</strong> {idea.targetAudience}</p>
                  <p><strong>Best CTA:</strong> {idea.bestCta}</p>
                  <p><strong>Output:</strong> {idea.estimatedAssetOutput}</p>
                </div>
                <button className="btn-primary mt-5 w-full" onClick={() => planBlog({
                  blogTopic: idea.blogTopic || idea.blogTitle,
                  targetAudience: idea.targetAudience,
                  primaryKeyword: idea.primaryKeyword,
                  secondaryKeywords: (idea.secondaryKeywords || []).join(", "),
                  businessGoal: idea.businessGoal,
                  ctaFocus: idea.ctaFocus,
                  shopifyBlogCategory: idea.shopifyBlogCategory
                })} disabled={loading}>
                  Generate Brief <ArrowRight size={16} />
                </button>
              </article>
            )) : (
              <div className="rounded-2xl bg-[#fffdf8] p-5 text-sm text-[#6f766f] ring-1 ring-[#eadfc8]">
                Click “Generate 3 blog ideas” to create this week’s options.
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-4">
          {mode === "own" ? (
            <PlanBlogForm form={form} setForm={setForm} loading={loading} onSubmit={() => planBlog()} />
          ) : null}

          <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#172a3a]">Weekly Dashboard</h2>
            <div className="mt-4 space-y-2">
              {projects.length ? projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedId(project.id);
                    setMode("continue");
                  }}
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
              <h2 className="text-2xl font-bold text-[#172a3a]">Choose a starting path.</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f766f]">Start with your own idea or ask the AI for three Shopify blog ideas for this week.</p>
            </section>
          ) : (
            <>
              <ProjectTracker status={selected.status} />
              <ProjectHeader project={selected} />
              <CreativeBriefCard project={selected} />
              <ClaudePromptCard project={selected} loading={loading} onAction={runAction} />
              <ClaudeDraftCard project={selected} draft={draft} setDraft={setDraft} loading={loading} onImport={importDraft} />
              {selected.content_dna ? <ContentDnaCard project={selected} /> : null}
              <WeeklyAssetsSection project={selected} loading={loading} hasAssets={hasAssets} onAction={runAction} />
              <ShopifyChecklistCard project={selected} checklist={checklist} onToggle={toggleChecklist} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function OpeningOption({ active, icon, title, description, onClick, loading }: { active: boolean; icon: React.ReactNode; title: string; description: string; onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-3xl border p-5 text-left shadow-sm transition ${active ? "border-[#172a3a] bg-[#fffdf8]" : "border-[#eadfc8] bg-white/90 hover:bg-[#fffdf8]"}`}>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef3ec] text-[#4f6f5a]">{loading ? <Loader2 className="animate-spin" size={18} /> : icon}</span>
      <span className="mt-4 block text-lg font-bold text-[#172a3a]">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-[#6f766f]">{description}</span>
    </button>
  );
}

function ProjectTracker({ status }: { status: string }) {
  const current = statusIndex(status);
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#172a3a]">Project Tracker</h2>
        <span className="rounded-full bg-[#f8f2e8] px-3 py-1 text-xs font-bold text-[#77633c]">Current: {normalizeStep(status)}</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workflowSteps.map((step, index) => {
          const complete = index < current;
          const active = index === current;
          const locked = index > current;
          return (
            <div key={step} className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? "border-[#172a3a] bg-[#f8f2e8]" : complete ? "border-[#cbdcc7] bg-[#eef3ec]" : "border-[#eadfc8] bg-[#fffdf8] opacity-70"}`}>
              {complete ? <CheckCircle2 className="text-[#4f6f5a]" size={18} /> : active ? <Circle className="text-[#172a3a]" size={18} /> : locked ? <Lock className="text-[#9a927f]" size={16} /> : <Circle size={18} />}
              <span className="text-sm font-bold text-[#172a3a]">{step}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlanBlogForm({ form, setForm, loading, onSubmit }: { form: Record<string, string>; setForm: (form: any) => void; loading: boolean; onSubmit: () => void }) {
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <h2 className="text-xl font-bold text-[#172a3a]">Start with my own blog idea</h2>
      <div className="mt-4 space-y-3">
        <Field label="Blog topic" value={form.blogTopic} onChange={(value) => setForm({ ...form, blogTopic: value })} placeholder="teen anxiety and stomach aches before school" />
        <Field label="Target audience" value={form.targetAudience} onChange={(value) => setForm({ ...form, targetAudience: value })} />
        <Field label="Primary keyword" value={form.primaryKeyword} onChange={(value) => setForm({ ...form, primaryKeyword: value })} placeholder="teen anxiety symptoms" />
        <Field label="Secondary keywords" value={form.secondaryKeywords} onChange={(value) => setForm({ ...form, secondaryKeywords: value })} placeholder="school anxiety, anxious teen, parent tips" />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Business goal" value={form.businessGoal} options={goals} onChange={(value) => setForm({ ...form, businessGoal: value })} />
          <SelectField label="CTA focus" value={form.ctaFocus} options={ctas} onChange={(value) => setForm({ ...form, ctaFocus: value })} />
        </div>
        <Field label="Shopify blog category/tag" value={form.shopifyBlogCategory} onChange={(value) => setForm({ ...form, shopifyBlogCategory: value })} />
        <Field label="Suggested publish date" type="date" value={form.suggestedPublishDate} onChange={(value) => setForm({ ...form, suggestedPublishDate: value })} />
        <button className="btn-primary w-full" onClick={onSubmit} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Generate Brief + Claude Prompt
        </button>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#172a3a]">{label}</span>
      <input className="input mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#172a3a]">{label}</span>
      <select className="input mt-1" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ProjectHeader({ project }: { project: Project }) {
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{project.status}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#172a3a]">{project.blog_topic}</h2>
          <p className="mt-2 text-sm text-[#6f766f]">Next best action: {nextBestAction(project)}</p>
        </div>
        {project.content_pack_id ? (
          <Link className="btn-primary" href="/approval-review">Open Approval Review <ArrowRight size={16} /></Link>
        ) : null}
      </div>
    </section>
  );
}

function CreativeBriefCard({ project }: { project: Project }) {
  const brief = project.creative_brief || {};
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
      <h3 className="text-xl font-bold text-[#172a3a]">Creative Brief</h3>
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
      <details className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
        <summary className="cursor-pointer font-bold text-[#172a3a]">Outline, FAQs, and repurposing angles</summary>
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
  );
}

function ClaudePromptCard({ project, loading, onAction }: { project: Project; loading: boolean; onAction: (action: string, payload?: Record<string, unknown>) => Promise<any> }) {
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#172a3a]">Claude Handoff</h3>
          <p className="mt-1 text-sm leading-6 text-[#6f766f]">Claude writes the long-form Shopify blog. Come back here when the draft is finished and paste it into Step 4.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={project.claude_prompt || ""} label="Copy Claude Prompt" />
          <a className="btn-secondary" href="https://claude.ai/" target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Claude</a>
          <button className="btn-secondary" onClick={() => onAction("mark-sent")} disabled={loading}><Send size={16} />Mark Sent to Claude</button>
          <button className="btn-secondary" onClick={() => onAction("mark-draft-ready")} disabled={loading}><CheckCircle2 size={16} />Mark Claude Draft Ready</button>
        </div>
      </div>
      <textarea className="mt-4 min-h-72 w-full rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#172a3a]" readOnly value={project.claude_prompt || ""} />
    </section>
  );
}

function ClaudeDraftCard({ project, draft, setDraft, loading, onImport }: { project: Project; draft: string; setDraft: (value: string) => void; loading: boolean; onImport: () => void }) {
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <h3 className="text-xl font-bold text-[#172a3a]">Step 4: Paste Claude Blog</h3>
      <p className="mt-1 text-sm leading-6 text-[#6f766f]">Paste the finished Claude blog draft here. The app will extract Content DNA before repurposing.</p>
      {project.claude_draft ? <p className="mt-3 rounded-2xl bg-[#eef3ec] p-3 text-sm font-semibold text-[#33533c]">A Claude draft has already been pasted and saved for this project.</p> : null}
      <textarea className="mt-4 min-h-64 w-full rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#172a3a]" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Paste Claude's finished Shopify blog draft here..." />
      <button className="btn-primary mt-3" onClick={onImport} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
        Analyze Content DNA
      </button>
    </section>
  );
}

function ContentDnaCard({ project }: { project: Project }) {
  const dna = project.content_dna || {};
  const primaryEmotion = Array.isArray(dna.emotionalThemes) ? dna.emotionalThemes[0] : "";
  const therapistInsight = Array.isArray(dna.therapistInsights) ? dna.therapistInsights[0] : "";
  const workbook = Array.isArray(dna.workbookMentionOpportunities) ? dna.workbookMentionOpportunities.join("\n") : "";
  const therapy = Array.isArray(dna.therapyServiceMentionOpportunities) ? dna.therapyServiceMentionOpportunities.join("\n") : "";
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
      <h3 className="text-xl font-bold text-[#172a3a]">Content DNA Extracted</h3>
      <p className="mt-1 text-sm leading-6 text-[#6f766f]">The app analyzed the Claude blog and found the strategy signals it can repurpose into weekly content.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Main topic" value={dna.mainTopic} />
        <InfoCard title="Primary emotion" value={primaryEmotion} />
        <InfoCard title="Target audience" value={project.target_audience} />
        <InfoCard title="Primary keyword" value={project.primary_keyword} />
        <InfoCard title="Secondary keywords" value={project.secondary_keywords} />
        <InfoCard title="Therapist insight" value={therapistInsight} />
        <MetricCard label="Teaching points" value={(dna.teachingPoints || []).length} />
        <MetricCard label="Quote-worthy lines" value={(dna.quoteWorthyLines || []).length} />
        <MetricCard label="FAQ opportunities" value={(dna.faqs || []).length} />
        <MetricCard label="Internal links" value={(dna.internalLinkOpportunities || []).length} />
        <InfoCard title="Workbook CTA opportunities" value={workbook} />
        <InfoCard title="Therapy service CTA opportunities" value={therapy} />
      </div>
    </section>
  );
}

function WeeklyAssetsSection({ project, loading, hasAssets, onAction }: { project: Project; loading: boolean; hasAssets: boolean; onAction: (action: string, payload?: Record<string, unknown>) => Promise<any> }) {
  const assets = project.weekly_assets || {};
  const cards = assetCards(project);
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#172a3a]">Weekly Asset Output</h3>
          <p className="mt-1 text-sm leading-6 text-[#6f766f]">This turns the Claude blog into a complete weekly marketing package.</p>
        </div>
        <button className="btn-primary" onClick={() => onAction("generate-assets")} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Generate Weekly Assets
        </button>
      </div>

      {hasAssets ? (
        <>
          <div className="mt-5 rounded-3xl bg-[#172a3a] p-5 text-white">
            <p className="text-sm font-bold text-[#eadfc8]">This blog creates:</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {["1 Shopify Blog", "1 YouTube Video", "5 Short-Form Videos", "1 Instagram Carousel", "3 Pinterest Pins", "1 Email Newsletter", "2 to 3 Threads/X posts", "1 Facebook post"].map((item) => (
                <span key={item} className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold">{item}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#f3ecdf]">Estimated total: 15+ publishable assets from one Shopify blog.</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => <AssetPreviewCard key={card.title} {...card} sent={Boolean(project.content_pack_id)} />)}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-[#fffdf8] p-5 text-sm leading-6 text-[#6f766f] ring-1 ring-[#eadfc8]">
          Generate weekly assets after Content DNA is ready. The app will also create a content pack for Approval Review.
        </div>
      )}
    </section>
  );
}

function assetCards(project: Project) {
  const assets = project.weekly_assets || {};
  const shortScripts = Array.isArray(assets.shortFormVideoScripts) ? assets.shortFormVideoScripts : [];
  const cards = [
    { title: "YouTube Script", value: assets.youtubeScript, preview: assets.youtubeScript?.hook || assets.youtubeScript?.suggestedTitle },
    ...shortScripts.slice(0, 5).map((script: Record<string, unknown>, index: number) => ({
      title: `Short Video ${index + 1}`,
      value: script,
      preview: script.hook || script.onScreenText
    })),
    { title: "Instagram Carousel", value: assets.instagramCarousel, preview: assets.instagramCarousel?.carouselTitle },
    { title: "Pinterest Package", value: assets.pinterestPackage, preview: Array.isArray(assets.pinterestPackage?.pinTitles) ? assets.pinterestPackage.pinTitles[0] : "" },
    { title: "Email Newsletter", value: assets.emailNewsletter, preview: Array.isArray(assets.emailNewsletter?.subjectLineOptions) ? assets.emailNewsletter.subjectLineOptions[0] : "" },
    { title: "Threads/X Content", value: assets.threadsXContent, preview: Array.isArray(assets.threadsXContent) ? assets.threadsXContent[0]?.emotionalHook : "" },
    { title: "Facebook Post", value: assets.facebookPost, preview: assets.facebookPost?.conversationQuestion || assets.facebookPost?.post },
    { title: "Internal Links", value: assets.internalLinkingAssistant, preview: Array.isArray(assets.internalLinkingAssistant) ? assets.internalLinkingAssistant[0]?.anchorText : "" },
    { title: "CTA Recommendation", value: assets.ctaAssistant, preview: assets.ctaAssistant?.recommendedCta }
  ];
  return cards.filter((card) => card.value);
}

function AssetPreviewCard({ title, value, preview, sent }: { title: string; value: unknown; preview: unknown; sent: boolean }) {
  return (
    <article className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{sent ? "needs review" : "generated"}</p>
          <h4 className="mt-1 text-lg font-bold text-[#172a3a]">{title}</h4>
        </div>
        <span className="rounded-full bg-[#eef3ec] px-2 py-1 text-xs font-bold text-[#33533c]">{sent ? "Sent" : "Draft"}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6f766f]">{textList(preview) || "Generated asset ready to review."}</p>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-bold text-[#172a3a]">View/Edit</summary>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-6 text-[#5f665f] ring-1 ring-[#eadfc8]">{pretty(value)}</pre>
      </details>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton text={pretty(value)} label="Copy" />
        {sent ? <Link className="btn-secondary" href="/approval-review">Open Approval Review</Link> : null}
      </div>
    </article>
  );
}

function ShopifyChecklistCard({ project, checklist, onToggle }: { project: Project; checklist: Record<string, boolean>; onToggle: (key: string) => void }) {
  const items = getChecklistItems(project);
  return (
    <section className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
      <h3 className="text-xl font-bold text-[#172a3a]">Shopify Posting Checklist</h3>
      <p className="mt-1 text-sm leading-6 text-[#6f766f]">Use this before manually publishing the finished blog in Shopify.</p>
      <div className="mt-4 grid gap-2">
        {items.map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 text-sm leading-6 text-[#172a3a] ring-1 ring-[#eadfc8]">
            <input className="mt-1" type="checkbox" checked={Boolean(checklist[key])} onChange={() => onToggle(key)} />
            <span className={checklist[key] ? "line-through opacity-70" : ""}>{label}</span>
          </label>
        ))}
      </div>
      {project.content_pack_id ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="btn-primary" href="/approval-review">Review Content Pack</Link>
          <Link className="btn-secondary" href="/content-calendar"><CalendarDays size={16} />Schedule Assets</Link>
        </div>
      ) : null}
    </section>
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#172a3a]">{value}</p>
    </article>
  );
}
