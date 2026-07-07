"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import type { ModelRoute } from "@/lib/modelRouter";

type EnvStatus = {
  envVar: string;
  configured: boolean;
  currentValue: string;
  recommendedModel: string;
  feature: string;
};

type Summary = {
  configuredVariables: number;
  usingDefaults: number;
  usingOpenAiModel: number;
  usingEmergencyFallback: number;
};

type TestResult = {
  ok: boolean;
  feature: string;
  configuredModel: string;
  selectedModel: string;
  responseTimeMs: number;
  fallbackOccurred: boolean;
  attempts: Array<{
    model: string;
    ok: boolean;
    responseTimeMs: number;
    error: string;
  }>;
  error?: string;
};

function stars(value: number) {
  return "★★★★★".slice(0, value) + "☆☆☆☆☆".slice(0, 5 - value);
}

function badgeClass(tone: ModelRoute["statusTone"]) {
  if (tone === "blue") return "bg-blue-50 text-blue-800 ring-blue-100";
  if (tone === "purple") return "bg-purple-50 text-purple-800 ring-purple-100";
  if (tone === "yellow") return "bg-amber-50 text-amber-800 ring-amber-100";
  return "bg-rose-50 text-rose-800 ring-rose-100";
}

function sourceExplanation(route: ModelRoute) {
  if (route.source === "feature_env") return `Using feature-specific environment variable ${route.envVar}.`;
  if (route.source === "openai_model") return "Using the global OPENAI_MODEL because the feature-specific variable is not configured.";
  if (route.source === "feature_default") return "Using the built-in recommended model because no environment override is configured.";
  return "Using the emergency final fallback because no other model could be resolved.";
}

export function ModelSettingsClient({
  routes,
  envStatuses,
  summary
}: {
  routes: ModelRoute[];
  envStatuses: EnvStatus[];
  summary: Summary;
}) {
  const [testing, setTesting] = useState("");
  const [results, setResults] = useState<Record<string, TestResult>>({});

  async function testModel(route: ModelRoute) {
    setTesting(route.feature);
    const response = await authedFetch("/api/model-settings/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: route.feature, envVar: route.envVar })
    });
    const data = await response.json();
    setResults((current) => ({
      ...current,
      [route.feature]: data
    }));
    setTesting("");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Configured variables", summary.configuredVariables],
          ["Using defaults", summary.usingDefaults],
          ["Using OPENAI_MODEL", summary.usingOpenAiModel],
          ["Using emergency fallback", summary.usingEmergencyFallback]
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
            <p className="mt-3 text-4xl font-bold text-[#172a3a]">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-[#eadfc8] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
            <Activity size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#172a3a]">Environment Variable Status</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f766f]">
              This section shows which model variables still need to be added to your local or production environment.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {envStatuses.map((item) => (
            <article key={item.envVar} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#77633c]">{item.envVar}</p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-[#6f766f]">
                <p><strong>Status:</strong> {item.configured ? "✅ Configured" : "❌ Not configured"}</p>
                <p><strong>Current Value:</strong> {item.currentValue || "Not configured"}</p>
                <p><strong>Recommended:</strong> {item.recommendedModel}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {routes.map((route) => {
          const result = results[route.feature];
          return (
            <article key={route.feature} className="rounded-3xl border border-[#eadfc8] bg-[#fffdf8] p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{route.envVar}</p>
                  <h2 className="mt-2 text-xl font-bold text-[#172a3a]">{route.feature}</h2>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeClass(route.statusTone)}`}>
                  {route.statusLabel}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Selected Model</p>
                  <p className="mt-2 font-mono text-lg font-bold text-[#172a3a]">{route.model}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Source</p>
                  <p className="mt-2 text-sm font-bold text-[#172a3a]">{route.sourceLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6f766f]">{sourceExplanation(route)}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#6f766f]">{route.description}</p>

              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#eadfc8]">
                <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Resolution Order</p>
                <ol className="mt-3 space-y-3">
                  {route.resolutionPath.map((step, index) => (
                    <li key={`${route.feature}-${step.label}`} className="text-sm leading-6 text-[#6f766f]">
                      <p className="font-bold text-[#172a3a]">{index + 1}. {step.label}</p>
                      <p>{step.status === "selected" ? `✓ ${step.value}` : "Not configured"}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eadfc8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Quality</p>
                  <p className="mt-1 text-sm font-bold text-[#172a3a]">{stars(route.costProfile.quality)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eadfc8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Speed</p>
                  <p className="mt-1 text-sm font-bold text-[#172a3a]">{stars(route.costProfile.speed)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eadfc8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Cost</p>
                  <p className="mt-1 text-sm font-bold text-[#172a3a]">{route.costProfile.cost}</p>
                </div>
              </div>

              <div className="mt-5">
                <button className="btn-secondary" onClick={() => void testModel(route)} disabled={Boolean(testing)}>
                  {testing === route.feature ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                  Test Model
                </button>
                {result ? (
                  <div className={`mt-4 rounded-2xl p-4 text-sm leading-6 ring-1 ${result.ok ? "bg-[#eef3ec] text-[#33533c] ring-[#cbdcc7]" : "bg-rose-50 text-rose-800 ring-rose-100"}`}>
                    <p className="flex items-center gap-2 font-bold">
                      {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {result.ok ? "Success" : "Failure"}
                    </p>
                    <p className="mt-2"><strong>Selected model:</strong> {result.selectedModel}</p>
                    <p><strong>Response time:</strong> {result.responseTimeMs}ms</p>
                    <p><strong>Fallback occurred:</strong> {result.fallbackOccurred ? "yes" : "no"}</p>
                    {result.error ? <p><strong>Error:</strong> {result.error}</p> : null}
                    <details className="mt-2">
                      <summary className="cursor-pointer font-bold">Attempts</summary>
                      <div className="mt-2 space-y-1">
                        {result.attempts.map((attempt) => (
                          <p key={`${route.feature}-${attempt.model}`}>{attempt.ok ? "✓" : "×"} {attempt.model} in {attempt.responseTimeMs}ms{attempt.error ? `: ${attempt.error}` : ""}</p>
                        ))}
                      </div>
                    </details>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
