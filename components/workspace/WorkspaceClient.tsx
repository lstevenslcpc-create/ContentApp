"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  ClipboardList,
  Edit3,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Megaphone,
  PackagePlus,
  PenLine,
  RefreshCw,
  Sparkles,
  Wand2
} from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import type { ContentCalendarPlan, ContentOpportunity, ContentPack, MediaLibraryAsset } from "@/lib/types";
import { WorkflowStatusBar } from "@/components/WorkflowStatusBar";

type GoldStandardSummary = {
  id: string;
  title: string;
  topic?: string | null;
  platform?: string | null;
  content_type?: string | null;
  created_at?: string;
};

type WorkspaceSummary = {
  ok: boolean;
  counts: {
    totalPacks: number;
    needsReview: number;
    canvaNeeded: number;
    scheduledThisWeek: number;
    readyToPost: number;
    mediaAwaitingApproval: number;
  };
  today: {
    needsReview: ContentPack[];
    canvaNeeded: ContentPack[];
    scheduledThisWeek: ContentCalendarPlan[];
    readyToPost: ContentPack[];
    mediaAwaitingApproval: MediaLibraryAsset[];
    recentGoldStandards: GoldStandardSummary[];
  };
  warnings?: string[];
  error?: string;
};

type CreatedPack = {
  id: string;
  title: string;
};

type CampaignIdea = {
  id: string;
  topic: string;
  platform: string;
  outputType: string;
  postingDay: string;
  cta: string;
  mediaAsset: string;
  template: string;
  selected: boolean;
};

const quickStarts = [
  { label: "Start With an Idea", icon: PenLine, action: "idea" },
  { label: "Generate My Week", icon: CalendarDays, action: "campaign" },
  { label: "Product/Service Campaign", icon: PackagePlus, action: "campaign" },
  { label: "Create Advertisement", icon: Megaphone, href: "/content-generator" },
  { label: "Create Quote Post", icon: Edit3, href: "/content-generator" },
  { label: "Create Product Promo", icon: PackagePlus, href: "/content-generator" },
  { label: "Create Service Promo", icon: ClipboardList, href: "/content-generator" },
  { label: "Create Pinterest Pin", icon: LayoutTemplate, href: "/content-generator" },
  { label: "Create Reel/TikTok Script", icon: Clapperboard, href: "/content-generator" },
  { label: "Create Facebook Post", icon: Megaphone, href: "/content-generator" },
  { label: "Create Instagram Carousel", icon: LayoutTemplate, href: "/content-generator" }
];

const contentGoals = [
  "engagement",
  "saves",
  "product sales",
  "service promotion",
  "email list growth",
  "local SEO",
  "awareness",
  "nurture existing audience"
];

const contentMissions = [
  "Grow Instagram",
  "Sell Teen Workbook",
  "Sell Anxiety Workbook",
  "Promote therapy services",
  "Promote EMDR",
  "Promote teen therapy",
  "Promote parenting teen girls content",
  "Build email list",
  "Drive Pinterest traffic",
  "Build therapist authority",
  "Launch a new product/service"
];

const platforms = ["Instagram", "Facebook", "Threads", "TikTok/Reels", "Pinterest", "Blog", "Email"];
const outputTypes = ["post", "carousel", "thread", "script", "ad", "quote post", "product promo", "service promo"];

function goalToCta(goal: string, mission: string) {
  if (goal.includes("product") || mission.toLowerCase().includes("workbook")) return "Invite the audience to view the matching LionHeart workbook or product with a warm, benefit-led CTA.";
  if (goal.includes("service") || mission.toLowerCase().includes("therapy") || mission.toLowerCase().includes("emdr")) return "Invite the audience to explore therapy support without pressure or overpromising.";
  if (goal.includes("email")) return "Invite the audience to join the LionHeart Therapy email list for grounded mental health tools.";
  if (goal.includes("saves")) return "Ask the audience to save the post for the moment they need language for this pattern.";
  if (goal.includes("engagement")) return "Invite a thoughtful comment that helps the audience name the pattern in real life.";
  return "Invite the audience to follow @LHtherapy for emotionally honest mental health content.";
}

function inferTieIns(mission: string) {
  const lower = mission.toLowerCase();
  return {
    product: lower.includes("workbook") || lower.includes("product") ? mission : null,
    service: lower.includes("therapy") || lower.includes("emdr") ? mission : null
  };
}

