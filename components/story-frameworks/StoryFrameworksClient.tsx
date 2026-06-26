"use client";

import { Archive, BookOpenText, Check, Loader2, Pencil, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { StoryFramework } from "@/lib/types";

const blank: Partial<StoryFramework> = {
  framework_name: "",
  purpose: "",
  when_to_use: "",
  best_platforms: [],
  best_content_types: [],
  writing_rhythm: "",
  psychological_goal: "",
  emotional_destination: "",
  typical_hook_styles: [],
  paragraph_rhythm: "",
  sentence_rhythm: "",
  education_level: 7,
  emotion_level: 8,
  curiosity_level: 8,
  story_level: 8,
  therapist_insight_level: 8,
  saveability_score: 8,
  shareability_score: 8,
  example_gold_standard_posts: [],
  status: "active"
};

export function StoryFrameworksClient() {
  const [frameworks, setFrameworks] = useState<StoryFramework[]>([]);
  const [editing, setEditing] = useState<Partial<StoryFramework> | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadFrameworks = useCallback(async () => {
    setLoading(true);
    const response = await authedFetch(`/api/story-frameworks?includeArchived=${showArchived}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to load Story Frameworks.");
      return;
    }
    setFrameworks(data.frameworks || []);
  }, [showArchived]);

  useEffect(() => {
    loadFrameworks();
  }, [loadFrameworks]);

  async function importStarters() {
    setSaving(true);
    const response = await authedFetch("/api/story-frameworks/import-starters", { method: "POST" });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to import starter frameworks.");
      return;
    }
    setMessage(data.imported ? `${data.imported} starter frameworks imported.` : data.message || "Starter frameworks already imported.");
    await loadFrameworks();
  }

  async function saveFramework() {
    if (!editing?.framework_name?.trim()) {
      setMessage("Framework name is required.");
      return;
    }
    setSaving(true);
    const isExisting = Boolean(editing.id);
    const response = await authedFetch(isExisting ? `/api/story-frameworks/${editing.id}` : "/api/story-frameworks", {
      method: isExisting ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to save Story Framework.");
      return;
    }
    setEditing(null);
    setMessage("Story Framework saved.");
    await loadFrameworks();
  }

  async function setStatus(framework: StoryFramework, status: "active" | "archived") {
    await authedFetch(`/api/story-frameworks/${framework.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await loadFrameworks();
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <BookOpenText size={14} />
          Story Frameworks
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Reusable structures for how Lauren thinks before the AI writes.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">Gold Standards show what great writing looks like. The Voice Library controls how Lauren sounds. Story Frameworks teach the AI how to structure the idea.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary bg-[#d8c28a] text-[#172a3a] hover:bg-[#e6d3a2]" onClick={importStarters} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
            Import Starter Frameworks
          </button>
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => setEditing(blank)}>
            <Plus size={16} />
            New Framework
          </button>
          <label className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            Show archived
          </label>
        </div>
      </section>

      {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}

      {editing && (
        <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-[#172a3a]">{editing.id ? "Edit Framework" : "New Framework"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Framework name" value={editing.framework_name || ""} onChange={(value) => setEditing({ ...editing, framework_name: value })} />
            <Field label="Emotional destination" value={editing.emotional_destination || ""} onChange={(value) => setEditing({ ...editing, emotional_destination: value })} />
            <Text label="Purpose" value={editing.purpose || ""} onChange={(value) => setEditing({ ...editing, purpose: value })} />
            <Text label="When to use" value={editing.when_to_use || ""} onChange={(value) => setEditing({ ...editing, when_to_use: value })} />
            <Field label="Best platforms" value={(editing.best_platforms || []).join(", ")} onChange={(value) => setEditing({ ...editing, best_platforms: split(value) })} />
            <Field label="Best content types" value={(editing.best_content_types || []).join(", ")} onChange={(value) => setEditing({ ...editing, best_content_types: split(value) })} />
            <Text label="Writing rhythm" value={editing.writing_rhythm || ""} onChange={(value) => setEditing({ ...editing, writing_rhythm: value })} />
            <Text label="Psychological goal" value={editing.psychological_goal || ""} onChange={(value) => setEditing({ ...editing, psychological_goal: value })} />
            <Field label="Typical hook styles" value={(editing.typical_hook_styles || []).join(" | ")} onChange={(value) => setEditing({ ...editing, typical_hook_styles: value.split("|").map((item) => item.trim()).filter(Boolean) })} />
            <Field label="Example Gold Standard posts" value={(editing.example_gold_standard_posts || []).join(", ")} onChange={(value) => setEditing({ ...editing, example_gold_standard_posts: split(value) })} />
            <Field label="Paragraph rhythm" value={editing.paragraph_rhythm || ""} onChange={(value) => setEditing({ ...editing, paragraph_rhythm: value })} />
            <Field label="Sentence rhythm" value={editing.sentence_rhythm || ""} onChange={(value) => setEditing({ ...editing, sentence_rhythm: value })} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(["education_level", "emotion_level", "curiosity_level", "story_level", "therapist_insight_level", "saveability_score", "shareability_score"] as const).map((key) => (
              <label key={key} className="block text-xs font-bold uppercase tracking-wide text-[#7b7468]">
                {key.replaceAll("_", " ")}
                <input className="field mt-1 border-[#e6ddcf] bg-[#fffdf8]" type="number" min={1} max={10} value={Number(editing[key] || 0)} onChange={(event) => setEditing({ ...editing, [key]: Number(event.target.value) })} />
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={saveFramework} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}Save Framework</button>
            <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </section>
      )}

      {loading && <div className="rounded-2xl bg-white p-8 text-center text-[#6f766f]">Loading Story Frameworks...</div>}
      {!loading && !frameworks.length && (
        <section className="rounded-3xl border border-dashed border-[#d8c28a] bg-white/80 p-10 text-center shadow-sm">
          <BookOpenText className="mx-auto text-[#b89b5e]" size={38} />
          <h2 className="mt-4 text-2xl font-bold text-[#172a3a]">No Story Frameworks yet.</h2>
          <p className="mt-2 text-sm text-[#6f766f]">Import the starter frameworks to teach the AI how Lauren structures ideas.</p>
        </section>
      )}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {frameworks.map((framework) => (
          <article key={framework.id} className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#77633c]">{framework.status}</span>
              <button className="btn-secondary" onClick={() => setEditing(framework)}><Pencil size={15} />Edit</button>
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#172a3a]">{framework.framework_name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f675f]">{framework.purpose}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#8a7143]">Emotional destination</p>
            <p className="mt-1 text-sm font-semibold text-[#20313f]">{framework.emotional_destination || "Not set"}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#8a7143]">Writing rhythm</p>
            <p className="mt-1 text-sm leading-6 text-[#5f675f]">{framework.writing_rhythm}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(framework.best_platforms || []).map((item) => <Badge key={item}>{item}</Badge>)}
              {(framework.best_content_types || []).map((item) => <Badge key={item}>{item}</Badge>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {framework.status === "archived" ? (
                <button className="btn-secondary" onClick={() => setStatus(framework, "active")}><RefreshCcw size={15} />Restore</button>
              ) : (
                <button className="btn-secondary" onClick={() => setStatus(framework, "archived")}><Archive size={15} />Archive</button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function split(value: string) {
  return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-bold text-[#172a3a]">
      {label}
      <input className="field mt-1 border-[#e6ddcf] bg-[#fffdf8]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-bold text-[#172a3a]">
      {label}
      <textarea className="field mt-1 min-h-[92px] border-[#e6ddcf] bg-[#fffdf8]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#eef3ec] px-2.5 py-1 text-xs font-bold text-[#4f6f5a]">{children}</span>;
}
