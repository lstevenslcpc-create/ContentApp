"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Edit3, ExternalLink, Loader2, Palette, RefreshCw, RotateCcw, Search, Send, Sparkles } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import { CANVA_TEMPLATES, type CanvaTemplateRegistryItem } from "@/lib/canvaTemplates";
import { CopyButton } from "@/components/CopyButton";
import type { CanvaTemplate, ContentPack, ContentPackBody, ContentPackSectionKey, ContentStatus } from "@/lib/types";

const statuses: Array<ContentStatus | "all"> = ["all", "draft", "needs_review", "approved", "scheduled", "posted", "failed"];
const platforms = ["all", "Instagram", "TikTok/Reels", "Pinterest", "Threads", "Blog", "Email", "Canva"];
const campaignOptions = ["all", "teen anxiety", "burnout", "anxious attachment", "therapy education", "workbook promotion", "free lead magnet", "mental health product promo"];
const sectionOptions: Array<{ key: ContentPackSectionKey; label: string }> = [
  { key: "tiktok_reels_script", label: "TikTok/Reels script" },
  { key: "instagram_carousel_outline", label: "Carousel outline" },
  { key: "slide_by_slide_carousel_copy", label: "Carousel slides" },
  { key: "instagram_caption", label: "Instagram caption" },
  { key: "pinterest_pin_title", label: "Pinterest title" },
  { key: "pinterest_description", label: "Pinterest description" },
  { key: "threads_post", label: "Threads post" },
  { key: "blog_outline", label: "Blog outline" },
  { key: "email_newsletter_blurb", label: "Newsletter blurb" },
  { key: "canva_visual_direction", label: "Canva visual direction" },
  { key: "product_cta", label: "Product CTA" },
  { key: "therapy_service_cta", label: "Therapy service CTA" },
  { key: "safety_disclaimer", label: "Safety disclaimer" }
];

type Filters = {
  status: string;
  platform: string;
  campaign: string;
  date: string;
  cta: string;
  query: string;
};

