import type { BrandBrain, ContentPack, ContentPackSectionKey, GeneratedContent } from "./types";
import { formatCompactBrandBrainForPrompt } from "./brandBrain/format";
import { applyLionHeartVoiceGuidance } from "./lionheartVoiceLibrary";
import { assessTopicFidelity, attachmentTopicRepairCopy, topicFidelityInstruction } from "./topicFidelity";

export type ContentImproveAction =
  | "regenerate_hook"
  | "regenerate_caption"
  | "regenerate_hashtags"
  | "make_more_emotional"
  | "make_more_clinical"
  | "make_less_salesy"
  | "add_real_life_examples"
  | "shorten_caption"
  | "rewrite_instagram"
  | "rewrite_tiktok"
  | "rewrite_pinterest"
  | "rewrite_carousel"
  | "regenerate_to_match_topic";

export type CanvaSlideImproveAction =
  | "regenerate_slide"
  | "shorten_slide"
  | "make_slide_more_emotional"
  | "make_slide_clearer";

export type GeneratedContentRevision = {
  hook?: string | null;
  caption?: string | null;
  hashtags?: string[];
  visual_idea?: string | null;
  script?: string | null;
  platform?: string | null;
  content_type?: string | null;
  changedAt: string;
  action: string;
};

export type ContentPackRevision = {
  pack?: Record<string, string>;
  canvaFillPackage?: Record<string, string>;
  changedAt: string;
  action: string;
  sectionKey?: string;
  fieldKey?: string;
};

type ChatJson = {
  choices?: Array<{
    message?: {
      content?: string | null;
    } | null;
  }>;
};

function removeEmDashes(value: string) {
  return value.replaceAll("—", ".").replace(/\s+\./g, ".").replace(/\.\s*\./g, ".");
}

function removeEmDashesDeep<T>(value: T): T {
  if (typeof value === "string") return removeEmDashes(value) as T;
  if (Array.isArray(value)) return value.map((item) => removeEmDashesDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, removeEmDashesDeep(item)])) as T;
  }
  return value;
}

function extractJson(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>;
    throw new Error("OpenAI returned invalid JSON for the targeted edit.");
  }
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function actionInstruction(action: ContentImproveAction) {
  const instructions: Record<ContentImproveAction, string> = {
    regenerate_hook: "Rewrite only the hook. Make it specific, emotionally recognizable, and social-native.",
    regenerate_caption: "Rewrite only the caption. Keep the same topic, goal, and therapist-led voice.",
    regenerate_hashtags: "Rewrite only the hashtags. Use relevant, non-spammy hashtags.",
    make_more_emotional: "Make the content warmer, more emotionally specific, and more relatable without becoming dramatic.",
    make_more_clinical: "Make the content more clinical, psychoeducational, and therapist-led while staying readable.",
    make_less_salesy: "Remove pushy sales language. Keep the CTA gentle, useful, and aligned with the content goal.",
    add_real_life_examples: "Add one or two concrete daily-life examples, behaviors, thoughts, or body signs.",
    shorten_caption: "Shorten the caption while preserving the hook, core insight, and CTA.",
    rewrite_instagram: "Rewrite for Instagram. Prioritize carousel or caption readability, saves, and comments.",
    rewrite_tiktok: "Rewrite for TikTok or Reels. Make it punchy, spoken, and creator-native.",
    rewrite_pinterest: "Rewrite for Pinterest. Make it searchable, clear, and save-worthy.",
    rewrite_carousel: "Rewrite as Canva-ready Instagram carousel slide copy with concise slide text.",
    regenerate_to_match_topic: "Regenerate the hook, caption, visual idea, and script only as needed so the content matches the requested topic exactly. Keep the same platform, content type, and goal."
  };
  return instructions[action];
}

function slideInstruction(action: CanvaSlideImproveAction) {
  const instructions: Record<CanvaSlideImproveAction, string> = {
    regenerate_slide: "Regenerate this one Canva slide field with finished slide copy.",
    shorten_slide: "Make this one Canva slide field shorter and easier to fit on a slide.",
    make_slide_more_emotional: "Make this one Canva slide field more emotionally specific and resonant.",
    make_slide_clearer: "Make this one Canva slide field clearer, simpler, and easier to understand."
  };
  return instructions[action];
}

