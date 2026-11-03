"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpenCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckSquare, 
  HelpCircle, 
  Target, 
  RotateCcw
} from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const AssessmentsHub: React.FC = () => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <BookOpenCheck className="w-5 h-5 text-indigo-600" />
            <span>امتحانات و آزمون‌های تشخیصی هوشمند:</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            سنجش دقیق تسلط بر مفاهیم بدون نمره منفی و با امکان انتخاب سرفصل‌های دلخواه
          </p>
        </div>
      </div>

      {/* Assessment Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Card 1: Custom Topic Selection */}
        <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 mb-1">آزمون با سرفصل‌های دلخواه</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              به جای آزمون کل کتاب، دقیقاً سرفصل‌هایی که در مدرسه خوانده‌اید را علامت بزنید و امتحان دهید.
            </p>
          </div>
          <Link
            href="/student"
            className="w-full min-h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>تنظیم سرفصل‌های آزمون</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Honest Uncertainty Feature */}
        <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 mb-1">سنجش بدون استرس («مطمئن نیستم»)</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              اگر در سوالی شک دارید، به جای حدس تصادفی روی «مطمئن نیستم» کلیک کنید تا سامانه شما را به کارگاه تمرین هدایت کند.
            </p>
          </div>
          <div className="bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] font-bold p-2.5 rounded-xl text-center">
            آزمون تشخیصی، آزمون استرس نیست!
          </div>
        </div>

        {/* Card 3: Dynamic Infinite Variations */}
        <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 mb-1">سوالات پویا و غیرتکراری</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              هر بار که در آزمون شرکت می‌کنید، اعداد و سناریوهای مسئله به شکل هوشمند تغییر می‌کنند تا یادگیری عمیق سنجیده شود.
            </p>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-[11px] font-bold p-2.5 rounded-xl text-center">
            {toPersianDigits(15)} مؤلفه شناختی فعال
          </div>
        </div>
      </div>
    </div>
  );
};
