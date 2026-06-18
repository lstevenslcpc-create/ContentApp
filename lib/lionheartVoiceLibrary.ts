export type LionHeartVoicePromptInput = {
  topic?: string | null;
  goal?: string | null;
  platform?: string | null;
  contentType?: string | null;
  audience?: string | null;
};

export type LionHeartVoiceScore = {
  score: number;
  specificity: number;
  emotionalResonance: number;
  therapistInsight: number;
  realLifeExample: number;
  socialNativeReadability: number;
  brandFit: number;
  ctaFit: number;
  genericLanguageRisk: number;
  strengths: string[];
  improvements: string[];
  genericPhraseWarnings: string[];
};

export const LIONHEART_VOICE_IDENTITY = [
  "emotionally intelligent",
  "therapist-led",
  "warm but direct",
  "trauma-informed",
  "social-native",
  "relatable",
  "clinically grounded without sounding academic",
  "culturally aware",
  "specific to real life",
  "free from generic wellness filler"
];

export const LIONHEART_PHRASE_PATTERNS = [
  "What I see in therapy is...",
  "What I often see in therapy is...",
  "As a therapist, I often hear...",
  "Many people assume... What is actually happening is...",
  "The behavior makes more sense when you understand...",
  "One thing people rarely realize...",
  "Parents are often surprised when...",
  "As a teen therapist, one thing parents struggle with is...",
  "Woman to woman...",
  "Gentle reminder...",
  "Hear me out...",
  "If you remember one thing today, remember...",
  "I am going to be honest with you...",
  "I do not know who needs to hear this, but...",
  "Your feelings make sense. The coping strategy may need support.",
  "The goal is not to stop having needs. The goal is to communicate them without abandoning yourself.",
  "Often our behaviors can reveal our feelings.",
  "In therapy, I often teach clients how to respond and not just react."
];

export const LIONHEART_FORBIDDEN_PHRASES = [
  "you are not alone",
  "mental health matters",
  "healing is not linear",
  "healing is a process",
  "just breathe",
  "self-care is important",
  "reach out for help",
  "you are enough",
  "everything happens for a reason",
  "you got this",
  "anxiety isn't all in your head",
  "anxiety isn’t all in your head"
];

export const LIONHEART_POST_STRUCTURES = [
  "Misunderstanding -> therapist insight -> real-life example -> reframe -> takeaway",
  "What it looks like -> what is underneath -> why it makes sense -> what to try instead",
  "Common phrase -> hidden meaning -> therapist explanation -> gentle script",
  "Emotional hook -> nervous system explanation -> behavior pattern -> healing reframe",
  "Parent assumption -> teen experience -> therapist reframe -> supportive response",
  "What I see in therapy -> what it looks like -> what it feels like -> what people assume -> what is actually happening"
];

const topicVoiceExamples: Record<string, string[]> = {
  "teen anxiety": [
    "Parents may see laziness while the teen is managing fear of failure and overwhelm.",
    "Anxiety can look like irritability, stomach aches, perfectionism, staying home, snapping, or saying I do not care.",
    "Use teen phrases such as I am fine, I do not know, or I do not want my parents to worry."
  ],
  "anxious attachment": [
    "People may see neediness while the person is scanning for signs of abandonment.",
    "Use moments like rereading texts, noticing a tone shift, asking are we okay, or overexplaining after conflict.",
    "The nervous system learned that connection may not be predictable."
  ],
  "people pleasing": [
    "Kindness can be mixed with fear of disappointment, rejection, or conflict.",
    "Use moments like saying yes while exhausted, deleting a boundary text, or feeling guilty after saying no."
  ],
  perfectionism: [
    "High achievement can be driven by fear of mistakes, shame, or looking unprepared.",
    "Use moments like rewriting an email, avoiding the first draft, or believing everything is equally urgent."
  ],
  burnout: [
    "Burnout can look like resentment, procrastination, numbness, takeout because cooking feels impossible, or withdrawing from family.",
    "Name the invisible load before suggesting individual self-care."
  ],
  "trauma responses": [
    "Explain protective behavior without turning every reaction into a diagnosis.",
    "Use grounded nervous system language and preserve agency."
  ],
  "emotional shutdown": [
    "Silence can mean overload, lost access to words, or fear that speaking will make things worse.",
    "Separate protective shutdown from intentional punishment."
  ],
  "conflict avoidance": [
    "Keeping the peace can become self-erasure when disagreement feels like disconnection.",
    "Use gentle scripts that support honesty without forced confrontation."
  ],
  "self-esteem": [
    "Ask whether the critical voice belongs to the person or was learned from someone else.",
    "Use real decisions, relationships, school, appearance, and work examples instead of broad confidence language."
  ],
  "therapy myths": [
    "Not every painful human experience is a disorder, and therapy is not only for crisis.",
    "Correct the myth with clinical nuance rather than a promotional pitch."
  ],
  "avoidant attachment": [
    "Distance can protect against dependence, disappointment, or feeling emotionally controlled.",
    "Do not label independence as coldness without explaining the protective logic."
  ],
  "teen depression": [
    "Depression can look like irritability, staying busy, memory trouble, heaviness, withdrawal, or saying I do not care.",
    "Use calm safety-aware language without sensationalizing risk."
  ],
  "cognitive distortions": [
    "Show the exact thought, the distortion, and a more balanced response in daily language.",
    "Use feelings are not facts as a doorway to examination, not dismissal."
  ],
  "negative self-talk": [
    "Ask whether the thought is helpful and whether it sounds like the person's own voice or someone else's.",
    "Replace forced positivity with a believable, balanced statement."
  ],
  "confirmation bias": [
    "Show how the mind collects evidence for an existing fear while filtering out disconfirming information.",
    "Use relationship, school, work, or self-esteem examples."
  ],
  "cbt strategies": [
    "Use a real thought-feeling-behavior sequence and one believable alternative thought.",
    "Avoid making CBT sound like simply thinking positive."
  ],
  "dbt strategies": [
    "Use dialectical language: two things can be true at once.",
    "Show the skill inside a conflict, urge, or emotionally intense moment."
  ]
};

