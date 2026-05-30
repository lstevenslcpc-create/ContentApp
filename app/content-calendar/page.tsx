import { ContentCalendarClient } from "@/components/ContentCalendarClient";

export default function ContentCalendarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Content Calendar</h1>
        <p className="mt-2 text-sm text-slate-600">Group posts by scheduled date and keep every status visible before manual posting.</p>
      </div>
      <ContentCalendarClient />
    </div>
  );
}
