"use client";

import { BarChart3, CalendarDays, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useContentItems } from "./useContentItems";

function breakdown(items: Array<Record<string, unknown>>, key: string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] || "Unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function AnalyticsClient() {
  const { items, loading, error } = useContentItems();
  const platform = breakdown(items, "platform");
  const contentType = breakdown(items, "content_type");
  const bestType = Object.entries(contentType).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  if (loading) return <div className="rounded-xl bg-white p-6 text-slate-500">Loading analytics...</div>;
  if (error) return <div className="rounded-xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">{error}</div>;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Posts generated" value={items.length} icon={Sparkles} />
        <MetricCard label="Scheduled posts" value={items.filter((x) => x.status === "scheduled").length} icon={CalendarDays} />
        <MetricCard label="Posted posts" value={items.filter((x) => x.status === "posted").length} icon={CheckCircle2} />
        <MetricCard label="Failed posts" value={items.filter((x) => x.status === "failed").length} icon={XCircle} />
        <MetricCard label="Best content type" value={bestType} icon={BarChart3} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Platform breakdown" data={platform} />
        <Breakdown title="Content type breakdown" data={contentType} />
      </section>
    </>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-4 space-y-3">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-slate-700">{label}</span>
            <span className="font-bold text-ink">{value}</span>
          </div>
        ))}
        {!Object.keys(data).length && <p className="text-sm text-slate-500">No data yet.</p>}
      </div>
    </div>
  );
}