export const LIONHEART_CLIENT_STYLE_LINES = [
  "I am fine.",
  "I do not know.",
  "Are you mad at me?",
  "I should be able to handle this.",
  "Everything feels important. I cannot prioritize.",
  "I am drowning and no one even notices.",
  "I cannot relax because there is always something that needs to be done.",
  "I try not to show people how much I am struggling.",
  "Are we okay?"
];

const styleTrainingNotes = [
  "Open with one emotionally recognizable truth, not a blog introduction.",
  "Use short lines and controlled repetition when it improves pacing.",
  "Contrast what people see with what is happening underneath.",
  "Use therapist authority carefully: direct, human, and clinically responsible.",
  "Name cultural, family, or systemic context when it materially changes the experience.",
  "Use bluntness only when it serves clarity. Do not copy profanity or sensational claims automatically.",
  "Do not repeat source examples verbatim. Learn from their pacing, specificity, contrast, and emotional framing.",
  "For high-risk topics, add clear safety language and avoid diagnostic certainty."
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
}

function closestTopicGuidance(topic: string) {
  const normalizedTopic = normalize(topic);
  const match = Object.entries(topicVoiceExamples).find(([key]) => normalizedTopic.includes(key) || key.includes(normalizedTopic));
  if (match) return match[1];
  if (normalizedTopic.includes("cbt")) return topicVoiceExamples["cbt strategies"];
  if (normalizedTopic.includes("dbt")) return topicVoiceExamples["dbt strategies"];
  return [
    "Name a specific behavior, thought, body response, or relationship moment.",
    "Contrast the visible behavior with the emotion, belief, or protection strategy underneath."
  ];
}

function ctaGuidance(goal: string) {
  const normalizedGoal = normalize(goal);
  if (["follower-growth", "engagement", "shares", "reach-awareness"].includes(normalizedGoal)) return "End with a specific save, share, follow, or reflection invitation tied to the post.";
  if (normalizedGoal === "saves") return "Give a script, checklist, question, or framework worth returning to.";
  if (["leads", "therapy-inquiries"].includes(normalizedGoal)) return "Connect gently to what therapy can help with. Do not use a generic reach-out CTA.";
  if (normalizedGoal === "product-sales") return "Connect the exact pain point to the product's practical benefit and a direct but ethical CTA.";
  return "End with one useful takeaway or reflection. Avoid a generic save-this CTA.";
}

