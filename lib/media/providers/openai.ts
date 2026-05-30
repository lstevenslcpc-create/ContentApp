import type { MediaProviderResponse } from "@/lib/types";

export async function generateWithOpenAI(): Promise<MediaProviderResponse> {
  return {
    provider: "openai",
    status: "failed",
    error: "OpenAI media generation is not implemented yet. Use MEDIA_PROVIDER=fal for the MVP."
  };
}
