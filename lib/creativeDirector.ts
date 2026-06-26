import type { BrandBrain, CanvaTemplate, ContentOpportunity, ContentPackBody, GoldStandardExample, StoryFramework } from "./types";
import { CANVA_TEMPLATES, type CanvaTemplateRegistryItem } from "./canvaTemplates";
import { applyLionHeartVoiceGuidance } from "./lionheartVoiceLibrary";
import { EMOTIONAL_DESTINATIONS, selectStoryFramework } from "./storyFrameworks";

export type CreativeBrief = {
  idea: string;
  primaryPlatform: string;
  supportingPlatforms: string[];
  storyFramework: string;
  supportingFramework: string;
  emotionalDestination: string;
  contentMission: string;
  suggestedCta: string;
  recommendedCanvaTemplate: {
    id: string;
    name: string;
    link: string;
    type: string;
  };
  goldStandardsUsed: number;
  voiceConfidence: number;
  topicConfidence: number;
  recommendedVisualStyle: string;
  aiImagePrompt: string;
  reelAngle: string;
  pinterestAngle: string;
  emailAngle: string;
  platformAngles: Record<string, string>;
  scheduleRecommendation: {
    day: string;
    time: string;
    reason: string;
  };
  why: Record<string, string>;
};

export type WeeklyPlanItem = {
  day: string;
  time: string;
  topic: string;
  platform: string;
  contentType: string;
  contentMission: string;
  storyFramework: string;
  emotionalDestination: string;
  cta: string;
  canvaTemplateName: string;
  visualStyle: string;
  why: string;
};

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  const value = normalize(text);
  return terms.some((term) => value.includes(term));
}

function isRegistryTemplate(template: CanvaTemplate | CanvaTemplateRegistryItem): template is CanvaTemplateRegistryItem {
  return "best_for" in template;
}

function scoreTemplate(idea: string, platform: string, contentType: string, template: CanvaTemplate | CanvaTemplateRegistryItem) {
  const context = normalize([idea, platform, contentType].join(" "));
  const registry = isRegistryTemplate(template);
  const name = registry ? template.name : template.template_name;
  const format = registry ? template.type : template.format_type;
  const content = template.content_type;
  const recommended = registry ? template.best_for : template.recommended_for || [];
  const bestUse = registry ? template.best_for.join(" ") : template.best_use_case || "";
  const pillars = registry ? template.content_pillars.join(" ") : template.content_pillar_fit || "";
  let score = 40;
  if (normalize(format).includes(normalize(platform)) || normalize(platform).includes(normalize(format))) score += 15;
  if (normalize(content).includes(normalize(contentType)) || normalize(contentType).includes(normalize(content))) score += 14;
  for (const term of recommended) if (context.includes(normalize(term))) score += 18;
  if (includesAny(context, ["attachment", "burnout", "people pleasing", "trauma"]) && normalize(name).includes("emotional")) score += 18;
  if (includesAny(context, ["teen", "school", "friendship"]) && normalize(name).includes("teen")) score += 18;
  if (includesAny(context, ["pinterest", "seo", "pin"]) && normalize(format).includes("pin")) score += 18;
  if (includesAny(context, ["reel", "tiktok", "video"]) && normalize(format).includes("reel")) score += 18;
  if (includesAny(context, ["workbook", "product", "journal", "coloring"]) && normalize(name).includes("product")) score += 18;
  if (includesAny(`${bestUse} ${pillars}`, [idea, platform, contentType])) score += 8;
  return score;
}

function pickCanvaTemplate(idea: string, platform: string, contentType: string, templates: CanvaTemplate[] = []) {
  const approved = templates.filter((template) => template.approval_status === "approved");
  const candidates = approved.length ? approved : CANVA_TEMPLATES.map((template) => ({
    id: template.id,
    template_name: template.name,
    canva_template_link: template.template_url,
    format_type: template.type,
    content_type: template.content_type,
    recommended_for: template.best_for,
    best_use_case: template.description,
    content_pillar_fit: template.content_pillars.join(", "),
    approval_status: "approved" as const
  }));
  return candidates
    .map((template) => ({ template, score: scoreTemplate(idea, platform, contentType, template) }))
    .sort((a, b) => b.score - a.score)[0]?.template;
}

function pickPrimaryPlatform(idea: string, mission?: string) {
  const text = normalize(`${idea} ${mission || ""}`);
  if (includesAny(text, ["pinterest", "seo", "blog", "workbook", "product"])) return "Pinterest";
  if (includesAny(text, ["delayed text", "tone", "inner dialogue", "conflict", "attachment", "relationship"])) return "Threads";
  if (includesAny(text, ["teen", "parent", "school", "therapy service", "education"])) return "Instagram Carousel";
  if (includesAny(text, ["reel", "video", "pov", "script"])) return "TikTok/Reels";
  return "Instagram Carousel";
}

