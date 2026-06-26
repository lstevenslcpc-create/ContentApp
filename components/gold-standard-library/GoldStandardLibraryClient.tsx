"use client";

import type React from "react";
import { Archive, Check, Copy, Download, FileJson, FileText, Layers3, Loader2, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { GoldStandardExample } from "@/lib/types";

type DraftEntry = Omit<Partial<GoldStandardExample>, "id" | "user_id"> & {
  localId: string;
  approvedForImport: boolean;
  duplicateWarnings: string[];
};

const emptyDraft = (): DraftEntry => ({
  localId: crypto.randomUUID(),
  title: "",
  platform: "Instagram",
  topic: "",
  subtopic: "",
  audience: "",
  content_type: "post",
  hook: "",
  full_content: "",
  cta: "",
  tags: [],
  collection: "LionHeart Voice Examples",
  why_gold_standard: "",
  notes: "",
  status: "approved",
  approvedForImport: true,
  duplicateWarnings: []
});

const csvColumns = ["title", "platform", "topic", "subtopic", "audience", "content_type", "hook", "full_content", "cta", "tags", "collection", "why_gold_standard", "notes"];

function splitPastedPosts(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const dividerSplit = trimmed
    .split(/\n\s*(?:---POST---|###\s*New Post)\s*\n/gi)
    .map((item) => item.trim())
    .filter(Boolean);
  if (dividerSplit.length > 1) return dividerSplit;
  const blankGroups = trimmed.split(/\n{3,}/).map((item) => item.trim()).filter((item) => item.length > 60);
  return blankGroups.length > 1 ? blankGroups : [trimmed];
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(text: string) {
  const rows = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(rows[0] || "").map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function normalizeDraft(input: Record<string, unknown> | Partial<GoldStandardExample>, existing: GoldStandardExample[] = []): DraftEntry {
  const record = input as Record<string, unknown>;
  const full = String(record.full_content || record.fullContent || "").trim();
  const hook = String(record.hook || full.split(/\n/).find(Boolean) || "").trim();
  const draft: DraftEntry = {
    ...emptyDraft(),
    title: String(record.title || hook.slice(0, 90) || "Untitled Gold Standard").trim(),
    platform: String(record.platform || "Instagram").trim(),
    topic: String(record.topic || "").trim(),
    subtopic: String(record.subtopic || "").trim(),
    audience: String(record.audience || "").trim(),
    content_type: String(record.content_type || record.contentType || "post").trim(),
    hook,
    full_content: full,
    cta: String(record.cta || "").trim(),
    tags: Array.isArray(record.tags) ? record.tags.map(String).filter(Boolean) : String(record.tags || "").split(/[;,]/).map((tag) => tag.trim()).filter(Boolean),
    collection: String(record.collection || "LionHeart Voice Examples").trim(),
    why_gold_standard: String(record.why_gold_standard || record.whyGoldStandard || "Strong LionHeart-style example. Review before saving.").trim(),
    notes: String(record.notes || "").trim(),
    approvedForImport: true,
    duplicateWarnings: []
  };
  draft.duplicateWarnings = duplicateWarnings(draft, existing);
  return draft;
}

function compact(value: unknown) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function duplicateWarnings(draft: Partial<GoldStandardExample>, existing: GoldStandardExample[]) {
  const warnings: string[] = [];
  const hook = compact(draft.hook);
  const full = compact(draft.full_content);
  const title = compact(draft.title);
  if (hook && existing.some((item) => compact(item.hook) === hook)) warnings.push("Exact same hook already exists.");
  if (full && existing.some((item) => compact(item.full_content) === full)) warnings.push("Exact same full content already exists.");
  if (title && existing.some((item) => {
    const existingTitle = compact(item.title);
    return existingTitle && (existingTitle.includes(title) || title.includes(existingTitle));
  })) warnings.push("Very similar title exists.");
  return warnings;
}

export function GoldStandardLibraryClient() {
  const [examples, setExamples] = useState<GoldStandardExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"library" | "bulk" | "confirm" | "success">("library");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [paste, setPaste] = useState("");
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    loadExamples();
  }, []);

  async function loadExamples() {
    setLoading(true);
    const response = await authedFetch("/api/gold-standard-library");
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to load Gold Standard Library.");
      return;
    }
    setExamples(data.examples || []);
  }

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return examples;
    return examples.filter((example) => [
      example.title,
      example.platform,
      example.topic,
      example.audience,
      example.content_type,
      example.hook,
      example.full_content,
      example.collection,
      example.why_gold_standard,
      ...(example.tags || [])
    ].filter(Boolean).join(" ").toLowerCase().includes(value));
  }, [examples, search]);

  async function extractPosts(posts: string[]) {
    setExtracting(true);
    setMessage("");
    const response = await authedFetch("/api/gold-standard-library/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts })
    });
    const data = await response.json();
    setExtracting(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to extract fields.");
      setDrafts(posts.map((post) => normalizeDraft({ full_content: post }, examples)));
      return;
    }
    setDrafts((data.entries || posts.map((post) => ({ full_content: post }))).map((entry: Record<string, unknown>, index: number) => normalizeDraft({ full_content: posts[index], ...entry }, examples)));
    if (data.warning) setMessage(data.warning);
  }

  async function parsePaste() {
    const posts = splitPastedPosts(paste);
    if (!posts.length) {
      setMessage("Paste at least one post first.");
      return;
    }
    await extractPosts(posts);
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const name = file.name.toLowerCase();
    if (name.endsWith(".json")) {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed.examples) ? parsed.examples : [parsed];
      setDrafts(items.map((item: Record<string, unknown>) => normalizeDraft(item, examples)));
      return;
    }
    if (name.endsWith(".csv")) {
      setDrafts(parseCsv(text).map((item) => normalizeDraft(item, examples)));
      return;
    }
    await extractPosts(splitPastedPosts(text));
  }

  function updateDraft(localId: string, update: Partial<DraftEntry>) {
    setDrafts((current) => current.map((draft) => {
      if (draft.localId !== localId) return draft;
      const next = { ...draft, ...update };
      return { ...next, duplicateWarnings: duplicateWarnings(next, examples) };
    }));
  }

  function downloadCsvTemplate() {
    const sample = [
      csvColumns.join(","),
      csvColumns.map((column) => column === "full_content" ? "\"Paste full post here\"" : column === "tags" ? "\"anxiety,carousel,voice\"" : "").join(",")
    ].join("\n");
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gold-standard-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importApproved() {
    const approved = drafts.filter((draft) => draft.approvedForImport && draft.full_content?.trim());
    if (!approved.length) {
      setMessage("Approve at least one entry before importing.");
      return;
    }
    setImporting(true);
    const response = await authedFetch("/api/gold-standard-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examples: approved })
    });
    const data = await response.json();
    setImporting(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to import examples.");
      return;
    }
    setSuccessCount(data.count || approved.length);
    setDrafts([]);
    setPaste("");
    await loadExamples();
    setMode("success");
  }

  async function saveManual() {
    const draft = normalizeDraft({ title: "New Gold Standard", full_content: "Paste your gold standard post here." }, examples);
    setDrafts([draft]);
    setMode("bulk");
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Layers3 size={14} />
              Gold Standard Library
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Approved examples the AI can learn from without copying.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">Use this as Lauren’s example bank. The LionHeart Voice Library remains the rulebook. These posts guide rhythm, emotional specificity, hooks, and CTA feel.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Examples" value={examples.length} />
            <Stat label="Visible" value={filtered.length} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary bg-[#d8c28a] text-[#172a3a] hover:bg-[#e6d3a2]" onClick={() => setMode("bulk")}><Upload size={16} />Bulk Add Gold Standards</button>
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={saveManual}><Plus size={16} />Add one manually</button>
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={downloadCsvTemplate}><Download size={16} />CSV template</button>
        </div>
      </section>

      {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}

      {mode === "library" && (
        <>
          <section className="rounded-2xl border border-[#e9dfcf] bg-white/85 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9dfcf] text-[#172a3a]"><Search size={18} /></span>
              <div>
                <h2 className="text-xl font-bold text-[#172a3a]">Search examples</h2>
                <p className="mt-1 text-sm text-[#6f766f]">Imported entries become searchable immediately and available to content generation.</p>
              </div>
            </div>
            <input className="field mt-5 border-[#e6ddcf] bg-[#fffdf8]" placeholder="Search by topic, hook, collection, tag, or phrase..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </section>

          {loading && <div className="rounded-2xl bg-white p-8 text-center text-[#6f766f]">Loading Gold Standard Library...</div>}
          {!loading && !filtered.length && (
            <section className="rounded-3xl border border-dashed border-[#d8c28a] bg-white/80 p-10 text-center shadow-sm">
              <Sparkles className="mx-auto text-[#b89b5e]" size={38} />
              <h2 className="mt-4 text-2xl font-bold text-[#172a3a]">No Gold Standard examples yet.</h2>
              <p className="mt-2 text-sm text-[#6f766f]">Bulk add several posts with `---POST---` dividers to build the example bank faster.</p>
            </section>
          )}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((example) => <ExampleCard key={example.id} example={example} onChange={loadExamples} />)}
          </section>
        </>
      )}

      {mode === "bulk" && (
        <section className="space-y-5 rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#172a3a]">Bulk Add Gold Standards</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f766f]">Paste several posts below. Separate each post with <strong>---POST---</strong> so the app can split them correctly. You can also use <strong>### New Post</strong>, upload CSV, JSON, TXT, or Markdown.</p>
            </div>
            <button className="btn-secondary" onClick={() => setMode("library")}>Cancel</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <textarea className="field min-h-[260px] border-[#e6ddcf] bg-[#fffdf8]" value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={"Paste post one...\n\n---POST---\n\nPaste post two...\n\n---POST---\n\nPaste post three..."} />
            <div className="space-y-3 rounded-2xl bg-[#f8f3ea] p-4">
              <label className="btn-secondary w-full cursor-pointer justify-center">
                <FileText size={16} />
                Upload CSV, JSON, TXT, MD
                <input className="hidden" type="file" accept=".csv,.json,.txt,.md,.markdown" onChange={handleFile} />
              </label>
              <button className="btn-secondary w-full justify-center" onClick={downloadCsvTemplate}><FileJson size={16} />Download CSV Template</button>
              <button className="btn-primary w-full justify-center" onClick={parsePaste} disabled={extracting}>
                {extracting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Parse + Suggest Fields
              </button>
            </div>
          </div>

          {!!drafts.length && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[#172a3a]">Import Preview</h3>
                  <p className="mt-1 text-sm text-[#6f766f]">Edit, remove, duplicate, tag, assign collections, and approve entries before saving.</p>
                </div>
                <button className="btn-primary" onClick={() => setMode("confirm")}><Check size={16} />Continue to confirmation</button>
              </div>
              {drafts.map((draft, index) => (
                <DraftCard
                  key={draft.localId}
                  draft={draft}
                  index={index}
                  onUpdate={(update) => updateDraft(draft.localId, update)}
                  onRemove={() => setDrafts((current) => current.filter((item) => item.localId !== draft.localId))}
                  onDuplicate={() => setDrafts((current) => [...current, { ...draft, localId: crypto.randomUUID(), title: `${draft.title || "Untitled"} copy` }])}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {mode === "confirm" && (
        <section className="rounded-3xl border border-[#e9dfcf] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#172a3a]">You’re about to import {drafts.filter((draft) => draft.approvedForImport).length} Gold Standard examples.</h2>
          <p className="mt-2 text-sm text-[#6f766f]">Only approved preview cards will be saved. Duplicate warnings do not block import unless you go back and remove or unapprove those entries.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={importApproved} disabled={importing}>{importing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}Import All Approved</button>
            <button className="btn-secondary" onClick={() => setMode("bulk")}>Go Back</button>
            <button className="btn-secondary" onClick={() => setMode("library")}>Cancel</button>
          </div>
        </section>
      )}

      {mode === "success" && (
        <section className="rounded-3xl border border-[#d8c28a] bg-white p-6 text-center shadow-sm">
          <Check className="mx-auto text-[#4f6f5a]" size={40} />
          <h2 className="mt-4 text-2xl font-bold text-[#172a3a]">{successCount} Gold Standard examples added.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={() => setMode("library")}>View Library</button>
            <button className="btn-secondary" onClick={() => setMode("bulk")}>Add More</button>
            <a className="btn-secondary" href="/content-generator">Generate Content Using These Examples</a>
          </div>
        </section>
      )}
    </div>
  );
}

function DraftCard({ draft, index, onUpdate, onRemove, onDuplicate }: { draft: DraftEntry; index: number; onUpdate: (update: Partial<DraftEntry>) => void; onRemove: () => void; onDuplicate: () => void }) {
  return (
    <article className="rounded-2xl border border-[#e9dfcf] bg-[#fffdf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-lg font-bold text-[#172a3a]">Draft Entry {index + 1}</h4>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">
            <input type="checkbox" checked={draft.approvedForImport} onChange={(event) => onUpdate({ approvedForImport: event.target.checked })} />
            Approve for import
          </label>
          <button className="btn-secondary" onClick={onDuplicate}><Copy size={15} />Duplicate</button>
          <button className="btn-secondary text-rose-700" onClick={onRemove}><Trash2 size={15} />Remove</button>
        </div>
      </div>
      {!!draft.duplicateWarnings.length && <p className="mt-3 rounded-xl bg-[#fff4d8] p-3 text-sm font-semibold text-[#8a6926]">{draft.duplicateWarnings.join(" ")}</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Title" value={draft.title || ""} onChange={(value) => onUpdate({ title: value })} />
        <Field label="Platform" value={draft.platform || ""} onChange={(value) => onUpdate({ platform: value })} />
        <Field label="Topic" value={draft.topic || ""} onChange={(value) => onUpdate({ topic: value })} />
        <Field label="Subtopic" value={draft.subtopic || ""} onChange={(value) => onUpdate({ subtopic: value })} />
        <Field label="Audience" value={draft.audience || ""} onChange={(value) => onUpdate({ audience: value })} />
        <Field label="Content type" value={draft.content_type || ""} onChange={(value) => onUpdate({ content_type: value })} />
        <Field label="Hook" value={draft.hook || ""} onChange={(value) => onUpdate({ hook: value })} />
        <Field label="CTA" value={draft.cta || ""} onChange={(value) => onUpdate({ cta: value })} />
        <Field label="Tags" value={(draft.tags || []).join(", ")} onChange={(value) => onUpdate({ tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
        <Field label="Collection" value={draft.collection || ""} onChange={(value) => onUpdate({ collection: value })} />
      </div>
      <label className="mt-3 block text-sm font-bold text-[#172a3a]">Full content</label>
      <textarea className="field mt-1 min-h-[170px] border-[#e6ddcf] bg-white" value={draft.full_content || ""} onChange={(event) => onUpdate({ full_content: event.target.value })} />
      <label className="mt-3 block text-sm font-bold text-[#172a3a]">Why this is a gold standard</label>
      <textarea className="field mt-1 min-h-[90px] border-[#e6ddcf] bg-white" value={draft.why_gold_standard || ""} onChange={(event) => onUpdate({ why_gold_standard: event.target.value })} />
      <label className="mt-3 block text-sm font-bold text-[#172a3a]">Notes</label>
      <textarea className="field mt-1 min-h-[70px] border-[#e6ddcf] bg-white" value={draft.notes || ""} onChange={(event) => onUpdate({ notes: event.target.value })} />
    </article>
  );
}

function ExampleCard({ example, onChange }: { example: GoldStandardExample; onChange: () => void }) {
  async function archive() {
    await authedFetch(`/api/gold-standard-library/${example.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" })
    });
    onChange();
  }
  async function remove() {
    if (!confirm("Delete this Gold Standard example permanently? This cannot be undone.")) return;
    await authedFetch(`/api/gold-standard-library/${example.id}`, { method: "DELETE" });
    onChange();
  }
  return (
    <article className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{example.platform || "Platform"}</Badge>
        <Badge>{example.content_type || "Type"}</Badge>
      </div>
      <h3 className="mt-3 text-lg font-bold text-[#172a3a]">{example.title}</h3>
      <p className="mt-2 text-sm font-semibold text-[#7b7468]">{example.topic || "No topic"} · {example.collection || "No collection"}</p>
      <p className="mt-4 line-clamp-5 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{example.full_content}</p>
      {!!example.tags?.length && <div className="mt-4 flex flex-wrap gap-2">{example.tags.map((tag) => <span key={tag} className="rounded-full bg-[#eef3ec] px-2.5 py-1 text-xs font-bold text-[#4f6f5a]">{tag}</span>)}</div>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(example.full_content)}><Copy size={15} />Copy</button>
        <button className="btn-secondary" onClick={archive}><Archive size={15} />Archive</button>
        <button className="btn-secondary text-rose-700" onClick={remove}><Trash2 size={15} />Delete</button>
      </div>
    </article>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-bold text-[#172a3a]">
      {label}
      <input className="field mt-1 border-[#e6ddcf] bg-white" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f7f1e6] px-2.5 py-1 text-xs font-bold text-[#77633c]">{children}</span>;
}
