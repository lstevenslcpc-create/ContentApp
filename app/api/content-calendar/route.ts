import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const grouped = (data || []).reduce<Record<string, typeof data>>((acc, item) => {
      const key = item.scheduled_for ? item.scheduled_for.slice(0, 10) : `Unscheduled - ${item.status}`;
      acc[key] = acc[key] || [];
      acc[key]?.push(item);
      return acc;
    }, {});

    return NextResponse.json({ grouped, items: data || [] });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load calendar." }, { status: 500 });
  }
}