function supportingPlatforms(primary: string, idea: string) {
  const set = new Set(["Instagram Carousel", "Facebook", "Pinterest"]);
  set.add(primary);
  if (includesAny(idea, ["relationship", "attachment", "people pleasing", "conflict"])) set.add("Threads");
  if (includesAny(idea, ["teen", "anxiety", "therapy", "workbook"])) set.add("Email");
  return Array.from(set).filter((item) => item !== primary).slice(0, 4);
}

function contentMissionFor(idea: string, requestedMission?: string) {
  if (requestedMission && requestedMission !== "Auto") return requestedMission;
  if (includesAny(idea, ["workbook", "journal", "product"])) return "Product Sales";
  if (includesAny(idea, ["therapy", "emdr", "session", "teen therapy"])) return "Service Promotion";
  if (includesAny(idea, ["delayed text", "people pleasing", "attachment", "burnout"])) return "Connection";
  return "Trust Building";
}

function ctaForMission(mission: string) {
  const value = normalize(mission);
  if (value.includes("product")) return "Product CTA";
  if (value.includes("service") || value.includes("therapy")) return "Soft therapy inquiry";
  if (value.includes("email")) return "Join the email list";
  if (value.includes("connection")) return "Reflection";
  return "Save and reflect";
}

function visualStyle(idea: string, platform: string) {
  if (includesAny(idea, ["delayed text", "attachment", "tone"])) return "Text-message style with soft cream background, muted navy headline, and intimate relationship micro-moment pacing.";
  if (includesAny(idea, ["teen", "school"])) return "Gen Z classroom aesthetic with soft sage, notebook details, calm margins, and parent-friendly readability.";
  if (includesAny(platform, ["pinterest"])) return "Clean Pinterest infographic with search-first title, soft gold accents, and scannable sections.";
  if (includesAny(idea, ["burnout"])) return "Moody burnout visual with quiet home details, low clutter, warm neutrals, and grounded body-language cues.";
  return "Cozy therapy office visual with muted navy, soft cream, sage, and emotionally calm spacing.";
}

export function buildCreativeBrief(input: {
  idea: string;
  mission?: string;
  templates?: CanvaTemplate[];
  goldExamples?: GoldStandardExample[];
  storyFrameworks?: StoryFramework[];
  brandBrain?: BrandBrain | null;
}): CreativeBrief {
  const primaryPlatform = pickPrimaryPlatform(input.idea, input.mission);
  const support = supportingPlatforms(primaryPlatform, input.idea);
  const mission = contentMissionFor(input.idea, input.mission);
  const contentType = primaryPlatform.includes("Threads") ? "thread" : primaryPlatform.includes("Pinterest") ? "Pinterest pin" : "carousel";
  const story = selectStoryFramework({
    topic: input.idea,
    goal: mission,
    platform: primaryPlatform,
    contentType,
    frameworks: input.storyFrameworks,
    goldExamples: input.goldExamples
  });
  const template = pickCanvaTemplate(input.idea, primaryPlatform, contentType, input.templates);
  const templateName = template?.template_name || "Emotional Hook Carousel";
  const templateLink = template?.canva_template_link || CANVA_TEMPLATES[0].template_url;
  const templateType = template?.format_type || "Instagram carousel";
  const destination = story.emotionalDestination || EMOTIONAL_DESTINATIONS[0];
  const voiceGuidance = applyLionHeartVoiceGuidance({
    topic: input.idea,
    goal: mission,
    platform: primaryPlatform,
    contentType,
    audience: input.brandBrain?.audience_profiles?.[0]?.name || "LionHeart Therapy audience"
  });
  const voiceConfidence = Math.min(98, Math.max(86, story.frameworkConfidence + (input.goldExamples?.length || 0) * 2));
  const topicConfidence = includesAny(input.idea, ["attachment", "anxiety", "people pleasing", "burnout", "teen", "perfectionism", "therapy"]) ? 97 : 88;
  const style = visualStyle(input.idea, primaryPlatform);

  return {
    idea: input.idea,
    primaryPlatform,
    supportingPlatforms: support,
    storyFramework: story.primary.framework_name,
    supportingFramework: story.supporting.framework_name,
    emotionalDestination: destination,
    contentMission: mission,
    suggestedCta: ctaForMission(mission),
    recommendedCanvaTemplate: {
      id: template?.id || CANVA_TEMPLATES[0].id,
      name: templateName,
      link: templateLink,
      type: templateType
    },
    goldStandardsUsed: Math.min(5, input.goldExamples?.length || 0),
    voiceConfidence,
    topicConfidence,
    recommendedVisualStyle: style,
    aiImagePrompt: `Create a LionHeart Therapy ${templateType} visual for "${input.idea}". Use ${style} Avoid generic wellness imagery, exaggerated smiles, and clinical stock-photo stiffness.`,
    reelAngle: `Therapist POV: the hidden emotional logic behind ${input.idea}. Open with the smallest real-life moment, then name what is happening psychologically.`,
    pinterestAngle: `${input.idea}: signs, what it can look like, and one grounded next step. Make it searchable, saveable, and workbook-friendly if relevant.`,
    emailAngle: `A warm therapist-authored note about why ${input.idea} can feel so intense, ending with one reflection question.`,
    platformAngles: {
      [primaryPlatform]: story.platformStrategy,
      Instagram: "Saveable carousel with emotional recognition first, clinical insight second, and a grounded CTA.",
      Facebook: "Longer emotional story with therapist reframe and discussion-friendly closing.",
      Threads: "Conversational, line-broken perspective shift with one screenshot-worthy insight.",
      Pinterest: "Searchable pin title, symptom or sign list, and evergreen CTA.",
      Blog: "AI-search friendly outline with plain-language psychology and practical takeaway.",
      Email: "Warm newsletter reflection with one helpful question and soft CTA."
    },
    scheduleRecommendation: {
      day: primaryPlatform.includes("Pinterest") ? "Tuesday" : primaryPlatform.includes("Threads") ? "Wednesday" : "Monday",
      time: primaryPlatform.includes("Pinterest") ? "8:00 PM" : primaryPlatform.includes("Threads") ? "11:30 AM" : "10:00 AM",
      reason: "Recommended from general platform best practices. Accept or modify before scheduling."
    },
    why: {
      primaryPlatform: `${primaryPlatform} is recommended because this idea is strongest as ${primaryPlatform.includes("Threads") ? "a conversational narrative with emotional tension" : primaryPlatform.includes("Pinterest") ? "a searchable, saveable evergreen resource" : "a visual emotional education piece"}.`,
      storyFramework: `${story.primary.framework_name} fits because it guides the audience toward: ${destination}`,
      canvaTemplate: `${templateName} is recommended because its structure fits the topic, platform, and content type.`,
      voiceGuidance: voiceGuidance.slice(0, 360),
      goldStandards: input.goldExamples?.length ? "Relevant Gold Standard examples were used as style inspiration only, not copied." : "No exact Gold Standard match was found, so the LionHeart Voice Library is carrying the style guidance.",
      schedule: "Posting time is a suggestion based on broad platform best practices, not live performance analytics."
    }
  };
}

