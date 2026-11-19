"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, Scale, Grid, Layers } from "lucide-react";
import { FractionStrip } from "../parametric/FractionStrip";
import { BalanceScale } from "../parametric/BalanceScale";
import { AreaGrid } from "../parametric/AreaGrid";
import { MathRenderer } from "../ui/MathRenderer";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface RemediationPathwayProps {
  kcId?: string;
  kcTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

export const RemediationPathway: React.FC<RemediationPathwayProps> = ({
  kcId = "",
  kcTitle,
  onComplete,
  onBack,
}) => {
  const isPercentageKC = kcId.includes("05") || kcTitle.includes("درصد");
  const isRatioKC = kcId.includes("MATH5") || kcTitle.includes("نسبت") || kcTitle.includes("تناسب");

  // State for Fraction Strip (Grade 4)
  const [coloredCount, setColoredCount] = useState(0);

  // State for Percentage Area Grid (Grade 5)
  const [percentageCount, setPercentageCount] = useState(10);
  const targetPercentage = 35;

  // State for Ratio Balance Scale (Grade 5)
  const [selectedRatioValue, setSelectedRatioValue] = useState<number>(0.5);
  const targetRatioValue = 2 / 3;

  const isResolved = isPercentageKC
    ? percentageCount === targetPercentage
    : isRatioKC
    ? Math.abs(selectedRatioValue - targetRatioValue) < 0.001
    : coloredCount === 3;

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

        {/* Interactive Challenge Section */}
        {isPercentageKC ? (
          /* Grade 5 Percentage Challenge */
          <div className="space-y-4">
            <div className="text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-emerald-600" />
                چالش درصد: نمایش ۳۵٪ در شبکه ۱۰۰ تایی
              </p>
              <p className="text-xs text-slate-600">
                با کشیدن اسلایدر زیر، دقیقاً ۳۵ خانه از شبکه ۱۰۰تایی را رنگ‌آمیزی کنید تا مفهوم نسبت به ۱۰۰ را مشاهده کنید:
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center">
              <AreaGrid rows={10} cols={10} initialColored={percentageCount} interactive={false} />
              <div className="w-full mt-3 px-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>درصد انتخابی شما:</span>
                  <span className="text-indigo-700 text-sm font-black" dir="ltr">{toPersianDigits(percentageCount)}٪</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={percentageCount}
                  onChange={(e) => setPercentageCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                  aria-label="تغییر درصد شبکه ۱۰۰ تایی"
                />
              </div>
            </div>

            {isResolved ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>آفرین! مفهوم درصد را دقیق درک کردید!</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  درصد یعنی نسبتی که کل آن ۱۰۰ واحد است. ۳۵ خانه از ۱۰۰ خانه دقیقاً برابر با ۳۵٪ است.
                </p>
              </div>
            ) : (
              <p className="text-xs text-center text-slate-500">
                برای تکمیل تمرین، اسلایدر را روی ۳۵٪ تنظیم کنید.
              </p>
            )}
          </div>
        ) : isRatioKC ? (
          /* Grade 5 Ratio & Proportion Challenge */
          <div className="space-y-4">
            <div className="text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                چالش تناسب: متعادل کردن ترازوی نسبت‌ها
              </p>
              <p className="text-xs text-slate-600">
                در کفه چپ نسبت ۲ به ۳ قرار دارد. کدام نسبت در کفه راست، ترازو را در حالت تعادل (تناسب) قرار می‌دهد؟
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center">
              <BalanceScale
                leftValue={2 / 3}
                rightValue={selectedRatioValue}
                leftLabel="۲ به ۳"
                rightLabel={
                  selectedRatioValue === 2 / 3
                    ? "۴ به ۶"
                    : selectedRatioValue === 0.5
                    ? "۲ به ۴"
                    : "۵ به ۷"
                }
              />

              <div className="w-full mt-3">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">انتخاب نسبت کفه راست:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRatioValue(0.5)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedRatioValue === 0.5
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ۲ به ۴
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRatioValue(2 / 3)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedRatioValue === 2 / 3
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ۴ به ۶
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRatioValue(5 / 7)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedRatioValue === 5 / 7
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ۵ به ۷
                  </button>
                </div>
              </div>
            </div>

            {isResolved ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>ترازو متعادل شد! تناسب برقرار است.</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  با ضرب همزمان صورت و مخرج نسبت ۲ به ۳ در ۲، نسبت مساوی ۴ به ۶ به دست می‌آید؛ بنابراین این دو نسبت تشکیل یک تناسب می‌دهند.
                </p>
              </div>
            ) : (
              <p className="text-xs text-center text-slate-500">
                نسبتی را انتخاب کنید که هم‌اندازه با ۲ به ۳ باشد تا ترازو تراز شود.
              </p>
            )}
          </div>
        ) : (
          /* Grade 4 Fractions Challenge (Default) */
          <div className="space-y-4">
            <div className="text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                فرض کنید یک نوار را به ۵ قسمت مساوی تقسیم کرده‌ایم.
              </p>
              <p className="text-xs text-slate-600">
                می‌خواهیم حاصل عبارت <MathRenderer content="$\\frac{2}{5} + \\frac{1}{5}$" /> را با رنگ‌آمیزی پیدا کنیم.
                روی نوار زیر ضربه بزنید و دقیقاً ۳ تکه از ۵ تکه را رنگ کنید:
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 my-2">
              <FractionStrip
                totalSegments={5}
                initialColored={coloredCount}
                interactive={true}
                onChange={(c) => setColoredCount(c)}
                label="برای رنگ‌آمیزی یا پاک کردن، روی خانه‌ها ضربه بزنید:"
              />
            </div>

            {isResolved ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-2 animate-in zoom-in-95 duration-200">
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
              <p className="text-xs text-center text-slate-500 mb-2">
                تعداد تکه‌های رنگ‌شده فعلی: <b className="text-indigo-600 font-bold text-sm">{toPersianDigits(coloredCount)}</b> از {toPersianDigits(5)}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-2.5 mt-4">
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
              onClick={() => {
                setColoredCount(0);
                setPercentageCount(10);
                setSelectedRatioValue(0.5);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>شروع مجدد</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
