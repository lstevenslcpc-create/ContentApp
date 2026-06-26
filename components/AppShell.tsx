"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { clearSupabaseSessionCookie, setSupabaseSessionCookie } from "@/lib/sessionCookie";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";

const publicPaths = new Set(["/", "/auth"]);

function normalizeNextPath(pathname: string) {
  if (!pathname || pathname === "/auth") return "/workspace";
  return pathname;
}

function SignInRequiredCard({ nextPath }: { nextPath: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#e9dfcf] bg-white/90 shadow-premium">
        <div className="bg-[#172a3a] px-6 py-6 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#eadfc8]">
            <LockKeyhole size={22} />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Sign in required</h1>
          <p className="mt-2 text-sm leading-6 text-[#f3ecdf]">Please sign in to use this workspace.</p>
        </div>
        <div className="bg-[#fffdf8] p-6">
          <p className="text-sm leading-6 text-[#6f766f]">
            Your Brand Brain, content ideas, media library, and saved drafts are protected so the workspace stays private to your account.
          </p>
          <Link href={`/auth?next=${encodeURIComponent(nextPath)}`} className="btn-primary mt-5 bg-[#172a3a] px-5 py-3 hover:bg-[#22384a]">
            Go to Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setCheckedAuth(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user || null);
      if (data.session?.access_token) {
        setSupabaseSessionCookie(data.session.access_token, data.session.expires_in);
      } else {
        clearSupabaseSessionCookie();
      }
      setCheckedAuth(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.access_token) {
        setSupabaseSessionCookie(session.access_token, session.expires_in);
      } else {
        clearSupabaseSessionCookie();
      }
      setCheckedAuth(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const protectedPage = useMemo(() => !publicPaths.has(pathname), [pathname]);
  const shouldGatePage = checkedAuth && protectedPage && !user;
  const nextPath = normalizeNextPath(pathname);

  return (
    <div className="flex min-h-screen bg-mist">
      <Sidebar user={user} checkedAuth={checkedAuth} />
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {shouldGatePage ? <SignInRequiredCard nextPath={nextPath} /> : children}
        </div>
      </main>
      <MobileBottomNav user={user} checkedAuth={checkedAuth} />
    </div>
  );
}
