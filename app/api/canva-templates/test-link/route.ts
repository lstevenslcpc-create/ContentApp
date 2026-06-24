import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function isAllowedCanvaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["canva.com", "www.canva.com", "canva.link"].includes(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser(request);
    const body = await request.json();
    const url = String(body.url || "").trim();

    if (!isAllowedCanvaUrl(url)) {
      return NextResponse.json({ ok: false, error: "Enter a valid https Canva or canva.link URL." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
      if (response.status === 405 || response.status === 403) {
        response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
      }
      return NextResponse.json({
        ok: response.ok,
        reachable: response.ok,
        status: response.status,
        finalUrl: response.url,
        message: response.ok
          ? "Canva link responded successfully."
          : response.status === 403
            ? "Canva blocked server verification with status 403. Open the template link in your browser to confirm manually."
            : `Canva link responded with status ${response.status}.`
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("[canva-templates][test-link]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, reachable: false, error: errorMessage(error) }, { status: 500 });
  }
}
