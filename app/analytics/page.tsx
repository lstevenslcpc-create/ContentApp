import { AnalyticsClient } from "@/components/AnalyticsClient";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">MVP analytics use generated content status data until social platform metrics are connected.</p>
      </div>
      <AnalyticsClient />
    </div>
  );
}
