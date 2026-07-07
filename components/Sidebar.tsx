"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BarChart3, BookOpenCheck, BookOpenText, Brain, CalendarDays, CheckSquare, Clapperboard, Compass, FolderOpen, Home, Image, LayoutTemplate, Megaphone, Newspaper, Plug, Settings, Sparkles, UserRound, WalletCards } from "lucide-react";
import { AccountBadge } from "./AccountBadge";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { href: "/workspace", label: "Daily Workspace", icon: Home },
      { href: "/workspace?mode=week", label: "Generate My Week", icon: Sparkles },
      { href: "/approval-review", label: "Approval Review", icon: CheckSquare },
      { href: "/content-calendar", label: "Calendar", icon: CalendarDays },
      { href: "/ready-to-post", label: "Ready to Post", icon: Megaphone }
    ]
  },
  {
    title: "Create",
    items: [
      { href: "/content-generator", label: "Content Generator", icon: Sparkles },
      { href: "/content-intelligence", label: "Content Intelligence", icon: Compass },
      { href: "/weekly-authority", label: "Weekly Authority", icon: Newspaper },
      { href: "/media-generator", label: "Creative Studio", icon: Image }
    ]
  },
  {
    title: "Library",
    items: [
      { href: "/brand-brain", label: "Brand Brain", icon: Brain },
      { href: "/business-profile", label: "Business Profile", icon: UserRound },
      { href: "/gold-standard-library", label: "Gold Standards", icon: BookOpenCheck },
      { href: "/story-frameworks", label: "Story Frameworks", icon: BookOpenText },
      { href: "/canva-templates", label: "Canva Templates", icon: LayoutTemplate },
      { href: "/media-library", label: "Media Library", icon: FolderOpen }
    ]
  },
  {
    title: "Business",
    items: [
      { href: "/workspace?mode=campaign", label: "Campaigns", icon: WalletCards },
      { href: "/scheduled-posts", label: "Scheduled", icon: Clapperboard },
      { href: "/social-accounts", label: "Social Accounts", icon: Plug },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/model-settings", label: "Model Settings", icon: Settings },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

export function Sidebar({ user, checkedAuth }: { user: User | null; checkedAuth: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 px-4 py-5 lg:block">
      <Link href="/workspace" className="mb-7 flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white">
          <WalletCards size={20} />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">AI Content</span>
          <span className="block text-xs text-slate-500">Creator OS</span>
        </span>
      </Link>
      <nav className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href.split("?")[0];
                const Icon = item.icon;
                return (
                  <Link
                    key={`${group.title}-${item.href}`}
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
            </div>
          </div>
        ))}
      </nav>
      <AccountBadge user={user} checkedAuth={checkedAuth} />
    </aside>
  );
}