async function createOpenAiJson(userPrompt: string, maxTokens = 700) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing. Add it before using targeted editing.");

  const { default: OpenAIClient } = await import("openai");
  const client = new OpenAIClient({ apiKey });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.58,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Return only valid JSON. You are editing LionHeart Therapy content. Preserve clinical safety, warmth, and specificity. Avoid em dashes completely. Do not use —."
      },
      { role: "user", content: userPrompt }
    ]
  }) as ChatJson;

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty targeted editing response.");
  return removeEmDashesDeep(extractJson(raw));
}

export function generatedRevisionSnapshot(item: GeneratedContent, action: string): GeneratedContentRevision {
  return {
    hook: item.hook,
    caption: item.caption,
    hashtags: item.hashtags || [],
    visual_idea: item.visual_idea,
    script: item.script,
    platform: item.platform,
    content_type: item.content_type,
    changedAt: new Date().toISOString(),
    action
  };
}

export function pushRevisionHistory(existing: unknown, revision: GeneratedContentRevision) {
  const base = existing && typeof existing === "object" && !Array.isArray(existing) ? existing as Record<string, unknown> : {};
  const current = Array.isArray(base.revision_history) ? base.revision_history : [];
  return {
    ...base,
    revision_history: [...current.slice(-9), revision],
    last_revision_action: revision.action,
    last_revision_at: revision.changedAt
  };
}

