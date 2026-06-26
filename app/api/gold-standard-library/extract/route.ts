import { NextResponse } from "next/server";
import OpenAI from "openai";
import { authErrorResponse, requireApiUser } from "@/lib/auth";

function fallbackExtract(raw: string) {
  const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const hook = lines[0] || raw.slice(0, 120);
  const cta = [...lines].reverse().find((line) => /save|send|follow|comment|share|download|book|learn|try/i.test(line)) || "";
  return {
    title: hook.slice(0, 90),
    platform: "",
    topic: "",
    subtopic: "",
    audience: "",
    content_type: "",
    hook,
    full_content: raw,
    cta,
    tags: [],
      collection: "",
      story_framework: "",
      emotional_destination: "",
      why_gold_standard: "Imported as a strong LionHeart-style reference. Review and edit before saving.",
    notes: ""
  };
}

export async function POST(request: Request) {
  try {
    await requireApiUser(request);
    const body = await request.json();
    const posts: string[] = Array.isArray(body.posts) ? body.posts.map(String).filter(Boolean) : [];
    if (!posts.length) return NextResponse.json({ entries: [] });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ entries: posts.map(fallbackExtract), warning: "OPENAI_API_KEY is missing, so fields were parsed locally." });
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.25,
        max_tokens: 2200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return only valid JSON. Extract editable metadata for Gold Standard Library imports. Do not rewrite the posts." },
          { role: "user", content: `
For each post, suggest metadata fields for a LionHeart Therapy Gold Standard Library import.
Return JSON:
{
  "entries": [
    {
      "title": "",
      "platform": "",
      "topic": "",
      "subtopic": "",
      "audience": "",
      "content_type": "",
      "hook": "",
      "full_content": "",
      "cta": "",
      "tags": ["tag"],
      "collection": "",
      "story_framework": "",
      "emotional_destination": "",
      "why_gold_standard": "",
      "notes": ""
    }
  ]
}

Posts:
${posts.map((post, index) => `POST ${index + 1}\n${post}`).join("\n\n---\n\n")}
` }
        ]
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      const result = JSON.parse(raw) as { entries?: unknown[] };
      const entries = Array.isArray(result.entries) ? result.entries : posts.map(fallbackExtract);
      return NextResponse.json({ entries });
    } catch (error) {
      console.warn("[gold-standard-extract][openai-failed]", error instanceof Error ? error.message : error);
      return NextResponse.json({ entries: posts.map(fallbackExtract), warning: "AI extraction failed, so fields were parsed locally." });
    }
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to extract Gold Standard fields." }, { status: 500 });
  }
}
