import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const { contentId, canvaTemplateId, canvaDesignUrl } = await request.json();

    if (!contentId) {
      return NextResponse.json({ error: "contentId is required." }, { status: 400 });
    }

    if (!process.env.CANVA_CLIENT_ID || !process.env.CANVA_CLIENT_SECRET) {
      return NextResponse.json({
        status: "prepared",
        message: "Canva API credentials are not configured yet. Use the suggested visual in Canva manually, then save the Canva design URL here when available."
      });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("generated_content")
      .update({
        canva_template_id: canvaTemplateId || null,
        canva_design_url: canvaDesignUrl || null
      })
      .eq("id", contentId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      item: data,
      message: "Canva design metadata saved. Automated Canva creation is prepared for the official OAuth/template phase."
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save Canva design metadata." }, { status: 500 });
  }
}
