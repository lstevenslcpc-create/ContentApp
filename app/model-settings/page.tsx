import { CheckCircle2, Cpu, Info } from "lucide-react";
import { getModelRoutes } from "@/lib/modelRouter";

export const dynamic = "force-dynamic";

export default function ModelSettingsPage() {
  const routes = getModelRoutes();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <Cpu size={14} />
          Model Router
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">Model Settings</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f3ecdf]">
          Read-only diagnostics for which OpenAI model each feature uses. Configure these through environment variables for now.
        </p>
      </section>

      <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
            <Info size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#172a3a]">How fallback works</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">
              Each feature tries its specific environment variable first, then OPENAI_MODEL, then its feature default, then the final fallback model. Prompts, API keys, and user content are never shown here.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {routes.map((route) => (
          <article key={route.feature} className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{route.envVar}</p>
                <h2 className="mt-2 text-xl font-bold text-[#172a3a]">{route.feature}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">
                <CheckCircle2 size={14} />
                {route.source}
              </span>
            </div>
            <p className="mt-4 rounded-2xl bg-white p-4 font-mono text-sm font-bold text-[#172a3a] ring-1 ring-[#eadfc8]">
              {route.model}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6f766f]">{route.description}</p>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Fallback order</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {route.candidates.map((candidate) => (
                  <span key={`${route.feature}-${candidate}`} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6f766f] ring-1 ring-[#eadfc8]">
                    {candidate}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
