"use client";

import Link from "next/link";
import { Check, ExternalLink, Loader2, RotateCcw, Send, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/lib/apiClient";
import type { GeneratedContent } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { StatusPill } from "./StatusPill";
import { useState } from "react";
import { SaveToLibraryButton } from "./media-library/SaveToLibraryButton";
import { ContentLifecycleActions } from "./ContentLifecycleActions";

const improveActions = [
  { action: "regenerate_hook", label: "Regenerate hook only" },
  { action: "regenerate_caption", label: "Regenerate caption only" },
  { action: "regenerate_hashtags", label: "Regenerate hashtags only" },
  { action: "make_more_emotional", label: "Make more emotional" },
  { action: "make_more_clinical", label: "Make more clinical" },
  { action: "make_less_salesy", label: "Make less salesy" },
  { action: "add_real_life_examples", label: "Add real-life examples" },
  { action: "shorten_caption", label: "Shorten caption" },
  { action: "rewrite_instagram", label: "Rewrite for Instagram" },
  { action: "rewrite_tiktok", label: "Rewrite for TikTok" },
  { action: "rewrite_pinterest", label: "Rewrite for Pinterest" },
  { action: "rewrite_carousel", label: "Rewrite as carousel slide copy" }
];

export function ContentCard({ item, onUpdate, onRemove }: { item: GeneratedContent; onUpdate?: (item: GeneratedContent) => void; onRemove?: (id: string) => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const router = useRouter();

  async function setStatus(status: string) {
    setMessage("");
    const response = await authedFetch("/api/content/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: item.id, status })
    });
    const data = await response.json();
    if (response.ok) {
      window.location.reload();
    } else {
    setMessage([data.error, Array.isArray(data.issues) ? data.issues.join(" ") : ""].filter(Boolean).join(" "));
    }
  }

  async function setArchived(archived: boolean) {
    setBusyAction(archived ? "archive" : "restore");
    setMessage("");
    const response = await authedFetch(`/api/content/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived })
    });
    const data = await response.json();
    setBusyAction("");
    if (!response.ok) {
      setMessage(data.error || "Unable to update archived state.");
      return;
    }
    onUpdate?.(data.item as GeneratedContent);
  }

  async function deleteContent() {
    setBusyAction("delete");
    setMessage("");
    const response = await authedFetch(`/api/content/${item.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setBusyAction("");
    if (!response.ok) {
      setMessage(data.error || "Unable to delete this content.");
      return;
    }
    if (data.deletedRelatedContentPacks) {
      setMessage(`Content deleted. ${data.deletedRelatedContentPacks} related Approval Review pack was also removed.`);
    }
    onRemove?.(item.id);
  }

  async function sendToApprovalReview() {
    setMessage("");
    setSending(true);
    const response = await authedFetch("/api/content-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generatedContentId: item.id })
    });
    const data = await response.json();
    setSending(false);

    if (response.ok && data.pack?.id) {
      router.push("/approval-review");
      return;
    }

    setMessage([data.error || "Unable to send this content to Approval Review.", Array.isArray(data.issues) ? data.issues.join(" ") : ""].filter(Boolean).join(" "));
  }

  async function improveContent(action: string) {
    setBusyAction(action);
    setMessage("");
    const response = await authedFetch(`/api/content/${item.id}/improve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await response.json().catch(() => ({}));
    setBusyAction("");
    if (!response.ok) {
      setMessage(data.error || "Unable to improve this content.");
      return;
    }
    onUpdate?.(data.item as GeneratedContent);
    setMessage(action === "undo_last_change" ? "Last change undone." : "Content updated.");
  }

  const whyThisWorks = item.why_this_works;
  const revisionCount = Array.isArray(whyThisWorks?.revision_history) ? whyThisWorks.revision_history.length : 0;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{item.platform} · {item.content_type}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.topic && <p className="inline-flex rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold text-[#77633c]">Topic: {item.topic}</p>}
            {item.content_angle && <p className="inline-flex rounded-full bg-[#ede7f6] px-3 py-1 text-xs font-bold text-[#6f4ca0]">Angle: {item.content_angle}</p>}
          </div>
          <h3 className="mt-2 text-lg font-bold text-ink">{item.hook || "Untitled content"}</h3>
        </div>
        <StatusPill status={item.status} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.caption}</p>
      {!!item.hashtags?.length && <p className="mt-3 text-sm font-semibold text-slate-600">{item.hashtags.join(" ")}</p>}
      {item.visual_idea && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><b>Suggested visual:</b> {item.visual_idea}</p>}
      {item.script && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-950"><b>Short script:</b> {item.script}</p>}
      {whyThisWorks && (
        <details className="mt-4 rounded-xl border border-[#e7ddca] bg-[#fffaf1] p-4 text-sm text-[#24384a]">
          <summary className="cursor-pointer text-sm font-bold text-ink">Why this content works</summary>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Goal used</dt>
              <dd className="mt-1 leading-6">{whyThisWorks.goal_used}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Suggested template</dt>
              <dd className="mt-1 leading-6">{whyThisWorks.suggested_template}</dd>
            </div>
            {item.content_angle && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Selected angle</dt>
                <dd className="mt-1 leading-6">{item.content_angle}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Audience insight</dt>
              <dd className="mt-1 leading-6">{whyThisWorks.audience_insight}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Psychological angle</dt>
              <dd className="mt-1 leading-6">{whyThisWorks.psychological_angle}</dd>
            </div>
            {whyThisWorks.selected_framework && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Framework</dt>
                <dd className="mt-1 leading-6">{whyThisWorks.selected_framework}</dd>
              </div>
            )}
            {whyThisWorks.therapist_insight && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Therapist insight</dt>
                <dd className="mt-1 leading-6">{whyThisWorks.therapist_insight}</dd>
              </div>
            )}
            {whyThisWorks.real_life_example_used && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Real-life example used</dt>
                <dd className="mt-1 leading-6">{whyThisWorks.real_life_example_used}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">CTA strategy</dt>
              <dd className="mt-1 leading-6">{whyThisWorks.cta_strategy}</dd>
            </div>
            {whyThisWorks.framework_explanation && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Framework explanation</dt>
                <dd className="mt-1 leading-6">{whyThisWorks.framework_explanation}</dd>
              </div>
            )}
            {whyThisWorks.practical_application && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[#8a7143]">Practical application</dt>
                <dd className="mt-1 leading-6">{whyThisWorks.practical_application}</dd>
              </div>
            )}
          </dl>
          {whyThisWorks.lionheart_voice_check && (
            <details className="mt-4 rounded-xl border border-[#d8c28a] bg-white p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#4d3a7a]">LionHeart Voice Check</summary>
              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between rounded-xl bg-[#eee8fb] px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#6f4ca0]">Voice score</span>
                  <strong className="text-2xl text-[#4d3a7a]">{whyThisWorks.lionheart_voice_check.score}/100</strong>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#4f6f5a]">What made it sound on-brand</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[#20313f]">
                    {whyThisWorks.lionheart_voice_check.strengths.length
                      ? whyThisWorks.lionheart_voice_check.strengths.map((strength) => <li key={strength}>• {strength}</li>)
                      : <li>• The draft follows the saved LionHeart voice guidance.</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8a6926]">What could be improved</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[#20313f]">
                    {whyThisWorks.lionheart_voice_check.improvements.length
                      ? whyThisWorks.lionheart_voice_check.improvements.map((improvement) => <li key={improvement}>• {improvement}</li>)
                      : <li>• No major voice improvements flagged.</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#a94b4b]">Generic phrase warnings</p>
                  <p className="mt-2 text-sm leading-6 text-[#20313f]">
                    {whyThisWorks.lionheart_voice_check.genericPhraseWarnings.length
                      ? whyThisWorks.lionheart_voice_check.genericPhraseWarnings.join(", ")
                      : "No forbidden or overused phrases detected."}
                  </p>
                </div>
              </div>
            </details>
          )}
        </details>
      )}
      {item.media_url && (
        <a href={item.media_url} target="_blank" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          Open generated media <ExternalLink size={14} />
        </a>
      )}

      <details className="mt-5 rounded-xl border border-[#e7ddca] bg-[#fffdf8] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#172a3a]">
          <span className="inline-flex items-center gap-2"><WandSparkles size={16} />Improve content</span>
        </summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {improveActions.map((option) => (
            <button
              key={option.action}
              type="button"
              className="btn-secondary justify-center"
              disabled={Boolean(busyAction)}
              onClick={() => void improveContent(option.action)}
            >
              {busyAction === option.action ? <Loader2 className="animate-spin" size={16} /> : <WandSparkles size={16} />}
              {option.label}
            </button>
          ))}
          <button
            type="button"
            className="btn-secondary justify-center"
            disabled={Boolean(busyAction) || !revisionCount}
            onClick={() => void improveContent("undo_last_change")}
          >
            {busyAction === "undo_last_change" ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
            Undo last change
          </button>
        </div>
      </details>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={sendToApprovalReview} disabled={sending}>
          {sending ? <Check size={16} /> : <Send size={16} />}
          {sending ? "Sending..." : "Approve + Send to Review"}
        </button>
        <ContentLifecycleActions
          archived={Boolean(item.archived)}
          busy={Boolean(busyAction)}
          deleteDetail="If this generated content already has an Approval Review content pack, that pack and any calendar references to it will also be removed."
          onArchive={() => void setArchived(true)}
          onRestore={() => void setArchived(false)}
          onDelete={() => void deleteContent()}
        />
        <CopyButton text={item.caption || ""} label="Copy caption" />
        <CopyButton text={(item.hashtags || []).join(" ")} label="Copy hashtags" />
        <SaveToLibraryButton
          payload={{
            title: item.hook || "Generated caption",
            description: item.visual_idea || null,
            asset_type: item.script ? "TikTok script" : item.content_type === "carousel" ? "carousel" : "caption",
            source: "content_generator",
            platform: item.platform || null,
            content_pillar: item.content_goal || null,
            linked_content_id: item.id,
            text_content: [item.hook, item.caption, item.hashtags?.join(" "), item.script].filter(Boolean).join("\n\n"),
            tags: [item.topic, item.content_angle, item.platform, item.content_type, item.content_goal].filter(Boolean) as string[],
            status: "saved"
          }}
        />
        <Link className="btn-secondary" href={`/media-generator?contentId=${item.id}`}>Send to media generator</Link>
        <button className="btn-secondary" onClick={() => setStatus("posted")}>Mark posted</button>
      </div>
      {message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{message}</p>}

      <p className="mt-4 text-xs text-slate-500">
        Manual posting: review the caption, copy it with hashtags, create or attach the visual in Canva or the AI Media Generator, then post in the social app. Auto-posting is disabled in MVP.
      </p>
    </article>
  );
}
