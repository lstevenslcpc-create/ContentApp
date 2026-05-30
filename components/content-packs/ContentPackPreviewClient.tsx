"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit3, Loader2, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CopyButton } from "@/components/CopyButton";
import type { ContentPack, ContentPackBody, ContentPackSectionKey, ContentStatus } from "@/lib/types";

const sections: Array<{ key: ContentPackSectionKey; label: string; tone: string }> = [
  { key: "tiktok_reels_script", label: "TikTok/Reels Script", tone: "Short-form video" },
  { key: "instagram_carousel_outline", label: "Instagram Carousel Outline", tone: "Structure" },
  { key: "slide_by_slide_carousel_copy", label: "Slide-by-Slide Carousel Copy", tone: "Canva-ready" },
  { key: "instagram_caption", label: "Instagram Caption", tone: "Caption" },
  { key: "pinterest_pin_title", label: "Pinterest Pin Title", tone: "Searchable" },
  { key: "pinterest_description", label: "Pinterest Description", tone: "SEO" },
  { key: "threads_post", label: "Threads Post", tone: "Conversational" },
  { key: "blog_outline", label: "Blog Outline", tone: "AI-search" },
  { key: "email_newsletter_blurb", label: "Email/Newsletter Blurb", tone: "Warm" },
  { key: "canva_visual_direction", label: "Canva Visual Direction", tone: "Design" },
  { key: "product_cta", label: "Product CTA", tone: "Soft conversion" },
  { key: "therapy_service_cta", label: "Therapy Service CTA", tone: "Clinical CTA" },
  { key: "safety_disclaimer", label: "Safety Disclaimer", tone: "Compliance" }
];