export function briefToOpportunity(brief: CreativeBrief, override?: Partial<ContentOpportunity>): ContentOpportunity {
  return {
    topic: brief.idea,
    explanation: `Creative Director brief for ${brief.idea}. Primary platform: ${brief.primaryPlatform}. Mission: ${brief.contentMission}.`,
    strongest_emotional_hook: brief.emotionalDestination,
    curiosity_angle: brief.why.storyFramework,
    save_worthy_angle: brief.platformAngles.Instagram,
    share_worthy_angle: brief.platformAngles.Threads,
    comment_bait_potential: "Invite the audience to name the real-life moment where this shows up.",
    emotional_trigger_category: "identity recognition",
    audience: "LionHeart Therapy audience",
    content_pillar: brief.contentMission,
    platform_recommendations: [brief.primaryPlatform, ...brief.supportingPlatforms],
    seo_keywords: [brief.idea, brief.contentMission, brief.primaryPlatform],
    emotional_angle: brief.emotionalDestination,
    visual_direction: brief.recommendedVisualStyle,
    product_tie_in: normalize(brief.contentMission).includes("product") ? brief.contentMission : null,
    service_tie_in: normalize(brief.contentMission).includes("therapy") || normalize(brief.contentMission).includes("service") ? brief.contentMission : null,
    cta: brief.suggestedCta,
    clinical_sensitivity: "medium",
    status: "idea",
    ...override
  };
}

