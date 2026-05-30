import { DashboardMetrics } from "@/components/DashboardMetrics";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-ink p-6 text-white shadow-premium">
        <p className="text-sm font-semibold text-blue-200">AI Content Creator OS</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Generate, review, approve, schedule, and manually post content from one premium dashboard.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">AI-generated content should be reviewed before posting. Auto-posting is disabled in MVP until approval logic and official OAuth are added.</p>
      </section>
      <DashboardMetrics />
    </div>
  );
}
