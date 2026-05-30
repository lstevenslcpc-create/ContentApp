import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateWithFal } from "@/lib/media/providers/fal";

export async function POST(request: Request) {
  try {
    await requireApiUser(request);
    const body = await request.json();
    const result = await generateWithFal(body);
    return NextResponse.json(result, { status: result.status === "failed" ? 400 : 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ provider: "fal", status: "failed", error: error instanceof Error ? error.message : "Unable to generate fal media." }, { status: 500 });
  }
}
