"use client";

import { ContentCard } from "./ContentCard";
import { ScheduleControl } from "./ScheduleControl";
import { useContentItems } from "./useContentItems";

export function ContentCalendarClient() {
  const { items, loading, error } = useContentItems();
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString() : `Unscheduled - ${item.status}`;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  if (loading) return <div className="rounded-xl bg-white p-6 text-slate-500">Loading your content...</div>;
  if (error) return <div className="rounded-xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">{error}</div>;
  if (!items.length) return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No generated content yet.</div>;

  return (
    <>
      {Object.entries(grouped).map(([date, posts]) => (
        <section key={date} className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{date}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {posts.map((item) => (
              <div key={item.id}>
                <ContentCard item={item} />
                {["approved", "needs_review"].includes(item.status) && <ScheduleControl contentId={item.id} />}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
