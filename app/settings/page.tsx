import { CheckCircle2, XCircle } from "lucide-react";
import { getSupabaseSetupError } from "@/lib/supabaseAdmin";

const envChecks = [
  ["MEDIA_PROVIDER", "Current media provider"],
  ["FAL_KEY", "fal.ai API key"],
  ["FAL_IMAGE_MODEL", "fal image model"],
  ["FAL_VIDEO_MODEL", "fal video model"],
  ["OPENAI_API_KEY", "OpenAI API key"],
  ["SUPABASE_URL", "Supabase URL"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Supabase service role key"],
  ["SUPABASE_ANON_KEY", "Supabase anon key"],
  ["NEXT_PUBLIC_SUPABASE_URL", "Browser Supabase URL"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Browser Supabase anon key"],
  ["CANVA_CLIENT_ID", "Canva client ID"],
  ["CANVA_CLIENT_SECRET", "Canva client secret"]
];

export default function SettingsPage() {
  const provider = process.env.MEDIA_PROVIDER || "fal";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Current media provider: <b>{provider}</b></p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Setup checklist</h2>
        <div className="mt-4 grid gap-2">
          {envChecks.map(([key, label]) => {
            const present = Boolean(process.env[key]);
            return (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className={`inline-flex items-center gap-2 font-bold ${present ? "text-emerald-700" : "text-rose-700"}`}>
                  {present ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {present ? "Configured" : "Missing"}
                </span>
              </div>
            );
          })}
        </div>
        {getSupabaseSetupError() && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{getSupabaseSetupError()}</p>}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Safety</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Auto-posting is disabled in MVP. Content must be approved before scheduling or posting.</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">AI-generated content should be reviewed before posting.</p>
      </section>
    </div>
  );
}
