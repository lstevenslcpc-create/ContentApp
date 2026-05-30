import type { BrandBrain, GeneratedContent } from "@/lib/types";
import { defaultForbiddenPhrases } from "./defaults";

const diagnosticCertaintyPatterns = [/you have [a-z\s]+disorder/i, /this means you are diagnosed/i, /you definitely have/i];
const overpromisePatterns = [/guaranteed/i, /cure your/i, /fix your anxiety/i, /never feel anxious again/i, /results overnight/i];

export function scanContentRisk(item: Pick<GeneratedContent, "caption" | "hook" | "script">, brandBrain?: BrandBrain | null) {
  const text = [item.hook, item.caption, item.script].filter(Boolean).join("\n").toLowerCase();
  const forbidden = [...defaultForbiddenPhrases, ...(brandBrain?.forbidden_ai_phrases || []), ...(brandBrain?.voice_tone.phrases_to_avoid || [])];
  const issues: string[] = [];

  for (const phrase of forbidden) {
    if (phrase && text.includes(phrase.toLowerCase())) {
      issues.push(`Uses forbidden phrase: "${phrase}"`);
    }
  }

  if (brandBrain?.clinical_safety_rules.avoid_diagnostic_certainty !== false) {
    for (const pattern of diagnosticCertaintyPatterns) {
      if (pattern.test(text)) issues.push("May imply diagnostic certainty.");
    }
  }

  if (brandBrain?.clinical_safety_rules.avoid_overpromising !== false) {
    for (const pattern of overpromisePatterns) {
      if (pattern.test(text)) issues.push("May overpromise outcomes.");
    }
  }

  return {
    passed: issues.length === 0,
    issues
  };
}
