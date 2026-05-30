import { BusinessProfilePageClient } from "@/components/BusinessProfilePageClient";

export default function BusinessProfilePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Business Profile</h1>
        <p className="mt-2 text-sm text-slate-600">This profile guides every caption, hook, script, visual direction, and CTA.</p>
      </div>
      <BusinessProfilePageClient />
    </div>
  );
}
