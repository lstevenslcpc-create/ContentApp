import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { GoldStandardExample } from "@/lib/types";

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function payload(body: Partial<GoldStandardExample>, userId: string) {
  const fullContent = String(body.full_content || "").trim();
  if (!fullContent) throw new Error("Full content is required.");
  return {
    user_id: userId,
    title: String(body.title || body.hook || fullContent.slice(0, 80) || "Untitled gold standard").trim(),
    platform: body.platform || null,
    topic: body.topic || null,
    subtopic: body.subtopic || null,
    audience: body.audience || null,
    content_type: body.content_type || null,
    hook: body.hook || null,
    full_content: fullContent,
    cta: body.cta || null,
    tags: asStringArray(body.tags),
    collection: body.collection || null,
    why_gold_standard: body.why_gold_standard || null,
    notes: body.notes || null,
    status: body.status || "approved",
    metadata: body.metadata || {}
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const includeArchived = searchParams.get("includeArchived") === "true";
    let query = supabase
      .from("gold_standard_examples")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!includeArchived) query = query.neq("status", "archived");
    for (const key of ["platform", "topic", "content_type", "collection", "status"]) {
      const value = searchParams.get(key);
      if (value) query = query.eq(key, value);
    }

    const { data, error } = await query;
    if (error) throw error;
    const examples = search
      ? (data || []).filter((example) => [
        example.title,
        example.platform,
        example.topic,
        example.subtopic,
        example.audience,
        example.content_type,
        example.hook,
        example.full_content,
        example.cta,
        example.collection,
        example.why_gold_standard,
        example.notes,
        ...(example.tags || [])
      ].filter(Boolean).join(" ").toLowerCase().includes(search))
      : data || [];
    return NextResponse.json({ examples });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message = error instanceof Error ? error.message : "Unable to load Gold Standard Library.";
    const setupMessage = /gold_standard_examples|schema cache|PGRST205/i.test(message)
      ? "Gold Standard Library table is missing. Run the Supabase migration for gold_standard_examples first."
      : message;
    return NextResponse.json({ error: setupMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json() as Partial<GoldStandardExample> & { examples?: Partial<GoldStandardExample>[] };
    const supabase = getSupabaseAdmin();
    const items: Partial<GoldStandardExample>[] = Array.isArray(body.examples) ? body.examples : [body];
    const rows = items.map((item) => payload(item, user.id));
    const { data, error } = await supabase.from("gold_standard_examples").insert(rows).select("*");
    if (error) throw error;
    return NextResponse.json({ examples: data || [], count: data?.length || 0 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message = error instanceof Error ? error.message : "Unable to save Gold Standard examples.";
    const setupMessage = /gold_standard_examples|schema cache|PGRST205/i.test(message)
      ? "Gold Standard Library table is missing. Run the Supabase migration for gold_standard_examples first."
      : message;
    return NextResponse.json({ error: setupMessage }, { status: 500 });
  }
}
