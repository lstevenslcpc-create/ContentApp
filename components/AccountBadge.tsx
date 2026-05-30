"use client";

import Link from "next/link";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export function AccountBadge({ user, checkedAuth }: { user: User | null; checkedAuth: boolean }) {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  }

  if (checkedAuth && user) {
    return (
      <div className="mt-5 rounded-2xl border border-[#e9dfcf] bg-[#fffdf8] p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f766f]">
          <UserCircle2 size={16} className="text-[#4f6f5a]" />
          <span>Signed in</span>
        </div>
        <p className="mt-2 truncate text-sm font-bold text-[#172a3a]">{user.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e6ddcf] bg-white px-3 py-2 text-xs font-bold text-[#7b7468] transition hover:border-[#b89b5e] hover:text-[#172a3a]"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href={`/auth?next=${encodeURIComponent(pathname || "/brand-brain")}`}
      className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#172a3a] px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#22384a]"
    >
      <LogIn size={15} />
      <span>Sign In</span>
    </Link>
  );
}
