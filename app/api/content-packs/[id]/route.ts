import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { generateContentPack } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ContentOpportunity, ContentPackBody, ContentStatus } from "@/lib/types";

export const runtime = "nodejs";

const allowedStatuses: ContentStatus[] = ["draft", "needs_review", "approved", "scheduled", "posted", "failed"];
const allowedDesignStatuses = ["not_started", "ready_for_canva", "design_started", "designed_in_canva"];

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

type RouteContext = { params: Promise<{ id: string }> };

async function paramsId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

async function loadPack(userId: string, id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_packs")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) throw new Error(`Unable to load content pack: ${error.message}`);
  return data;
}

async function loadBrandBrain(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("brand_brains")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function loadOpportunity(userId: string, pack: Record<string, unknown>): Promise<ContentOpportunity> {
  const opportunityId = typeof pack.opportunity_id === "string" ? pack.opportunity_id : "";
  if (opportunityId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_opportunities")
      .select("*")
      .eq("user_id", userId)
      .eq("id", opportunityId)
      .single();

    if (!error && data) return data as ContentOpportunity;
  }

  return {
    id: opportunityId || undefined,
    topic: String(pack.source_topic || pack.title || "Content pack"),
    audience: String(pack.audience || "LionHeart Therapy audience"),
    content_pillar: String(pack.content_pillar || "Trust-building"),
    platform_recommendations: {},
    seo_keywords: [],
    emotional_angle: "Emotionally specific therapist-authored content.",
    product_tie_in: typeof pack.product_tie_in === "string" ? pack.product_tie_in : "",
    service_tie_in: typeof pack.service_tie_in === "string" ? pack.service_tie_in : "",
    cta: "Save this for later and reach out when you are ready for support.",
    clinical_sensitivity: pack.clinical_sensitivity === "low" || pack.clinical_sensitivity === "high" ? pack.clinical_sensitivity : "medium"
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const pack = await loadPack(user.id, id);
    return NextResponse.json({ ok: true, pack });
  } catch (error) {
    console.error("[content-packs][GET id]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ ok: false, error: "Unsupported content pack status." }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.pack && typeof body.pack === "object") {
      updates.pack = body.pack as ContentPackBody;
    }

    if (body.designStatus) {
      if (!allowedDesignStatuses.includes(body.designStatus)) {
        return NextResponse.json({ ok: false, error: "Unsupported Canva design status." }, { status: 400 });
      }
      updates.design_status = body.designStatus;
    }

    if (body.canvaBrief && typeof body.canvaBrief === "object") {
      updates.canva_brief = body.canvaBrief;
    }

    if (body.canvaTemplateId === null || typeof body.canvaTemplateId === "string") {
      updates.canva_template_id = body.canvaTemplateId;
    }

    if (body.metadata && typeof body.metadata === "object") {
      updates.metadata = body.metadata;
    }

    if (typeof body.archived === "boolean") {
      const existing = await loadPack(user.id, id);
      updates.metadata = {
        ...(existing.metadata && typeof existing.metadata === "object" ? existing.metadata as Record<string, unknown> : {}),
        ...(updates.metadata && typeof updates.metadata === "object" ? updates.metadata : {}),
        archived: body.archived,
        archivedAt: body.archived ? new Date().toISOString() : null
      };
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ ok: false, error: "No content pack updates were provided." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_packs")
      .update(updates)
      .eq("user_id", user.id)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, pack: data });
  } catch (error) {
    console.error("[content-packs][PATCH]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const supabase = getSupabaseAdmin();

    await supabase
      .from("content_calendar_plans")
      .update({ content_pack_id: null })
      .eq("user_id", user.id)
      .eq("content_pack_id", id);

    const { error } = await supabase
      .from("content_packs")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[content-packs][DELETE]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const id = await paramsId(context);
    const body = await request.json();
    const sectionKey = typeof body.sectionKey === "string" ? body.sectionKey : undefined;
    const existing = await loadPack(user.id, id);
    const opportunity = await loadOpportunity(user.id, existing);
    const brandBrain = await loadBrandBrain(user.id);
    const generated = await generateContentPack(opportunity, brandBrain, sectionKey);
    const currentPack = existing.pack && typeof existing.pack === "object" ? existing.pack as ContentPackBody : generated.pack;
    const nextPack = sectionKey && sectionKey in generated.pack
      ? { ...currentPack, [sectionKey]: generated.pack[sectionKey as keyof ContentPackBody] }
      : generated.pack;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("content_packs")
      .update({
        pack: nextPack,
        metadata: {
          ...(existing.metadata && typeof existing.metadata === "object" ? existing.metadata as Record<string, unknown> : {}),
          lastRegeneratedSection: sectionKey || "all",
          regenerationWarnings: generated.warnings
        }
      })
      .eq("user_id", user.id)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, pack: data, warnings: generated.warnings });
  } catch (error) {
    console.error("[content-packs][POST id]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
