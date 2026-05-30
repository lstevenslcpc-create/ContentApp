import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateMedia } from "@/lib/media/generateMedia";
import { getSupabaseAdmin, getSupabaseSetupError } from "@/lib/supabaseAdmin";
import type { MediaGenerationRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as MediaGenerationRequest;
    if (!body.prompt?.trim() || !body.mediaType) {
      return NextResponse.json({ error: "prompt and mediaType are required." }, { status: 400 });
    }

    const supabase = getSupabaseSetupError() ? null : getSupabaseAdmin();
    const { data: brandBrain } = supabase
      ? await supabase.from("brand_brains").select("visual_identity, clinical_safety_rules").eq("user_id", user.id).maybeSingle()
      : { data: null };

    const visualIdentity = brandBrain?.visual_identity as
      | { brand_colors?: string[]; aesthetic_descriptors?: string[]; banned_visual_styles?: string[]; preferred_content_vibe?: string; canva_template_categories?: string[] }
      | undefined;

    const promptWithBrandBrain = visualIdentity
      ? [
          body.prompt,
          `Brand visual identity: colors ${visualIdentity.brand_colors?.join(", ") || "not specified"}; aesthetic ${visualIdentity.aesthetic_descriptors?.join(", ") || "not specified"}; vibe ${visualIdentity.preferred_content_vibe || "not specified"}.`,
          `Avoid visual styles: ${visualIdentity.banned_visual_styles?.join(", ") || "none specified"}.`,
          `Canva direction categories: ${visualIdentity.canva_template_categories?.join(", ") || "not specified"}.`
        ].join("\n")
      : body.prompt;

    const result = await generateMedia({ ...body, prompt: promptWithBrandBrain });

    if (body.contentId && supabase) {
      await supabase
        .from("generated_content")
        .update({
          media_url: result.mediaUrl || null,
          media_provider: result.provider,
          media_job_id: result.jobId || null,
          media_status: result.status
        })
        .eq("id", body.contentId)
        .eq("user_id", user.id);
    }

    if (result.status === "completed" && result.mediaUrl && supabase) {
      const selectedContent = body.contentId
        ? await supabase.from("generated_content").select("hook, platform, content_type, content_goal, visual_idea").eq("id", body.contentId).eq("user_id", user.id).maybeSingle()
        : { data: null };

      await supabase.from("media_library").insert({
        user_id: user.id,
        title: selectedContent.data?.hook || `${body.mediaType === "video" ? "Video" : "Image"} generated from AI Media Generator`,
        description: selectedContent.data?.visual_idea || null,
        asset_type: body.mediaType,
        source: "ai_media_generator",
        platform: selectedContent.data?.platform || null,
        content_pillar: selectedContent.data?.content_goal || null,
        linked_content_id: body.contentId || null,
        media_url: result.mediaUrl,
        thumbnail_url: result.mediaUrl,
        prompt: body.prompt,
        tags: [body.mediaType, result.provider, body.aspectRatio, body.style].filter(Boolean),
        status: "saved",
        metadata: {
          provider: result.provider,
          jobId: result.jobId,
          contentType: selectedContent.data?.content_type || null
        }
      });
    }

    return NextResponse.json(result, { status: result.status === "failed" ? 400 : 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ provider: "unknown", status: "failed", error: error instanceof Error ? error.message : "Unable to generate media." }, { status: 500 });
  }
}
