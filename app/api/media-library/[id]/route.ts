import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { MediaLibraryAsset } from "@/lib/types";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const body = (await request.json()) as Partial<MediaLibraryAsset>;
    const supabase = getSupabaseAdmin();

    const update = {
      title: body.title,
      description: body.description,
      asset_type: body.asset_type,
      source: body.source,
      platform: body.platform,
      content_pillar: body.content_pillar,
      product_tie_in: body.product_tie_in,
      service_tie_in: body.service_tie_in,
      campaign_id: body.campaign_id,
      linked_content_id: body.linked_content_id,
      media_url: body.media_url,
      thumbnail_url: body.thumbnail_url,
      text_content: body.text_content,
      prompt: body.prompt,
      tags: body.tags,
      status: body.status,
      metadata: body.metadata
    };

    const cleanUpdate = Object.fromEntries(Object.entries(update).filter(([, value]) => value !== undefined));
    const { data, error } = await supabase.from("media_library").update(cleanUpdate).eq("id", id).eq("user_id", user.id).select("*").single();
    if (error) throw error;

    return NextResponse.json({ asset: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update media library asset." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("media_library").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete media library asset." }, { status: 500 });
  }
}
