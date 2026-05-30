import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabaseAdmin";

export class AuthError extends Error {
  status = 401;
}

export async function requireApiUser(request: Request): Promise<User> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) {
    throw new AuthError("Sign in is required for this workspace.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new AuthError("Your session is invalid or expired. Please sign in again.");
  }

  return data.user;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return null;
}
