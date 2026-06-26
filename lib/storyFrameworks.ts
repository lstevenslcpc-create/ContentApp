import type { GoldStandardExample, StoryFramework } from "./types";

export const EMOTIONAL_DESTINATIONS = [
  "I finally feel understood.",
  "I have never thought about it that way.",
  "That explains me perfectly.",
  "I am not broken.",
  "I should send this to someone.",
  "I need to save this.",
  "This gives me language for what I have been feeling.",
  "Maybe my behavior makes more sense than I thought.",
  "I feel less ashamed.",
  "I feel hopeful."
];

export const STARTER_STORY_FRAMEWORKS: Omit<StoryFramework, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    framework_name: "Perspective Shift",
    purpose: "Challenge something the audience believes and replace it with a more compassionate psychological explanation.",
    when_to_use: "Misunderstood behaviors like avoidance, people pleasing, perfectionism, shutting down, overthinking, anger, procrastination, or needing space.",
    best_platforms: ["Threads", "Instagram", "Facebook"],
    best_content_types: ["thread", "carousel", "story post", "caption"],
    writing_rhythm: "Misconception, emotional recognition, therapist observation, psychological explanation, compassionate reframe, screenshot-worthy ending.",
    psychological_goal: "Replace shame or judgment with a more accurate psychological explanation.",
    emotional_destination: "I have never thought about it that way.",
    typical_hook_styles: ["People think ___. But what they do not see is ___.", "Maybe this was never about ___. Maybe it was about ___."],
    paragraph_rhythm: "Short contrast lines followed by one grounding explanation.",
    sentence_rhythm: "Direct, reflective, and lightly rhythmic.",
    education_level: 7,
    emotion_level: 8,
    curiosity_level: 9,
    story_level: 6,
    therapist_insight_level: 9,
    saveability_score: 8,
    shareability_score: 9,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Invisible Experience",
    purpose: "Make the reader feel deeply seen by naming the private emotional experience behind a public behavior.",
    when_to_use: "The audience may look functional outside but feel overwhelmed, anxious, disconnected, exhausted, or unseen inside.",
    best_platforms: ["Instagram", "Facebook", "Threads"],
    best_content_types: ["carousel", "Facebook post", "caption", "thread"],
    writing_rhythm: "Small everyday moment, hidden internal experience, emotional validation, therapist insight, hopeful reframe.",
    psychological_goal: "Create recognition before teaching.",
    emotional_destination: "I finally feel understood.",
    typical_hook_styles: ["You do ___. Everyone else sees ___. But inside, you are ___.", "That is not weakness. That is your nervous system trying to ___."],
    paragraph_rhythm: "Scene first, inner world second, insight third.",
    sentence_rhythm: "Gentle, intimate, and emotionally specific.",
    education_level: 5,
    emotion_level: 10,
    curiosity_level: 8,
    story_level: 9,
    therapist_insight_level: 8,
    saveability_score: 9,
    shareability_score: 8,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Therapy Room Truth",
    purpose: "Share a therapist observation that sounds like something Lauren notices repeatedly in session.",
    when_to_use: "Content should feel clinically grounded, emotionally wise, and conversational.",
    best_platforms: ["Instagram", "Threads", "Facebook", "Blog"],
    best_content_types: ["caption", "thread", "carousel", "educational post"],
    writing_rhythm: "Therapy observation, what people usually believe, what is actually happening, psychological reframe, new language.",
    psychological_goal: "Translate clinical pattern recognition into everyday language.",
    emotional_destination: "This gives me language for what I have been feeling.",
    typical_hook_styles: ["One thing I notice in therapy is ___.", "People usually think it means ___. But often, it means ___."],
    paragraph_rhythm: "Observation led, then reframe.",
    sentence_rhythm: "Conversational therapist voice with clear authority.",
    education_level: 8,
    emotion_level: 8,
    curiosity_level: 7,
    story_level: 6,
    therapist_insight_level: 10,
    saveability_score: 9,
    shareability_score: 7,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Nervous System Reframe",
    purpose: "Explain behavior through survival, protection, and nervous system adaptation rather than personality flaws.",
    when_to_use: "Anxiety, trauma, shutdown, avoidance, people pleasing, panic, perfectionism, emotional regulation, or burnout.",
    best_platforms: ["Instagram", "Facebook", "Blog", "Threads"],
    best_content_types: ["carousel", "caption", "educational story post", "thread"],
    writing_rhythm: "Behavior, common judgment, nervous system explanation, compassionate validation, hope or choice.",
    psychological_goal: "Reduce shame by naming protective adaptation.",
    emotional_destination: "Maybe my behavior makes more sense than I thought.",
    typical_hook_styles: ["You are not ___. Your nervous system learned ___.", "At one point, this may have protected you. But now, healing means ___."],
    paragraph_rhythm: "Correction, protection, choice.",
    sentence_rhythm: "Steady, compassionate, and clarifying.",
    education_level: 8,
    emotion_level: 8,
    curiosity_level: 7,
    story_level: 7,
    therapist_insight_level: 9,
    saveability_score: 9,
    shareability_score: 8,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Emotional Micro-Story",
    purpose: "Tell a tiny real-life scene that helps the reader recognize themselves before being taught anything.",
    when_to_use: "Content needs to feel relatable, human, and emotionally specific.",
    best_platforms: ["Threads", "Instagram", "TikTok/Reels", "Facebook"],
    best_content_types: ["thread", "caption", "reel script", "carousel intro"],
    writing_rhythm: "Moment, body sensation, inner thought, therapist insight, meaning.",
    psychological_goal: "Create immediate self-recognition.",
    emotional_destination: "That explains me perfectly.",
    typical_hook_styles: ["You reread the message. Delete your reply. Type another one. Delete that too.", "This is not you being dramatic. This is your nervous system trying to avoid ___."],
    paragraph_rhythm: "Tiny scene fragments followed by meaning.",
    sentence_rhythm: "Short, cinematic, and intimate.",
    education_level: 4,
    emotion_level: 10,
    curiosity_level: 9,
    story_level: 10,
    therapist_insight_level: 7,
    saveability_score: 8,
    shareability_score: 9,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Hidden Meaning",
    purpose: "Reveal what a behavior is actually communicating beneath the surface.",
    when_to_use: "A behavior looks confusing, immature, cold, clingy, lazy, angry, or dramatic from the outside.",
    best_platforms: ["Instagram", "Threads", "Facebook"],
    best_content_types: ["carousel", "thread", "caption"],
    writing_rhythm: "Surface behavior, common interpretation, hidden emotional meaning, psychological explanation, compassionate closing.",
    psychological_goal: "Help the reader see the signal underneath the symptom.",
    emotional_destination: "I feel less ashamed.",
    typical_hook_styles: ["When someone ___, it can look like ___. But underneath, it may be ___.", "The behavior is not the whole story. It is the signal."],
    paragraph_rhythm: "Surface, underneath, signal.",
    sentence_rhythm: "Clear contrast with emotional softness.",
    education_level: 7,
    emotion_level: 9,
    curiosity_level: 8,
    story_level: 7,
    therapist_insight_level: 9,
    saveability_score: 8,
    shareability_score: 8,
    example_gold_standard_posts: [],
    status: "active"
  },
  {
    framework_name: "Platform-Specific Emotional Strategy",
    purpose: "Adapt the writing strategy based on platform, not just format.",
    when_to_use: "Every generation needs platform-native pacing and emotional strategy.",
    best_platforms: ["Facebook", "Threads", "Instagram", "TikTok/Reels", "Pinterest", "Blog"],
    best_content_types: ["caption", "thread", "carousel", "reel script", "blog", "pin"],
    writing_rhythm: "Choose platform-native emotional pacing before writing.",
    psychological_goal: "Make the same idea feel native to the platform.",
    emotional_destination: "I should send this to someone.",
    typical_hook_styles: ["Platform-native hook chosen by channel."],
    paragraph_rhythm: "Platform dependent.",
    sentence_rhythm: "Platform dependent.",
    education_level: 6,
    emotion_level: 8,
    curiosity_level: 8,
    story_level: 8,
    therapist_insight_level: 7,
    saveability_score: 8,
    shareability_score: 8,
    example_gold_standard_posts: [],
    status: "active"
  }
];

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

