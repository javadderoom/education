"use client";

import React from "react";
import { BookOpen, BookOpenCheck, TrendingUp, Sparkles, LayoutGrid } from "lucide-react";

export type HubTabKey = "all" | "courses" | "exams" | "progress" | "reports";

export interface HubNavTabsProps {
  activeTab: HubTabKey;
  onTabChange: (tab: HubTabKey) => void;
}

export const HubNavTabs: React.FC<HubNavTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "all" as HubTabKey,
      label: "نمای جامع",
      icon: LayoutGrid,
    },
    {
      id: "courses" as HubTabKey,
      label: "لیست درس‌ها",
      icon: BookOpen,
    },
    {
      id: "exams" as HubTabKey,
      label: "امتحانات",
      icon: BookOpenCheck,
    },
    {
      id: "progress" as HubTabKey,
      label: "پیشرفت",
      icon: TrendingUp,
    },
    {
      id: "reports" as HubTabKey,
      label: "گزارش و کارگاه",
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl mb-6 overflow-x-auto scrollbar-none border border-slate-200/80">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              isActive
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
