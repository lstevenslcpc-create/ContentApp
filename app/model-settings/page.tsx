import { Cpu, Info } from "lucide-react";
import { ModelSettingsClient } from "@/components/model-settings/ModelSettingsClient";
import { getModelConfigurationSummary, getModelEnvironmentStatuses, getModelRoutes } from "@/lib/modelRouter";

export const dynamic = "force-dynamic";

export default function ModelSettingsPage() {
  const routes = getModelRoutes();
  const envStatuses = getModelEnvironmentStatuses();
  const summary = getModelConfigurationSummary();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <Cpu size={14} />
          Model Router
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">Model Settings Diagnostics</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f3ecdf]">
          See exactly which OpenAI model each feature is using, why it was selected, what to configure next, and whether the selected model responds.
        </p>
      </section>

      <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
            <Info size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#172a3a]">How resolution works</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">
              Each feature checks its feature-specific environment variable first, then OPENAI_MODEL, then the built-in recommended model, then the final fallback. The test buttons send only a tiny request and never expose prompts, keys, or user content.
            </p>
          </div>
        </div>
      </section>

      <ModelSettingsClient routes={routes} envStatuses={envStatuses} summary={summary} />
    </div>
  );
}
