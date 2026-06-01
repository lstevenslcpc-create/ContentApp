"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Edit3, ExternalLink, Loader2, Palette, RefreshCw, RotateCcw, Search, Send, Sparkles } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CopyButton } from "@/components/CopyButton";
import type { CanvaTemplate, ContentPack, ContentPackBody, ContentPackSectionKey, ContentStatus } from "@/lib/types";

const statuses: Array<ContentStatus | "all"> = ["all", "draft", "needs_review", "approved", "scheduled", "posted", "failed"];
const platforms = ["all", "Instagram", "TikTok/Reels", "Pinterest", "Threads", "Blog", "Email", "Canva"];
const campaignOptions = ["all", "teen anxiety", "burnout", "anxious attachment", "therapy education", "workbook promotion", "free lead magnet", "mental health product promo"];
const sectionOptions: Array<{ key: ContentPackSectionKey; label: string }> = [
  { key: "tiktok_reels_script", label: "TikTok/Reels script" },
  { key: "instagram_carousel_outline", label: "Carousel outline" },
  { key: "slide_by_slide_carousel_copy", label: "Carousel slides" },
  { key: "instagram_caption", label: "Instagram caption" },
  { key: "pinterest_pin_title", label: "Pinterest title" },
  { key: "pinterest_description", label: "Pinterest description" },
  { key: "threads_post", label: "Threads post" },
  { key: "blog_outline", label: "Blog outline" },
  { key: "email_newsletter_blurb", label: "Newsletter blurb" },
  { key: "canva_visual_direction", label: "Canva visual direction" },
  { key: "product_cta", label: "Product CTA" },
  { key: "therapy_service_cta", label: "Therapy service CTA" },
  { key: "safety_disclaimer", label: "Safety disclaimer" }
];

