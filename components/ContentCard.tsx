"use client";

import Link from "next/link";
import { Check, ExternalLink, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/lib/apiClient";
import type { GeneratedContent } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { StatusPill } from "./StatusPill";
import { useState } from "react";
import { SaveToLibraryButton } from "./media-library/SaveToLibraryButton";

export function ContentCard({ item }: { item: GeneratedContent }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
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

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{item.platform} · {item.content_type}</p>
          {item.topic && <p className="mt-2 inline-flex rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold text-[#77633c]">Topic: {item.topic}</p>}
          <h3 className="mt-2 text-lg font-bold text-ink">{item.hook || "Untitled content"}</h3>
        </div>
        <StatusPill status={item.status} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.caption}</p>
      {!!item.hashtags?.length && <p className="mt-3 text-sm font-semibold text-slate-600">{item.hashtags.join(" ")}</p>}
      {item.visual_idea && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><b>Suggested visual:</b> {item.visual_idea}</p>}
      {item.script && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-950"><b>Short script:</b> {item.script}</p>}
      {item.media_url && (
        <a href={item.media_url} target="_blank" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          Open generated media <ExternalLink size={14} />
        </a>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={sendToApprovalReview} disabled={sending}>
          {sending ? <Check size={16} /> : <Send size={16} />}
          {sending ? "Sending..." : "Approve + Send to Review"}
        </button>
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
            tags: [item.topic, item.platform, item.content_type, item.content_goal].filter(Boolean) as string[],
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
