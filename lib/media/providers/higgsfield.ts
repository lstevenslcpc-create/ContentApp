import type { MediaGenerationRequest, MediaProviderResponse } from "@/lib/types";

export async function generateWithHiggsfield(input: MediaGenerationRequest): Promise<MediaProviderResponse> {
  const apiKey = process.env.HIGGSFIELD_API_KEY;
  const baseUrl = process.env.HIGGSFIELD_API_BASE_URL || "https://cloud.higgsfield.ai/api";

  if (!apiKey) {
    return {
      provider: "higgsfield",
      status: "failed",
      error: "HIGGSFIELD_API_KEY is missing. Higgsfield is optional and is not required for the MVP."
    };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return {
        provider: "higgsfield",
        status: "failed",
        error: `Higgsfield request failed with ${response.status}. Check the endpoint and API credentials.`
      };
    }

    const raw = await response.json();
    const mediaUrl = raw?.mediaUrl || raw?.url || raw?.video?.url || raw?.image?.url;

    return {
      provider: "higgsfield",
      status: mediaUrl ? "completed" : "processing",
      mediaUrl,
      jobId: raw?.id || raw?.jobId,
      raw
    };
  } catch (error) {
    return {
      provider: "higgsfield",
      status: "failed",
      error: error instanceof Error ? error.message : "Higgsfield generation failed."
    };
  }
}