function buildOpportunity({
  idea,
  goal,
  mission,
  selectedPlatforms,
  outputType
}: {
  idea: string;
  goal: string;
  mission: string;
  selectedPlatforms: string[];
  outputType: string;
}): ContentOpportunity {
  const tieIns = inferTieIns(mission);
  const platformList = selectedPlatforms.length ? selectedPlatforms : ["Instagram"];
  return {
    topic: idea.trim(),
    explanation: `Create a ${outputType} that turns this idea into a therapist-led LionHeart content pack.`,
    strongest_emotional_hook: `A real-life recognition moment about ${idea.trim()}`,
    curiosity_angle: `What people often misunderstand about ${idea.trim()}`,
    save_worthy_angle: `A practical way to notice or respond to ${idea.trim()}`,
    share_worthy_angle: `Send this to someone who needs better language for ${idea.trim()}`,
    comment_bait_potential: "Invite the audience to name the moment this pattern shows up.",
    emotional_trigger_category: "identity recognition",
    audience: "LionHeart Therapy audience",
    content_pillar: mission || goal,
    platform_recommendations: platformList,
    seo_keywords: [idea.trim(), goal, mission].filter(Boolean),
    emotional_angle: `Make ${idea.trim()} feel specific, human, and clinically grounded.`,
    visual_direction: outputType.includes("carousel")
      ? "Use an approved Canva carousel template with calm navy, cream, sage, and readable slide copy."
      : "Use calm LionHeart visuals with emotionally specific text overlay and simple composition.",
    product_tie_in: tieIns.product,
    service_tie_in: tieIns.service,
    cta: goalToCta(goal, mission),
    clinical_sensitivity: "medium",
    status: "idea"
  };
}

