import { NextResponse } from "next/server";
import { getContentIntelligenceDiagnostics } from "@/lib/contentIntelligenceDiagnostics";

export async function GET(request: Request) {
  return NextResponse.json(await getContentIntelligenceDiagnostics(request));
}