type CanvaTemplateMatch = {
  template: CanvaTemplate;
  registry?: CanvaTemplateRegistryItem;
  score: number;
  reason: string;
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

function packText(pack: ContentPack) {
  return Object.values(pack.pack || {}).join("\n").toLowerCase();
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function splitList(value: string | null | undefined) {
  return normalizeText(value)
    .split(/[,·\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function registryForTemplate(template?: CanvaTemplate | null) {
  if (!template) return undefined;
  const name = normalizeText(template.template_name);
  const url = normalizeText(template.canva_template_link);
  return CANVA_TEMPLATES.find((item) => normalizeText(item.template_url) === url || normalizeText(item.name) === name);
}

function packMatchingContext(pack: ContentPack) {
  return [
    pack.title,
    pack.source_topic,
    pack.audience,
    pack.content_pillar,
    pack.product_tie_in,
    pack.service_tie_in,
    pack.clinical_sensitivity,
    pack.pack.instagram_carousel_outline,
    pack.pack.slide_by_slide_carousel_copy,
    pack.pack.instagram_caption,
    pack.pack.pinterest_pin_title,
    pack.pack.pinterest_description,
    pack.pack.tiktok_reels_script,
    pack.pack.canva_visual_direction,
    pack.pack.product_cta,
    pack.pack.therapy_service_cta
  ].join(" ").toLowerCase();
}

function countMatches(context: string, values: string[] | undefined, weight: number) {
  return (values || []).reduce((score, value) => score + (context.includes(normalizeText(value)) ? weight : 0), 0);
}

function scoreTemplateForPack(pack: ContentPack, template: CanvaTemplate): CanvaTemplateMatch {
  const registry = registryForTemplate(template);
  const context = packMatchingContext(pack);
  const recommended = splitList((template.recommended_for || []).join(","));
  const audience = splitList(template.audience_fit);
  const pillars = splitList(template.content_pillar_fit);
  const useCases = splitList(template.best_use_case);
  let score = 34;
  const reasons: string[] = [];

  const bestForScore = countMatches(context, registry?.best_for || recommended, 16);
  if (bestForScore) reasons.push("matches the topic and campaign language");
  score += bestForScore;

  const audienceScore = countMatches(context, registry?.audience || audience, 8);
  if (audienceScore) reasons.push("fits the intended audience");
  score += audienceScore;

  const pillarScore = countMatches(context, registry?.content_pillars || pillars, 9);
  if (pillarScore) reasons.push("supports this content pillar");
  score += pillarScore;

  const useCaseScore = countMatches(context, useCases, 7);
  if (useCaseScore) reasons.push("aligns with the product or service CTA");
  score += useCaseScore;

  if (context.includes("anxious attachment") && normalizeText(template.template_name).includes("emotional hook")) {
    score += 26;
    reasons.unshift("is designed for emotionally specific anxious attachment recognition");
  }
  if ((context.includes("teen") || context.includes("school")) && normalizeText(template.template_name).includes("teen")) score += 24;
  if ((context.includes("pinterest") || context.includes("seo")) && normalizeText(template.format_type).includes("pinterest")) score += 20;
  if ((context.includes("blog") || context.includes("website")) && normalizeText(template.template_name).includes("blog")) score += 20;
  if ((context.includes("reel") || context.includes("tiktok") || context.includes("video")) && normalizeText(template.format_type).includes("reel")) score += 20;
  if ((context.includes("workbook") || context.includes("journal") || context.includes("coloring book")) && normalizeText(template.template_name).includes("workbook")) score += 22;
  if (normalizeText(template.approval_status) === "approved") score += 5;

  const finalScore = Math.max(0, Math.min(98, Math.round(score)));
  return {
    template,
    registry,
    score: finalScore,
    reason: reasons.length
      ? `Chosen because this template ${Array.from(new Set(reasons)).join(", ")}.`
      : "Chosen because it is an approved LionHeart template with the closest fit to this pack."
  };
}

function bestTemplateMatch(pack: ContentPack, templates: CanvaTemplate[]) {
  if (!templates.length) return null;
  return templates
    .map((template) => scoreTemplateForPack(pack, template))
    .sort((a, b) => b.score - a.score)[0];
}

function cleanLine(value: string, fallback: string) {
  const line = value
    .split("\n")
    .map((item) => item.replace(/^[-*\d.\s]+/, "").trim())
    .find(Boolean);
  return line || fallback;
}

function sentence(value: string, fallback: string) {
  const match = value.match(/[^.!?\n]+[.!?]?/);
  return (match?.[0] || fallback).trim();
}

function isAnxiousAttachmentPack(pack: ContentPack) {
  return packMatchingContext(pack).includes("anxious attachment");
}

function emotionalHookCarouselFillPackage(pack: ContentPack, cta: string) {
  if (isAnxiousAttachmentPack(pack)) {
    return {
      slide1_hook: "When their tone changes and your whole body starts looking for what went wrong",
      slide1_subhook: "An anxious attachment response can feel like panic before you even know what you are afraid of.",
      slide2_recognition: "You might reread the text.\nReplay the conversation.\nCheck their face.\nTry to fix the mood before anyone says there is a problem.",
      slide3_nervous_system_explanation: "Your nervous system is not being dramatic.\nIt may be scanning for distance, rejection, or emotional danger based on what felt unsafe before.",
      slide4_examples: "It can sound like:\n\"Are they mad at me?\"\n\"Did I say too much?\"\n\"Why do they feel different?\"\n\"I need to make this okay right now.\"",
      slide5_reframe: "The trigger is not proof that you are too needy.\nIt is information: something in you is asking for steadiness, clarity, and reassurance.",
      slide6_healing_message: "You can learn to pause before pursuing.\nName the fear underneath the urgency.\nAsk for connection without abandoning yourself.",
      slide7_cta: cta || "Save this for the next time a small shift feels bigger than it should."
    };
  }

  const topic = pack.title || "the emotional pattern you keep minimizing";
  return {
    slide1_hook: topic,
    slide1_subhook: "If this feels personal, it may be because your body recognized the pattern before your mind had words for it.",
    slide2_recognition: "You may look calm on the outside while quietly managing fear, pressure, resentment, or overwhelm on the inside.",
    slide3_nervous_system_explanation: "Your nervous system can turn old emotional patterns into automatic responses: overexplaining, shutting down, people pleasing, or bracing for conflict.",
    slide4_examples: "It can look like:\nchecking for tone shifts\napologizing too quickly\nsaying yes when you mean no\nfeeling exhausted after normal conversations",
    slide5_reframe: "This is not a character flaw.\nIt is a signal that something in your emotional system has been working too hard for too long.",
    slide6_healing_message: "Support can help you notice the pattern sooner, respond with more choice, and build language for what you actually need.",
    slide7_cta: cta || "Save this as a gentle reminder to notice the pattern, not shame yourself for having it."
  };
}

function canvaFillPackage(pack: ContentPack, template?: CanvaTemplate | null) {
  const registry = registryForTemplate(template);
  const body = pack.pack || {} as ContentPackBody;
  const title = pack.title;
  const carousel = body.slide_by_slide_carousel_copy || body.instagram_carousel_outline || "";
  const caption = body.instagram_caption || "";
  const cta = body.product_cta || body.therapy_service_cta || "Save this for later, and reach out when you are ready for support.";
  const visual = body.canva_visual_direction || "Use a calm LionHeart Therapy visual style with soft cream, sage, muted navy, and emotionally grounded spacing.";

  if (registry?.id === "emotional-hook-carousel") {
    return emotionalHookCarouselFillPackage(pack, cta);
  }

  const values: Record<string, string> = {
    title,
    hook: cleanLine(body.instagram_carousel_outline || body.tiktok_reels_script || title, title),
    subtitle: sentence(caption, "A LionHeart Therapy resource for emotionally specific support."),
    visual_direction: visual,
    cta,
    product_cta: body.product_cta || cta,
    therapy_cta: body.therapy_service_cta || cta,
    pinterest_title: body.pinterest_pin_title || title,
    pinterest_description: body.pinterest_description || caption,
    caption,
    carousel_slides: carousel,
    cover_hook: cleanLine(body.tiktok_reels_script || title, title),
    cover_subhook: sentence(body.tiktok_reels_script || caption, "A therapist POV for the moment you cannot quite explain."),
    video_series_label: pack.content_pillar || "Therapist POV",
    therapist_pov_line: sentence(body.tiktok_reels_script || caption, "If this feels familiar, your body may be trying to keep you safe."),
    visual_mood: visual,
    cta_microcopy: cta,
    pin_title: body.pinterest_pin_title || title,
    pin_subtitle: sentence(body.pinterest_description || caption, "Save this for later."),
    seo_title: body.pinterest_pin_title || title,
    seo_subtitle: sentence(body.pinterest_description || caption, "Therapist-written insight for real-life mental health questions."),
    blog_category: pack.content_pillar || "Therapy Education",
    key_question: title,
    three_takeaways: body.blog_outline || carousel || caption,
    service_or_product_tie_in: [pack.product_tie_in, pack.service_tie_in].filter(Boolean).join(" · ") || cta,
    website_cta: cta,
    product_name: pack.product_tie_in || "LionHeart Therapy resource",
    product_hook: cleanLine(body.product_cta || title, title),
    pain_point: sentence(caption || carousel, "Feeling overwhelmed, anxious, or unsure where to start."),
    transformation_outcome: "More language, clarity, and grounded next steps.",
    inside_the_product: body.product_cta || "Practical prompts, reflection support, and emotionally specific guidance.",
    best_for: pack.audience || "LionHeart Therapy audience",
    seasonal_angle: pack.content_pillar || "evergreen mental health support"
  };

  return (registry?.fields || ["hook", "subtitle", "visual_direction", "cta"]).reduce<Record<string, string>>((fields, field) => {
    fields[field] = values[field] || values[field.replace(/^slide\d+_/, "")] || visual;
    return fields;
  }, {});
}

function formatFillPackage(fillPackage: Record<string, string>) {
  return Object.entries(fillPackage)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n\n");
}

function slideTextFromFillPackage(fillPackage: Record<string, string>) {
  return Object.entries(fillPackage)
    .filter(([key]) => key.startsWith("slide"))
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n\n") || formatFillPackage(fillPackage);
}

function platformMatches(pack: ContentPack, platform: string) {
  if (platform === "all") return true;
  const text = packText(pack);
  const needle = platform.toLowerCase();
  if (needle === "tiktok/reels") return text.includes("tiktok") || text.includes("reel");
  return text.includes(needle.toLowerCase());
}

function canvaBrief(pack: ContentPack, template?: CanvaTemplate | null) {
  const body = pack.pack || {} as ContentPackBody;
  const carouselSlides = body.slide_by_slide_carousel_copy || body.instagram_carousel_outline || "";
  const pinterest = [body.pinterest_pin_title, body.pinterest_description].filter(Boolean).join("\n\n");
  const coverText = body.tiktok_reels_script?.split(/[.\n]/)[0] || pack.title;
  const palette = "Muted navy, soft cream, sage, muted gold, clean white space.";
  const layoutNotes = "Use generous margins, high contrast readable text, minimal clutter, and wellness-editorial spacing. Keep @LHtherapy visible but subtle.";
  return {
    carouselSlides,
    pinterest,
    caption: body.instagram_caption || "",
    full: [
      `Title: ${pack.title}`,
      `Approved Canva template: ${template?.template_name || "Choose an approved LionHeart template"}`,
      template?.canva_template_link ? `Canva template link: ${template.canva_template_link}` : "",
      `Campaign: ${pack.content_pillar || "campaign focus"}`,
      `Instagram carousel slide text:\n${carouselSlides}`,
      `Pinterest pin text:\n${pinterest}`,
      `Reel/TikTok cover text:\n${coverText}`,
      `Canva design brief:\n${body.canva_visual_direction || "Create a calm LionHeart Therapy branded asset."}`,
      `Visual direction:\n${body.canva_visual_direction || ""}`,
      `Color palette:\n${template?.color_palette || palette}`,
      `Font vibe:\n${template?.font_style || "clean editorial, readable, feminine-neutral"}`,
      `Graphics:\n${template?.graphic_style || "minimal line accents, soft textures, grounded wellness imagery"}`,
      `Image direction:\n${template?.best_use_case || body.canva_visual_direction || "realistic lifestyle or notebook-style therapy visuals"}`,
      `Layout notes:\n${template?.notes || layoutNotes}`,
      `CTA placement:\n${body.product_cta || body.therapy_service_cta || "Place CTA on final slide and caption close."}`,
      "@LHtherapy placement: lower corner or final slide footer, never competing with the main message.",
      "Avoid: generic AI stock imagery, neon gradients, cluttered text, guru-style wellness language, and off-brand color palettes."
    ].join("\n\n"),
    coverText,
    palette,
    layoutNotes
  };
}

function designStatus(pack: ContentPack) {
  const metadataStatus = pack.metadata && typeof pack.metadata.canvaPrepStatus === "string" ? pack.metadata.canvaPrepStatus : "";
  return pack.design_status || metadataStatus || "not_started";
}

function metadataString(pack: ContentPack, key: string) {
  return pack.metadata && typeof pack.metadata[key] === "string" ? String(pack.metadata[key]) : "";
}

function metadataNumber(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return typeof value === "number" ? value : 0;
}

function metadataRecord(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string> : {};
}

function metadataWithCanva(pack: ContentPack, status: "ready_for_canva" | "design_started" | "designed_in_canva", template?: CanvaTemplate | null, match?: CanvaTemplateMatch | null) {
  const activeMatch = match || (template ? scoreTemplateForPack(pack, template) : null);
  const activeTemplate = template || activeMatch?.template || null;
  const fillPackage = activeTemplate ? canvaFillPackage(pack, activeTemplate) : {};
  return {
    ...(pack.metadata || {}),
    canvaPrepStatus: status,
    canvaBrief: canvaBrief(pack, activeTemplate),
    selectedCanvaTemplateId: activeTemplate?.id || metadataString(pack, "selectedCanvaTemplateId") || null,
    selectedCanvaTemplateName: activeTemplate?.template_name || metadataString(pack, "selectedCanvaTemplateName") || null,
    selectedCanvaTemplateLink: activeTemplate?.canva_template_link || metadataString(pack, "selectedCanvaTemplateLink") || null,
    canvaTemplateMatchScore: activeMatch?.score || null,
    canvaTemplateMatchReason: activeMatch?.reason || null,
    canvaTemplateRegistryId: activeMatch?.registry?.id || null,
    canvaFillPackage: fillPackage,
    canvaFillPackageVersion: 2,
    canvaPrepUpdatedAt: new Date().toISOString()
  };
}

export function ApprovalReviewClient() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: "all", platform: "all", campaign: "all", date: "", cta: "all", query: "" });
  const [selectedId, setSelectedId] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSection, setSelectedSection] = useState<ContentPackSectionKey>("instagram_caption");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadPacks() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch("/api/content-packs");
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to load content packs.");
      return;
    }
    const nextPacks = Array.isArray(data.packs) ? data.packs as ContentPack[] : [];
    setPacks(nextPacks);
    setSelectedId((current) => current || nextPacks[0]?.id || "");
  }

  async function loadTemplates() {
    const response = await authedFetch("/api/canva-templates?status=approved");
    const data = await readApiResponse(response);
    if (response.ok) {
      const nextTemplates = Array.isArray(data.templates) ? data.templates as CanvaTemplate[] : [];
      setTemplates(nextTemplates);
      setSelectedTemplateId((current) => current || nextTemplates[0]?.id || "");
    }
  }

  useEffect(() => {
    void loadPacks();
    void loadTemplates();
  }, []);

  const filtered = useMemo(() => packs.filter((pack) => {
    const text = `${pack.title} ${pack.audience || ""} ${pack.content_pillar || ""} ${pack.product_tie_in || ""} ${pack.service_tie_in || ""} ${packText(pack)}`.toLowerCase();
    if (filters.status !== "all" && pack.status !== filters.status) return false;
    if (!platformMatches(pack, filters.platform)) return false;
    if (filters.campaign !== "all" && !text.includes(filters.campaign.toLowerCase())) return false;
    if (filters.cta !== "all") {
      if (filters.cta === "product" && !pack.product_tie_in) return false;
      if (filters.cta === "service" && !pack.service_tie_in) return false;
      if (filters.cta === "none" && (pack.product_tie_in || pack.service_tie_in)) return false;
    }
    if (filters.date && !String(pack.created_at || "").startsWith(filters.date)) return false;
    if (filters.query && !text.includes(filters.query.toLowerCase())) return false;
    return true;
  }), [filters, packs]);

  const selected = filtered.find((pack) => pack.id === selectedId) || filtered[0] || packs.find((pack) => pack.id === selectedId) || null;
  const recommendedMatch = selected ? bestTemplateMatch(selected, templates) : null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || (selected ? templates.find((template) => template.id === metadataString(selected, "selectedCanvaTemplateId")) : null) || recommendedMatch?.template || null;
  const selectedTemplateMatch = selected && selectedTemplate ? scoreTemplateForPack(selected, selectedTemplate) : recommendedMatch;
  const brief = selected ? canvaBrief(selected, selectedTemplate) : null;
  const fillPackage = selected && selectedTemplate ? canvaFillPackage(selected, selectedTemplate) : {};
  const savedFillPackage = selected && metadataString(selected, "selectedCanvaTemplateId") === selectedTemplate?.id && metadataNumber(selected, "canvaFillPackageVersion") >= 2 ? metadataRecord(selected, "canvaFillPackage") : {};
  const visibleFillPackage = Object.keys(savedFillPackage).length ? savedFillPackage : fillPackage;

  useEffect(() => {
    if (!selected || !templates.length) return;
    const savedTemplateId = metadataString(selected, "selectedCanvaTemplateId");
    const recommended = bestTemplateMatch(selected, templates);
    const savedTemplate = templates.find((template) => template.id === savedTemplateId);
    const savedScore = savedTemplate ? scoreTemplateForPack(selected, savedTemplate).score : 0;
    const shouldPreferRecommended = recommended && (!savedTemplate || recommended.score >= savedScore + 10);
    const recommendedTemplateId = recommended?.template.id || "";
    const nextTemplateId = savedTemplateId || recommendedTemplateId || templates[0]?.id || "";
    const preferredTemplateId = shouldPreferRecommended ? recommendedTemplateId : nextTemplateId;
    setSelectedTemplateId((current) => current === preferredTemplateId ? current : preferredTemplateId);
  }, [selected, templates]);

  async function patchPack(packId: string, updates: Record<string, unknown>, success: string) {
    setBusy(`${packId}:${JSON.stringify(updates)}`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update content pack.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((pack) => pack.id === packId ? updated : pack));
    setSelectedId(packId);
    setMessage(success);
  }

  async function regenerate(packId: string, sectionKey: ContentPackSectionKey) {
    setBusy(`${packId}:regen`);
    setMessage("");
    const response = await authedFetch(`/api/content-packs/${packId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to regenerate section.");
      return;
    }
    const updated = data.pack as ContentPack;
    setPacks((current) => current.map((pack) => pack.id === packId ? updated : pack));
    setSelectedId(packId);
    setMessage("Section regenerated.");
  }

  async function schedule(pack: ContentPack) {
    setBusy(`${pack.id}:schedule`);
    setMessage("");
    const response = await authedFetch("/api/content-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentPackId: pack.id,
        plannedDate: scheduleDate,
        status: "approved",
        campaignLabel: pack.content_pillar || "therapy education",
        focusLabel: pack.audience || "",
        seasonalPrompt: "",
        notes: "Scheduled from Approval Review."
      })
    });
    const data = await readApiResponse(response);
    setBusy("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to schedule content pack.");
      return;
    }
    await patchPack(pack.id, { status: "scheduled" }, "Content pack scheduled on the calendar.");
  }

  async function selectTemplateForPack(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!selected || !templateId) return;
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    const match = scoreTemplateForPack(selected, template);
    await patchPack(selected.id, {
      canvaTemplateId: template.id,
      metadata: metadataWithCanva(selected, designStatus(selected) === "not_started" ? "ready_for_canva" : designStatus(selected) as "ready_for_canva" | "design_started" | "designed_in_canva", template, match)
    }, "Canva template selection saved.");
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <CheckCircle2 size={14} />
              Approval Review + Canva Prep
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">Approve content before it moves into design, calendar, or manual posting.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">Review every generated pack, tighten the copy, prep Canva instructions, and keep approval separate from auto-posting.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">Review queue</p>
            <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={statuses} />
          <FilterSelect label="Platform" value={filters.platform} onChange={(value) => setFilters((current) => ({ ...current, platform: value }))} options={platforms} />
          <FilterSelect label="Campaign/focus" value={filters.campaign} onChange={(value) => setFilters((current) => ({ ...current, campaign: value }))} options={campaignOptions} />
          <FilterSelect label="Product/service CTA" value={filters.cta} onChange={(value) => setFilters((current) => ({ ...current, cta: value }))} options={["all", "product", "service", "none"]} />
          <label>
            <span className="label">Date</span>
            <input className="field mt-1" type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            <span className="label">Search</span>
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input className="w-full bg-transparent text-sm outline-none" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="keyword" />
            </span>
          </label>
        </div>
      </section>

      {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-[#6f766f]"><Loader2 className="mx-auto mb-3 animate-spin" />Loading approval queue...</div>
          ) : filtered.length ? filtered.map((pack) => (
            <PackReviewCard
              key={pack.id}
              pack={pack}
              selected={selected?.id === pack.id}
              busy={busy.startsWith(pack.id)}
              onSelect={() => setSelectedId(pack.id)}
              onApprove={() => patchPack(pack.id, { status: "approved" }, "Content pack approved.")}
              onDraft={() => patchPack(pack.id, { status: "draft" }, "Content pack sent back to draft.")}
              onNeedsReview={() => patchPack(pack.id, { status: "needs_review" }, "Content pack marked needs review.")}
              onCanva={() => {
                const match = bestTemplateMatch(pack, templates);
                patchPack(pack.id, { canvaTemplateId: match?.template.id || selectedTemplate?.id || null, metadata: metadataWithCanva(pack, "ready_for_canva", match?.template || selectedTemplate, match) }, "Content pack sent to Canva Prep with Canva template match saved.");
              }}
              onDesignStarted={() => {
                const match = bestTemplateMatch(pack, templates);
                patchPack(pack.id, { canvaTemplateId: selectedTemplate?.id || match?.template.id || null, designStatus: "design_started", metadata: metadataWithCanva(pack, "design_started", selectedTemplate || match?.template, selectedTemplateMatch || match) }, "Design marked started.");
              }}
              onDesigned={() => {
                const match = bestTemplateMatch(pack, templates);
                patchPack(pack.id, { canvaTemplateId: selectedTemplate?.id || match?.template.id || null, designStatus: "designed_in_canva", metadata: metadataWithCanva(pack, "designed_in_canva", selectedTemplate || match?.template, selectedTemplateMatch || match) }, "Marked as designed in Canva.");
              }}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              onSchedule={() => schedule(pack)}
            />
          )) : (
            <div className="rounded-3xl border border-dashed border-[#d8c28a] bg-white p-8 text-center">
              <p className="text-lg font-bold text-[#172a3a]">No content packs match these filters.</p>
              <p className="mt-2 text-sm text-[#6f766f]">Create a Content Pack from Content Intelligence, then review it here before Canva or scheduling.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {selected && brief ? (
            <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]"><Palette size={14} /> Canva Prep</p>
                  <h2 className="mt-3 text-xl font-bold leading-tight text-[#172a3a]">{selected.title}</h2>
                </div>
                <StatusBadge status={designStatus(selected)} />
              </div>

              <div className="mt-4 grid gap-2">
                <label>
                  <span className="label">Choose approved Canva template</span>
                  <select className="field mt-1" value={selectedTemplateId} onChange={(event) => void selectTemplateForPack(event.target.value)}>
                    <option value="">No approved template selected</option>
                    {templates.map((template) => <option key={template.id} value={template.id}>{template.template_name} · {template.format_type}</option>)}
                  </select>
                </label>
                {recommendedMatch ? (
                  <div className="rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Recommended Template</p>
                    <h3 className="mt-2 text-lg font-bold text-[#172a3a]">{recommendedMatch.template.template_name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]">Match Score: {recommendedMatch.score}</span>
                      <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{recommendedMatch.template.format_type}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6f766f]">{recommendedMatch.reason}</p>
                    {recommendedMatch.template.canva_template_link && <a className="btn-secondary mt-3" href={recommendedMatch.template.canva_template_link} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Canva Template</a>}
                  </div>
                ) : null}
                {selectedTemplateMatch ? (
                  <div className="rounded-2xl bg-[#eef3ec] p-4 text-sm leading-6 text-[#4f6f5a]">
                    <strong>Selected match:</strong> {selectedTemplateMatch.score} · {selectedTemplateMatch.reason}
                    {selected && metadataNumber(selected, "canvaTemplateMatchScore") ? <span> Saved score: {metadataNumber(selected, "canvaTemplateMatchScore")}.</span> : null}
                  </div>
                ) : null}
                {selectedTemplate?.canva_template_link && <a className="btn-secondary" href={selectedTemplate.canva_template_link} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open Canva Template</a>}
                <CopyButton text={brief.full} label="Copy Full Canva Brief" />
                <CopyButton text={brief.full} label="Copy Canva Prompt" />
                <CopyButton text={formatFillPackage(visibleFillPackage)} label="Copy Full Canva Fill Package" />
                <CopyButton text={slideTextFromFillPackage(visibleFillPackage)} label="Copy Slide Text" />
                <CopyButton text={brief.carouselSlides} label="Copy Carousel Slides" />
                <CopyButton text={brief.pinterest} label="Copy Pinterest Details" />
                <CopyButton text={brief.caption} label="Copy Caption" />
              </div>

              <PrepBlock title="Canva Fill Package" value={formatFillPackage(visibleFillPackage)} />
              <PrepBlock title="Instagram carousel slide text" value={brief.carouselSlides} />
              <PrepBlock title="Pinterest pin text" value={brief.pinterest} />
              <PrepBlock title="Reel/TikTok cover text" value={brief.coverText} />
              <PrepBlock title="Canva design brief" value={selected.pack.canva_visual_direction || "Create a calm LionHeart Therapy branded visual."} />
              <PrepBlock title="Color palette" value={brief.palette} />
              <PrepBlock title="Approved template" value={selectedTemplate ? `${selectedTemplate.template_name}\n${selectedTemplate.format_type}\n${selectedTemplate.canva_template_link}` : "Choose an approved Canva template from the library."} />
              <PrepBlock title="Layout notes" value={brief.layoutNotes} />
              <PrepBlock title="CTA placement" value={selected.pack.product_cta || selected.pack.therapy_service_cta || "Final slide and caption close."} />
              <PrepBlock title="@LHtherapy placement" value="Lower corner or final slide footer, visible but subtle." />

              <div className="mt-5 grid gap-2">
                <label>
                  <span className="label">Regenerate section</span>
                  <select className="field mt-1" value={selectedSection} onChange={(event) => setSelectedSection(event.target.value as ContentPackSectionKey)}>
                    {sectionOptions.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}
                  </select>
                </label>
                <button className="btn-secondary" onClick={() => regenerate(selected.id, selectedSection)} disabled={busy.startsWith(selected.id)}>
                  {busy.startsWith(selected.id) ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Regenerate Section
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field mt-1 capitalize" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}

function PackReviewCard({ pack, selected, busy, onSelect, onApprove, onDraft, onNeedsReview, onCanva, onDesignStarted, onDesigned, scheduleDate, setScheduleDate, onSchedule }: {
  pack: ContentPack;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDraft: () => void;
  onNeedsReview: () => void;
  onCanva: () => void;
  onDesignStarted: () => void;
  onDesigned: () => void;
  scheduleDate: string;
  setScheduleDate: (value: string) => void;
  onSchedule: () => void;
}) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${selected ? "border-[#b89b5e] ring-4 ring-[#eadfc8]" : "border-[#e9dfcf]"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <button className="text-left" onClick={onSelect}>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={pack.status} />
            <StatusBadge status={designStatus(pack)} />
            {pack.content_pillar && <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-bold text-[#4f6f5a]">{pack.content_pillar}</span>}
          </div>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-[#172a3a]">{pack.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6f766f]">{pack.audience || "LionHeart audience"} · {[pack.product_tie_in, pack.service_tie_in].filter(Boolean).join(" · ") || "CTA review needed"}</p>
        </button>
        <Link className="btn-secondary shrink-0" href={`/content-packs/${pack.id}`}><Edit3 size={16} />Edit Content</Link>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={onApprove} disabled={busy}><CheckCircle2 size={16} />Approve</button>
        <button className="btn-secondary" onClick={onDraft} disabled={busy}><RotateCcw size={16} />Send to Draft</button>
        <button className="btn-secondary" onClick={onNeedsReview} disabled={busy}><Sparkles size={16} />Needs Review</button>
        <button className="btn-secondary" onClick={onCanva} disabled={busy}><Send size={16} />Send to Canva Prep</button>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8] lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label>
          <span className="label">Schedule on calendar</span>
          <input className="field mt-1" type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
        </label>
        <button className="btn-secondary" onClick={onSchedule} disabled={busy}><CalendarPlus size={16} />Schedule</button>
        <button className="btn-secondary" onClick={onDesignStarted} disabled={busy}><Palette size={16} />Mark Design Started</button>
        <button className="btn-secondary border-[#d8c28a] text-[#77633c]" onClick={onDesigned} disabled={busy}><Palette size={16} />Mark Designed</button>
      </div>
    </article>
  );
}

function PrepBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#eadfc8]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#20313f]">{value || "Not provided yet."}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#f7f1e6] text-[#77633c]",
    needs_review: "bg-[#fff4d8] text-[#8a6926]",
    approved: "bg-[#eef3ec] text-[#4f6f5a]",
    scheduled: "bg-blue-50 text-blue-700",
    posted: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
    not_started: "bg-slate-100 text-slate-600",
    ready_for_canva: "bg-[#eee8fb] text-[#4d3a7a]",
    design_started: "bg-[#fff4d8] text-[#8a6926]",
    designed_in_canva: "bg-[#eef3ec] text-[#4f6f5a]"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status] || styles.draft}`}>{status.replaceAll("_", " ")}</span>;
}
