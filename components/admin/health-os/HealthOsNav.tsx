"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Brain, HeartPulse, Pill, Utensils } from "lucide-react";

const items = [
  { href: "/admin/health", label: "Overview", icon: HeartPulse },
  { href: "/admin/health/diet", label: "Diet", icon: Utensils },
  { href: "/admin/health/supplements", label: "Supplements", icon: Pill },
  { href: "/admin/health/meditation", label: "Meditation", icon: Brain },
  { href: "/admin/health/skincare", label: "Skincare", icon: HeartPulse },
  { href: "/admin/health/haircare", label: "Haircare", icon: Activity },
  { href: "/admin/health/intimate-care", label: "Intimate Care", icon: HeartPulse },
  { href: "/admin/health/products", label: "Products", icon: BookOpen },
  { href: "/admin/health/reports", label: "Reports", icon: Activity },
];

export function HealthOsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 rounded-[20px] border border-white/10 bg-white/[0.02] p-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin/health" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={`inline-flex min-h-10 items-center gap-2 rounded-[14px] px-4 text-sm font-bold transition ${active ? "bg-[#C6FF32] text-[#030608]" : "text-white/45 hover:bg-white/[0.05] hover:text-white"}`}>
            <Icon className="h-4 w-4" />{item.label}
          </Link>
        );
      })}
    </nav>
  );
}
