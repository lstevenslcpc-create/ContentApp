import { getSupabaseAdmin, getSupabaseSetupError } from "./supabaseAdmin";
import type { GeneratedContent } from "./types";

export async function getContentItems(): Promise<GeneratedContent[]> {
  return [];
}

export async function getBusinessProfile() {
  if (getSupabaseSetupError()) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("business_profiles").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}
