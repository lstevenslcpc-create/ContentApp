"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Compass, FolderOpen, Home, Image, Sparkles } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/brand-brain", label: "Brain", icon: Brain },
  { href: "/content-intelligence", label: "Ideas", icon: Compass },
  { href: "/content-generator", label: "Create", icon: Sparkles },
  { href: "/media-generator", label: "Media", icon: Image },
  { href: "/media-library", label: "Library", icon: FolderOpen }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 px-1 py-2 shadow-premium lg:hidden">
      {nav.map((item) => {
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
