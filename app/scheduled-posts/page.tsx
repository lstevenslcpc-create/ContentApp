import { ScheduledPostsClient } from "@/components/ScheduledPostsClient";

export default function ScheduledPostsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Scheduled Posts</h1>
        <p className="mt-2 text-sm text-slate-600">Use this as your ready-to-post manually queue. Auto-posting is disabled in MVP.</p>
      </div>
      <ScheduledPostsClient />
    </div>
  );
}
