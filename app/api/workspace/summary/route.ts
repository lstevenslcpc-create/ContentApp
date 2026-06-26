import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentCalendarPlan, ContentPack, MediaLibraryAsset } from "@/lib/types";

export const runtime = "nodejs";

type GoldStandardSummary = {
  id: string;
  title: string;
  topic?: string | null;
  platform?: string | null;
  content_type?: string | null;
  created_at?: string;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function isMissingOptionalTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || "");
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isReadyToPost(pack: ContentPack, plans: ContentCalendarPlan[]) {
  const metadataStatus = typeof pack.metadata?.manualPostingStatus === "string" ? pack.metadata.manualPostingStatus : "";
  const hasPlan = plans.some((plan) => plan.content_pack_id === pack.id);
  return (
    ["approved", "scheduled"].includes(pack.status) &&
    pack.design_status === "designed_in_canva" &&
    hasPlan &&
    metadataStatus !== "posted" &&
    metadataStatus !== "failed"
  );
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const today = startOfToday();
    const weekEnd = addDays(today, 7);
    const todayText = today.toISOString().slice(0, 10);
    const weekEndText = weekEnd.toISOString().slice(0, 10);

    const [packsResult, plansResult, mediaResult, goldResult] = await Promise.all([
      supabase
        .from("content_packs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase
        .from("content_calendar_plans")
        .select("*, content_pack:content_packs(*)")
        .eq("user_id", user.id)
        .gte("planned_date", todayText)
        .lte("planned_date", weekEndText)
        .order("planned_date", { ascending: true })
        .limit(30),
      supabase
        .from("media_library")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("gold_standard_examples")
        .select("id,title,topic,platform,content_type,created_at")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

    if (packsResult.error) throw packsResult.error;

    const warnings: string[] = [];
    if (plansResult.error && !isMissingOptionalTable(plansResult.error)) warnings.push(`Calendar summary unavailable: ${plansResult.error.message}`);
    if (mediaResult.error && !isMissingOptionalTable(mediaResult.error)) warnings.push(`Media summary unavailable: ${mediaResult.error.message}`);
    if (goldResult.error && !isMissingOptionalTable(goldResult.error)) warnings.push(`Gold Standards summary unavailable: ${goldResult.error.message}`);

    const packs = ((packsResult.data || []) as ContentPack[]).filter((pack) => pack.metadata?.archived !== true);
    const plans = plansResult.error ? [] : (plansResult.data || []) as ContentCalendarPlan[];
    const mediaAssets = mediaResult.error ? [] : (mediaResult.data || []) as MediaLibraryAsset[];
    const goldStandards = goldResult.error ? [] : (goldResult.data || []) as GoldStandardSummary[];

    const needsReview = packs.filter((pack) => pack.status === "needs_review" || pack.status === "draft").slice(0, 8);
    const canvaNeeded = packs
      .filter((pack) => ["draft", "needs_review", "approved"].includes(pack.status) && pack.design_status !== "designed_in_canva")
      .slice(0, 8);
    const readyToPost = packs.filter((pack) => isReadyToPost(pack, plans)).slice(0, 8);
    const scheduledThisWeek = plans.filter((plan) => plan.content_pack_id).slice(0, 8);
    const mediaAwaitingApproval = mediaAssets.filter((asset) => asset.status === "draft" || asset.status === "saved").slice(0, 8);

    return NextResponse.json({
      ok: true,
      counts: {
        totalPacks: packs.length,
        needsReview: needsReview.length,
        canvaNeeded: canvaNeeded.length,
        scheduledThisWeek: scheduledThisWeek.length,
        readyToPost: readyToPost.length,
        mediaAwaitingApproval: mediaAwaitingApproval.length
      },
      today: {
        needsReview,
        canvaNeeded,
        scheduledThisWeek,
        readyToPost,
        mediaAwaitingApproval,
        recentGoldStandards: goldStandards
      },
      warnings
    });
  } catch (error) {
    console.error("[workspace-summary][GET]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
