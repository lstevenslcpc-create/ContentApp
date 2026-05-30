import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const { contentId, scheduledFor } = await request.json();
    if (!contentId || !scheduledFor) {
      return NextResponse.json({ error: "contentId and scheduledFor are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: loadError } = await supabase.from("generated_content").select("status").eq("id", contentId).eq("user_id", user.id).single();
    if (loadError) throw loadError;
    if (!["approved", "needs_review"].includes(existing.status)) {
      return NextResponse.json({ error: "Only approved or needs_review content can be scheduled." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("generated_content")
      .update({ status: "scheduled", scheduled_for: new Date(scheduledFor).toISOString() })
      .eq("id", contentId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to schedule content." }, { status: 500 });
  }
}