function SectionHeader({ title, description, href }: { title: string; description: string; href?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-[#172a3a]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#6f766f]">{description}</p>
      </div>
      {href && (
        <Link href={href} className="btn-secondary">
          Open
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8cbb8] bg-white/60 p-5 text-sm leading-6 text-[#6f766f]">
      {children}
    </div>
  );
}

function PackMiniCard({ pack }: { pack: ContentPack }) {
  return (
    <article className="rounded-2xl border border-[#eadfc8] bg-white/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#8a7448]">{pack.status.replace("_", " ")}</p>
          <h3 className="mt-1 text-base font-bold leading-6 text-[#172a3a]">{pack.title}</h3>
        </div>
        <Link href={`/content-packs/${pack.id}`} className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold text-[#77633c]">
          Open
        </Link>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6f766f]">{pack.source_topic || pack.content_pillar || "Content Pack"}</p>
      <div className="mt-4">
        <WorkflowStatusBar pack={pack} compact />
      </div>
    </article>
  );
}

function PlanMiniCard({ plan }: { plan: ContentCalendarPlan }) {
  return (
    <article className="rounded-2xl border border-[#eadfc8] bg-white/90 p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#8a7448]">{plan.planned_date}</p>
      <h3 className="mt-1 text-base font-bold text-[#172a3a]">{plan.content_pack?.title || "Scheduled Content Pack"}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6f766f]">{plan.campaign_label || plan.focus_label || plan.status}</p>
      <Link href="/content-calendar" className="mt-4 inline-flex text-sm font-bold text-[#4f6f5a]">
        View Calendar
      </Link>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function WorkspaceClient() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [mode, setMode] = useState<"idea" | "campaign">("idea");
  const [idea, setIdea] = useState("");
  const [goal, setGoal] = useState("engagement");
  const [mission, setMission] = useState("Grow Instagram");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Instagram"]);
  const [outputType, setOutputType] = useState("carousel");
  const [creating, setCreating] = useState(false);
  const [createdPack, setCreatedPack] = useState<CreatedPack | null>(null);
  const [message, setMessage] = useState("");
  const [campaignOffer, setCampaignOffer] = useState("Teen Anxiety Workbook");
  const [campaignGoal, setCampaignGoal] = useState("product sales");
  const [campaignIdeas, setCampaignIdeas] = useState<CampaignIdea[]>([]);

  async function loadSummary() {
    setLoadingSummary(true);
    const response = await authedFetch("/api/workspace/summary");
    const data = await response.json();
    setSummary(data);
    setLoadingSummary(false);
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const currentPlatforms = useMemo(() => selectedPlatforms.length ? selectedPlatforms : ["Instagram"], [selectedPlatforms]);

  function togglePlatform(platform: string) {
    setSelectedPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  async function createIdeaPack() {
    if (!idea.trim()) {
      setMessage("Add one clear idea first.");
      return;
    }

    setCreating(true);
    setMessage("");
    setCreatedPack(null);

    const response = await authedFetch("/api/content-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity: buildOpportunity({ idea, goal, mission, selectedPlatforms: currentPlatforms, outputType })
      })
    });
    const data = await response.json();
    setCreating(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error || "Unable to create content pack.");
      return;
    }

    setCreatedPack({ id: data.pack.id, title: data.pack.title });
    setMessage("Content Pack created.");
    loadSummary();
  }

  function buildCampaignIdeas() {
    const chosenPlatforms = currentPlatforms;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const themes = [
      "recognition post",
      "therapist education",
      "real-life example",
      "myth correction",
      "soft CTA",
      "save-worthy checklist",
      "story-driven reminder"
    ];

    const ideas = themes.map((theme, index) => ({
      id: `${theme}-${index}`,
      topic: `${campaignOffer}: ${theme}`,
      platform: chosenPlatforms[index % chosenPlatforms.length],
      outputType: index % 2 === 0 ? "carousel" : "post",
      postingDay: days[index],
      cta: goalToCta(campaignGoal, campaignOffer),
      mediaAsset: index % 2 === 0 ? "Canva carousel and Pinterest-friendly cover" : "Simple text graphic or therapist POV visual",
      template: index % 2 === 0 ? "Emotional Hook Carousel" : "Pinterest Infographic Pin",
      selected: index < 5
    }));
    setCampaignIdeas(ideas);
    setMode("campaign");
  }

  function updateCampaignIdea(id: string, patch: Partial<CampaignIdea>) {
    setCampaignIdeas((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function createSelectedCampaignPacks() {
    const selected = campaignIdeas.filter((item) => item.selected);
    if (!selected.length) {
      setMessage("Select at least one campaign idea to create.");
      return;
    }

    setCreating(true);
    setMessage("");
    const created: CreatedPack[] = [];

    for (const campaignIdea of selected) {
      const opportunity = buildOpportunity({
        idea: campaignIdea.topic,
        goal: campaignGoal,
        mission: campaignOffer,
        selectedPlatforms: [campaignIdea.platform],
        outputType: campaignIdea.outputType
      });
      opportunity.visual_direction = `${campaignIdea.template}. Suggested asset: ${campaignIdea.mediaAsset}.`;
      opportunity.cta = campaignIdea.cta;

      const response = await authedFetch("/api/content-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity })
      });
      const data = await response.json();
      if (response.ok && data.ok && data.pack?.id) {
        created.push({ id: data.pack.id, title: data.pack.title });
      } else {
        setMessage(data.error || "One campaign content pack could not be created.");
        break;
      }
    }

    setCreating(false);
    if (created.length) {
      setCreatedPack(created[0]);
      setMessage(`${created.length} Content Pack${created.length === 1 ? "" : "s"} created.`);
      loadSummary();
    }
  }

  return (
    <div className="space-y-8 text-[#20313f]">
      <section className="overflow-hidden rounded-[2rem] bg-[#172a3a] text-white shadow-premium">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Sparkles size={14} />
              Daily Workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Create, review, design, schedule, and post from one calm place.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f3ecdf]">
              This is the daily home for AI Content Creator OS. Start with a single idea, turn it into a Content Pack, prepare Canva copy, schedule it, then move it to Ready to Post.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary bg-[#c9b7ee] text-[#2f2550] hover:bg-[#bba5e8]" onClick={() => setMode("idea")}>
                Start With an Idea
                <ArrowRight size={16} />
              </button>
              <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={buildCampaignIdeas}>
                Generate Campaign Ideas
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Needs Review", summary?.counts.needsReview || 0, "/approval-review"],
              ["Canva Needed", summary?.counts.canvaNeeded || 0, "/approval-review"],
              ["Scheduled This Week", summary?.counts.scheduledThisWeek || 0, "/content-calendar"],
              ["Ready to Post", summary?.counts.readyToPost || 0, "/ready-to-post"]
            ].map(([label, count, href]) => (
              <Link key={label} href={String(href)} className="rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:bg-white/15">
                <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">{label}</p>
                <p className="mt-3 text-4xl font-bold">{count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {summary?.warnings?.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
          {summary.warnings.join(" ")}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
        <SectionHeader title="Quick Start" description="Choose the fastest path for what you want to make today." />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickStarts.map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="flex h-full items-center gap-3 rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 text-left font-bold text-[#172a3a] transition hover:border-[#c9b7ee] hover:bg-[#fbf8ff]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
                  <Icon size={18} />
                </span>
                {item.label}
              </span>
            );
            if ("href" in item && item.href) return <Link key={item.label} href={item.href}>{content}</Link>;
            return (
              <button key={item.label} className="text-left" onClick={() => item.action === "campaign" ? buildCampaignIdeas() : setMode("idea")}>
                {content}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[440px_1fr]">
        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          <div className="mb-5 flex rounded-2xl bg-[#f7f1e6] p-1">
            <button className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold ${mode === "idea" ? "bg-white text-[#172a3a] shadow-sm" : "text-[#7b7468]"}`} onClick={() => setMode("idea")}>
              Start With an Idea
            </button>
            <button className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold ${mode === "campaign" ? "bg-white text-[#172a3a] shadow-sm" : "text-[#7b7468]"}`} onClick={() => setMode("campaign")}>
              Campaign Starter
            </button>
          </div>

          {mode === "idea" ? (
            <div className="space-y-4">
              <Field label="Idea">
                <textarea className="field mt-1 min-h-28" value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Example: anxious attachment after a delayed text" />
              </Field>
              <Field label="Content Mission">
                <select className="field mt-1" value={mission} onChange={(event) => setMission(event.target.value)}>
                  {contentMissions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Goal">
                <select className="field mt-1" value={goal} onChange={(event) => setGoal(event.target.value)}>
                  {contentGoals.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <div>
                <p className="label">Platforms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      className={`rounded-full px-3 py-2 text-xs font-bold ${selectedPlatforms.includes(platform) ? "bg-[#172a3a] text-white" : "bg-[#f7f1e6] text-[#77633c]"}`}
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Output Type">
                <select className="field mt-1" value={outputType} onChange={(event) => setOutputType(event.target.value)}>
                  {outputTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <button className="btn-primary w-full justify-center" onClick={createIdeaPack} disabled={creating}>
                {creating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                Create Content Pack
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Product, service, or offer">
                <input className="field mt-1" value={campaignOffer} onChange={(event) => setCampaignOffer(event.target.value)} />
              </Field>
              <Field label="Campaign Goal">
                <select className="field mt-1" value={campaignGoal} onChange={(event) => setCampaignGoal(event.target.value)}>
                  {contentGoals.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <div>
                <p className="label">Platforms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      className={`rounded-full px-3 py-2 text-xs font-bold ${selectedPlatforms.includes(platform) ? "bg-[#172a3a] text-white" : "bg-[#f7f1e6] text-[#77633c]"}`}
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-secondary w-full justify-center" onClick={buildCampaignIdeas}>
                Refresh Campaign Ideas
                <RefreshCw size={16} />
              </button>
              <button className="btn-primary w-full justify-center" onClick={createSelectedCampaignPacks} disabled={creating || !campaignIdeas.length}>
                {creating ? <Loader2 className="animate-spin" size={16} /> : <PackagePlus size={16} />}
                Create Selected Content Packs
              </button>
            </div>
          )}

          {message ? (
            <div className="mt-5 rounded-2xl border border-[#d8cbb8] bg-[#fffdf8] p-4 text-sm font-semibold leading-6 text-[#172a3a]">
              {message}
              {createdPack ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/content-packs/${createdPack.id}`} className="btn-secondary">Open Content Pack</Link>
                  <Link href="/approval-review" className="btn-secondary">Open in Approval Review</Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          {mode === "campaign" ? (
            <div>
              <SectionHeader title="Product/Service Campaign Ideas" description="Select the ideas you want to turn into real Content Packs." />
              {!campaignIdeas.length ? (
                <EmptyCard>Generate campaign ideas to see a manageable 3 to 7 item plan before creating anything.</EmptyCard>
              ) : (
                <div className="mt-5 grid gap-3">
                  {campaignIdeas.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <label className="flex items-center gap-3 text-sm font-bold text-[#172a3a]">
                          <input type="checkbox" checked={item.selected} onChange={(event) => updateCampaignIdea(item.id, { selected: event.target.checked })} />
                          {item.topic}
                        </label>
                        <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{item.postingDay}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm leading-6 text-[#6f766f] md:grid-cols-2">
                        <p><strong>Platform:</strong> {item.platform}</p>
                        <p><strong>Output:</strong> {item.outputType}</p>
                        <p><strong>Canva:</strong> {item.template}</p>
                        <p><strong>Media:</strong> {item.mediaAsset}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#6f766f]">{item.cta}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <SectionHeader title="Today’s Content" description="A quick view of the production work already moving through your workflow." href="/approval-review" />
              {loadingSummary ? (
                <div className="mt-5 rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-6 text-sm font-semibold text-[#6f766f]">Loading workspace...</div>
              ) : (
                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {(summary?.today.needsReview || []).slice(0, 4).map((pack) => <PackMiniCard key={pack.id} pack={pack} />)}
                  {!summary?.today.needsReview?.length ? <EmptyCard>No review items are waiting. Generate a Content Pack when you are ready.</EmptyCard> : null}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          <SectionHeader title="Canva/Design Needed" description="Approved or draft packs that still need Canva copy or design work." href="/approval-review" />
          <div className="mt-5 grid gap-4">
            {(summary?.today.canvaNeeded || []).slice(0, 3).map((pack) => <PackMiniCard key={pack.id} pack={pack} />)}
            {!summary?.today.canvaNeeded?.length ? <EmptyCard>No Canva prep is waiting right now.</EmptyCard> : null}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          <SectionHeader title="Scheduled This Week" description="Content Packs assigned to this week’s calendar." href="/content-calendar" />
          <div className="mt-5 grid gap-4">
            {(summary?.today.scheduledThisWeek || []).slice(0, 4).map((plan) => <PlanMiniCard key={plan.id} plan={plan} />)}
            {!summary?.today.scheduledThisWeek?.length ? <EmptyCard>Scheduled Content Packs appear here after you assign dates on the calendar.</EmptyCard> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          <SectionHeader title="Ready to Post" description="Designed, scheduled, unposted content that is ready for manual publishing." href="/ready-to-post" />
          <div className="mt-5 grid gap-4">
            {(summary?.today.readyToPost || []).slice(0, 3).map((pack) => <PackMiniCard key={pack.id} pack={pack} />)}
            {!summary?.today.readyToPost?.length ? <EmptyCard>Posts appear here after they are approved, designed in Canva, scheduled, and not yet posted.</EmptyCard> : null}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
          <SectionHeader title="Voice and Creative Tools" description="Shortcut into the libraries that keep LionHeart content distinct." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/brand-brain" className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 font-bold text-[#172a3a]">Brand Brain</Link>
            <Link href="/gold-standard-library" className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 font-bold text-[#172a3a]">Gold Standards</Link>
            <Link href="/story-frameworks" className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 font-bold text-[#172a3a]">Story Frameworks</Link>
            <Link href="/canva-templates" className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 font-bold text-[#172a3a]">Canva Templates</Link>
          </div>
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#77633c]">
              <BookOpenCheck size={16} />
              Recent Gold Standards
            </h3>
            <div className="mt-3 grid gap-3">
              {(summary?.today.recentGoldStandards || []).map((item) => (
                <Link key={item.id} href="/gold-standard-library" className="rounded-xl bg-[#f7f1e6] p-3 text-sm font-semibold text-[#172a3a]">
                  {item.title}
                  <span className="mt-1 block text-xs font-medium text-[#6f766f]">{[item.topic, item.platform, item.content_type].filter(Boolean).join(" · ")}</span>
                </Link>
              ))}
              {!summary?.today.recentGoldStandards?.length ? <EmptyCard>Gold Standard examples will appear here after you add or import them.</EmptyCard> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#172a3a]">Creative Studio and Media</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">Create visual assets, save them to the Media Library, then use them during review and posting.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/media-generator" className="btn-primary">
              Open Creative Studio
              <ImageIcon size={16} />
            </Link>
            <Link href="/media-library" className="btn-secondary">Media Library</Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {(summary?.today.mediaAwaitingApproval || []).slice(0, 6).map((asset) => (
            <article key={asset.id} className="rounded-2xl border border-[#eadfc8] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8a7448]">{asset.asset_type}</p>
              <h3 className="mt-1 line-clamp-2 font-bold text-[#172a3a]">{asset.title || "Untitled asset"}</h3>
              <p className="mt-2 text-sm text-[#6f766f]">{asset.source || "media library"} · {asset.status}</p>
            </article>
          ))}
          {!summary?.today.mediaAwaitingApproval?.length ? <EmptyCard>Saved AI images, videos, Canva directions, and post assets will appear here.</EmptyCard> : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#eadfc8] bg-white/90 p-5 shadow-sm lg:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#172a3a]">Manual posting safety</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">
              Auto-posting is still disabled. This workspace prepares content, Canva copy, scheduling plans, and manual posting checklists so every post stays reviewed before it goes live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
