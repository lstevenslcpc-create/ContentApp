import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { MediaLibraryAsset } from "@/lib/types";

const allowedAssetTypes = [
  "image",
  "video",
  "caption",
  "carousel",
  "blog outline",
  "Pinterest pin",
  "TikTok script",
  "email",
  "Canva direction",
  "product promo",
  "therapy service promo"
];

function assetPayload(body: Partial<MediaLibraryAsset>, userId: string) {
  const assetType = body.asset_type || "caption";

  if (!allowedAssetTypes.includes(assetType)) {
    throw new Error("Unsupported media library asset type.");
  }

  return {
    user_id: userId,
    title: body.title || "Untitled asset",
    description: body.description || null,
    asset_type: assetType,
    source: body.source || "manual_upload",
    platform: body.platform || null,
    content_pillar: body.content_pillar || null,
    product_tie_in: body.product_tie_in || null,
    service_tie_in: body.service_tie_in || null,
    campaign_id: body.campaign_id || null,
    linked_content_id: body.linked_content_id || null,
    media_url: body.media_url || null,
    thumbnail_url: body.thumbnail_url || body.media_url || null,
    text_content: body.text_content || null,
    prompt: body.prompt || null,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    status: body.status || "saved",
    metadata: body.metadata || {}
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    let query = supabase.from("media_library").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    for (const key of ["asset_type", "platform", "content_pillar", "product_tie_in", "service_tie_in", "status"]) {
      const value = searchParams.get(key);
      if (value) query = query.eq(key, value);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ assets: data || [] });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load media library." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as Partial<MediaLibraryAsset>;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from("media_library").insert(assetPayload(body, user.id)).select("*").single();
    if (error) throw error;

    return NextResponse.json({ asset: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save media library asset." }, { status: 500 });
  }
}
