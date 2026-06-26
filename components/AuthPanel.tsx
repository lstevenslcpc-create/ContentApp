"use client";

import { ArrowRight, CheckCircle2, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { clearSupabaseSessionCookie, setSupabaseSessionCookie } from "@/lib/sessionCookie";

type Message = {
  type: "success" | "error" | "info";
  text: string;
};

export function AuthPanel() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [returnTo, setReturnTo] = useState("/workspace");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/") && !next.startsWith("//") && next !== "/auth") {
      setReturnTo(next);
    }
  }, []);

  async function submit(formData: FormData) {
    if (!supabase) {
      setMessage({
        type: "error",
        text: "Supabase browser auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-in and account creation."
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (mode === "sign-up") {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(returnTo)}`
        }
      });

      setLoading(false);

      if (result.error) {
        setMessage({ type: "error", text: result.error.message });
        return;
      }

      if (result.data.session) {
        setSupabaseSessionCookie(result.data.session.access_token, result.data.session.expires_in);
        setMessage({ type: "success", text: "Account created. Opening your workspace..." });
        router.push(returnTo);
        return;
      }

      setMessage({
        type: "success",
        text: "Account created. If email confirmation is required, check your inbox, confirm your email, then return here to sign in."
      });
      return;
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error.message });
      return;
    }

    if (result.data.session) {
      setSupabaseSessionCookie(result.data.session.access_token, result.data.session.expires_in);
    }
    setMessage({ type: "success", text: "Signed in. Opening your workspace..." });
    router.push(returnTo);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    clearSupabaseSessionCookie();
    setMessage({ type: "info", text: "Signed out." });
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#7b7468]">Signed in as</p>
            <p className="mt-1 font-bold text-[#172a3a]">{user.email}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={returnTo} className="btn-primary bg-[#172a3a] hover:bg-[#22384a]">
            Open workspace
            <ArrowRight size={16} />
          </Link>
          <button className="btn-secondary" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <form action={submit} className="overflow-hidden rounded-3xl border border-[#e9dfcf] bg-white/90 shadow-premium">
      <div className="bg-[#172a3a] px-5 py-5 text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
          <Heart size={14} />
          LionHeart workspace
        </p>
        <h2 className="mt-4 text-2xl font-bold">{mode === "sign-up" ? "Create your account" : "Welcome back"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#f3ecdf]">
          {mode === "sign-up"
            ? "Save your Brand Brain, clinical safety rules, content preferences, and generated marketing assets."
            : "Sign in to continue shaping content that sounds like your practice."}
        </p>
      </div>

      <div className="p-5">
        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[#f7f1e6] p-1">
          <button
            type="button"
            disabled={loading}
            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${mode === "sign-in" ? "bg-white text-[#172a3a] shadow-sm" : "text-[#7b7468] hover:text-[#172a3a]"}`}
            onClick={() => {
              setMode("sign-in");
              setMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={loading}
            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${mode === "sign-up" ? "bg-white text-[#172a3a] shadow-sm" : "text-[#7b7468] hover:text-[#172a3a]"}`}
            onClick={() => {
              setMode("sign-up");
              setMessage(null);
            }}
          >
            Create Account
          </button>
        </div>

        <div className="grid gap-4">
          {!supabase && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable browser sign-in and account creation.
            </p>
          )}
          <label>
            <span className="text-xs font-bold uppercase tracking-wide text-[#7b7468]">Email</span>
            <input className="mt-1 w-full rounded-xl border border-[#e6ddcf] bg-[#fffdf8] px-3 py-3 text-sm text-[#20313f] outline-none transition focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]" name="email" type="email" autoComplete="email" required disabled={loading} />
          </label>
          <label>
            <span className="text-xs font-bold uppercase tracking-wide text-[#7b7468]">Password</span>
            <input className="mt-1 w-full rounded-xl border border-[#e6ddcf] bg-[#fffdf8] px-3 py-3 text-sm text-[#20313f] outline-none transition focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]" name="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={6} required disabled={loading} />
          </label>
          <button className="btn-primary bg-[#172a3a] py-3 hover:bg-[#22384a]" disabled={loading}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? "Please wait..." : mode === "sign-up" ? "Create Account" : "Sign In"}
          </button>
          {message && (
            <p className={`rounded-xl p-3 text-sm font-semibold leading-6 ${
              message.type === "error" ? "bg-rose-50 text-rose-700" : message.type === "success" ? "bg-[#eef3ec] text-[#4f6f5a]" : "bg-[#f7f1e6] text-[#77633c]"
            }`}>
              {message.text}
            </p>
          )}
          <p className="text-xs leading-5 text-[#7b7468]">
            New accounts use Supabase email/password auth. If confirmation is enabled, you will need to verify your email before signing in.
          </p>
        </div>
      </div>
    </form>
  );
}
