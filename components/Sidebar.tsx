"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BarChart3, Brain, CalendarDays, Clapperboard, Compass, FolderOpen, Home, Image, Plug, Settings, Sparkles, UserRound, WalletCards } from "lucide-react";
import { AccountBadge } from "./AccountBadge";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/brand-brain", label: "Brand Brain", icon: Brain },
  { href: "/content-intelligence", label: "Content Intelligence", icon: Compass },
  { href: "/business-profile", label: "Business Profile", icon: UserRound },
  { href: "/content-generator", label: "Content Generator", icon: Sparkles },
  { href: "/media-generator", label: "AI Media", icon: Image },
  { href: "/media-library", label: "Media Library", icon: FolderOpen },
  { href: "/content-calendar", label: "Calendar", icon: CalendarDays },
  { href: "/scheduled-posts", label: "Scheduled", icon: Clapperboard },
  { href: "/social-accounts", label: "Social Accounts", icon: Plug },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({ user, checkedAuth }: { user: User | null; checkedAuth: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 px-4 py-5 lg:block">
      <Link href="/" className="mb-7 flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white">
          <WalletCards size={20} />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">AI Content</span>
          <span className="block text-xs text-slate-500">Creator OS</span>
        </span>
      </Link>
      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <AccountBadge user={user} checkedAuth={checkedAuth} />
    </aside>
  );
}