type Filters = {
  status: string;
  platform: string;
  campaign: string;
  date: string;
  cta: string;
  query: string;
};

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}).` };
  }
}

function packText(pack: ContentPack) {
  return Object.values(pack.pack || {}).join("\n").toLowerCase();
}

function platformMatches(pack: ContentPack, platform: string) {
  if (platform === "all") return true;
  const text = packText(pack);
  const needle = platform.toLowerCase();
  if (needle === "tiktok/reels") return text.includes("tiktok") || text.includes("reel");
  return text.includes(needle.toLowerCase());
}

function canvaBrief(pack: ContentPack, template?: CanvaTemplate | null) {
  const body = pack.pack || {} as ContentPackBody;
  const carouselSlides = body.slide_by_slide_carousel_copy || body.instagram_carousel_outline || "";
  const pinterest = [body.pinterest_pin_title, body.pinterest_description].filter(Boolean).join("\n\n");
  const coverText = body.tiktok_reels_script?.split(/[.\n]/)[0] || pack.title;
  const palette = "Muted navy, soft cream, sage, muted gold, clean white space.";
  const layoutNotes = "Use generous margins, high contrast readable text, minimal clutter, and wellness-editorial spacing. Keep @LHtherapy visible but subtle.";
  return {
    carouselSlides,
    pinterest,
    caption: body.instagram_caption || "",
    full: [
      `Title: ${pack.title}`,
      `Approved Canva template: ${template?.template_name || "Choose an approved LionHeart template"}`,
      template?.canva_template_link ? `Canva template link: ${template.canva_template_link}` : "",
      `Campaign: ${pack.content_pillar || "campaign focus"}`,
      `Instagram carousel slide text:\n${carouselSlides}`,
      `Pinterest pin text:\n${pinterest}`,
      `Reel/TikTok cover text:\n${coverText}`,
      `Canva design brief:\n${body.canva_visual_direction || "Create a calm LionHeart Therapy branded asset."}`,
      `Visual direction:\n${body.canva_visual_direction || ""}`,
      `Color palette:\n${template?.color_palette || palette}`,
      `Font vibe:\n${template?.font_style || "clean editorial, readable, feminine-neutral"}`,
      `Graphics:\n${template?.graphic_style || "minimal line accents, soft textures, grounded wellness imagery"}`,
      `Image direction:\n${template?.best_use_case || body.canva_visual_direction || "realistic lifestyle or notebook-style therapy visuals"}`,
      `Layout notes:\n${template?.notes || layoutNotes}`,
      `CTA placement:\n${body.product_cta || body.therapy_service_cta || "Place CTA on final slide and caption close."}`,
      "@LHtherapy placement: lower corner or final slide footer, never competing with the main message.",
      "Avoid: generic AI stock imagery, neon gradients, cluttered text, guru-style wellness language, and off-brand color palettes."
    ].join("\n\n"),
    coverText,
    palette,
    layoutNotes
  };
}

function designStatus(pack: ContentPack) {
  const metadataStatus = pack.metadata && typeof pack.metadata.canvaPrepStatus === "string" ? pack.metadata.canvaPrepStatus : "";
  return pack.design_status || metadataStatus || "not_started";
}

function metadataString(pack: ContentPack, key: string) {
  return pack.metadata && typeof pack.metadata[key] === "string" ? String(pack.metadata[key]) : "";
}

function metadataWithCanva(pack: ContentPack, status: "ready_for_canva" | "design_started" | "designed_in_canva", template?: CanvaTemplate | null) {
  return {
    ...(pack.metadata || {}),
    canvaPrepStatus: status,
    canvaBrief: canvaBrief(pack, template),
    selectedCanvaTemplateId: template?.id || metadataString(pack, "selectedCanvaTemplateId") || null,
    selectedCanvaTemplateName: template?.template_name || metadataString(pack, "selectedCanvaTemplateName") || null,
    selectedCanvaTemplateLink: template?.canva_template_link || metadataString(pack, "selectedCanvaTemplateLink") || null,
    canvaPrepUpdatedAt: new Date().toISOString()
  };
}

export function ApprovalReviewClient() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: "all", platform: "all", campaign: "all", date: "", cta: "all", query: "" });
  const [selectedId, setSelectedId] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSection, setSelectedSection] = useState<ContentPackSectionKey>("instagram_caption");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadPacks() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch("/api/content-packs");
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to load content packs.");
      return;
    }
    const nextPacks = Array.isArray(data.packs) ? data.packs as ContentPack[] : [];
    setPacks(nextPacks);
    setSelectedId((current) => current || nextPacks[0]?.id || "");
  }

  async function loadTemplates() {
    const response = await authedFetch("/api/canva-templates?status=approved");
    const data = await readApiResponse(response);
    if (response.ok) {
      const nextTemplates = Array.isArray(data.templates) ? data.templates as CanvaTemplate[] : [];
      setTemplates(nextTemplates);
      setSelectedTemplateId((current) => current || nextTemplates[0]?.id || "");
    }
  }

  useEffect(() => {
    void loadPacks();
    void loadTemplates();
  }, []);

  const filtered = useMemo(() => packs.filter((pack) => {
    const text = `${pack.title} ${pack.audience || ""} ${pack.content_pillar || ""} ${pack.product_tie_in || ""} ${pack.service_tie_in || ""} ${packText(pack)}`.toLowerCase();
    if (filters.status !== "all" && pack.status !== filters.status) return false;
    if (!platformMatches(pack, filters.platform)) return false;
    if (filters.campaign !== "all" && !text.includes(filters.campaign.toLowerCase())) return false;
    if (filters.cta !== "all") {
      if (filters.cta === "product" && !pack.product_tie_in) return false;
      if (filters.cta === "service" && !pack.service_tie_in) return false;
      if (filters.cta === "none" && (pack.product_tie_in || pack.service_tie_in)) return false;
    }
    if (filters.date && !String(pack.created_at || "").startsWith(filters.date)) return false;
    if (filters.query && !text.includes(filters.query.toLowerCase())) return false;
    return true;
  }), [filters, packs]);

  const selected = filtered.find((pack) => pack.id === selectedId) || filtered[0] || packs.find((pack) => pack.id === selectedId) || null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || (selected ? templates.find((template) => template.id === metadataString(selected, "selectedCanvaTemplateId")) : null) || null;
  const brief = selected ? canvaBrief(selected, selectedTemplate) : null;

  async function patchPack(packId: string, updates: Record<string, unknown>, success: string) {
    setBusy(`${packId}:${JSON.stringify(updates)}`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update content pack.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((pack) => pack.id === packId ? updated : pack));
    setSelectedId(packId);
    setMessage(success);
  }

  async function regenerate(packId: string, sectionKey: ContentPackSectionKey) {
    setBusy(`${packId}:regen`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to regenerate section.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((pack) => pack.id === packId ? updated : pack));
    setSelectedId(packId);
    setMessage("Section regenerated.");
  }

  async function schedule(pack: ContentPack) {
    setBusy(`${pack.id}:schedule`);
    setMessage("");
    const response = await authedFetch("/api/content-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentPackId: pack.id,
        plannedDate: scheduleDate,
        status: "approved",
        campaignLabel: pack.content_pillar || "therapy education",
        focusLabel: pack.audience || "",
        seasonalPrompt: "",
        notes: "Scheduled from Approval Review."
      })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to schedule content pack.");
      return;
    }
    await patchPack(pack.id, { status: "scheduled" }, "Content pack scheduled on the calendar.");
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <CheckCircle2 size={14} />
              Approval Review + Canva Prep
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">Approve content before it moves into design, calendar, or manual posting.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">Review every generated pack, tighten the copy, prep Canva instructions, and keep approval separate from auto-posting.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">Review queue</p>
            <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={statuses} />
          <FilterSelect label="Platform" value={filters.platform} onChange={(value) => setFilters((current) => ({ ...current, platform: value }))} options={platforms} />
          <FilterSelect label="Campaign/focus" value={filters.campaign} onChange={(value) => setFilters((current) => ({ ...current, campaign: value }))} options={campaignOptions} />
          <FilterSelect label="Product/service CTA" value={filters.cta} onChange={(value) => setFilters((current) => ({ ...current, cta: value }))} options={["all", "product", "service", "none"]} />
          <label>
            <span className="label">Date</span>
            <input className="field mt-1" type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            <span className="label">Search</span>
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input className="w-full bg-transparent text-sm outline-none" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="keyword" />
            </span>
          </label>
        </div>
      </section>

      {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-[#6f766f]"><Loader2 className="mx-auto mb-3 animate-spin" />Loading approval queue...</div>
          ) : filtered.length ? filtered.map((pack) => (
            <PackReviewCard
              key={pack.id}
              pack={pack}
              selected={selected?.id === pack.id}
              busy={busy.startsWith(pack.id)}
              onSelect={() => setSelectedId(pack.id)}
              onApprove={() => patchPack(pack.id, { status: "approved" }, "Content pack approved.")}
              onDraft={() => patchPack(pack.id, { status: "draft" }, "Content pack sent back to draft.")}
              onNeedsReview={() => patchPack(pack.id, { status: "needs_review" }, "Content pack marked needs review.")}
              onCanva={() => patchPack(pack.id, { metadata: metadataWithCanva(pack, "ready_for_canva", selectedTemplate) }, "Content pack sent to Canva Prep.")}
              onDesignStarted={() => patchPack(pack.id, { metadata: metadataWithCanva(pack, "design_started", selectedTemplate) }, "Design marked started.")}
              onDesigned={() => patchPack(pack.id, { metadata: metadataWithCanva(pack, "designed_in_canva", selectedTemplate) }, "Marked as designed in Canva.")}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              onSchedule={() => schedule(pack)}
            />
          )) : (
            <div className="rounded-3xl border border-dashed border-[#d8c28a] bg-white p-8 text-center">
              <p className="text-lg font-bold text-[#172a3a]">No content packs match these filters.</p>
              <p className="mt-2 text-sm text-[#6f766f]">Create a Content Pack from Content Intelligence, then review it here before Canva or scheduling.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {selected && brief ? (
            <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]"><Palette size={14} /> Canva Prep</p>
                  <h2 className="mt-3 text-xl font-bold leading-tight text-[#172a3a]">{selected.title}</h2>
                </div>
                <StatusBadge status={designStatus(selected)} />
              </div>

              <div className="mt-4 grid gap-2">
                <label>
                  <span className="label">Choose approved Canva template</span>
                  <select className="field mt-1" value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}>
                    <option value="">No approved template selected</option>
                    {templates.map((template) => <option key={template.id} value={template.id}>{template.template_name} · {template.format_type}</option>)}
                  </select>
                </label>
                {selectedTemplate?.canva_template_link && <a className="btn-secondary" href={selectedTemplate.canva_template_link} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Canva Template</a>}
                <CopyButton text={brief.full} label="Copy Full Canva Brief" />
                <CopyButton text={brief.full} label="Copy Canva Prompt" />
                <CopyButton text={brief.carouselSlides} label="Copy Carousel Slides" />
                <CopyButton text={brief.pinterest} label="Copy Pinterest Details" />
                <CopyButton text={brief.caption} label="Copy Caption" />
              </div>

              <PrepBlock title="Instagram carousel slide text" value={brief.carouselSlides} />
              <PrepBlock title="Pinterest pin text" value={brief.pinterest} />
              <PrepBlock title="Reel/TikTok cover text" value={brief.coverText} />
              <PrepBlock title="Canva design brief" value={selected.pack.canva_visual_direction || "Create a calm LionHeart Therapy branded visual."} />
              <PrepBlock title="Color palette" value={brief.palette} />
              <PrepBlock title="Approved template" value={selectedTemplate ? `${selectedTemplate.template_name}\n${selectedTemplate.format_type}\n${selectedTemplate.canva_template_link}` : "Choose an approved Canva template from the library."} />
              <PrepBlock title="Layout notes" value={brief.layoutNotes} />
              <PrepBlock title="CTA placement" value={selected.pack.product_cta || selected.pack.therapy_service_cta || "Final slide and caption close."} />
              <PrepBlock title="@LHtherapy placement" value="Lower corner or final slide footer, visible but subtle." />

              <div className="mt-5 grid gap-2">
                <label>
                  <span className="label">Regenerate section</span>
                  <select className="field mt-1" value={selectedSection} onChange={(event) => setSelectedSection(event.target.value as ContentPackSectionKey)}>
                    {sectionOptions.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}
                  </select>
                </label>
                <button className="btn-secondary" onClick={() => regenerate(selected.id, selectedSection)} disabled={busy.startsWith(selected.id)}>
                  {busy.startsWith(selected.id) ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Regenerate Section
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field mt-1 capitalize" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}

function PackReviewCard({ pack, selected, busy, onSelect, onApprove, onDraft, onNeedsReview, onCanva, onDesignStarted, onDesigned, scheduleDate, setScheduleDate, onSchedule }: {
  pack: ContentPack;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDraft: () => void;
  onNeedsReview: () => void;
  onCanva: () => void;
  onDesignStarted: () => void;
  onDesigned: () => void;
  scheduleDate: string;
  setScheduleDate: (value: string) => void;
  onSchedule: () => void;
}) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${selected ? "border-[#b89b5e] ring-4 ring-[#eadfc8]" : "border-[#e9dfcf]"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <button className="text-left" onClick={onSelect}>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={pack.status} />
            <StatusBadge status={designStatus(pack)} />
            {pack.content_pillar && <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{pack.content_pillar}</span>}
          </div>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-[#172a3a]">{pack.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6f766f]">{pack.audience || "LionHeart audience"} · {[pack.product_tie_in, pack.service_tie_in].filter(Boolean).join(" · ") || "CTA review needed"}</p>
        </button>
        <Link className="btn-secondary shrink-0" href={`/content-packs/${pack.id}`}><Edit3 size={16} />Edit Content</Link>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={onApprove} disabled={busy}><CheckCircle2 size={16} />Approve</button>
        <button className="btn-secondary" onClick={onDraft} disabled={busy}><RotateCcw size={16} />Send to Draft</button>
        <button className="btn-secondary" onClick={onNeedsReview} disabled={busy}><Sparkles size={16} />Needs Review</button>
        <button className="btn-secondary" onClick={onCanva} disabled={busy}><Send size={16} />Send to Canva Prep</button>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8] lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label>
          <span className="label">Schedule on calendar</span>
          <input className="field mt-1" type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
        </label>
        <button className="btn-secondary" onClick={onSchedule} disabled={busy}><CalendarPlus size={16} />Schedule</button>
        <button className="btn-secondary" onClick={onDesignStarted} disabled={busy}><Palette size={16} />Mark Design Started</button>
        <button className="btn-secondary border-[#d8c28a] text-[#77633c]" onClick={onDesigned} disabled={busy}><Palette size={16} />Mark Designed</button>
      </div>
    </article>
  );
}

function PrepBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#20313f]">{value || "Not provided yet."}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#f7f1e6] text-[#77633c]",
    needs_review: "bg-[#fff4d8] text-[#8a6926]",
    approved: "bg-[#eef3ec] text-[#4f6f5a]",
    scheduled: "bg-blue-50 text-blue-700",
    posted: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
    not_started: "bg-slate-100 text-slate-600",
    ready_for_canva: "bg-[#eee8fb] text-[#4d3a7a]",
    design_started: "bg-[#fff4d8] text-[#8a6926]",
    designed_in_canva: "bg-[#eef3ec] text-[#4f6f5a]"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status] || styles.draft}`}>{status.replaceAll("_", " ")}</span>;
}
