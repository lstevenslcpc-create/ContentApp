import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import {
  improveCanvaSlide,
  improveContentPackSection,
  packRevisionSnapshot,
  pushPackRevisionHistory,
  type CanvaSlideImproveAction,
  type ContentImproveAction,
  type ContentPackRevision
} from "@/lib/contentRevision";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentPack, ContentPackBody, ContentPackSectionKey } from "@/lib/types";

export const runtime = "nodejs";

const packActions: ContentImproveAction[] = [
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

const slideActions: CanvaSlideImproveAction[] = [
  "regenerate_slide",
  "shorten_slide",
  "make_slide_more_emotional",
  "make_slide_clearer"
];

const sectionKeys: ContentPackSectionKey[] = [
  "tiktok_reels_script",
  "instagram_carousel_outline",
  "slide_by_slide_carousel_copy",
  "instagram_caption",
  "pinterest_pin_title",
  "pinterest_description",
  "threads_post",
  "blog_outline",
  "email_newsletter_blurb",
  "canva_visual_direction",
  "product_cta",
  "therapy_service_cta",
  "safety_disclaimer"
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

function metadataRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringRecord(value: unknown) {
  const source = metadataRecord(value);
  return Object.fromEntries(Object.entries(source).map(([key, item]) => [key, String(item || "")]));
}

function revisionHistory(pack: ContentPack) {
  return Array.isArray(pack.metadata?.revisionHistory) ? pack.metadata.revisionHistory as ContentPackRevision[] : [];
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const body = await request.json();
    const action = String(body.action || "");
    const target = String(body.target || "section");
    const sectionKey = String(body.sectionKey || "");
    const fieldKey = String(body.fieldKey || "");

    const supabase = getSupabaseAdmin();
    const { data: packData, error: packError } = await supabase
      .from("content_packs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (packError) throw packError;
    const pack = packData as ContentPack;

    if (action === "undo_last_change") {
      const history = revisionHistory(pack);
      const previous = history[history.length - 1];
      if (!previous) {
        return NextResponse.json({ ok: false, error: "There is no previous content pack revision to undo." }, { status: 400 });
      }

      const metadata = {
        ...metadataRecord(pack.metadata),
        ...(previous.canvaFillPackage ? { canvaFillPackage: previous.canvaFillPackage, canvaFillPackageVersion: 2 } : {}),
        revisionHistory: history.slice(0, -1),
        lastRevisionAction: "undo_last_change",
        lastRevisionAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("content_packs")
        .update({
          pack: previous.pack || pack.pack,
          metadata
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, pack: data });
    }

    const { data: brandBrain, error: brandError } = await supabase
      .from("brand_brains")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (brandError) throw brandError;

    const revision = packRevisionSnapshot(pack, action, sectionKey || undefined, fieldKey || undefined);
    const metadataBase = pushPackRevisionHistory(pack.metadata, revision);

    if (target === "slide") {
      if (!slideActions.includes(action as CanvaSlideImproveAction)) {
        return NextResponse.json({ ok: false, error: "Unsupported Canva slide improvement action." }, { status: 400 });
      }
      if (!fieldKey) {
        return NextResponse.json({ ok: false, error: "fieldKey is required for Canva slide edits." }, { status: 400 });
      }

      const currentFillPackage = stringRecord(pack.metadata?.canvaFillPackage);
      const currentValue = currentFillPackage[fieldKey] || "";
      const nextValue = await improveCanvaSlide(pack, fieldKey, currentValue, action as CanvaSlideImproveAction, brandBrain);
      const nextFillPackage = { ...currentFillPackage, [fieldKey]: nextValue };
      const metadata = {
        ...metadataBase,
        canvaFillPackage: nextFillPackage,
        canvaFillPackageVersion: 2,
        canvaFillPackageUpdatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("content_packs")
        .update({ metadata })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, pack: data });
    }

    if (!packActions.includes(action as ContentImproveAction)) {
      return NextResponse.json({ ok: false, error: "Unsupported content pack improvement action." }, { status: 400 });
    }
    if (!sectionKeys.includes(sectionKey as ContentPackSectionKey)) {
      return NextResponse.json({ ok: false, error: "A valid sectionKey is required for content pack edits." }, { status: 400 });
    }

    const nextValue = await improveContentPackSection(pack, sectionKey as ContentPackSectionKey, action as ContentImproveAction, brandBrain);
    const nextPack: ContentPackBody = {
      ...(pack.pack || {}),
      [sectionKey]: nextValue
    } as ContentPackBody;

    const { data, error } = await supabase
      .from("content_packs")
      .update({
        pack: nextPack,
        metadata: {
          ...metadataBase,
          lastImprovedSection: sectionKey,
          lastImprovedAt: new Date().toISOString()
        }
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, pack: data });
  } catch (error) {
    console.error("[content-packs][improve]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
