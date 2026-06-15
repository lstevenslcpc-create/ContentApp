import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import {
  generatedRevisionSnapshot,
  improveGeneratedContent,
  pushRevisionHistory,
  type ContentImproveAction,
  type GeneratedContentRevision
} from "@/lib/contentRevision";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { GeneratedContent } from "@/lib/types";

export const runtime = "nodejs";

const improveActions: ContentImproveAction[] = [
  "regenerate_hook",
  "regenerate_caption",
  "regenerate_hashtags",
  "make_more_emotional",
  "make_more_clinical",
  "make_less_salesy",
  "add_real_life_examples",
  "shorten_caption",
  "rewrite_instagram",
  "rewrite_tiktok",
  "rewrite_pinterest",
  "rewrite_carousel"
];

type RouteContext = { params: Promise<{ id: string }> };

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

async function paramsId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

function revisionHistory(item: GeneratedContent) {
  const why = item.why_this_works && typeof item.why_this_works === "object" ? item.why_this_works as Record<string, unknown> : {};
  return Array.isArray(why.revision_history) ? why.revision_history as GeneratedContentRevision[] : [];
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const body = await request.json();
    const action = String(body.action || "");

    const supabase = getSupabaseAdmin();
    const { data: item, error: itemError } = await supabase
      .from("generated_content")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (itemError) throw itemError;
    const current = item as GeneratedContent;

    if (action === "undo_last_change") {
      const history = revisionHistory(current);
      const previous = history[history.length - 1];
      if (!previous) {
        return NextResponse.json({ ok: false, error: "There is no previous generated content revision to undo." }, { status: 400 });
      }

      const whyThisWorks = current.why_this_works && typeof current.why_this_works === "object" ? current.why_this_works as Record<string, unknown> : {};
      const { data, error } = await supabase
        .from("generated_content")
        .update({
          hook: previous.hook,
          caption: previous.caption,
          hashtags: previous.hashtags || [],
          visual_idea: previous.visual_idea,
          script: previous.script,
          platform: previous.platform,
          content_type: previous.content_type,
          why_this_works: {
            ...whyThisWorks,
            revision_history: history.slice(0, -1),
            last_revision_action: "undo_last_change",
            last_revision_at: new Date().toISOString()
          }
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, item: data });
    }

    if (!improveActions.includes(action as ContentImproveAction)) {
      return NextResponse.json({ ok: false, error: "Unsupported content improvement action." }, { status: 400 });
    }

    const { data: brandBrain, error: brandError } = await supabase
      .from("brand_brains")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (brandError) throw brandError;

    const updates = await improveGeneratedContent(current, action as ContentImproveAction, brandBrain);
    const revision = generatedRevisionSnapshot(current, action);
    const whyThisWorks = pushRevisionHistory(current.why_this_works, revision);

    const { data, error } = await supabase
      .from("generated_content")
      .update({
        ...updates,
        why_this_works: whyThisWorks
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, item: data });
  } catch (error) {
    console.error("[content][improve]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
