"use client";

import { getSupabaseBrowserClient } from "./supabaseBrowser";
import { clearSupabaseSessionCookie, setSupabaseSessionCookie } from "./sessionCookie";

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = getSupabaseBrowserClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const headers = new Headers(init.headers);

  if (session?.access_token) {
    setSupabaseSessionCookie(session.access_token, session.expires_in);
    headers.set("Authorization", `Bearer ${session.access_token}`);
  } else {
    clearSupabaseSessionCookie();
  }

  return fetch(input, { ...init, headers });
}
