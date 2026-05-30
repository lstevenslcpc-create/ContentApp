"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Brain, Compass, Home, Image, LogIn, Sparkles, UserCircle2 } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/brand-brain", label: "Brain", icon: Brain },
  { href: "/content-intelligence", label: "Ideas", icon: Compass },
  { href: "/content-generator", label: "Create", icon: Sparkles },
  { href: "/media-generator", label: "Media", icon: Image }
];

export function MobileBottomNav({ user, checkedAuth }: { user: User | null; checkedAuth: boolean }) {
  const pathname = usePathname();
  const accountItem = checkedAuth && user
    ? { href: "/auth", label: "Account", icon: UserCircle2 }
    : { href: `/auth?next=${encodeURIComponent(pathname || "/brand-brain")}`, label: "Sign In", icon: LogIn };
  const mobileNav = [...nav, accountItem];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 px-1 py-2 shadow-premium lg:hidden">
      {mobileNav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold ${active ? "text-brand" : "text-slate-500"}`}>
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
