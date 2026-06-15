import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load business profile." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json();
    if (!body.business_name?.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const payload = {
      user_id: user.id,
      business_name: body.business_name,
      industry: body.industry || null,
      services_offered: body.services_offered || null,
      target_audience: body.target_audience || null,
      location_served: body.location_served || null,
      brand_voice: body.brand_voice || null,
      main_goal: body.main_goal || null,
      website_link: body.website_link || null,
      social_handles: body.social_handles || {},
      offer_promotion: body.offer_promotion || null,
      call_to_action: body.call_to_action || null
    };

    const { data: existing, error: existingError } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;

    const query = existing?.id
      ? supabase.from("business_profiles").update(payload).eq("user_id", user.id).eq("id", existing.id)
      : supabase.from("business_profiles").insert(payload);

    const { data, error } = await query.select("*").single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save business profile." }, { status: 500 });
  }
}
