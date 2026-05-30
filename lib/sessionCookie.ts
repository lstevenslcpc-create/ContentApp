"use client";

const cookieName = "lh_supabase_access_token";

export function setSupabaseSessionCookie(accessToken: string, expiresIn?: number) {
  const maxAge = Math.max(60, expiresIn || 60 * 60);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cookieName}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearSupabaseSessionCookie() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
