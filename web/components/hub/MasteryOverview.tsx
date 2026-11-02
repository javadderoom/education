"use client";

import React from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Target, 
  BrainCircuit,
  BarChart3
} from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";

export interface MasteryOverviewProps {
  masteredCount?: number;
  totalKCs?: number;
  averageMastery?: number;
}

export const MasteryOverview: React.FC<MasteryOverviewProps> = ({
  masteredCount = 0,
  totalKCs = 15,
  averageMastery = 0,
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>پیشرفت و تسلط بر مفاهیم ریاضی:</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ارزیابی پیوسته درک ریاضی، پایداری حافظه و زمان‌بندی مرور مفاهیم
          </p>
        </div>

        <Link
          href="/student/mastery"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <span>مشاهده کارنامه جامع</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress Cards Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-indigo-400/30">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-300" />
              <span>موتور هوشمند ردیابی شناختی</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mb-2 leading-tight">
              میزان یادگیری واقعی را در کارنامه راداری ببینید
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              سامانه به جای نمره سنتی، تک‌تک مباحث مثل «تساوی کسرها»، «ارزش مکانی در ضرب» و «جدول تناسب» را جداگانه تحلیل کرده و نمودار تسلط را رسم می‌کند.
            </p>
          </div>

          {/* Quick Mastery Counters */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[130px]">
              <span className="text-2xl font-black block font-mono text-emerald-400" dir="ltr">
                %{toPersianDigits(averageMastery)}
              </span>
              <span className="text-[11px] font-bold text-indigo-200 mt-1 block">میانگین تسلط شناختی</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[130px]">
              <span className="text-2xl font-black block font-mono text-amber-400" dir="ltr">
                {toPersianDigits(masteredCount)} / {toPersianDigits(totalKCs)}
              </span>
              <span className="text-[11px] font-bold text-indigo-200 mt-1 block">سرفصل‌های تثبیت‌شده</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-indigo-200/90 text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسلط سبز: تثبیت کامل مفهوم</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>مرور بهینه: چرخه تکرار فاصله‌دار</span>
            </span>
          </div>

          <Link
            href="/student/mastery"
            className="py-2 px-4 bg-white text-slate-900 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer mr-auto"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>باز کردن کارنامه تحلیلی</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
