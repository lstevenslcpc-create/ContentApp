import type { BrandBrain, ContentGenerationRequest, ContentIntelligenceBrief } from "./types";
import { getContentGoalConfig } from "./contentGoalConfig";

type BriefInput = {
  request: ContentGenerationRequest;
  brandBrain?: BrandBrain | null;
};

type SourceNote = {
  name: string;
  url: string;
  note: string;
};

const trustedSources: SourceNote[] = [
  {
    name: "National Institute of Mental Health",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    note: "Use for general anxiety symptoms, physical symptoms, avoidance, and impairment context."
  },
  {
    name: "CDC Children's Mental Health",
    url: "https://www.cdc.gov/childrensmentalhealth/",
    note: "Use for child and teen mental health context, caregiver observations, and school or family impact."
  },
  {
    name: "SAMHSA Mental Health",
    url: "https://www.samhsa.gov/mental-health",
    note: "Use for safety-aware mental health education and support-seeking framing."
  },
  {
    name: "American Psychological Association",
    url: "https://www.apa.org/topics/anxiety",
    note: "Use for anxiety education, stress responses, and therapy-informed language."
  }
];

function includesTopic(topic: string, terms: string[]) {
  const normalized = topic.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function goalCtaStrategy(goal: string) {
  const config = getContentGoalConfig(goal);
  return `${config.ctaStyle} The CTA should serve the goal of ${config.primaryGoal.toLowerCase()}`;
}

function suggestedTemplate(request: ContentGenerationRequest, topic: string) {
  const type = String(request.contentType || "").toLowerCase();
  const platform = String(request.platform || "").toLowerCase();

  if (type.includes("carousel")) {
    if (includesTopic(topic, ["teen", "school", "friendship"])) return "Teen Mental Health Carousel";
    if (includesTopic(topic, ["attachment", "people pleasing", "burnout", "trauma"])) return "Emotional Hook Carousel";
    return "Therapist Education Carousel";
  }

  if (platform.includes("pinterest")) return "Pinterest Infographic Pin";
  if (type.includes("reel") || type.includes("short") || platform.includes("tiktok")) return "Reel/TikTok Cover";
  if (includesTopic(topic, ["workbook", "journal", "coloring", "toolkit"])) return "Workbook/Product Promo Template";
  return "Therapist Education Carousel";
}

function baseBrief(request: ContentGenerationRequest, brandBrain?: BrandBrain | null): ContentIntelligenceBrief {
  const topic = String(request.topic || "mental health").trim();
  const goal = String(request.contentGoal || "education");
  const template = suggestedTemplate(request, topic);
  const audience = brandBrain?.audience_profiles?.[0]?.name || "LionHeart Therapy audience";

  const common = {
    topic_definition: `${topic} is a content topic that should be explained through lived experience, emotional patterns, body cues, and clinically grounded support.`,
    psychological_explanation: `This topic often connects to threat detection, learned coping patterns, unmet emotional needs, avoidance, reassurance seeking, and nervous system activation. Explain the pattern without diagnosing the viewer.`,
    common_symptoms: ["overthinking", "avoidance", "reassurance seeking", "irritability", "difficulty relaxing"],
    hidden_signs: ["masking distress", "overexplaining", "shutdown", "checking for tone shifts", "saying I am fine when overwhelmed"],
    emotional_experience: "The audience may feel embarrassed by how intense their reactions are, even when the outside situation looks small.",
    real_life_examples: ["rewriting a message several times", "feeling a body drop after a short reply", "avoiding a task because it already feels too loaded"],
    behavioral_patterns: ["people pleasing", "conflict avoidance", "perfectionism", "emotional monitoring", "delayed decision making"],
    nervous_system_signs: ["tight chest", "stomach aches", "racing thoughts", "freeze response", "body scanning for danger"],
    common_myths: ["It is just overreacting", "If someone functions well, they are fine", "Needing support means the person is weak"],
    therapist_insight: "A therapist would want people to understand that the reaction usually makes sense in context, and support can focus on awareness, regulation, boundaries, and safer connection.",
    observer_notes: "Parents, partners, or clients may notice withdrawal, irritability, repeated reassurance questions, perfectionism, sudden tears, or a need to know exactly where they stand.",
    practical_takeaway: "Name the pattern, notice the body cue, and choose one small response that supports safety instead of shame.",
    best_fit_cta: goalCtaStrategy(goal),
    audience_insight: `${audience} needs language that names the private emotional moment before offering advice.`,
    psychological_angle: "Connect the visible behavior to the underlying nervous system response and emotional need.",
    cta_strategy: goalCtaStrategy(goal),
    suggested_template: template,
    source_notes: []
  };

  if (includesTopic(topic, ["teen anxiety", "teen", "school anxiety", "teen mental"])) {
    return {
      ...common,
      topic_definition: "Teen anxiety can show up as worry, pressure, avoidance, irritability, shutdown, perfectionism, reassurance seeking, school stress, friendship stress, or physical complaints.",
      psychological_explanation: "For teens, anxiety often lives at the intersection of identity development, social evaluation, academic pressure, family communication, and a nervous system that may interpret uncertainty as threat.",
      common_symptoms: ["irritability", "shutdown", "avoidance", "stomach aches", "headaches", "perfectionism", "overthinking", "reassurance seeking", "school refusal or school dread"],
      hidden_signs: ["I am fine behavior", "masking distress at school", "snapping at parents after holding it together all day", "staying busy to avoid feelings", "quietly comparing themselves to friends"],
      emotional_experience: "A teen may feel embarrassed, trapped, misunderstood, pressured to perform, and afraid that naming the anxiety will create more conflict or disappointment.",
      real_life_examples: ["a teen says I am fine but avoids starting homework", "friendship drama becomes stomach pain before school", "a small grade drop feels like proof they are failing", "a parent asks what is wrong and the teen shuts down"],
      behavioral_patterns: ["avoidance", "perfectionistic checking", "reassurance seeking", "irritability after school", "scrolling to numb", "overplanning or procrastinating"],
      nervous_system_signs: ["stomach aches", "tight throat", "headaches", "fatigue after masking", "racing heart before school", "freeze response when asked too many questions"],
      common_myths: ["Teen anxiety always looks like obvious panic", "If grades are fine, the teen is fine", "Irritability means defiance instead of distress", "Avoidance is laziness"],
      therapist_insight: "A therapist would want parents to see the behavior as communication, not just attitude. The goal is to reduce shame, build language for feelings, and support tolerable next steps.",
      observer_notes: "Parents may notice irritability, withdrawal, perfectionism, sleep changes, physical complaints, sudden tears, reassurance loops, school dread, or a teen who says I am fine but seems tense.",
      practical_takeaway: "Start with curiosity and one specific observation: I notice mornings have felt harder lately. Do you want help problem-solving or do you need me to just sit with you for a minute?",
      audience_insight: "Parents and teen girls need examples that make anxiety visible without making the teen feel exposed or blamed.",
      psychological_angle: "Explain anxiety as threat sensitivity, masking, and pressure overload rather than simple worry.",
      suggested_template: request.contentType === "carousel" ? "Teen Mental Health Carousel" : common.suggested_template
    };
  }

  if (includesTopic(topic, ["anxious attachment", "attachment", "abandonment"])) {
    return {
      ...common,
      topic_definition: "Anxious attachment is a relational pattern where ambiguity, distance, silence, or tone shifts can feel emotionally threatening.",
      psychological_explanation: "The attachment system can treat uncertainty as danger. The person may scan for cues, seek reassurance, overexplain, or feel body panic when connection feels unstable.",
      common_symptoms: ["tone scanning", "delayed text spirals", "fear of abandonment", "overexplaining", "reassurance seeking", "emotional hypervigilance"],
      hidden_signs: ["reading silence as rejection", "editing texts to sound easygoing", "feeling ashamed after asking for reassurance", "tracking tiny changes in warmth", "trying to earn calm through perfection"],
      emotional_experience: "The person may know logically that nothing is wrong, while their body feels like the relationship is already slipping away.",
      real_life_examples: ["a delayed reply becomes a full story about being replaced", "a different tone makes the body start looking for what went wrong", "they apologize for needing clarity", "they replay the conversation for hidden meaning"],
      behavioral_patterns: ["checking", "protest behavior", "overexplaining", "people pleasing", "conflict avoidance", "seeking certainty before resting"],
      nervous_system_signs: ["body panic", "tight chest", "stomach drop", "racing thoughts", "restlessness", "freeze or fawn response"],
      common_myths: ["Anxious attachment means being needy", "Reassurance should fix it permanently", "The person is choosing drama", "Love should make every trigger disappear"],
      therapist_insight: "A therapist would want people to understand that anxious attachment is not a character flaw. It is often a protection strategy that needs safety, self-trust, communication skills, and nervous system support.",
      observer_notes: "Partners may notice repeated checking, sensitivity to tone, fear after distance, over-apologizing, or intense reactions to unclear communication.",
      practical_takeaway: "Before chasing certainty, name the cue, check the body, and ask: What did I actually observe, and what story did my nervous system add?",
      audience_insight: "Anxious high achievers and overwhelmed women need language that validates the body alarm without making reassurance the whole solution.",
      psychological_angle: "Tie the social cue to attachment threat response, body panic, and learned protection patterns.",
      suggested_template: request.contentType === "carousel" ? "Emotional Hook Carousel" : common.suggested_template
    };
  }

  return common;
}

async function getOptionalResearchNotes(topic: string) {
  if (process.env.WEB_RESEARCH_ENABLED !== "true") return [];

  const relevant = trustedSources.filter((source) => {
    const lower = topic.toLowerCase();
    if (lower.includes("teen") || lower.includes("school")) return source.name.includes("CDC") || source.name.includes("NIMH") || source.name.includes("SAMHSA");
    return source.name.includes("NIMH") || source.name.includes("APA") || source.name.includes("SAMHSA");
  });

  const notes = await Promise.all(relevant.map(async (source) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(source.url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) return `${source.name}: ${source.note}`;
      return `${source.name}: ${source.note}`;
    } catch {
      return `${source.name}: ${source.note}`;
    }
  }));

  return notes;
}

export async function buildContentIntelligenceBrief(input: BriefInput) {
  const brief = baseBrief(input.request, input.brandBrain);
  const sourceNotes = await getOptionalResearchNotes(String(input.request.topic || ""));
  return {
    ...brief,
    common_symptoms: unique(brief.common_symptoms),
    hidden_signs: unique(brief.hidden_signs),
    real_life_examples: unique(brief.real_life_examples),
    behavioral_patterns: unique(brief.behavioral_patterns),
    nervous_system_signs: unique(brief.nervous_system_signs),
    common_myths: unique(brief.common_myths),
    source_notes: sourceNotes
  };
}
