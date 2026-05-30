import type { MediaGenerationRequest, MediaProviderResponse } from "@/lib/types";
import { generateWithFal } from "./providers/fal";
import { generateWithHiggsfield } from "./providers/higgsfield";
import { generateWithOpenAI } from "./providers/openai";

export async function generateMedia(input: MediaGenerationRequest): Promise<MediaProviderResponse> {
  const provider = (process.env.MEDIA_PROVIDER || "fal").toLowerCase();

  if (provider === "fal") return generateWithFal(input);
  if (provider === "higgsfield") return generateWithHiggsfield(input);
  if (provider === "openai") return generateWithOpenAI();
  if (provider === "replicate" || provider === "runway") {
    return {
      provider,
      status: "failed",
      error: `${provider} is reserved for a future provider adapter. Set MEDIA_PROVIDER=fal for this MVP.`
    };
  }

  return {
    provider,
    status: "failed",
    error: `Unknown MEDIA_PROVIDER "${provider}". Supported values: fal, higgsfield, openai, replicate, runway.`
  };
}
