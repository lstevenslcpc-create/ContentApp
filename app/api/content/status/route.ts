import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { scanContentRisk } from "@/lib/brandBrain/riskScan";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentStatus } from "@/lib/types";

const statuses: ContentStatus[] = ["draft", "needs_review", "approved", "scheduled", "posted", "failed"];

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const { contentId, status } = await request.json();
    if (!contentId || !statuses.includes(status)) {
      return NextResponse.json({ error: "Valid contentId and status are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (status === "approved") {
      const { data: item, error: itemError } = await supabase
        .from("generated_content")
        .select("hook, caption, script")
        .eq("id", contentId)
        .eq("user_id", user.id)
        .single();

      if (itemError) throw itemError;

      const { data: brandBrain, error: brandBrainError } = await supabase.from("brand_brains").select("*").eq("user_id", user.id).maybeSingle();
      if (brandBrainError) throw brandBrainError;

      const risk = scanContentRisk(item, brandBrain);
      if (!risk.passed) {
        return NextResponse.json(
          {
            error: "Clinical safety scan blocked approval. Edit the content before approving.",
            issues: risk.issues
          },
          { status: 400 }
        );
      }
    }

    const payload = status === "posted" ? { status, posted_at: new Date().toISOString() } : { status };
    const { data, error } = await supabase.from("generated_content").update(payload).eq("id", contentId).eq("user_id", user.id).select("*").single();
    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update status." }, { status: 500 });
  }
}
