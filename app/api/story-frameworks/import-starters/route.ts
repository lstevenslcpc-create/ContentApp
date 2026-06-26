import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { STARTER_STORY_FRAMEWORKS } from "@/lib/storyFrameworks";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from("story_frameworks")
      .select("framework_name")
      .eq("user_id", user.id);
    if (existingError) throw existingError;
    const existingNames = new Set((existing || []).map((item) => String(item.framework_name).toLowerCase()));
    const rows = STARTER_STORY_FRAMEWORKS
      .filter((framework) => !existingNames.has(framework.framework_name.toLowerCase()))
      .map((framework) => ({ ...framework, user_id: user.id }));
    if (!rows.length) return NextResponse.json({ imported: 0, message: "Starter frameworks are already imported." });
    const { error } = await supabase.from("story_frameworks").insert(rows);
    if (error) throw error;
    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import starter frameworks." }, { status: 500 });
  }
}
