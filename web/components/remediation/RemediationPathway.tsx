"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { FractionStrip } from "../parametric/FractionStrip";
import { MathRenderer } from "../ui/MathRenderer";

export interface RemediationPathwayProps {
  kcTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

export const RemediationPathway: React.FC<RemediationPathwayProps> = ({
  kcTitle,
  onComplete,
  onBack,
}) => {
  const [coloredCount, setColoredCount] = useState(0);
  const [isResolved, setIsResolved] = useState(false);

  const targetCount = 3; // Student needs to color 2 + 1 = 3 segments out of 5

  const handleSegmentChange = (count: number) => {
    setColoredCount(count);
    if (count === targetCount) {
      setIsResolved(true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2 px-1 select-none animate-in fade-in duration-300">
      <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-lg">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm">کارگاه دست‌ورزی و تقویت مفهوم</h3>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            بازگشت به کارنامه
          </button>
        </div>

        {/* Topic Title */}
        <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-2xl mb-4">
          <span className="text-[11px] font-bold text-indigo-900 block mb-1">موضوع تمرین:</span>
          <p className="text-sm font-bold text-indigo-950">{kcTitle}</p>
        </div>

        {/* Interactive Challenge Instructions */}
        <div className="text-sm text-slate-700 space-y-2 mb-4 leading-relaxed">
          <p className="font-semibold text-slate-900">
            فرض کنید یک نوار را به ۵ قسمت مساوی تقسیم کرده‌ایم.
          </p>
          <p className="text-xs text-slate-600">
            می‌خواهیم حاصل عبارت <MathRenderer content="$\\frac{2}{5} + \\frac{1}{5}$" /> را با رنگ‌آمیزی پیدا کنیم.
            روی نوار زیر ضربه بزنید و دقیقاً ۳ تکه از ۵ تکه را رنگ کنید:
          </p>
        </div>

        {/* Interactive Fraction Strip */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 my-4">
          <FractionStrip
            totalSegments={5}
            initialColored={coloredCount}
            interactive={true}
            onChange={handleSegmentChange}
            label="برای رنگ‌آمیزی یا پاک کردن، روی خانه‌ها ضربه بزنید:"
          />
        </div>

        {/* Pedagogical Feedback */}
        {isResolved ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>بسیار عالی و دقیق!</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              همان‌طور که دیدید، اندازه تکه‌ها هیچ تغییری نکرد و نوار هنوز ۵ تکه دارد. فقط تعداد تکه‌های رنگ‌شده از ۲ به ۳ رسید:
              <span className="block mt-1 font-bold text-sm" dir="ltr">
                <MathRenderer content="$\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{5}$" />
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-center text-slate-500 mb-4">
            تعداد تکه‌های رنگ‌شده فعلی: <b className="text-indigo-600 font-mono text-sm">{coloredCount}</b> از ۵
          </p>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-2.5">
          {isResolved ? (
            <button
              type="button"
              onClick={onComplete}
              className="w-full min-h-[50px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>آموختم، ثبت در کارنامه</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setColoredCount(0)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>شروع مجدد رنگ‌آمیزی</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
