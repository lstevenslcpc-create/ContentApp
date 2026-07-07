import { NextResponse } from "next/server";
import { authErrorResponse, requireApiUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  analyzeClaudeDraft,
  generateBlogCreativeBrief,
  generateClaudePrompt,
  generateWeeklyAssets,
  loadWeeklyAuthorityContext,
  weeklyAssetsToContentPack,
  type BlogCreativeBrief,
  type ContentDna,
  type WeeklyAssets,
  type WeeklyAuthorityInput,
  type WeeklyAuthorityStatus
} from "@/lib/weeklyAuthority";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String((error as { message?: unknown }).message || "Unknown error");
  return String(error || "Unknown error");
}

function listFromInput(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeInput(body: Record<string, unknown>): WeeklyAuthorityInput {
  return {
    blogTopic: String(body.blogTopic || "").trim(),
    targetAudience: String(body.targetAudience || "").trim(),
    primaryKeyword: String(body.primaryKeyword || "").trim(),
    secondaryKeywords: listFromInput(body.secondaryKeywords),
    businessGoal: String(body.businessGoal || "trust building").trim(),
    ctaFocus: String(body.ctaFocus || "related blog").trim(),
    shopifyBlogCategory: String(body.shopifyBlogCategory || "").trim(),
    suggestedPublishDate: String(body.suggestedPublishDate || "").trim()
  };
}

async function loadProject(userId: string, projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("weekly_authority_projects")
    .select("*")
    .eq("user_id", userId)
    .eq("id", projectId)
    .single();

  if (error) throw new Error(`Unable to load Weekly Authority project: ${error.message}`);
  return data;
}

function projectInput(project: Record<string, unknown>): WeeklyAuthorityInput {
  return {
    blogTopic: String(project.blog_topic || ""),
    targetAudience: String(project.target_audience || ""),
    primaryKeyword: String(project.primary_keyword || ""),
    secondaryKeywords: Array.isArray(project.secondary_keywords) ? project.secondary_keywords.map(String) : [],
    businessGoal: String(project.business_goal || ""),
    ctaFocus: String(project.cta_focus || ""),
    shopifyBlogCategory: String(project.shopify_blog_category || ""),
    suggestedPublishDate: String(project.suggested_publish_date || "")
  };
}

async function updateProjectStatus(projectId: string, userId: string, status: WeeklyAuthorityStatus, patch: Record<string, unknown> = {}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("weekly_authority_projects")
    .update({ ...patch, status })
    .eq("user_id", userId)
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) throw new Error(`Unable to update Weekly Authority project: ${error.message}`);
  return data;
}

