import { applyLionHeartVoiceGuidance, LIONHEART_MINIMUM_VOICE_SCORE, scoreLionHeartVoice, type LionHeartVoicePromptInput, type LionHeartVoiceScore } from "./lionheartVoiceLibrary";

export type LionHeartEditorialDraft = {
  hook: string;
  caption: string;
  hashtags?: string[];
  visual_idea?: string;
  script?: string;
  content_angle?: string;
  why_this_works?: Record<string, unknown> | null;
};

export type LionHeartEditorialScore = {
  hookStrength: number;
  voiceMatch: number;
  emotionalRecognition: number;
  storytelling: number;
  therapistInsight: number;
  screenshotPotential: number;
  saveability: number;
  shareability: number;
  readAloudFlow: number;
  genericLanguageRisk: number;
  explanationOverload: number;
  paragraphEfficiency: number;
  overall: number;
  oneBigIdea: string;
  screenshotSentence: string;
  revisionNeeded: boolean;
  reasons: string[];
  voice: LionHeartVoiceScore;
};

const blockedOpeners = [
  /^many people\b/i,
  /^did you know\b/i,
  /^it is important\b/i,
  /^anxiety is\b/i,
  /^avoidant attachment is\b/i,
  /^people with\b/i,
  /^research shows\b/i
];