export function buildFastContentPack(brief: CreativeBrief, item?: Partial<WeeklyPlanItem>): ContentPackBody {
  const topic = item?.topic || brief.idea;
  const platform = item?.platform || brief.primaryPlatform;
  const cta = item?.cta || brief.suggestedCta;
  const angle = item?.why || brief.why.storyFramework;
  return {
    tiktok_reels_script: `Hook: ${topic}\n\nTherapist POV: ${brief.reelAngle}\n\nBeat 1: Name the real-life moment.\nBeat 2: Explain what is happening underneath.\nBeat 3: Offer the reframe.\nCTA: ${cta}`,
    instagram_carousel_outline: `Slide 1: Emotional hook\nSlide 2: What people see\nSlide 3: What is happening underneath\nSlide 4: Real-life example\nSlide 5: Therapist reframe\nSlide 6: What helps\nSlide 7: ${cta}`,
    slide_by_slide_carousel_copy: `Slide 1: ${topic}\nSlide 2: What it can look like: the small moment that feels bigger than it should.\nSlide 3: What may be happening: your nervous system is reading uncertainty as threat.\nSlide 4: Real life: replaying the message, scanning tone, or trying to make sense of silence.\nSlide 5: Therapist reframe: the behavior is a signal, not the whole story.\nSlide 6: What helps: slow the reaction, name the fear, and choose one grounded next step.\nSlide 7: ${cta}`,
    instagram_caption: `${topic}\n\nWhat I often see in therapy is that the behavior people judge on the surface usually makes more sense when you understand the emotion underneath.\n\n${angle}\n\nThis does not mean the pattern is your fault. It means the pattern has information.\n\n${cta}`,
    pinterest_pin_title: `${topic}: What It Can Really Look Like`,
    pinterest_description: `${brief.pinterestAngle} LionHeart Therapy content for emotional insight, therapy education, and practical reflection.`,
    threads_post: `${topic}\n\nSometimes the thing that looks like overreacting from the outside is actually your body trying to get certainty.\n\n${brief.emotionalDestination}\n\n${cta}`,
    blog_outline: `H1: ${topic}\nH2: What this can look like in real life\nH2: Why it can feel so intense\nH2: The psychology underneath\nH2: A therapist reframe\nH2: What to try next\nCTA: ${cta}`,
    email_newsletter_blurb: `${brief.emailAngle}\n\nReflection: where does this show up most often for you right now?`,
    canva_visual_direction: `${brief.recommendedCanvaTemplate.name}: ${brief.recommendedVisualStyle}`,
    product_cta: normalize(brief.contentMission).includes("product") ? cta : "",
    therapy_service_cta: normalize(brief.contentMission).includes("service") || normalize(brief.contentMission).includes("therapy") ? cta : "",
    safety_disclaimer: "Educational content only. This is not therapy advice, diagnosis, or a substitute for care from a licensed professional."
  };
}

export function buildWeeklyPlan(input: {
  weeklyFocus: string;
  productOrService?: string;
  desiredPosts: number;
  templates?: CanvaTemplate[];
  goldExamples?: GoldStandardExample[];
  storyFrameworks?: StoryFramework[];
  brandBrain?: BrandBrain | null;
}) {
  const desired = Math.max(1, Math.min(7, input.desiredPosts || 7));
  const sequence = [
    ["Monday", "10:00 AM", "Instagram Carousel", "carousel", "Educational carousel"],
    ["Tuesday", "7:30 PM", "Facebook", "post", "Facebook emotional story"],
    ["Wednesday", "11:30 AM", "Threads", "thread", "Threads conversation"],
    ["Thursday", "8:00 PM", "Pinterest", "Pinterest pin", "Pinterest infographic"],
    ["Friday", "12:00 PM", "TikTok/Reels", "script", "Reel"],
    ["Saturday", "9:30 AM", "Instagram Carousel", "product promo", "Workbook promotion"],
    ["Sunday", "6:00 PM", "Email", "email", "Story sequence"]
  ];
  const missions = ["Trust Building", "Connection", "Engagement", "Pinterest Traffic", "Awareness", "Product Sales", "Nurture Existing Audience"];
  const frameworks = ["Therapy Room Truth", "Invisible Experience", "Perspective Shift", "Nervous System Reframe", "Emotional Micro-Story", "Hidden Meaning", "Platform-Specific Emotional Strategy"];
  const destinations = EMOTIONAL_DESTINATIONS;

  return sequence.slice(0, desired).map(([day, time, platform, contentType, label], index) => {
    const topic = `${input.weeklyFocus}: ${label}`;
    const mission = input.productOrService && index === 5 ? "Product Sales" : missions[index % missions.length];
    const brief = buildCreativeBrief({
      idea: topic,
      mission,
      templates: input.templates,
      goldExamples: input.goldExamples,
      storyFrameworks: input.storyFrameworks,
      brandBrain: input.brandBrain
    });
    return {
      day,
      time,
      topic,
      platform,
      contentType,
      contentMission: mission,
      storyFramework: frameworks[index % frameworks.length],
      emotionalDestination: destinations[index % destinations.length],
      cta: input.productOrService && index === 5 ? `Invite the audience to explore ${input.productOrService}.` : brief.suggestedCta,
      canvaTemplateName: brief.recommendedCanvaTemplate.name,
      visualStyle: brief.recommendedVisualStyle,
      why: `This varies the week with ${contentType} on ${platform}, using ${frameworks[index % frameworks.length]} so it does not repeat the previous post.`
    } satisfies WeeklyPlanItem;
  });
}