async function upsertCompanionRows(projectId: string, userId: string, values: {
  brief?: BlogCreativeBrief;
  prompt?: string;
  draft?: string;
  contentDna?: ContentDna;
  assets?: WeeklyAssets;
  contentPackId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const operations = [];

  if (values.brief) {
    operations.push(supabase.from("blog_creative_briefs").upsert({
      project_id: projectId,
      user_id: userId,
      brief: values.brief,
      shopify_metadata: {
        title: values.brief.shopifyBlogTitle,
        slug: values.brief.suggestedUrlSlug,
        metaTitle: values.brief.metaTitle,
        metaDescription: values.brief.metaDescription,
        excerpt: values.brief.excerpt,
        tags: values.brief.shopifyTags
      },
      updated_at: now
    }, { onConflict: "project_id" }));
  }

  if (typeof values.prompt === "string") {
    operations.push(supabase.from("claude_blog_prompts").upsert({
      project_id: projectId,
      user_id: userId,
      prompt: values.prompt,
      status: "Claude Prompt Ready",
      updated_at: now
    }, { onConflict: "project_id" }));
  }

  if (typeof values.draft === "string") {
    operations.push(supabase.from("claude_blog_drafts").upsert({
      project_id: projectId,
      user_id: userId,
      draft: values.draft,
      analysis_status: values.contentDna ? "Content DNA Generated" : "Draft Pasted",
      updated_at: now
    }, { onConflict: "project_id" }));
  }

  if (values.contentDna) {
    operations.push(supabase.from("content_dna").upsert({
      project_id: projectId,
      user_id: userId,
      dna: values.contentDna,
      updated_at: now
    }, { onConflict: "project_id" }));
  }

  if (values.assets) {
    const assets = values.assets;
    const rows = [
      ["youtube_script", "YouTube", assets.youtubeScript],
      ["short_form_video", "Instagram/TikTok/YouTube Shorts", assets.shortFormVideoScripts],
      ["instagram_carousel", "Instagram", assets.instagramCarousel],
      ["pinterest_package", "Pinterest", assets.pinterestPackage],
      ["email_newsletter", "Email", assets.emailNewsletter],
      ["threads_x", "Threads/X", assets.threadsXContent],
      ["facebook_post", "Facebook", assets.facebookPost],
      ["internal_links", "Shopify", assets.internalLinkingAssistant],
      ["cta_assistant", "Shopify", assets.ctaAssistant]
    ].map(([assetType, platform, asset]) => ({
      project_id: projectId,
      user_id: userId,
      asset_type: assetType,
      platform,
      asset,
      content_pack_id: values.contentPackId || null,
      status: "needs_review"
    }));
    operations.push(supabase.from("repurposed_blog_assets").insert(rows));
    operations.push(supabase.from("shopify_blog_metadata").upsert({
      project_id: projectId,
      user_id: userId,
      ...assets.shopifyMetadata,
      updated_at: now
    }, { onConflict: "project_id" }));
  }

  for (const operation of operations) {
    const { error } = await operation;
    if (error) throw new Error(`Unable to save Weekly Authority companion data: ${error.message}`);
  }
}

async function createContentPackFromAssets(userId: string, project: Record<string, unknown>, input: WeeklyAuthorityInput, brief: BlogCreativeBrief, assets: WeeklyAssets) {
  const supabase = getSupabaseAdmin();
  const pack = weeklyAssetsToContentPack(input, brief, assets);
  const { data, error } = await supabase
    .from("content_packs")
    .insert({
      user_id: userId,
      title: `${input.blogTopic} weekly authority pack`,
      status: "needs_review",
      source_topic: input.blogTopic,
      audience: input.targetAudience,
      content_pillar: "Shopify blog repurposing",
      product_tie_in: input.ctaFocus.includes("product") || input.ctaFocus.includes("workbook") ? input.ctaFocus : null,
      service_tie_in: input.ctaFocus.includes("therapy") ? input.ctaFocus : null,
      clinical_sensitivity: "medium",
      design_status: "ready_for_canva",
      pack,
      metadata: {
        generatedFrom: "weekly_authority_engine",
        weeklyAuthorityProjectId: project.id,
        shopifyOnly: true,
        blogTopic: input.blogTopic,
        primaryKeyword: input.primaryKeyword,
        businessGoal: input.businessGoal,
        ctaFocus: input.ctaFocus,
        contentDna: project.content_dna || null,
        shopifyMetadata: assets.shopifyMetadata,
        approvalNote: "Repurposed assets from Claude-written Shopify blog draft."
      }
    })
    .select("*")
    .single();

  if (error) throw new Error(`Weekly assets were generated, but the Approval Review content pack could not be saved: ${error.message}`);
  return data;
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("weekly_authority_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json({ ok: true, projects: data || [] });
  } catch (error) {
    console.error("[weekly-authority][GET]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || "plan");
    const supabase = getSupabaseAdmin();

    if (action === "plan") {
      const input = normalizeInput(body);
      if (!input.blogTopic) return NextResponse.json({ ok: false, error: "Blog topic is required." }, { status: 400 });
      if (!input.primaryKeyword) return NextResponse.json({ ok: false, error: "Primary keyword is required." }, { status: 400 });

      const context = await loadWeeklyAuthorityContext(supabase, user.id, input.blogTopic);
      const { brief } = await generateBlogCreativeBrief(input, context);
      const prompt = await generateClaudePrompt(input, brief, context);
      const { data: project, error } = await supabase
        .from("weekly_authority_projects")
        .insert({
          user_id: user.id,
          blog_topic: input.blogTopic,
          target_audience: input.targetAudience,
          primary_keyword: input.primaryKeyword,
          secondary_keywords: input.secondaryKeywords,
          business_goal: input.businessGoal,
          cta_focus: input.ctaFocus,
          shopify_blog_category: input.shopifyBlogCategory,
          suggested_publish_date: input.suggestedPublishDate || null,
          status: "Claude Prompt Ready",
          creative_brief: brief,
          claude_prompt: prompt,
          shopify_metadata: {
            title: brief.shopifyBlogTitle,
            slug: brief.suggestedUrlSlug,
            metaTitle: brief.metaTitle,
            metaDescription: brief.metaDescription,
            excerpt: brief.excerpt,
            tags: brief.shopifyTags
          }
        })
        .select("*")
        .single();

      if (error) throw new Error(`Unable to save Weekly Authority project: ${error.message}`);
      await upsertCompanionRows(project.id, user.id, { brief, prompt });
      return NextResponse.json({ ok: true, project });
    }

    const projectId = String(body.projectId || "");
    if (!projectId) return NextResponse.json({ ok: false, error: "Project ID is required." }, { status: 400 });
    const project = await loadProject(user.id, projectId);
    const input = projectInput(project);

    if (action === "mark-sent") {
      const updated = await updateProjectStatus(projectId, user.id, "Sent to Claude");
      return NextResponse.json({ ok: true, project: updated });
    }

    if (action === "mark-draft-ready") {
      const updated = await updateProjectStatus(projectId, user.id, "Claude Draft Needed");
      return NextResponse.json({ ok: true, project: updated });
    }

    if (action === "import-draft") {
      const draft = String(body.draft || "").trim();
      if (draft.length < 300) return NextResponse.json({ ok: false, error: "Paste the finished Claude blog draft before analyzing Content DNA." }, { status: 400 });
      const context = await loadWeeklyAuthorityContext(supabase, user.id, input.blogTopic);
      const { contentDna } = await analyzeClaudeDraft(input, draft, context);
      const updated = await updateProjectStatus(projectId, user.id, "Content DNA Generated", {
        claude_draft: draft,
        content_dna: contentDna
      });
      await upsertCompanionRows(projectId, user.id, { draft, contentDna });
      return NextResponse.json({ ok: true, project: updated, contentDna });
    }

    if (action === "generate-assets") {
      const brief = (project.creative_brief || {}) as BlogCreativeBrief;
      const contentDna = (project.content_dna || {}) as ContentDna;
      const draft = String(project.claude_draft || "");
      if (!draft) return NextResponse.json({ ok: false, error: "Paste and analyze the Claude blog draft before generating weekly assets." }, { status: 400 });
      const context = await loadWeeklyAuthorityContext(supabase, user.id, input.blogTopic);
      const { assets } = await generateWeeklyAssets(input, brief, contentDna, draft, context);
      const pack = await createContentPackFromAssets(user.id, project, input, brief, assets);
      const updated = await updateProjectStatus(projectId, user.id, "Needs Review", {
        weekly_assets: assets,
        content_pack_id: pack.id,
        shopify_metadata: assets.shopifyMetadata
      });
      await upsertCompanionRows(projectId, user.id, { assets, contentPackId: pack.id });
      return NextResponse.json({ ok: true, project: updated, assets, contentPack: pack });
    }

    return NextResponse.json({ ok: false, error: "Unknown Weekly Authority action." }, { status: 400 });
  } catch (error) {
    console.error("[weekly-authority][POST]", { message: errorMessage(error) });
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
