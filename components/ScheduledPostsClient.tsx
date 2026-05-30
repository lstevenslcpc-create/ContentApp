"use client";

import { CopyButton } from "./CopyButton";
import { StatusPill } from "./StatusPill";
import { useContentItems } from "./useContentItems";
import ClientStatusButtons from "@/app/scheduled-posts/status-buttons";

export function ScheduledPostsClient() {
  const { items, loading, error } = useContentItems();
  const scheduled = items.filter((item) => item.status === "scheduled");

  if (loading) return <div className="rounded-xl bg-white p-6 text-slate-500">Loading scheduled posts...</div>;
  if (error) return <div className="rounded-xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">{error}</div>;
  if (!scheduled.length) return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No scheduled posts yet.</div>;

  return (
    <div className="grid gap-4">
      {scheduled.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-ink">{item.hook}</h2><StatusPill status={item.status} /></div>
          <p className="mt-2 text-sm text-slate-500">Scheduled for {item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : "not set"}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{item.caption}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={item.caption || ""} label="Copy caption" />
            <CopyButton text={(item.hashtags || []).join(" ")} label="Copy hashtags" />
            <ClientStatusButtons id={item.id} />
          </div>
          <p className="mt-4 text-xs text-slate-500">Manual posting: copy the caption and hashtags, attach the approved visual, publish in the native platform, then mark posted here.</p>
        </article>
      ))}
    </div>
  );
}
