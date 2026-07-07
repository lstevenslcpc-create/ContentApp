import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getModelRoutes, testOpenAiModelAvailability } from "@/lib/modelRouter";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

export async function POST(request: Request) {
  try {
    await requireApiUser(request);
    const body = await request.json();
    const feature = String(body.feature || "");
    const envVar = String(body.envVar || "");
    const route = getModelRoutes().find((item) => item.feature === feature || item.envVar === envVar);

    if (!route) {
      return NextResponse.json({ ok: false, error: "Unknown model feature." }, { status: 400 });
    }

    const attempts = [];
    const started = Date.now();
    let selectedModel = "";

    for (const model of route.candidates) {
      const attemptStarted = Date.now();
      const result = await testOpenAiModelAvailability({ model, timeoutMs: 12000 });
      const attempt = {
        model,
        ok: result.ok,
        responseTimeMs: Date.now() - attemptStarted,
        error: result.ok ? "" : result.error || "Model test failed."
      };
      attempts.push(attempt);

      if (result.ok) {
        selectedModel = model;
        break;
      }
    }

    return NextResponse.json({
      ok: Boolean(selectedModel),
      feature: route.feature,
      configuredModel: route.model,
      selectedModel: selectedModel || route.model,
      responseTimeMs: Date.now() - started,
      fallbackOccurred: Boolean(selectedModel && selectedModel !== route.model),
      attempts,
      error: selectedModel ? "" : "All configured model candidates failed the tiny availability test."
    });
  } catch (error) {
    console.error("[model-settings][test]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
