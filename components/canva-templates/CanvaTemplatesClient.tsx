"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, ClipboardCheck, ExternalLink, LayoutTemplate, Link2, Loader2, Pencil, Plus, Sparkles, XCircle } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CANVA_TEMPLATES } from "@/lib/canvaTemplates";
import type { CanvaTemplate } from "@/lib/types";

const formatTypes = ["Instagram carousel", "Pinterest pin", "Reel cover", "Story", "Workbook promo", "Blog graphic", "Quote post"];
const contentTypes = ["carousel", "reel cover", "Pinterest pin", "product promo", "quote post"];
const recommendedOptions = ["teen anxiety", "anxious attachment", "burnout", "workbook promo", "Pinterest SEO", "therapy education", "nervous system content"];
const defaultSlideRules = {
  fields: [] as string[],
  rule: "Copy each generated field into the matching Canva placeholder manually until official Canva autofill is connected."
};

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}).` };
  }
}

const emptyForm = {
  canva_template_id: "",
  template_name: "",
  canva_template_link: "",
  content_type: "carousel",
  format_type: "Instagram carousel",
  dimensions: "",
  platform_size: "",
  number_of_slides: "",
  aesthetic_vibe: "",
  visual_style_notes: "",
  color_palette: "",
  font_style: "",
  graphic_style: "",
  best_use_case: "",
  audience_fit: "",
  content_pillar_fit: "",
  slide_structure_rules_text: JSON.stringify(defaultSlideRules, null, 2),
  canva_design_id: "",
  canva_design_url: "",
  canva_autofill_enabled: false,
  placeholder_mapping_text: "{}",
  recommended_for: [] as string[],
  approval_status: "draft",
  notes: ""
};

function parseJsonObject(value: string, fallback: Record<string, unknown>) {
  try {
    const parsed = JSON.parse(value || "{}");
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : fallback;
  } catch {
    return fallback;
  }
}

function jsonText(value: unknown, fallback: Record<string, unknown>) {
  return JSON.stringify(typeof value === "object" && value !== null && !Array.isArray(value) ? value : fallback, null, 2);
}

const integrationStatuses = [
  { label: "Canva Prep", active: true },
  { label: "Template links", active: true },
  { label: "AI template matching", active: true },
  { label: "Copy buttons", active: true },
  { label: "Auto-fill text into Canva", active: false },
  { label: "Canva API OAuth", active: false },
  { label: "Auto-created Canva designs", active: false }
];

export function CanvaTemplatesClient() {
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [linkMessages, setLinkMessages] = useState<Record<string, string>>({});

  async function loadTemplates() {
    setLoading(true);
    const response = await authedFetch("/api/canva-templates?status=all");
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to load Canva templates.");
      return;
    }
    setTemplates(Array.isArray(data.templates) ? data.templates as CanvaTemplate[] : []);
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  const visible = useMemo(() => templates.filter((template) => filter === "all" || template.approval_status === filter), [filter, templates]);

  function update(field: keyof typeof emptyForm, value: string | string[] | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function testLink(url: string, key = "form") {
    if (!url.trim()) {
      setLinkMessages((current) => ({ ...current, [key]: "Add a Canva link first." }));
      return;
    }
    setBusy(`test-link:${key}`);
    setLinkMessages((current) => ({ ...current, [key]: "Testing Canva link..." }));
    const response = await authedFetch("/api/canva-templates/test-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await readApiResponse(response);
    setBusy("");
    const label = typeof data.message === "string" ? data.message : typeof data.error === "string" ? data.error : response.ok ? "Canva link responded." : "Could not verify this Canva link.";
    setLinkMessages((current) => ({ ...current, [key]: label }));
  }

  async function saveTemplate() {
    setBusy("save");
    setMessage("");
    const payload = {
      ...form,
      number_of_slides: form.number_of_slides ? Number(form.number_of_slides) : null,
      slide_structure_rules: parseJsonObject(form.slide_structure_rules_text, defaultSlideRules),
      placeholder_mapping: parseJsonObject(form.placeholder_mapping_text, {})
    };
    const path = editingId ? `/api/canva-templates/${editingId}` : "/api/canva-templates";
    const response = await authedFetch(path, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to save Canva template.");
      return;
    }
    const template = data.template as CanvaTemplate;
    setTemplates((current) => editingId ? current.map((item) => item.id === template.id ? template : item) : [template, ...current]);
    setEditingId("");
    setForm(emptyForm);
    setMessage(editingId ? "Template updated." : "Template saved.");
  }

  async function setStatus(template: CanvaTemplate, approval_status: "draft" | "approved" | "archived") {
    setBusy(template.id);
    const response = await authedFetch(`/api/canva-templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approval_status })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update template.");
      return;
    }
    setTemplates((current) => current.map((item) => item.id === template.id ? data.template as CanvaTemplate : item));
  }

  async function importStarterTemplates() {
    setBusy("import-starters");
    setMessage("");
    const response = await authedFetch("/api/canva-templates/import-starters", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to import starter templates.");
      return;
    }
    const importedTemplates = Array.isArray(data.templates) ? data.templates as CanvaTemplate[] : [];
    setTemplates((current) => {
      const importedIds = new Set(importedTemplates.map((template) => template.id));
      return [...importedTemplates, ...current.filter((template) => !importedIds.has(template.id))];
    });
    setMessage(typeof data.message === "string" ? data.message : "Starter templates imported.");
  }

  function edit(template: CanvaTemplate) {
    setEditingId(template.id);
    setForm({
      canva_template_id: template.canva_template_id || "",
      template_name: template.template_name || "",
      canva_template_link: template.canva_template_link || "",
      content_type: template.content_type || "carousel",
      format_type: template.format_type || "Instagram carousel",
      dimensions: template.dimensions || "",
      platform_size: template.platform_size || template.dimensions || "",
      number_of_slides: template.number_of_slides ? String(template.number_of_slides) : "",
      aesthetic_vibe: template.aesthetic_vibe || "",
      visual_style_notes: template.visual_style_notes || "",
      color_palette: template.color_palette || "",
      font_style: template.font_style || "",
      graphic_style: template.graphic_style || "",
      best_use_case: template.best_use_case || "",
      audience_fit: template.audience_fit || "",
      content_pillar_fit: template.content_pillar_fit || "",
      slide_structure_rules_text: jsonText(template.slide_structure_rules, defaultSlideRules),
      canva_design_id: template.canva_design_id || "",
      canva_design_url: template.canva_design_url || "",
      canva_autofill_enabled: Boolean(template.canva_autofill_enabled),
      placeholder_mapping_text: jsonText(template.placeholder_mapping, {}),
      recommended_for: template.recommended_for || [],
      approval_status: template.approval_status || "draft",
      notes: template.notes || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <LayoutTemplate size={14} />
          Canva Template Library
        </p>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">Approve the templates before AI content moves into design.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">Save the LionHeart-approved Canva layouts that feel calm, credible, and emotionally specific so content never drifts into generic AI visuals.</p>
      </section>

      <CanvaIntegrationStatusPanel />

      <section className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <form className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); void saveTemplate(); }}>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]"><Plus size={14} />{editingId ? "Edit template" : "Add approved option"}</p>
          <div className="mt-4 grid gap-3">
            <Field label="Template name" value={form.template_name} onChange={(value) => update("template_name", value)} required />
            <Field label="Canva template link" value={form.canva_template_link} onChange={(value) => update("canva_template_link", value)} required />
            <button className="btn-secondary justify-center" type="button" onClick={() => void testLink(form.canva_template_link)} disabled={busy === "test-link:form"}>
              {busy === "test-link:form" ? <Loader2 className="animate-spin" size={16} /> : <Link2 size={16} />}
              Test Template Link
            </button>
            {linkMessages.form && <p className="rounded-xl bg-[#f7f1e6] p-3 text-xs font-bold text-[#77633c]">{linkMessages.form}</p>}
            <label><span className="label">Content type</span><select className="field mt-1" value={form.content_type} onChange={(event) => update("content_type", event.target.value)}>{contentTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="label">Format/type</span><select className="field mt-1" value={form.format_type} onChange={(event) => update("format_type", event.target.value)}>{formatTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <Field label="Dimensions" value={form.dimensions} onChange={(value) => update("dimensions", value)} placeholder="1080x1350, 1080x1920..." />
            <Field label="Platform size" value={form.platform_size} onChange={(value) => update("platform_size", value)} placeholder="Instagram 4:5, 1080x1920..." />
            <Field label="Number of slides" value={form.number_of_slides} onChange={(value) => update("number_of_slides", value)} placeholder="7" />
            <Field label="Aesthetic/vibe" value={form.aesthetic_vibe} onChange={(value) => update("aesthetic_vibe", value)} />
            <label><span className="label">Visual style notes</span><textarea className="field mt-1 min-h-20" value={form.visual_style_notes} onChange={(event) => update("visual_style_notes", event.target.value)} /></label>
            <Field label="Color palette" value={form.color_palette} onChange={(value) => update("color_palette", value)} />
            <Field label="Font style" value={form.font_style} onChange={(value) => update("font_style", value)} />
            <Field label="Graphic style" value={form.graphic_style} onChange={(value) => update("graphic_style", value)} />
            <Field label="Best use case" value={form.best_use_case} onChange={(value) => update("best_use_case", value)} />
            <Field label="Audience fit" value={form.audience_fit} onChange={(value) => update("audience_fit", value)} />
            <Field label="Content pillar fit" value={form.content_pillar_fit} onChange={(value) => update("content_pillar_fit", value)} />
            <label><span className="label">Slide structure rules</span><textarea className="field mt-1 min-h-28 font-mono text-xs" value={form.slide_structure_rules_text} onChange={(event) => update("slide_structure_rules_text", event.target.value)} /></label>
            <details className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#77633c]">Future Canva API fields, inactive</summary>
              <div className="mt-4 grid gap-3">
                <Field label="Canva API template ID" value={form.canva_template_id} onChange={(value) => update("canva_template_id", value)} />
                <Field label="Canva design ID" value={form.canva_design_id} onChange={(value) => update("canva_design_id", value)} />
                <Field label="Canva design URL" value={form.canva_design_url} onChange={(value) => update("canva_design_url", value)} />
                <label className="flex items-center gap-2 text-sm font-bold text-[#6f766f]">
                  <input type="checkbox" checked={form.canva_autofill_enabled} onChange={(event) => update("canva_autofill_enabled", event.target.checked)} disabled />
                  Canva autofill enabled, inactive until OAuth is built
                </label>
                <label><span className="label">Placeholder mapping JSON</span><textarea className="field mt-1 min-h-24 font-mono text-xs" value={form.placeholder_mapping_text} onChange={(event) => update("placeholder_mapping_text", event.target.value)} /></label>
              </div>
            </details>
            <label><span className="label">Approval status</span><select className="field mt-1" value={form.approval_status} onChange={(event) => update("approval_status", event.target.value)}>{["draft", "approved", "archived"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="label">Recommended For</span><div className="mt-2 flex flex-wrap gap-2">{recommendedOptions.map((item) => <button type="button" key={item} className={`rounded-full px-3 py-1.5 text-xs font-bold ${form.recommended_for.includes(item) ? "bg-[#172a3a] text-white" : "bg-[#f7f1e6] text-[#77633c]"}`} onClick={() => update("recommended_for", form.recommended_for.includes(item) ? form.recommended_for.filter((value) => value !== item) : [...form.recommended_for, item])}>{item}</button>)}</div></label>
            <label><span className="label">Notes</span><textarea className="field mt-1 min-h-24" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
          </div>
          <button className="btn-primary mt-5 w-full bg-[#172a3a] py-3 hover:bg-[#22384a]" disabled={Boolean(busy)}>
            {busy === "save" ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            {editingId ? "Save Template" : "Add Template"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[#e9dfcf] bg-[#fffbf5] p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]">
                  <Sparkles size={14} />
                  Starter registry
                </p>
                <h2 className="mt-3 text-xl font-bold text-[#172a3a]">Import the 7 approved LionHeart templates.</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6f766f]">Adds the approved Canva links, recommended uses, audiences, pillars, and template field notes. Existing templates are skipped automatically.</p>
              </div>
              <button className="btn-primary bg-[#8f79d6] px-5 py-3 hover:bg-[#7e68c7]" onClick={() => void importStarterTemplates()} disabled={Boolean(busy)}>
                {busy === "import-starters" ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Import Approved Starter Templates
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CANVA_TEMPLATES.map((template) => (
                <span key={template.id} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#77633c] shadow-sm">{template.name}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e9dfcf] bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-[#172a3a]">Template Cards</h2>
              <p className="mt-1 text-sm text-[#6f766f]">Only approved templates are recommended to Content Packs by default. Starter registry: {CANVA_TEMPLATES.length} templates.</p>
            </div>
            <select className="field w-auto" value={filter} onChange={(event) => setFilter(event.target.value)}>
              {["all", "draft", "approved", "archived"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}
          {loading ? <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-[#6f766f]"><Loader2 className="mx-auto mb-3 animate-spin" />Loading templates...</div> : null}
          {!loading && visible.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8c28a] bg-white p-8 text-center text-[#6f766f]">No Canva templates saved yet.</div> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((template) => (
              <article key={template.id} className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]">{template.format_type}</span>
                    {template.content_type && <span className="ml-2 rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{template.content_type}</span>}
                    <h3 className="mt-3 text-xl font-bold text-[#172a3a]">{template.template_name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6f766f]">{template.aesthetic_vibe || "Aesthetic not set"} · {template.platform_size || template.dimensions || "size TBD"}{template.number_of_slides ? ` · ${template.number_of_slides} slide${template.number_of_slides === 1 ? "" : "s"}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${template.approval_status === "approved" ? "bg-[#eef3ec] text-[#4f6f5a]" : template.approval_status === "archived" ? "bg-slate-100 text-slate-600" : "bg-[#f7f1e6] text-[#77633c]"}`}>{template.approval_status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{(template.recommended_for || []).map((item) => <span key={item} className="rounded-full bg-[#f7f1e6] px-2 py-1 text-[11px] font-bold text-[#77633c]">{item}</span>)}</div>
                <div className="mt-4 space-y-2 text-sm leading-6 text-[#6f766f]">
                  <p><strong className="text-[#172a3a]">Best use:</strong> {template.best_use_case || "Not set"}</p>
                  <p><strong className="text-[#172a3a]">Visual style:</strong> {template.visual_style_notes || template.graphic_style || "Not set"}</p>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <a className="btn-secondary" href={template.canva_template_link} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Canva</a>
                  <button className="btn-secondary" onClick={() => void testLink(template.canva_template_link, template.id)} disabled={busy === `test-link:${template.id}`}>
                    {busy === `test-link:${template.id}` ? <Loader2 className="animate-spin" size={16} /> : <Link2 size={16} />}
                    Test Template Link
                  </button>
                  <button className="btn-secondary" onClick={() => edit(template)}><Pencil size={16} />Edit</button>
                  {template.approval_status !== "approved" && (
                    <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={() => setStatus(template, "approved")} disabled={busy === template.id}><CheckCircle2 size={16} />Approve</button>
                  )}
                  <button className="btn-secondary" onClick={() => setStatus(template, "archived")} disabled={busy === template.id}><Archive size={16} />Archive</button>
                </div>
                {linkMessages[template.id] && <p className="mt-3 rounded-xl bg-[#f7f1e6] p-3 text-xs font-bold text-[#77633c]">{linkMessages[template.id]}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CanvaIntegrationStatusPanel() {
  return (
    <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#4f6f5a]">
            <ClipboardCheck size={14} />
            Canva Integration Status
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#172a3a]">Current workflow is Canva Prep, not Canva API automation.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f766f]">The app prepares template-matched copy, links, and design briefs for manual Canva use. OAuth, autofill, and auto-created Canva designs are intentionally inactive until the official API phase.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {integrationStatuses.map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 ring-1 ${item.active ? "bg-[#eef3ec] ring-[#cbdcc7]" : "bg-[#fff7f5] ring-[#efd1cc]"}`}>
            <div className="flex items-center gap-2">
              {item.active ? <CheckCircle2 className="text-[#4f6f5a]" size={18} /> : <XCircle className="text-[#a94b4b]" size={18} />}
              <span className="text-xs font-bold uppercase tracking-wide text-[#6f766f]">{item.active ? "Active" : "Not connected yet"}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-[#172a3a]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return <label><span className="label">{label}</span><input className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>;
}