export function platformStrategy(platform?: string | null) {
  const value = normalize(platform);
  if (value.includes("facebook")) return "Facebook emotionally validating story post. Prioritize comments, shares, body-based examples, and community discussion.";
  if (value.includes("thread")) return "Threads perspective-shift writing. Short, punchy therapist reframes. Every line should be easy to repost.";
  if (value.includes("instagram")) return "Instagram saveable emotional education. Prioritize carousel pacing, visual slide rhythm, and screenshot-worthy sentences.";
  if (value.includes("tiktok") || value.includes("reel") || value.includes("short")) return "TikTok/Reels spoken rhythm. Start with a sharp first sentence, visual cue, and real-life scenario.";
  if (value.includes("pinterest")) return "Pinterest searchable evergreen strategy. Use practical, SEO-friendly language and saveable list framing.";
  if (value.includes("blog")) return "Blog authority-building clinical education while preserving LionHeart warmth and specificity.";
  return "Multi-platform LionHeart emotional recognition strategy.";
}

export function selectStoryFramework(input: {
  topic?: string | null;
  goal?: string | null;
  platform?: string | null;
  contentType?: string | null;
  frameworks?: StoryFramework[];
  goldExamples?: GoldStandardExample[];
}) {
  const frameworks = (input.frameworks?.length ? input.frameworks : STARTER_STORY_FRAMEWORKS.map((framework, index) => ({ ...framework, id: `starter-${index}` } as StoryFramework))).filter((framework) => framework.status !== "archived");
  const text = normalize([input.topic, input.goal, input.platform, input.contentType].filter(Boolean).join(" "));
  const scored = frameworks.map((framework) => {
    let score = 40;
    if ((framework.best_platforms || []).some((platform) => normalize(input.platform).includes(normalize(platform)) || normalize(platform).includes(normalize(input.platform)))) score += 12;
    if ((framework.best_content_types || []).some((type) => normalize(input.contentType).includes(normalize(type)) || normalize(type).includes(normalize(input.contentType)))) score += 12;
    const use = normalize(framework.when_to_use);
    if (includesAny(use, ["avoidance", "people pleasing", "perfectionism", "shutting down", "overthinking", "needing space"]) && includesAny(text, ["avoidant", "people pleasing", "perfectionism", "shutdown", "overthinking", "space"])) score += 18;
    if (includesAny(use, ["functional", "overwhelmed", "unseen", "exhausted"]) && includesAny(text, ["burnout", "teen", "anxiety", "mom", "women"])) score += 16;
    if (includesAny(framework.framework_name, ["nervous system"]) && includesAny(text, ["anxiety", "trauma", "shutdown", "avoidance", "burnout", "panic", "perfectionism"])) score += 20;
    if (includesAny(framework.framework_name, ["emotional micro-story"]) && ["follower-growth", "engagement", "shares"].includes(normalize(input.goal))) score += 18;
    if (includesAny(framework.framework_name, ["therapy room truth"]) && ["trust-building", "education", "leads"].includes(normalize(input.goal))) score += 16;
    if (input.goldExamples?.some((example) => normalize(example.story_framework) === normalize(framework.framework_name))) score += 10;
    return { framework, score };
  }).sort((a, b) => b.score - a.score);

  const primary = scored[0]?.framework || frameworks[0];
  const supporting = scored.find((item) => item.framework.framework_name !== primary.framework_name)?.framework || frameworks[1] || primary;
  const destination = primary.emotional_destination || EMOTIONAL_DESTINATIONS[0];
  return {
    primary,
    supporting,
    emotionalDestination: destination,
    platformStrategy: platformStrategy(input.platform),
    frameworkConfidence: Math.max(72, Math.min(98, scored[0]?.score || 78))
  };
}

export function formatStoryFrameworkForPrompt(selection: ReturnType<typeof selectStoryFramework>) {
  return `
Story Framework Engine:
- Primary framework: ${selection.primary.framework_name}
- Primary purpose: ${selection.primary.purpose || ""}
- Primary writing rhythm: ${selection.primary.writing_rhythm || ""}
- Primary hook styles: ${(selection.primary.typical_hook_styles || []).join(" | ")}
- Supporting framework: ${selection.supporting.framework_name}
- Supporting purpose: ${selection.supporting.purpose || ""}
- Emotional destination: ${selection.emotionalDestination}
- Platform strategy: ${selection.platformStrategy}
- Framework confidence: ${selection.frameworkConfidence}%

Write backwards from the emotional destination. The reader should feel that destination by the end.
Use the primary framework for structure and the supporting framework only to strengthen the piece.
`;
}
