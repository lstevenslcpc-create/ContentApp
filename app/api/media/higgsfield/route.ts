import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateWithHiggsfield } from "@/lib/media/providers/higgsfield";

export async function POST(request: Request) {
  try {
    await requireApiUser(request);
    const body = await request.json();
    const result = await generateWithHiggsfield(body);
    return NextResponse.json(result, { status: result.status === "failed" ? 400 : 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ provider: "higgsfield", status: "failed", error: error instanceof Error ? error.message : "Unable to generate Higgsfield media." }, { status: 500 });
  }
}
