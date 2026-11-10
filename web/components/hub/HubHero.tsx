"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, BookOpenCheck, TrendingUp, Layers } from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { CANONICAL_TAXONOMIES } from "@/lib/data/curriculum-taxonomy";

export interface HubHeroProps {
  studentName?: string;
}

export const HubHero: React.FC<HubHeroProps> = ({ studentName }) => {
  const totalChapters = Object.keys(CANONICAL_TAXONOMIES).length;
  const totalTopics = Object.values(CANONICAL_TAXONOMIES).reduce(
    (acc, t) => acc + t.topics.length,
    0
  );

  return (
    <div className="bg-gradient-to-b from-indigo-50/90 via-white to-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-xs mb-6 relative overflow-hidden">
      {/* Decorative ambient badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-100/90 text-indigo-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>پلتفرم تخصصی آموزش و سنجش شناختی ریاضی دبستان</span>
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2.5">
        یادگیری مفهومی و سنجش هوشمند ریاضی
      </h1>

      {studentName ? (
        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-2">
          خوش آمدید، {studentName} عزیز! امروز می‌خواهید روی کدام مبحث تمرین کنید؟
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-4">
          شناسایی دقیق نقاط قوت، ریشه‌یابی خطاهای ذهنی با مدل‌های شناختی، و تقویت درک عمیق ریاضی با کارگاه‌های دست‌ورزی تعاملی
        </p>
      )}

      {/* Feature stats pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto pt-2">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs text-center">
          <div className="flex items-center justify-center text-indigo-600 mb-1">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 block">
            {toPersianDigits(totalChapters)} فصل
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">بسته‌های درسی فعال</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs text-center">
          <div className="flex items-center justify-center text-emerald-600 mb-1">
            <BookOpenCheck className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 block">
            {toPersianDigits(totalTopics)} سرفصل
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">اهداف شناختی مصوب</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs text-center">
          <div className="flex items-center justify-center text-amber-600 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 block">
            ۱۰۰٪ تشخیصی
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">بدون تله حدس تصادفی</span>
        </div>
      </div>
    </div>
  );
};
