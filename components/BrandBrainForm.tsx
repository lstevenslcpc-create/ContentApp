"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Brain, CheckCircle2, Heart, Palette, Search, ShieldCheck, ShoppingBag, Sparkles, Users, type LucideIcon } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { defaultBrandBrain } from "@/lib/brandBrain/defaults";
import type { BrandBrain } from "@/lib/types";

type EditableBrandBrain = Omit<BrandBrain, "id" | "user_id" | "created_at" | "updated_at">;

const sectionStyles = "rounded-2xl border border-[#e9dfcf] bg-white/85 p-5 shadow-sm backdrop-blur";
const inputStyles = "w-full rounded-xl border border-[#e6ddcf] bg-[#fffdf8] px-3 py-2 text-sm text-[#20313f] outline-none transition focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]";
const labelStyles = "text-xs font-bold uppercase tracking-wide text-[#7b7468]";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function joinLines(value?: string[]) {
  return (value || []).join("\n");
}

function parseListObjects<T>(value: string, fallback: T[]) {
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function listText(value?: string[]) {
  return value?.length ? value.join(", ") : "Not set yet.";
}

export function BrandBrainForm() {
  const [brandBrain, setBrandBrain] = useState<EditableBrandBrain>(defaultBrandBrain);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [jsonDrafts, setJsonDrafts] = useState({
    audience_profiles: JSON.stringify(defaultBrandBrain.audience_profiles, null, 2),
    therapy_services: JSON.stringify(defaultBrandBrain.therapy_services, null, 2),
    product_catalog: JSON.stringify(defaultBrandBrain.product_catalog, null, 2)
  });

  useEffect(() => {
    let active = true;
    authedFetch("/api/brand-brain")
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (response.ok && data.brandBrain) {
          setBrandBrain(data.brandBrain);
          setJsonDrafts({
            audience_profiles: JSON.stringify(data.brandBrain.audience_profiles || [], null, 2),
            therapy_services: JSON.stringify(data.brandBrain.therapy_services || [], null, 2),
            product_catalog: JSON.stringify(data.brandBrain.product_catalog || [], null, 2)
          });
        } else {
          setMessage(data.error || "Sign in to save your Brand Brain.");
        }
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load Brand Brain."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const influenceSummary = useMemo(() => {
    const layer = brandBrain.ai_instruction_layer;
    return Object.entries(layer).filter(([, enabled]) => enabled).map(([key]) => key.replaceAll("_", " ")).join(", ");
  }, [brandBrain.ai_instruction_layer]);
  const audienceProfiles = useMemo(() => parseListObjects(jsonDrafts.audience_profiles, brandBrain.audience_profiles), [brandBrain.audience_profiles, jsonDrafts.audience_profiles]);
  const therapyServices = useMemo(() => parseListObjects(jsonDrafts.therapy_services, brandBrain.therapy_services), [brandBrain.therapy_services, jsonDrafts.therapy_services]);
  const productCatalog = useMemo(() => parseListObjects(jsonDrafts.product_catalog, brandBrain.product_catalog), [brandBrain.product_catalog, jsonDrafts.product_catalog]);

  function update<K extends keyof EditableBrandBrain>(key: K, value: EditableBrandBrain[K]) {
    setBrandBrain((current) => ({ ...current, [key]: value }));
  }

  function updateVoice<K extends keyof EditableBrandBrain["voice_tone"]>(key: K, value: EditableBrandBrain["voice_tone"][K]) {
    setBrandBrain((current) => ({ ...current, voice_tone: { ...current.voice_tone, [key]: value } }));
  }

  function updateVisual<K extends keyof EditableBrandBrain["visual_identity"]>(key: K, value: EditableBrandBrain["visual_identity"][K]) {
    setBrandBrain((current) => ({ ...current, visual_identity: { ...current.visual_identity, [key]: value } }));
  }

  function updateSafety<K extends keyof EditableBrandBrain["clinical_safety_rules"]>(key: K, value: EditableBrandBrain["clinical_safety_rules"][K]) {
    setBrandBrain((current) => ({ ...current, clinical_safety_rules: { ...current.clinical_safety_rules, [key]: value } }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const payload = {
      ...brandBrain,
      audience_profiles: parseListObjects(jsonDrafts.audience_profiles, brandBrain.audience_profiles),
      therapy_services: parseListObjects(jsonDrafts.therapy_services, brandBrain.therapy_services),
      product_catalog: parseListObjects(jsonDrafts.product_catalog, brandBrain.product_catalog)
    };

    const response = await authedFetch("/api/brand-brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setSaving(false);
    if (response.ok) {
      setBrandBrain(data.brandBrain);
      setMessage("Brand Brain saved. Future AI content will use these instructions.");
    } else {
      setMessage(data.error || "Unable to save Brand Brain.");
    }
  }

  if (loading) {
    return <div className={sectionStyles}>Loading Brand Brain...</div>;
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Brain size={14} />
              Brand Brain
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">The identity engine for every caption, hook, email, SEO idea, and Canva direction.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">Built for LionHeart Therapy: calm, clinically safe, emotionally intelligent, and deeply specific instead of generic AI wellness content.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#d8c28a]">Currently influencing</p>
            <p className="mt-3 text-sm leading-6 text-[#fffaf0]">{influenceSummary}</p>
          </div>
        </div>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={Heart} title="Brand Identity" subtitle="Name, mission, and personality sliders." />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Brand Name" value={brandBrain.brand_name} onChange={(value) => update("brand_name", value)} />
          <TextField label="Tagline" value={brandBrain.tagline || ""} onChange={(value) => update("tagline", value)} />
          <label className="md:col-span-2"><span className={labelStyles}>Mission</span><textarea className={`${inputStyles} mt-1 min-h-24`} value={brandBrain.mission || ""} onChange={(event) => update("mission", event.target.value)} /></label>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Slider label="clinical to relatable" left="clinical" right="relatable" value={brandBrain.personality_sliders.clinical_relatable} onChange={(value) => update("personality_sliders", { ...brandBrain.personality_sliders, clinical_relatable: value })} />
          <Slider label="witty to serious" left="witty" right="serious" value={brandBrain.personality_sliders.witty_serious} onChange={(value) => update("personality_sliders", { ...brandBrain.personality_sliders, witty_serious: value })} />
          <Slider label="educational to emotional" left="educational" right="emotional" value={brandBrain.personality_sliders.educational_emotional} onChange={(value) => update("personality_sliders", { ...brandBrain.personality_sliders, educational_emotional: value })} />
          <Slider label="trendy to timeless" left="trendy" right="timeless" value={brandBrain.personality_sliders.trendy_timeless} onChange={(value) => update("personality_sliders", { ...brandBrain.personality_sliders, trendy_timeless: value })} />
        </div>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={Sparkles} title="Voice & Tone" subtitle="The language rules that stop generic AI from leaking into your brand." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextArea label="Example captions" value={joinLines(brandBrain.voice_tone.example_captions)} onChange={(value) => updateVoice("example_captions", splitLines(value))} />
          <TextArea label="Preferred phrases" value={joinLines(brandBrain.voice_tone.preferred_phrases)} onChange={(value) => updateVoice("preferred_phrases", splitLines(value))} />
          <TextArea label="Phrases to avoid" value={joinLines(brandBrain.voice_tone.phrases_to_avoid)} onChange={(value) => updateVoice("phrases_to_avoid", splitLines(value))} />
          <TextArea label="Forbidden AI Phrases" value={joinLines(brandBrain.forbidden_ai_phrases)} onChange={(value) => update("forbidden_ai_phrases", splitLines(value))} />
          <TextField label="Emotional tone" value={brandBrain.voice_tone.emotional_tone} onChange={(value) => updateVoice("emotional_tone", value)} />
          <TextField label="Humor level" value={brandBrain.voice_tone.humor_level} onChange={(value) => updateVoice("humor_level", value)} />
          <TextField label="Sentence style" value={brandBrain.voice_tone.sentence_style} onChange={(value) => updateVoice("sentence_style", value)} />
          <TextField label="Formatting style" value={brandBrain.voice_tone.formatting_style} onChange={(value) => updateVoice("formatting_style", value)} />
          <TextField label="Emoji preferences" value={brandBrain.voice_tone.emoji_preferences} onChange={(value) => updateVoice("emoji_preferences", value)} />
          <TextField label="CTA tone" value={brandBrain.voice_tone.cta_tone} onChange={(value) => updateVoice("cta_tone", value)} />
        </div>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={Users} title="Audience Profiles" subtitle="Multiple saved audiences with pain points, triggers, platforms, hooks, and buying behavior." />
        <AudienceProfileCards profiles={audienceProfiles} />
        <JsonDetails label="Advanced JSON editor">
          <JsonEditor value={jsonDrafts.audience_profiles} onChange={(value) => setJsonDrafts((current) => ({ ...current, audience_profiles: value }))} />
        </JsonDetails>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={ShieldCheck} title="Therapy Services" subtitle="Service-specific SEO, CTAs, internal links, target audiences, and FAQs." />
        <TherapyServiceCards services={therapyServices} />
        <JsonDetails label="Advanced JSON editor">
          <JsonEditor value={jsonDrafts.therapy_services} onChange={(value) => setJsonDrafts((current) => ({ ...current, therapy_services: value }))} />
        </JsonDetails>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={ShoppingBag} title="Product Catalog" subtitle="Products, emotional pain points, transformation outcomes, CTAs, visuals, SEO, and seasonal opportunities." />
        <ProductCatalogCards products={productCatalog} />
        <JsonDetails label="Advanced JSON editor">
          <JsonEditor value={jsonDrafts.product_catalog} onChange={(value) => setJsonDrafts((current) => ({ ...current, product_catalog: value }))} />
        </JsonDetails>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={Palette} title="Visual Identity" subtitle="The Canva and media-generation aesthetic rules." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextArea label="Brand colors" value={joinLines(brandBrain.visual_identity.brand_colors)} onChange={(value) => updateVisual("brand_colors", splitLines(value))} />
          <TextArea label="Fonts" value={joinLines(brandBrain.visual_identity.fonts)} onChange={(value) => updateVisual("fonts", splitLines(value))} />
          <TextArea label="Aesthetic descriptors" value={joinLines(brandBrain.visual_identity.aesthetic_descriptors)} onChange={(value) => updateVisual("aesthetic_descriptors", splitLines(value))} />
          <TextArea label="Banned visual styles" value={joinLines(brandBrain.visual_identity.banned_visual_styles)} onChange={(value) => updateVisual("banned_visual_styles", splitLines(value))} />
          <TextArea label="Canva template categories" value={joinLines(brandBrain.visual_identity.canva_template_categories)} onChange={(value) => updateVisual("canva_template_categories", splitLines(value))} />
          <TextArea label="Moodboard URLs" value={joinLines(brandBrain.visual_identity.moodboard_urls)} onChange={(value) => updateVisual("moodboard_urls", splitLines(value))} />
          <TextArea label="Reference post URLs" value={joinLines(brandBrain.visual_identity.reference_post_urls)} onChange={(value) => updateVisual("reference_post_urls", splitLines(value))} />
          <TextArea label="Aesthetic screenshot URLs" value={joinLines(brandBrain.visual_identity.aesthetic_screenshot_urls)} onChange={(value) => updateVisual("aesthetic_screenshot_urls", splitLines(value))} />
          <TextField label="Logo URL" value={brandBrain.visual_identity.logo_url || ""} onChange={(value) => updateVisual("logo_url", value)} />
          <TextField label="Preferred content vibe" value={brandBrain.visual_identity.preferred_content_vibe} onChange={(value) => updateVisual("preferred_content_vibe", value)} />
        </div>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={ShieldCheck} title="Clinical Safety Rules" subtitle="Required disclaimers, safety checks, and approval scanning rules." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextArea label="Required disclaimers" value={joinLines(brandBrain.clinical_safety_rules.required_disclaimers)} onChange={(value) => updateSafety("required_disclaimers", splitLines(value))} />
          <TextArea label="Safety checks" value={joinLines(brandBrain.clinical_safety_rules.safety_checks)} onChange={(value) => updateSafety("safety_checks", splitLines(value))} />
          <TextArea label="Crisis resource reminders" value={joinLines(brandBrain.clinical_safety_rules.crisis_resource_reminders)} onChange={(value) => updateSafety("crisis_resource_reminders", splitLines(value))} />
          <div className="rounded-xl bg-[#f7f1e6] p-4">
            <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={brandBrain.clinical_safety_rules.avoid_diagnostic_certainty} onChange={(event) => updateSafety("avoid_diagnostic_certainty", event.target.checked)} /> Avoid diagnostic certainty</label>
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={brandBrain.clinical_safety_rules.avoid_overpromising} onChange={(event) => updateSafety("avoid_overpromising", event.target.checked)} /> Avoid overpromising</label>
          </div>
        </div>
      </section>

      <section className={sectionStyles}>
        <SectionTitle icon={Search} title="AI Instructions Layer" subtitle="Global rules for SEO, hooks, hashtags, emails, blogs, Canva directions, and conversion paths." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextArea label="SEO priorities" value={joinLines(brandBrain.seo_priorities)} onChange={(value) => update("seo_priorities", splitLines(value))} />
          <TextArea label="Preferred CTA styles" value={joinLines(brandBrain.preferred_cta_styles)} onChange={(value) => update("preferred_cta_styles", splitLines(value))} />
          <TextArea label="Preferred platforms" value={joinLines(brandBrain.preferred_platforms)} onChange={(value) => update("preferred_platforms", splitLines(value))} />
          <TextArea label="Content goals" value={joinLines(brandBrain.content_goals)} onChange={(value) => update("content_goals", splitLines(value))} />
          <TextArea label="Conversion priorities" value={joinLines(brandBrain.conversion_priorities)} onChange={(value) => update("conversion_priorities", splitLines(value))} />
        </div>
      </section>

      <div className="sticky bottom-20 z-20 rounded-2xl border border-[#d8c28a] bg-[#fffaf0]/95 p-4 shadow-premium backdrop-blur lg:bottom-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#20313f]">Save once. Every future content generator call inherits this identity and safety layer.</p>
          <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={save} disabled={saving}>
            <CheckCircle2 size={16} />
            {saving ? "Saving..." : "Save Brand Brain"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-[#77633c]">{message}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9dfcf] text-[#172a3a]"><Icon size={19} /></span>
      <div>
        <h2 className="text-xl font-bold text-[#172a3a]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#6f766f]">{subtitle}</p>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className={labelStyles}>{label}</span><input className={`${inputStyles} mt-1`} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className={labelStyles}>{label}</span><textarea className={`${inputStyles} mt-1 min-h-32`} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Slider({ label, left, right, value, onChange }: { label: string; left: string; right: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-xl bg-[#f7f1e6] p-4">
      <span className={labelStyles}>{label}</span>
      <input className="mt-4 w-full accent-[#b89b5e]" type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="mt-2 flex justify-between text-xs font-semibold text-[#7b7468]"><span>{left}</span><span>{right}</span></span>
    </label>
  );
}

function AudienceProfileCards({ profiles }: { profiles: EditableBrandBrain["audience_profiles"] }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {profiles.map((profile) => (
        <article key={profile.name} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#172a3a]">{profile.name}</h3>
          <CardField label="Goals" value={listText(profile.goals)} />
          <CardField label="Pain Points" value={listText(profile.pain_points)} />
          <CardField label="Language Style" value={profile.language_style || "Not set yet."} />
          <CardField label="Resonant Hooks" value={listText(profile.resonant_hooks)} />
        </article>
      ))}
    </div>
  );
}

function TherapyServiceCards({ services }: { services: EditableBrandBrain["therapy_services"] }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {services.map((service) => (
        <article key={service.name} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#172a3a]">{service.name}</h3>
          <CardField label="Target Audience" value={service.target_audience || "Not set yet."} />
          <CardField label="SEO Keywords" value={listText(service.seo_keywords)} />
          <CardField label="FAQs" value={listText(service.common_faqs)} />
          <CardField label="CTA" value={service.cta || "Not set yet."} />
        </article>
      ))}
    </div>
  );
}

function ProductCatalogCards({ products }: { products: EditableBrandBrain["product_catalog"] }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {products.map((product) => (
        <article key={product.name} className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#172a3a]">{product.name}</h3>
          <CardField label="Pain Points" value={listText(product.emotional_pain_points)} />
          <CardField label="Transformation Outcomes" value={product.transformation_outcome || "Not set yet."} />
          <CardField label="SEO Keywords" value={listText(product.seo_keywords)} />
          <CardField label="CTA" value={product.cta || "Not set yet."} />
        </article>
      ))}
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className={labelStyles}>{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#20313f]">{value}</p>
    </div>
  );
}

function JsonDetails({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="mt-5 rounded-2xl border border-[#eadfc8] bg-white/70 p-4">
      <summary className="cursor-pointer text-sm font-bold text-[#77633c]">{label}</summary>
      {children}
    </details>
  );
}

function JsonEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      className="mt-5 min-h-[360px] w-full rounded-xl border border-[#e6ddcf] bg-[#fffdf8] p-4 font-mono text-xs leading-5 text-[#20313f] outline-none focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
    />
  );
}
