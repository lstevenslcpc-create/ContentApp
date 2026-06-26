import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoldStandardExample } from "./types";

type RetrievalRequest = {
  userId: string;
  topic?: string | null;
  audience?: string | null;
  platform?: string | null;
  contentType?: string | null;
  limit?: number;
};

function normalize(value: unknown) {
  return String(value || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesToken(text: string, value: unknown) {
  const token = normalize(value);
  return Boolean(token && text.includes(token));
}

function scoreExample(example: GoldStandardExample, request: RetrievalRequest) {
  const searchable = normalize([
    example.title,
    example.topic,
    example.subtopic,
    example.audience,
    example.platform,
    example.content_type,
    example.hook,
    example.full_content,
    example.cta,
    example.collection,
    example.why_gold_standard,
    ...(example.tags || [])
  ].filter(Boolean).join(" "));

  let score = 0;
  if (includesToken(searchable, request.topic)) score += 35;
  if (includesToken(searchable, request.audience)) score += 20;
  if (normalize(example.platform) === normalize(request.platform)) score += 20;
  if (normalize(example.content_type) === normalize(request.contentType)) score += 20;
  if ((example.tags || []).some((tag) => includesToken(normalize(request.topic), tag) || includesToken(searchable, tag))) score += 10;
  if (normalize(example.status) === "approved") score += 10;
  return score;
}

export async function getRelevantGoldStandardExamples(
  supabase: SupabaseClient,
  request: RetrievalRequest
) {
  const { data, error } = await supabase
    .from("gold_standard_examples")
    .select("*")
    .eq("user_id", request.userId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    console.warn("[gold-standard-library][retrieval-failed]", {
      message: error.message,
      code: error.code
    });
    return [];
  }

  return ((data || []) as GoldStandardExample[])
    .map((example) => ({ example, score: scoreExample(example, request) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, request.limit || 5)
    .map((item) => item.example);
}

export function formatGoldStandardExamplesForPrompt(examples: GoldStandardExample[]) {
  if (!examples.length) return "";

  return `
Gold Standard Library examples:
- These are approved LionHeart examples for stylistic inspiration only.
- The LionHeart Voice Library remains the rulebook. These examples are the example bank.
- Study rhythm, emotional specificity, hook structure, therapist insight style, CTA texture, and what makes the examples work.
- Do not copy, paraphrase, reuse exact lines, or imitate a post too closely.

${examples.map((example, index) => `
Example ${index + 1}: ${example.title}
- Platform: ${example.platform || "Not labeled"}
- Topic: ${example.topic || "Not labeled"}
- Audience: ${example.audience || "Not labeled"}
- Content type: ${example.content_type || "Not labeled"}
- Hook style: ${example.hook || "Not labeled"}
- CTA style: ${example.cta || "Not labeled"}
- Why it is gold standard: ${example.why_gold_standard || "Strong LionHeart-style example."}
- Tags: ${(example.tags || []).join(", ") || "None"}
- Content excerpt: ${example.full_content.slice(0, 900)}
`).join("\n")}
`;
}
