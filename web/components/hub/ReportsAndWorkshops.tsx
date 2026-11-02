"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  GraduationCap, 
  ArrowLeft, 
  Shapes, 
  BarChart2, 
  ShieldCheck,
  Scale,
  SplitSquareVertical
} from "lucide-react";

export const ReportsAndWorkshops: React.FC = () => {
  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>کارگاه‌های یادگیری و گزارش‌های تحلیلی:</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            دست‌ورزی با ابزارهای هندسی و بصری، و مشاهده گزارش‌های تشخیصی برای آموزگاران و اولیا
          </p>
        </div>
      </div>

      {/* Side-by-Side Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Interactive Manipulative Workshops */}
        <div className="border-2 border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 via-white to-white rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100/80 flex items-center justify-center text-indigo-700 shadow-2xs">
                <Shapes className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                دست‌ورزی تجسمی
              </span>
            </div>

            <h3 className="font-black text-base text-slate-900 mb-1.5">
              کارگاه‌های تعاملی و آزمایشگاه ریاضی
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              تجربه مستقیم و لمس مفاهیم با نوارهای کسری پویا، ترازوی دوکفه تناسب، شبکه گسترده مساحت و محور تعاملی اعداد جهت برطرف کردن خطاهای ذهنی.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold mb-4 bg-white/80 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-600" />
                <span>نوار قطعات کسر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>ترازوی تناسب</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[9px] font-black">#</span>
                <span>شبکه مساحت مستطیل</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-purple-500/20 text-purple-600 flex items-center justify-center text-[9px] font-black">↔</span>
                <span>محور مدرج اعداد</span>
              </div>
            </div>
          </div>

          <Link
            href="/student/workshop"
            className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>ورود به کارگاه‌های دست‌ورزی</span>
          </Link>
        </div>

        {/* Card 2: Teacher & Classroom Analytics */}
        <div className="border-2 border-slate-200 bg-gradient-to-b from-slate-50/60 via-white to-white rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs border border-slate-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                میز کار آموزگار
              </span>
            </div>

            <h3 className="font-black text-base text-slate-900 mb-1.5">
              گزارش‌های تحلیلی و پایش کلاسی
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              نمایش ماتریس تسلط دانش‌آموزان کلاس، کشف زنگ خطرهای بدفهمی پرتکرار (مانند جمع مخرج‌ها یا حذف صفر ارزش مکانی) و ارائه توصیه‌های تدریس هدفمند.
            </p>

            <div className="space-y-2 mb-4 bg-white/80 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>نمودار تجمیعی پیشرفت کلاس:</span>
                <span className="font-bold text-slate-800">فعال و برخط</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ردیابی خطاهای شناختی پرتکرار:</span>
                <span className="font-bold text-amber-600">هوشمند</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/teacher"
              className="flex-1 min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <BarChart2 className="w-4 h-4" />
              <span>پیشخوان تحلیلی کلاس</span>
            </Link>

            <Link
              href="/login?role=staff"
              className="min-h-[44px] px-3.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center justify-center transition-all"
            >
              ورود آموزگاران
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