export async function improveGeneratedContent(item: GeneratedContent, action: ContentImproveAction, brandBrain?: BrandBrain | null) {
  const current = {
    topic: item.topic,
    platform: item.platform,
    contentType: item.content_type,
    contentGoal: item.content_goal,
    angle: item.content_angle,
    hook: item.hook,
    caption: item.caption,
    hashtags: item.hashtags || [],
    visualIdea: item.visual_idea,
    script: item.script,
    whyThisWorks: item.why_this_works
  };

  const result = await createOpenAiJson(`
Targeted edit action:
${actionInstruction(action)}

Brand Brain summary:
${formatCompactBrandBrainForPrompt(brandBrain)}

${applyLionHeartVoiceGuidance({
  topic: item.topic,
  goal: item.content_goal,
  platform: item.platform,
  contentType: item.content_type
})}

${topicFidelityInstruction(String(item.topic || ""))}

Current content:
${JSON.stringify(current, null, 2)}

Rules:
- Update only the fields needed for the requested action.
- Keep the content specific to LionHeart Therapy and the topic.
- The requested topic is ${item.topic || "the saved topic"}. Do not drift into a related but different topic.
- For attachment topics, preserve the exact attachment style. Avoidant, anxious, secure, and disorganized attachment are not interchangeable.
- Avoid generic therapy filler, guru language, and guaranteed outcomes.
- Avoid em dashes completely.
- Return JSON only.

Return this shape:
{
  "hook": "only if changed",
  "caption": "only if changed",
  "hashtags": ["only", "if", "changed"],
  "visual_idea": "only if changed",
  "script": "only if changed",
  "platform": "only if changed",
  "content_type": "only if changed"
}
`, action === "rewrite_carousel" ? 1000 : 800);

  const updates: Partial<GeneratedContent> = {};
  if (typeof result.hook === "string") updates.hook = result.hook.trim();
  if (typeof result.caption === "string") updates.caption = result.caption.trim();
  const hashtags = asStringArray(result.hashtags);
  if (hashtags.length) updates.hashtags = hashtags.map((tag) => tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`);
  if (typeof result.visual_idea === "string") updates.visual_idea = result.visual_idea.trim();
  if (typeof result.script === "string") updates.script = result.script.trim();
  if (typeof result.platform === "string") updates.platform = result.platform.trim();
  if (typeof result.content_type === "string") updates.content_type = result.content_type.trim();

  if (action === "rewrite_instagram") updates.platform = "Instagram";
  if (action === "rewrite_tiktok") updates.platform = "TikTok";
  if (action === "rewrite_pinterest") updates.platform = "Pinterest";
  if (action === "rewrite_carousel") updates.content_type = "carousel";

  if (action === "regenerate_to_match_topic") {
    let fidelity = assessTopicFidelity({
      requestedTopic: String(item.topic || ""),
      contentAngle: item.content_angle,
      hook: updates.hook || item.hook,
      caption: updates.caption || item.caption,
      visualIdea: updates.visual_idea || item.visual_idea,
      script: updates.script || item.script
    });
    if (fidelity.topicMatch !== "Strong") {
      const repair = attachmentTopicRepairCopy(String(item.topic || ""), String(item.content_goal || ""));
      if (repair) {
        updates.hook = repair.hook;
        updates.caption = repair.caption;
        updates.visual_idea = repair.visualIdea;
        updates.script = repair.script;
        fidelity = assessTopicFidelity({
          requestedTopic: String(item.topic || ""),
          contentAngle: item.content_angle,
          hook: updates.hook,
          caption: updates.caption,
          visualIdea: updates.visual_idea,
          script: updates.script
        });
      }
    }
    updates.why_this_works = {
      ...(item.why_this_works || {
        goal_used: String(item.content_goal || ""),
        audience_insight: "",
        psychological_angle: "",
        cta_strategy: "",
        suggested_template: ""
      }),
      topic_fidelity: fidelity
    };
  }

  if (!Object.keys(updates).length) {
    throw new Error("The targeted edit did not return any usable content changes.");
  }

  return updates;
}

export function packRevisionSnapshot(pack: ContentPack, action: string, sectionKey?: string, fieldKey?: string): ContentPackRevision {
  return {
    pack: pack.pack,
    canvaFillPackage: pack.metadata?.canvaFillPackage && typeof pack.metadata.canvaFillPackage === "object" && !Array.isArray(pack.metadata.canvaFillPackage)
      ? pack.metadata.canvaFillPackage as Record<string, string>
      : undefined,
    changedAt: new Date().toISOString(),
    action,
    sectionKey,
    fieldKey
  };
}

export function pushPackRevisionHistory(metadata: unknown, revision: ContentPackRevision) {
  const base = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, unknown> : {};
  const current = Array.isArray(base.revisionHistory) ? base.revisionHistory : [];
  return {
    ...base,
    revisionHistory: [...current.slice(-9), revision],
    lastRevisionAction: revision.action,
    lastRevisionAt: revision.changedAt
  };
}

export async function improveContentPackSection(pack: ContentPack, sectionKey: ContentPackSectionKey, action: ContentImproveAction, brandBrain?: BrandBrain | null) {
  const currentValue = pack.pack?.[sectionKey] || "";
  const result = await createOpenAiJson(`
Targeted content pack edit:
${actionInstruction(action)}

Brand Brain summary:
${formatCompactBrandBrainForPrompt(brandBrain)}

${applyLionHeartVoiceGuidance({
  topic: pack.source_topic || pack.title,
  goal: pack.content_pillar,
  platform: sectionKey,
  contentType: "content pack section",
  audience: pack.audience
})}

Content pack context:
${JSON.stringify({
  title: pack.title,
  topic: pack.source_topic,
  audience: pack.audience,
  contentPillar: pack.content_pillar,
  productTieIn: pack.product_tie_in,
  serviceTieIn: pack.service_tie_in,
  sectionKey,
  currentValue
}, null, 2)}

Rules:
- Rewrite only this one section.
- Return finished, publication-ready copy.
- Avoid em dashes completely.
- Return JSON only: { "value": "updated section copy" }
`, 900);

  if (typeof result.value !== "string" || !result.value.trim()) {
    throw new Error("The content pack edit did not return updated copy.");
  }

  return result.value.trim();
}

export async function improveCanvaSlide(pack: ContentPack, fieldKey: string, currentValue: string, action: CanvaSlideImproveAction, brandBrain?: BrandBrain | null) {
  const result = await createOpenAiJson(`
Targeted Canva slide edit:
${slideInstruction(action)}

Brand Brain summary:
${formatCompactBrandBrainForPrompt(brandBrain)}

${applyLionHeartVoiceGuidance({
  topic: pack.source_topic || pack.title,
  goal: pack.content_pillar,
  platform: "Canva",
  contentType: String(pack.metadata?.selectedCanvaTemplateName || "Canva slide"),
  audience: pack.audience
})}

Slide context:
${JSON.stringify({
  contentPackTitle: pack.title,
  topic: pack.source_topic,
  audience: pack.audience,
  contentPillar: pack.content_pillar,
  selectedTemplateName: pack.metadata?.selectedCanvaTemplateName,
  fieldKey,
  currentValue
}, null, 2)}

Rules:
- Rewrite only this one Canva field.
- Output actual slide text exactly as it should appear in Canva.
- Keep it concise enough for a Canva template field.
- Avoid em dashes completely.
- Return JSON only: { "value": "updated slide copy" }
`, 550);

  if (typeof result.value !== "string" || !result.value.trim()) {
    throw new Error("The Canva slide edit did not return updated slide copy.");
  }

  return result.value.trim();
}
