import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const providers = ["canva", "instagram", "facebook", "tiktok", "linkedin", "youtube"];

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const { provider } = await request.json();

    if (!providers.includes(provider)) {
      return NextResponse.json({ error: "Unsupported integration provider." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("integration_connections")
      .upsert(
        {
          user_id: user.id,
          provider,
          status: "prepared",
          metadata: { auto_posting_enabled: false }
        },
        { onConflict: "user_id,provider" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      integration: data,
      message: `${provider} integration prepared. OAuth connection and auto-posting remain disabled until official approval flow is added.`
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to prepare integration." }, { status: 500 });
  }
}
