"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Layers, Scale, Grid, RefreshCw } from "lucide-react";
import { FractionStrip } from "@/components/parametric/FractionStrip";
import { BalanceScale } from "@/components/parametric/BalanceScale";
import { AreaGrid } from "@/components/parametric/AreaGrid";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export default function WorkshopPage() {
  const searchParams = useSearchParams();
  const { selectedSubjectId } = useCurriculumStore();
  const subjectId = searchParams.get("subject") || selectedSubjectId || "SUBJ-MATH4-FRACTIONS";
  const isGrade5 = subjectId === "SUBJ-MATH5-RATIO" || subjectId.includes("5");

  const [activeTab, setActiveTab] = useState<"strip" | "scale" | "grid">(isGrade5 ? "scale" : "strip");

  // State for Fraction Strip workshop
  const [stripSegments, setStripSegments] = useState(6);
  const [stripColored, setStripColored] = useState(2);

  // State for Balance Scale workshop
  const [scaleLeft, setScaleLeft] = useState<{ label: string; value: number }>({ label: isGrade5 ? "2:3" : "1/2", value: isGrade5 ? 6 : 0.5 });
  const [scaleRight, setScaleRight] = useState<{ label: string; value: number }>({ label: isGrade5 ? "4:6" : "1/4", value: isGrade5 ? 6 : 0.25 });

  // State for Area Grid workshop
  const [gridColored, setGridColored] = useState(isGrade5 ? 35 : 3);

  return (
    <div className="w-full max-w-2xl mx-auto py-2 select-none animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-xs mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {isGrade5 ? "آزمایشگاه و کارگاه دست‌ورزی نسبت، تناسب و درصد" : "آزمایشگاه و کارگاه دست‌ورزی کسرها"}
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          {isGrade5 ? "با دست‌ورزی، نسبت‌ها و درصد را لمس کنید" : "با دست‌ورزی کسرها را لمس و کشف کنید"}
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isGrade5
            ? "با ترازوی تعادل، تساوی نسبت‌ها و تناسب را بسنجید یا در شبکه ۱۰۰ تایی مفهوم درصد را مشاهده کنید."
            : "ابزار مورد نظر خود را انتخاب کرده و با تغییر قطعات، اندازه و روابط کسرها را به صورت دیداری تجربه کنید."}
        </p>

        {/* Tool Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("scale")}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scale"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isGrade5 ? "ترازوی تناسب" : "ترازوی مقایسه"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("grid")}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "grid"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{isGrade5 ? "شبکه درصد" : "شبکه مساحت"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("strip")}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "strip"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isGrade5 ? "نوار نسبت‌ها" : "نوار کسرها"}</span>
          </button>
        </div>
      </div>

      {/* Main Manipulative Visual Container */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs mb-4">
        {activeTab === "strip" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>ابزار نوار رنگ‌آمیزی:</span>
              <span className="font-mono text-indigo-700 text-sm" dir="ltr">
                {toPersianDigits(stripColored)} / {toPersianDigits(stripSegments)}
              </span>
            </div>

            <div className="flex justify-center py-4">
              <FractionStrip
                totalSegments={stripSegments}
                initialColored={stripColored}
                interactive={true}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>تعداد کل قطعات واحد:</span>
                  <span className="font-mono" dir="ltr">{toPersianDigits(stripSegments)}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={stripSegments}
                  onChange={(e) => {
                    const seg = Number(e.target.value);
                    setStripSegments(seg);
                    if (stripColored > seg) setStripColored(seg);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>تعداد بخش‌های رنگ‌شده:</span>
                  <span className="font-mono" dir="ltr">{toPersianDigits(stripColored)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stripSegments}
                  value={stripColored}
                  onChange={(e) => setStripColored(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "scale" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>{isGrade5 ? "ترازوی سنجش تناسب:" : "ترازوی مقایسه کسرها:"}</span>
              <span className="text-slate-500 font-normal text-[11px]">
                {scaleLeft.value === scaleRight.value ? "✅ تعادل برقرار است (متناسب)" : "⚖️ نامتعادل"}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <BalanceScale
                leftValue={scaleLeft.value}
                rightValue={scaleRight.value}
                leftLabel={scaleLeft.label}
                rightLabel={scaleRight.label}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">وزن کفه چپ:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScaleLeft({ label: isGrade5 ? "2:3" : "1/2", value: isGrade5 ? 6 : 0.5 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۲ به ۳" : "۱/۲"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleLeft({ label: isGrade5 ? "4:6" : "3/4", value: isGrade5 ? 12 : 0.75 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۴ به ۶" : "۳/۴"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">وزن کفه راست:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScaleRight({ label: isGrade5 ? "4:6" : "2/4", value: isGrade5 ? 6 : 0.5 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۴ به ۶" : "۲/۴"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleRight({ label: isGrade5 ? "5:7" : "1/4", value: isGrade5 ? 8 : 0.25 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۵ به ۷" : "۱/۴"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "grid" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>{isGrade5 ? "شبکه ۱۰۰ تایی درصد:" : "شبکه مستطیلی کسر:"}</span>
              <span className="font-mono text-indigo-700 text-sm" dir="ltr">
                {isGrade5 ? `${toPersianDigits(gridColored)}٪` : `${toPersianDigits(gridColored)} / ۶`}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <AreaGrid
                rows={isGrade5 ? 10 : 2}
                cols={isGrade5 ? 10 : 3}
                initialColored={gridColored}
                interactive={true}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>{isGrade5 ? "درصد پرشده:" : "تعداد خانه‌های رنگی:"}</span>
                <span className="font-mono" dir="ltr">
                  {isGrade5 ? `${toPersianDigits(gridColored)}٪` : toPersianDigits(gridColored)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={isGrade5 ? 100 : 6}
                value={gridColored}
                onChange={(e) => setGridColored(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
