import type { ContentStatus } from "@/lib/types";

const styles: Record<ContentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-blue-100 text-blue-800",
  posted: "bg-teal-100 text-teal-800",
  failed: "bg-rose-100 text-rose-800"
};

export function StatusPill({ status }: { status: ContentStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{status.replace("_", " ")}</span>;
}
