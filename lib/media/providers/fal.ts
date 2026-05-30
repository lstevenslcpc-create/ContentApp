import { fal } from "@fal-ai/client";
import type { MediaGenerationRequest, MediaProviderResponse } from "@/lib/types";

function extractMediaUrl(result: unknown): string | undefined {
  const data = result as {
    image?: { url?: string };
    images?: Array<{ url?: string }>;
    video?: { url?: string };
    videos?: Array<{ url?: string }>;
    url?: string;
  };

  return data.image?.url || data.images?.[0]?.url || data.video?.url || data.videos?.[0]?.url || data.url;
}

function normalizeAspectRatio(aspectRatio?: string) {
  if (aspectRatio === "9:16") return "portrait_16_9";
  if (aspectRatio === "16:9") return "landscape_16_9";
  return "square";
}

export async function generateWithFal(input: MediaGenerationRequest): Promise<MediaProviderResponse> {
  if (!process.env.FAL_KEY) {
    return {
      provider: "fal",
      status: "failed",
      error: "FAL_KEY is missing. Add FAL_KEY to your server environment to enable fal.ai media generation."
    };
  }

  const imageModel = process.env.FAL_IMAGE_MODEL || "fal-ai/flux/schnell";
  const videoModel = process.env.FAL_VIDEO_MODEL || "";
  const model = input.mediaType === "video" ? videoModel : imageModel;

  if (input.mediaType === "video" && !videoModel) {
    return {
      provider: "fal",
      status: "failed",
      error: "FAL_VIDEO_MODEL is not configured yet. Add a fal video model ID to enable video generation."
    };
  }

  try {
    fal.config({ credentials: process.env.FAL_KEY });
    const styledPrompt = [input.prompt, input.style ? `Style: ${input.style}` : ""].filter(Boolean).join("\n");

    const result = await fal.subscribe(model, {
      input: {
        prompt: styledPrompt,
        image_size: normalizeAspectRatio(input.aspectRatio),
        aspect_ratio: input.aspectRatio
        // Adjust model-specific input parameters here when switching fal models.
      },
      logs: false
    });

    const raw = result.data ?? result;
    const mediaUrl = extractMediaUrl(raw);

    return {
      provider: "fal",
      status: mediaUrl ? "completed" : "processing",
      mediaUrl,
      jobId: result.requestId,
      message: mediaUrl ? "Media generated successfully." : "fal.ai accepted the request, but no media URL was returned yet.",
      raw
    };
  } catch (error) {
    return {
      provider: "fal",
      status: "failed",
      error: error instanceof Error ? error.message : "fal.ai media generation failed."
    };
  }
}
