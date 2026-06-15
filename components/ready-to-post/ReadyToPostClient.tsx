"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Megaphone, Send, XCircle } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CopyButton } from "@/components/CopyButton";
import { ContentLifecycleActions } from "@/components/ContentLifecycleActions";
import type { ContentCalendarPlan, ContentPack } from "@/lib/types";

type CalendarResponse = {
  packs?: ContentPack[];
  plans?: ContentCalendarPlan[];
};

type PostingState = "posted" | "failed";

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}).` };
  }
}

function metadataString(pack: ContentPack, key: string) {
  return pack.metadata && typeof pack.metadata[key] === "string" ? String(pack.metadata[key]) : "";
}

function metadataNumber(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return typeof value === "number" ? value : 0;
}

function metadataRecord(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string> : {};
}

function metadataArray(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return Array.isArray(value) ? value : [];
}

function isPackArchived(pack: ContentPack) {
  return Boolean(pack.archived || pack.metadata?.archived);
}

function designStatus(pack: ContentPack) {
  return pack.design_status || metadataString(pack, "canvaPrepStatus") || "not_started";
}

function isDesigned(pack: ContentPack) {
  const status = designStatus(pack);
  return status === "design_started" || status === "designed_in_canva";
}

function postingStatus(pack: ContentPack) {
  return metadataString(pack, "manualPostingStatus") || pack.status;
}

function hashtagsFromCaption(caption: string) {
  return Array.from(new Set(caption.match(/#[\w-]+/g) || []));
}

function captionWithoutHashtags(caption: string) {
  return caption.replace(/#[\w-]+/g, "").replace(/\s{2,}/g, " ").trim();
}

function platformForPack(pack: ContentPack) {
  const templateType = metadataString(pack, "selectedCanvaTemplateName").toLowerCase();
  const text = [
    pack.title,
    pack.content_pillar,
    pack.pack.instagram_caption,
    pack.pack.pinterest_pin_title,
    pack.pack.tiktok_reels_script,
    templateType
  ].join(" ").toLowerCase();
  if (text.includes("pinterest")) return "Pinterest";
  if (text.includes("tiktok") || text.includes("reel")) return "TikTok/Reels";
  if (text.includes("threads")) return "Threads";
  if (text.includes("facebook")) return "Facebook";
  return "Instagram";
}

function canvaPackageForPack(pack: ContentPack, scheduledDate: string) {
  const fields = metadataRecord(pack, "canvaFillPackage");
  const caption = pack.pack.instagram_caption || "";
  return {
    contentPackId: pack.id,
    templateName: metadataString(pack, "selectedCanvaTemplateName") || null,
    templateType: metadataString(pack, "selectedCanvaTemplateType") || null,
    canvaLink: metadataString(pack, "selectedCanvaTemplateLink") || null,
    matchScore: metadataNumber(pack, "canvaTemplateMatchScore") || null,
    matchReason: metadataString(pack, "canvaTemplateMatchReason") || null,
    fields,
    slideOrder: Object.keys(fields),
    platform: platformForPack(pack),
    campaign: pack.content_pillar || pack.source_topic || pack.title,
    scheduledDate,
    caption,
    hashtags: hashtagsFromCaption(caption),
    CTA: pack.pack.product_cta || pack.pack.therapy_service_cta || ""
  };
}

function dateLabel(value: string) {
  if (!value) return "Unscheduled";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function plannedDateForPack(pack: ContentPack, plans: ContentCalendarPlan[]) {
  const plan = plans.find((item) => item.content_pack_id === pack.id);
  return plan?.planned_date || metadataString(pack, "manualPostingScheduledDate") || "";
}

function socialLinks() {
  return [
    { label: "Open Instagram", href: "https://www.instagram.com/" },
    { label: "Open Facebook", href: "https://www.facebook.com/" },
    { label: "Open Pinterest", href: "https://www.pinterest.com/" },
    { label: "Open Threads", href: "https://www.threads.net/" }
  ];
}

function checklist(pack: ContentPack, scheduledDate: string) {
  const caption = pack.pack.instagram_caption || "";
  const cta = pack.pack.product_cta || pack.pack.therapy_service_cta || "";
  return [
    { label: "Canva design completed", done: designStatus(pack) === "designed_in_canva" },
    { label: "Caption reviewed", done: Boolean(caption) },
    { label: "CTA verified", done: Boolean(cta) },
    { label: "Hashtags reviewed", done: hashtagsFromCaption(caption).length > 0 || Boolean(caption) },
    { label: "Scheduled date confirmed", done: Boolean(scheduledDate) }
  ];
}

function groupedReadyPacks(packs: ContentPack[], plans: ContentCalendarPlan[]) {
  return packs.reduce<Record<string, ContentPack[]>>((groups, pack) => {
    const scheduledDate = plannedDateForPack(pack, plans);
    const key = `${dateLabel(scheduledDate)} · ${platformForPack(pack)} · ${pack.content_pillar || "No pillar"} · ${pack.product_tie_in || pack.service_tie_in || "No CTA tie-in"}`;
    groups[key] = groups[key] || [];
    groups[key].push(pack);
    return groups;
  }, {});
}

export function ReadyToPostClient() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [plans, setPlans] = useState<ContentCalendarPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  async function loadReadyData() {
    setLoading(true);
    setMessage("");
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().slice(0, 10);
    const to = new Date(today.getFullYear(), today.getMonth() + 6, 0).toISOString().slice(0, 10);
    const response = await authedFetch(`/api/content-calendar?from=${from}&to=${to}`);
    const data = await readApiResponse(response) as CalendarResponse & { error?: string };
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to load ready-to-post items.");
      return;
    }
    setPacks(Array.isArray(data.packs) ? data.packs : []);
    setPlans(Array.isArray(data.plans) ? data.plans : []);
  }

  useEffect(() => {
    void loadReadyData();
  }, []);

  const visiblePacks = useMemo(() => packs.filter((pack) => showArchived || !isPackArchived(pack)), [packs, showArchived]);

  const readyPacks = useMemo(() => visiblePacks.filter((pack) => {
    const status = postingStatus(pack);
    return pack.status === "approved" && isDesigned(pack) && status !== "posted" && status !== "failed";
  }), [visiblePacks]);

  const historyPacks = useMemo(() => visiblePacks.filter((pack) => {
    const status = postingStatus(pack);
    return status === "posted" || status === "failed";
  }), [visiblePacks]);

  const grouped = useMemo(() => groupedReadyPacks(readyPacks, plans), [readyPacks, plans]);

  async function markPostingStatus(pack: ContentPack, status: PostingState) {
    setBusy(`${pack.id}:${status}`);
    setMessage("");
    const timestamp = new Date().toISOString();
    const history = [
      ...metadataArray(pack, "manualPostingHistory"),
      {
        status,
        at: timestamp,
        platform: platformForPack(pack),
        title: pack.title
      }
    ];
    const metadata = {
      ...(pack.metadata || {}),
      manualPostingStatus: status,
      manualPostingUpdatedAt: timestamp,
      manualPostingHistory: history,
      manualPostingScheduledDate: plannedDateForPack(pack, plans)
    };
    const response = await authedFetch(`/api/content-packs/${pack.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, metadata })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update posting status.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((item) => item.id === updated.id ? updated : item));
    setMessage(status === "posted" ? "Marked as posted and moved to Posted History." : "Marked as failed and moved to Posted History.");
  }

  async function archivePack(pack: ContentPack, archived: boolean) {
    setBusy(`${pack.id}:archive`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${pack.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update archived state.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((item) => item.id === updated.id ? updated : item));
    setMessage(archived ? "Content pack archived." : "Content pack restored.");
  }

  async function deletePack(pack: ContentPack) {
    setBusy(`${pack.id}:delete`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${pack.id}`, { method: "DELETE" });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to delete content pack.");
      return;
    }
    setPacks((current) => current.filter((item) => item.id !== pack.id));
    setMessage("Content pack deleted permanently.");
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <Megaphone size={14} />
          Ready to Post
        </p>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">Prepare approved Canva content for manual publishing.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">Use this final checkpoint before full social auto-posting exists. Copy captions, open Canva, verify the checklist, and mark the post outcome.</p>
      </section>

      {message ? <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Ready" value={readyPacks.length} />
        <Metric label="Posted" value={historyPacks.filter((pack) => postingStatus(pack) === "posted").length} />
        <Metric label="Failed" value={historyPacks.filter((pack) => postingStatus(pack) === "failed").length} />
        <Metric label="Designed" value={packs.filter(isDesigned).length} />
      </section>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm font-bold text-[#6f766f]">
          <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
          Show Archived
        </label>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-[#6f766f]"><Loader2 className="mx-auto mb-3 animate-spin" />Loading ready-to-post workflow...</div>
      ) : null}

      {!loading && readyPacks.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[#d8c28a] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[#172a3a]">No approved designed content is ready yet.</p>
          <p className="mt-2 text-sm text-[#6f766f]">Approve a content pack, send it through Canva Prep, and mark design started or designed in Canva.</p>
        </section>
      ) : null}

      <section className="space-y-5">
        {Object.entries(grouped).map(([group, groupPacks]) => (
          <div key={group} className="space-y-3">
            <h2 className="rounded-2xl bg-[#f8f5ee] px-4 py-3 text-sm font-bold text-[#77633c] ring-1 ring-[#eadfc8]">{group}</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {groupPacks.map((pack) => (
                <PostingCard key={pack.id} pack={pack} plans={plans} busy={busy.startsWith(pack.id)} onStatus={markPostingStatus} onArchive={archivePack} onDelete={deletePack} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Posted History</p>
            <h2 className="mt-1 text-2xl font-bold text-[#172a3a]">Manual posting outcomes</h2>
          </div>
          <span className="rounded-full bg-[#f8f5ee] px-3 py-1 text-xs font-bold text-[#77633c]">{historyPacks.length} items</span>
        </div>
        <div className="mt-4 grid gap-3">
          {historyPacks.length ? historyPacks.map((pack) => <HistoryCard key={pack.id} pack={pack} busy={busy.startsWith(pack.id)} onArchive={archivePack} onDelete={deletePack} />) : <p className="text-sm text-[#6f766f]">Posted and failed items will appear here after you mark them.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#172a3a]">{value}</p>
    </div>
  );
}

function PostingCard({ pack, plans, busy, onStatus, onArchive, onDelete }: {
  pack: ContentPack;
  plans: ContentCalendarPlan[];
  busy: boolean;
  onStatus: (pack: ContentPack, status: PostingState) => void;
  onArchive: (pack: ContentPack, archived: boolean) => void;
  onDelete: (pack: ContentPack) => void;
}) {
  const scheduledDate = plannedDateForPack(pack, plans);
  const caption = pack.pack.instagram_caption || "";
  const hashtags = hashtagsFromCaption(caption);
  const hashtagText = hashtags.join(" ");
  const cta = pack.pack.product_cta || pack.pack.therapy_service_cta || "";
  const canvaLink = metadataString(pack, "selectedCanvaTemplateLink");
  const canvaPackageJson = JSON.stringify(canvaPackageForPack(pack, scheduledDate), null, 2);
  const templateName = metadataString(pack, "selectedCanvaTemplateName") || "No Canva template selected";

  return (
    <article className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{platformForPack(pack)} · {pack.content_pillar || "Content pillar"}</p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-[#172a3a]">{pack.title}</h3>
          <p className="mt-2 text-sm text-[#6f766f]">{dateLabel(scheduledDate)} · {pack.product_tie_in || pack.service_tie_in || "No product/service CTA tie-in"}</p>
        </div>
        <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold uppercase text-[#4f6f5a]">{designStatus(pack).replaceAll("_", " ")}</span>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]">
        <InfoRow label="Selected Canva template" value={templateName} />
        <InfoRow label="Canva link" value={canvaLink || "No Canva link saved yet."} />
        <InfoRow label="Caption" value={caption || "No caption generated yet."} />
        <InfoRow label="Hashtags" value={hashtagText || "No hashtags found in caption."} />
        <InfoRow label="CTA" value={cta || "No CTA saved yet."} />
      </div>

      <div className="mt-4 rounded-2xl bg-[#f8f5ee] p-4 ring-1 ring-[#eadfc8]">
        <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Posting checklist</p>
        <div className="mt-3 grid gap-2">
          {checklist(pack, scheduledDate).map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-[#20313f]">
              {item.done ? <CheckCircle2 size={16} className="text-[#4f6f5a]" /> : <XCircle size={16} className="text-[#b97765]" />}
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <CopyButton text={captionWithoutHashtags(caption) || caption} label="Copy caption" />
        <CopyButton text={hashtagText} label="Copy hashtags" />
        {canvaLink ? <a className="btn-secondary" href={canvaLink} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Canva template</a> : null}
        {socialLinks().map((link) => <a key={link.href} className="btn-secondary" href={link.href} target="_blank" rel="noreferrer"><ExternalLink size={16} />{link.label}</a>)}
        <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" disabled={busy} onClick={() => onStatus(pack, "posted")}><Send size={16} />Mark posted</button>
        <button className="btn-secondary border-[#d8c28a] text-[#77633c]" disabled={busy} onClick={() => onStatus(pack, "failed")}><XCircle size={16} />Mark failed</button>
        <ContentLifecycleActions
          archived={isPackArchived(pack)}
          busy={busy}
          onArchive={() => onArchive(pack, true)}
          onRestore={() => onArchive(pack, false)}
          onDelete={() => onDelete(pack)}
        />
      </div>

      <details className="mt-4 rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#77633c]">Advanced Developer Tools</summary>
        <div className="mt-4">
          <CopyButton text={canvaPackageJson} label="Copy Canva package JSON" />
        </div>
      </details>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#20313f]">{value}</p>
    </div>
  );
}

function HistoryCard({ pack, busy, onArchive, onDelete }: {
  pack: ContentPack;
  busy: boolean;
  onArchive: (pack: ContentPack, archived: boolean) => void;
  onDelete: (pack: ContentPack) => void;
}) {
  const status = postingStatus(pack);
  const history = metadataArray(pack, "manualPostingHistory");
  const latest = history[history.length - 1] as { at?: string; platform?: string } | undefined;
  return (
    <article className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{latest?.platform || platformForPack(pack)} · {latest?.at ? new Date(latest.at).toLocaleString() : "No timestamp"}</p>
          <h3 className="mt-1 text-lg font-bold text-[#172a3a]">{pack.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${status === "posted" ? "bg-[#eef3ec] text-[#4f6f5a]" : "bg-[#fff4d8] text-[#8a6926]"}`}>{status}</span>
          <ContentLifecycleActions
            archived={isPackArchived(pack)}
            busy={busy}
            onArchive={() => onArchive(pack, true)}
            onRestore={() => onArchive(pack, false)}
            onDelete={() => onDelete(pack)}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {["views", "saves", "shares", "clicks", "notes"].map((item) => (
          <div key={item} className="rounded-xl bg-white p-3 ring-1 ring-[#eadfc8]">
            <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{item}</p>
            <p className="mt-1 text-sm text-[#6f766f]">Placeholder</p>
          </div>
        ))}
      </div>
    </article>
  );
}