export function applyLionHeartVoiceGuidance(input: LionHeartVoicePromptInput = {}) {
  const topic = String(input.topic || "mental health");
  const goal = String(input.goal || "education");
  const phraseRotation = LIONHEART_PHRASE_PATTERNS.slice(0, 8).join(" | ");
  return `
LionHeart Voice Library:
- Voice identity: ${LIONHEART_VOICE_IDENTITY.join(", ")}.
- Topic voice guidance: ${closestTopicGuidance(topic).join(" ")}
- Choose one natural phrase pattern when it fits. Rotate them and do not force the same opener every time: ${phraseRotation}
- Choose one structure: ${LIONHEART_POST_STRUCTURES.join(" | ")}.
- Client-style language may be anonymized and generalized. Never imply a line is a real client quote.
- Rewrite rules: sound specific; include a real-life detail; teach one useful idea; avoid filler and blog-intro language; use short lines for social content; stay emotionally precise; include therapist perspective when appropriate.
- Platform: ${input.platform || "social content"}. Content type: ${input.contentType || "post"}. Audience: ${input.audience || "LionHeart Therapy audience"}.
- CTA direction: ${ctaGuidance(goal)}
- Forbidden phrases: ${LIONHEART_FORBIDDEN_PHRASES.join(" | ")}.
- Style training: ${styleTrainingNotes.join(" ")}
- Do not copy training examples as templates. Use their tone, pacing, emotional contrast, and specificity to create original content.
`;
}

function countMatches(content: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(content) ? 1 : 0), 0);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreLionHeartVoice(content: string, input: LionHeartVoicePromptInput = {}): LionHeartVoiceScore {
  const text = normalize(content || "");
  const warnings = LIONHEART_FORBIDDEN_PHRASES.filter((phrase) => text.includes(normalize(phrase)));
  const specificity = clamp(28 + countMatches(text, [/\bwhen\b/, /\bafter\b/, /\bbefore\b/, /\btext\b/, /\bschool\b/, /\bhome\b/, /\bwork\b/, /\bstomach\b/, /\btone\b/, /\bemail\b/]) * 9);
  const emotionalResonance = clamp(25 + countMatches(text, [/fear/, /shame/, /overwhelm/, /resent/, /panic/, /guilt/, /lonely/, /exhaust/, /pressure/, /rejection/]) * 8);
  const therapistInsight = clamp(20 + countMatches(text, [/what i see in therapy/, /as a therapist/, /many people assume/, /what is actually happening/, /nervous system/, /behavior makes more sense/]) * 14);
  const realLifeExample = clamp(20 + countMatches(text, [/for example/, /this can look like/, /reread/, /rewrite/, /stays? home/, /shuts? down/, /says? yes/, /snaps?/, /checks?/, /avoids?/]) * 12);
  const averageSentenceLength = text.split(/[.!?\n]+/).map((sentence) => sentence.trim().split(/\s+/).filter(Boolean).length).filter(Boolean);
  const averageWords = averageSentenceLength.length ? averageSentenceLength.reduce((sum, value) => sum + value, 0) / averageSentenceLength.length : 30;
  const socialNativeReadability = clamp(100 - Math.max(0, averageWords - 14) * 4 + (content.includes("\n") ? 8 : 0));
  const brandFit = clamp((specificity + emotionalResonance + therapistInsight + realLifeExample + socialNativeReadability) / 5 - warnings.length * 12);
  const goal = normalize(String(input.goal || ""));
  const ctaFit = clamp(45 + (goal === "saves" && /save|script|checklist|remember/.test(text) ? 35 : 0) + (["follower-growth", "shares", "engagement"].includes(goal) && /follow|send|share|comment/.test(text) ? 35 : 0) + (["leads", "therapy-inquiries"].includes(goal) && /therapy|support|work with/.test(text) ? 30 : 0));
  const genericLanguageRisk = clamp(warnings.length * 22 + countMatches(text, [/many people struggle/, /in today's world/, /it is important to/, /remember that/, /prioritize your well-being/]) * 18);
  const score = clamp((specificity + emotionalResonance + therapistInsight + realLifeExample + socialNativeReadability + brandFit + ctaFit + (100 - genericLanguageRisk)) / 8);
  const strengths: string[] = [];
  const improvements: string[] = [];
  if (specificity >= 70) strengths.push("Uses specific, recognizable moments."); else improvements.push("Add one concrete behavior, thought, body cue, or daily-life moment.");
  if (therapistInsight >= 70) strengths.push("Includes a clear therapist perspective."); else improvements.push("Add a therapist observation that explains what is happening underneath.");
  if (emotionalResonance >= 70) strengths.push("Names the emotion underneath the behavior."); else improvements.push("Name the hidden fear, shame, pressure, grief, or need more precisely.");
  if (socialNativeReadability >= 70) strengths.push("Reads naturally for social media."); else improvements.push("Shorten sentences and remove blog-style setup.");
  if (ctaFit < 65) improvements.push(`Make the CTA more specific to ${input.goal || "the selected goal"}.`);
  return { score, specificity, emotionalResonance, therapistInsight, realLifeExample, socialNativeReadability, brandFit, ctaFit, genericLanguageRisk, strengths, improvements, genericPhraseWarnings: warnings };
}