const statusOptions: ContentStatus[] = ["draft", "needs_review", "approved", "scheduled", "posted"];

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}).` };
  }
}

export function ContentPackPreviewClient({ packId }: { packId: string }) {
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [draftPack, setDraftPack] = useState<ContentPackBody | null>(null);
  const [editing, setEditing] = useState<ContentPackSectionKey | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      if (packId.startsWith("temporary-")) {
        const stored = window.sessionStorage.getItem(`content-pack:${packId}`);
        if (stored) {
          const temporaryPack = JSON.parse(stored) as ContentPack;
          if (!mounted) return;
          setLoading(false);
          setPack(temporaryPack);
          setDraftPack(temporaryPack.pack);
          setMessage("Temporary preview only. Apply the content_packs Supabase migration to save packs permanently.");
          return;
        }
      }

      const response = await authedFetch(`/api/content-packs/${packId}`);
      const data = await readApiResponse(response);
      if (!mounted) return;
      setLoading(false);
      if (!response.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Unable to load content pack.");
        return;
      }
      const nextPack = data.pack as ContentPack;
      setPack(nextPack);
      setDraftPack(nextPack.pack);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [packId]);

  const completeText = useMemo(() => {
    if (!draftPack) return "";
    return sections.map((section) => `${section.label}\n${draftPack[section.key] || ""}`).join("\n\n---\n\n");
  }, [draftPack]);

  async function savePatch(updates: { pack?: ContentPackBody; status?: ContentStatus }) {
    if (packId.startsWith("temporary-")) {
      const nextPack = {
        ...pack,
        ...updates,
        pack: updates.pack || draftPack,
        status: updates.status || pack?.status || "draft"
      } as ContentPack;
      setPack(nextPack);
      setDraftPack(nextPack.pack);
      window.sessionStorage.setItem(`content-pack:${packId}`, JSON.stringify(nextPack));
      setEditing(null);
      setMessage("Temporary preview updated. Apply the content_packs Supabase migration to save permanently.");
      return;
    }

    setBusy("save");
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to save content pack.");
      return;
    }
    const nextPack = data.pack as ContentPack;
    setPack(nextPack);
    setDraftPack(nextPack.pack);
    setEditing(null);
    setMessage("Content pack saved.");
  }

  async function regenerate(sectionKey?: ContentPackSectionKey) {
    if (packId.startsWith("temporary-")) {
      setMessage("Regeneration requires a saved Supabase content pack. Apply the content_packs migration, then create the pack again.");
      return;
    }

    setBusy(sectionKey || "regenerate-all");
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to regenerate content pack.");
      return;
    }
    const nextPack = data.pack as ContentPack;
    setPack(nextPack);
    setDraftPack(nextPack.pack);
    setMessage(sectionKey ? "Section regenerated." : "Content pack regenerated.");
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-white p-6 text-center shadow-premium">
          <Loader2 className="mx-auto animate-spin text-[#172a3a]" />
          <p className="mt-3 text-sm font-bold text-[#172a3a]">Loading content pack...</p>
        </div>
      </div>
    );
  }

  if (!pack || !draftPack) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <section className="max-w-lg rounded-3xl border border-[#e9dfcf] bg-white p-6 text-center shadow-premium">
          <h1 className="text-2xl font-bold text-[#172a3a]">Content pack unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#6f766f]">{message || "This content pack could not be loaded."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <ShieldCheck size={14} />
              Multi-platform Content Pack
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">{pack.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">
              A LionHeart-ready pack for scripts, captions, Pinterest, blog, email, Canva direction, CTAs, and clinical safety review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={completeText} label="Copy Full Pack" />
            <button className="btn-secondary border-[#eadfc8] bg-white/10 text-white hover:bg-white/15" onClick={() => regenerate()} disabled={Boolean(busy)}>
              {busy === "regenerate-all" ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Regenerate All
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetaCard label="Status" value={pack.status} />
        <MetaCard label="Audience" value={pack.audience || "LionHeart audience"} />
        <MetaCard label="Pillar" value={pack.content_pillar || "Trust-building"} />
        <MetaCard label="Sensitivity" value={pack.clinical_sensitivity || "medium"} />
      </section>

      <section className="rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#172a3a]">Approval Status</h2>
            <p className="mt-1 text-sm text-[#6f766f]">Keep the pack in review until every section sounds clinically safe and on-brand.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`rounded-full px-3 py-2 text-xs font-bold transition ${pack.status === status ? "bg-[#172a3a] text-white" : "bg-[#f7f1e6] text-[#77633c] hover:bg-[#eadfc8]"}`}
                onClick={() => savePatch({ status })}
                disabled={Boolean(busy)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        {message && <p className="mt-4 rounded-xl bg-[#eef3ec] p-3 text-sm font-semibold text-[#4f6f5a]">{message}</p>}
      </section>

      <section className="grid gap-5">
        {sections.map((section) => {
          const isEditing = editing === section.key;
          return (
            <article key={section.key} className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-bold text-[#77633c]">{section.tone}</span>
                  <h3 className="mt-3 text-xl font-bold text-[#172a3a]">{section.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={draftPack[section.key] || ""} />
                  <button className="btn-secondary" onClick={() => setEditing(isEditing ? null : section.key)}>
                    <Edit3 size={16} />
                    {isEditing ? "Close Edit" : "Edit"}
                  </button>
                  <button className="btn-secondary" onClick={() => regenerate(section.key)} disabled={Boolean(busy)}>
                    {busy === section.key ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    Regenerate
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4">
                  <textarea
                    className="min-h-56 w-full rounded-2xl border border-[#e6ddcf] bg-[#fffdf8] p-4 text-sm leading-6 outline-none focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]"
                    value={draftPack[section.key] || ""}
                    onChange={(event) => setDraftPack((current) => current ? { ...current, [section.key]: event.target.value } : current)}
                  />
                  <button className="btn-primary mt-3 bg-[#172a3a] hover:bg-[#22384a]" onClick={() => savePatch({ pack: draftPack })} disabled={Boolean(busy)}>
                    {busy === "save" ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Edits
                  </button>
                </div>
              ) : (
                <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#fffdf8] p-4 text-sm leading-7 text-[#20313f] ring-1 ring-[#eadfc8]">
                  {draftPack[section.key]}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl bg-[#eef3ec] p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-[#172a3a]"><CheckCircle2 size={18} /> Review reminder</p>
        <p className="mt-2 text-sm leading-6 text-[#4f6f5a]">AI-generated content should be reviewed before posting. Auto-posting remains disabled in MVP.</p>
      </section>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9dfcf] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{label}</p>
      <p className="mt-2 text-lg font-bold capitalize text-[#172a3a]">{value}</p>
    </div>
  );
}