const vagueWords = /\b(hard|challenging|stressful|difficult)\b/gi;
const genericTransitions = /\b(picture this|imagine this|let's say|think about it|comment below|what do you think|like and share)\b/gi;
const microMomentPatterns = [
  /typing bubble/i,
  /stomach drops?/i,
  /reread/i,
  /rewrit/i,
  /delete your reply/i,
  /type another/i,
  /drive home/i,
  /replaying the conversation/i,
  /parking lot/i,
  /checking your phone/i,
  /check your phone/i,
  /one-word reply/i,
  /simple text/i,
  /type the boundary/i,
  /delete it/i,
  /disappointed/i,
  /email six times/i,
  /rewrite the email/i,
  /one mistake/i,
  /too expensive/i,
  /leave the conversation/i,
  /replay one sentence/i,
  /rest of the night/i,
  /bedroom door/i,
  /says? "i'?m fine"/i,
  /i.?m fine/i,
  /hold herself together/i,
  /shuts her bedroom door/i,
  /say yes/i,
  /says yes/i,
  /exhausted/i,
  /pretending (you are|you're) tired/i,
  /laughing while overwhelmed/i,
  /apologizing before/i,
  /needing space/i
];
const therapistInsightPatterns = [
  /what i see in therapy/i,
  /what is actually happening/i,
  /the behavior makes more sense/i,
  /nervous system/i,
  /survival strateg/i,
  /trying to protect/i,
  /old protection/i
];
const screenshotPatterns = [
  /coping strategy/i,
  /survival/i,
  /safer/i,
  /protect/i,
  /familiarity/i,
  /your body/i,
  /your nervous system/i
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatches(content: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(content) ? 1 : 0), 0);
}

function splitSentences(content: string) {
  return content
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function removeEmDashes(value: string) {
  return value.replaceAll("—", ".").replace(/\s+\./g, ".").replace(/\.\s*\./g, ".");
}

export function extractScreenshotSentence(content: string) {
  const sentences = splitSentences(content);
  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score: 0
        + (sentence.length >= 42 && sentence.length <= 120 ? 22 : 0)
        + countMatches(sentence, screenshotPatterns) * 18
        + (/\byou\b/i.test(sentence) ? 10 : 0)
        + (/\bnot\b|\bisn't\b|\bdoesn't\b|\bactually\b|\bsometimes\b/i.test(sentence) ? 10 : 0)
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.sentence || sentences[0] || "";
}

export function scoreLionHeartEditorialDraft(draft: LionHeartEditorialDraft, input: LionHeartVoicePromptInput = {}): LionHeartEditorialScore {
  const hook = removeEmDashes(String(draft.hook || "").trim());
  const caption = removeEmDashes(String(draft.caption || "").trim());
  const allText = [hook, caption, draft.script, draft.visual_idea].filter(Boolean).join("\n\n");
  const lower = allText.toLowerCase();
  const voice = scoreLionHeartVoice(allText, input);
  const paragraphs = splitParagraphs(caption);
  const sentences = splitSentences(caption);
  const averageParagraphWords = paragraphs.length
    ? paragraphs.reduce((sum, paragraph) => sum + paragraph.split(/\s+/).filter(Boolean).length, 0) / paragraphs.length
    : 0;
  const averageSentenceWords = sentences.length
    ? sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).filter(Boolean).length, 0) / sentences.length
    : 0;
  const hookPenalty = blockedOpeners.some((pattern) => pattern.test(hook)) ? 45 : 0;
  const hookStrength = clamp(45
    + (hook.length >= 24 ? 18 : 0)
    + countMatches(hook, microMomentPatterns) * 20
    + (/\byou\b|\byour\b/i.test(hook) ? 12 : 0)
    + (/\bnot\b|\bwhat they don't see\b|\btrying not to\b|\binstead\b|\bactually\b|\bsometimes\b/i.test(hook) ? 15 : 0)
    + (/\bprotect\b|\bspace\b|\bshutdown\b|\bshut down\b|\bdisappear\b|\bfamiliarity\b/i.test(hook) ? 12 : 0)
    - hookPenalty);
  const emotionalRecognition = clamp(35 + countMatches(allText, microMomentPatterns) * 12 + countMatches(allText, [/stomach/i, /chest/i, /replay/i, /guilty/i, /unsafe/i, /overwhelmed/i, /pulling away/i]) * 9);
  const storytelling = clamp(30 + countMatches(allText, microMomentPatterns) * 14 + (paragraphs.length >= 3 ? 12 : 0) + (/\bthen\b|\bbefore\b|\bafter\b/i.test(lower) ? 10 : 0));
  const therapistInsight = clamp(25 + countMatches(allText, therapistInsightPatterns) * 22);
  const screenshotSentence = extractScreenshotSentence(caption || hook);
  const screenshotPotential = clamp(35 + (screenshotSentence.length >= 42 && screenshotSentence.length <= 120 ? 24 : 0) + countMatches(screenshotSentence, screenshotPatterns) * 14);
  const saveability = clamp(35 + (/save this|remember this|notice this|script|checklist/i.test(allText) ? 25 : 0) + screenshotPotential * 0.25 + emotionalRecognition * 0.2);
  const shareability = clamp(35 + (/send this|felt familiar|someone who|you are not ignoring|what they don't see/i.test(allText) ? 25 : 0) + emotionalRecognition * 0.25);
  const readAloudFlow = clamp(100 - Math.max(0, averageSentenceWords - 13) * 5 + (caption.includes("\n\n") ? 10 : 0) - countMatches(allText, [/furthermore/i, /therefore/i, /individuals may/i, /it is essential/i]) * 20);
  const genericLanguageRisk = clamp(voice.genericLanguageRisk + countMatches(allText, [genericTransitions, vagueWords, /generic wellness/i]) * 12);
  const explanationOverload = clamp(Math.max(0, averageParagraphWords - 34) * 2 + countMatches(allText, [/because/i, /this means/i, /it is caused by/i, /in other words/i]) * 5);
  const paragraphEfficiency = clamp(100 - explanationOverload + (paragraphs.length <= 7 ? 8 : -12));
  const overall = clamp((hookStrength + voice.score + emotionalRecognition + storytelling + therapistInsight + screenshotPotential + saveability + shareability + readAloudFlow + paragraphEfficiency + (100 - genericLanguageRisk) + (100 - explanationOverload)) / 12);
  const reasons: string[] = [];
  if (voice.score < LIONHEART_MINIMUM_VOICE_SCORE) reasons.push(`Voice Match is ${voice.score}, below ${LIONHEART_MINIMUM_VOICE_SCORE}.`);
  if (hookStrength < 90) reasons.push("Hook needs more curiosity, specificity, or emotional contradiction.");
  if (genericLanguageRisk > 10) reasons.push("Generic language risk is too high.");
  if (explanationOverload > 15) reasons.push("Explanation overload is too high. Cut repeated teaching.");
  if (therapistInsight < 80) reasons.push("Needs one stronger therapist insight.");
  if (screenshotPotential < 80) reasons.push("Needs one stronger screenshot sentence.");
  const oneBigIdea = screenshotSentence || hook;
  return {
    hookStrength,
    voiceMatch: voice.score,
    emotionalRecognition,
    storytelling,
    therapistInsight,
    screenshotPotential,
    saveability,
    shareability,
    readAloudFlow,
    genericLanguageRisk,
    explanationOverload,
    paragraphEfficiency,
    overall,
    oneBigIdea,
    screenshotSentence,
    revisionNeeded: reasons.length > 0,
    reasons,
    voice
  };
}

export function buildLionHeartEditorialPrompt(draft: LionHeartEditorialDraft, score: LionHeartEditorialScore, input: LionHeartVoicePromptInput = {}) {
  return `
LionHeart Editorial Intelligence Engine:
The LionHeart Voice Library is the highest writing authority.

${applyLionHeartVoiceGuidance(input)}

Editorial mission:
- The goal is not more information. The goal is deeper recognition.
- Make the reader think: "How did they know that's exactly what I do?"
- Remove roughly 30% of unnecessary explanation.
- Keep one big emotional idea. Everything supports it.
- Hook with curiosity before explanation.
- Show the moment immediately. Do not use "Picture this", "Imagine this", "Let's say", or "Think about it".
- Use emotional specificity instead of vague words like hard, challenging, stressful, or difficult.
- Keep exactly one therapist insight.
- Keep exactly one screenshot-worthy sentence.
- CTA should continue the emotional conversation.
- Avoid em dashes completely.

Current editorial score:
${JSON.stringify({
  hookStrength: score.hookStrength,
  voiceMatch: score.voiceMatch,
  emotionalRecognition: score.emotionalRecognition,
  storytelling: score.storytelling,
  therapistInsight: score.therapistInsight,
  screenshotPotential: score.screenshotPotential,
  saveability: score.saveability,
  shareability: score.shareability,
  readAloudFlow: score.readAloudFlow,
  genericLanguageRisk: score.genericLanguageRisk,
  explanationOverload: score.explanationOverload,
  paragraphEfficiency: score.paragraphEfficiency,
  reasons: score.reasons
}, null, 2)}

Draft:
${JSON.stringify({
  hook: draft.hook,
  caption: draft.caption,
  hashtags: draft.hashtags || [],
  visual_idea: draft.visual_idea || "",
  script: draft.script || "",
  content_angle: draft.content_angle || ""
}, null, 2)}

Return JSON only:
{
  "hook": "edited hook",
  "caption": "edited caption",
  "hashtags": ["#Example"],
  "visual_idea": "edited visual idea",
  "script": "edited script or empty string",
  "one_big_idea": "the one sentence someone remembers tomorrow",
  "screenshot_sentence": "the one screenshot-worthy sentence kept in the caption"
}
`;
}

export function enforceEditorialBasics<T extends LionHeartEditorialDraft>(draft: T, input: LionHeartVoicePromptInput = {}): T {
  const hook = blockedOpeners.some((pattern) => pattern.test(draft.hook || ""))
    ? "The part no one sees is what your body learned to protect."
    : draft.hook;
  const paragraphs = splitParagraphs(removeEmDashes(draft.caption || ""))
    .filter((paragraph, index, list) => {
      if (index === 0) return true;
      const previous = list[index - 1]?.toLowerCase() || "";
      const current = paragraph.toLowerCase();
      return previous.slice(0, 60) !== current.slice(0, 60);
    });
  const caption = paragraphs.join("\n\n")
    .replace(vagueWords, (match) => {
      const replacements: Record<string, string> = {
        hard: "emotionally expensive",
        challenging: "a lot for your nervous system to carry",
        stressful: "the thing your body keeps replaying",
        difficult: "the part you keep bracing for"
      };
      return replacements[match.toLowerCase()] || match;
    })
    .replace(genericTransitions, "")
    .trim();
  const score = scoreLionHeartEditorialDraft({ ...draft, hook, caption }, input);
  return {
    ...draft,
    hook,
    caption,
    why_this_works: {
      ...(draft.why_this_works || {}),
      editorial_intelligence_score: score,
      screenshot_sentence: score.screenshotSentence || (draft.why_this_works as Record<string, unknown> | null | undefined)?.screenshot_sentence,
      one_big_idea: score.oneBigIdea
    }
  };
}
