"use client";

import Link from "next/link";
import { AlertCircle, CalendarCheck, CheckCircle2, ClipboardList, Sparkles, ThumbsUp } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useContentItems } from "./useContentItems";

export function DashboardMetrics() {
  const { items, loading, error } = useContentItems();
  const count = (status: string) => items.filter((item) => item.status === status).length;

  return (
    <>
      {error && <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Total generated" value={loading ? "..." : items.length} icon={Sparkles} />
        <MetricCard label="Needs review" value={loading ? "..." : count("needs_review")} icon={ClipboardList} />
        <MetricCard label="Approved" value={loading ? "..." : count("approved")} icon={ThumbsUp} />
        <MetricCard label="Scheduled" value={loading ? "..." : count("scheduled")} icon={CalendarCheck} />
        <MetricCard label="Posted" value={loading ? "..." : count("posted")} icon={CheckCircle2} />
        <MetricCard label="Failed" value={loading ? "..." : count("failed")} icon={AlertCircle} />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="btn-primary" href="/business-profile">Complete Business Profile</Link>
        <Link className="btn-primary" href="/content-generator">Generate Content</Link>
        <Link className="btn-primary" href="/media-generator">Generate AI Media</Link>
        <Link className="btn-primary" href="/content-calendar">View Calendar</Link>
      </section>
    </>
  );
}
