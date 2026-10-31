"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, BookOpenCheck, Sparkles, TrendingUp } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const querySuffix = subject ? `?subject=${encodeURIComponent(subject)}` : "";

  // If on teacher curation desk or admin dashboard, hide the student bottom navigation bar
  if (pathname.startsWith("/teacher") || pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      label: "خانه",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "سنجش و تمرین",
      href: `/student${querySuffix}`,
      icon: BookOpenCheck,
      isActive: pathname === "/student",
    },
    {
      label: "کارگاه دست‌ورزی",
      href: `/student/workshop${querySuffix}`,
      icon: Sparkles,
      isActive: pathname === "/student/workshop",
    },
    {
      label: "کارنامه تسلط",
      href: `/student/mastery${querySuffix}`,
      icon: TrendingUp,
      isActive: pathname === "/student/mastery",
    },
  ];

  return (
    <nav
      aria-label="منوی اصلی ناوبری"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl sm:rounded-3xl p-1.5 flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-semibold"
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${active ? "text-white" : "text-slate-500"}`} />
                <span className="text-[10px] sm:text-xs leading-none truncate max-w-[70px] sm:max-w-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
