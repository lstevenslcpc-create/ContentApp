"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export function AccountBadge() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email || null));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  return (
    <Link href="/auth" className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
      <LogIn size={15} />
      <span className="truncate">{email || "Sign in"}</span>
    </Link>
  );
}
