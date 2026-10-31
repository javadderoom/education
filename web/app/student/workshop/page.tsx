"use client";

import React, { useState } from "react";
import { Sparkles, Layers, Scale, Grid, RefreshCw } from "lucide-react";
import { FractionStrip } from "@/components/parametric/FractionStrip";
import { BalanceScale } from "@/components/parametric/BalanceScale";
import { AreaGrid } from "@/components/parametric/AreaGrid";
import { toPersianDigits } from "@/lib/math/persian-digits";

export default function WorkshopPage() {
  const [activeTab, setActiveTab] = useState<"strip" | "scale" | "grid">("strip");

  // State for Fraction Strip workshop
  const [stripSegments, setStripSegments] = useState(6);
  const [stripColored, setStripColored] = useState(2);

  // State for Balance Scale workshop
  const [scaleLeft, setScaleLeft] = useState<{ label: string; value: number }>({ label: "1/2", value: 0.5 });
  const [scaleRight, setScaleRight] = useState<{ label: string; value: number }>({ label: "1/4", value: 0.25 });

  // State for Area Grid workshop
  const [gridColored, setGridColored] = useState(3);

  return (
    <div className="w-full max-w-2xl mx-auto py-2 select-none animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-xs mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>آزمایشگاه و کارگاه دست‌ورزی کسرها</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          با دست‌ورزی کسرها را لمس و کشف کنید
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          ابزار مورد نظر خود را انتخاب کرده و با تغییر قطعات، اندازه و روابط کسرها را به صورت دیداری تجربه کنید.
        </p>

        {/* Tool Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto p-1 bg-slate-100 rounded-2xl">
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
            <span>نوار کسرها</span>
          </button>

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
            <span>ترازوی مقایسه</span>
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
            <span>شبکه مساحت</span>
          </button>
        </div>
      </div>

      {/* Active Workshop Tool */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        {activeTab === "strip" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">دست‌ورزی با نوار کسرها</h3>
                <p className="text-xs text-slate-500 mt-0.5">روی خانه‌ها ضربه بزنید تا رنگ شوند یا پاک شوند.</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl font-mono" dir="ltr">
                {toPersianDigits(stripColored)} / {toPersianDigits(stripSegments)}
              </span>
            </div>

            {/* Quick segment selector buttons */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500">تعداد کل قسمت‌ها:</span>
              {[4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setStripSegments(num);
                    setStripColored(Math.min(stripColored, num));
                  }}
                  className={`min-h-[38px] px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    stripSegments === num
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {toPersianDigits(num)}
                </button>
              ))}
            </div>

            {/* Interactive Strip */}
            <div className="my-4 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <FractionStrip
                totalSegments={stripSegments}
                initialColored={stripColored}
                interactive={true}
                onChange={(c) => setStripColored(c)}
              />
            </div>

            <p className="text-xs text-center text-slate-600 bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl font-medium leading-relaxed">
              هرچه مخرج (تعداد کل قسمت‌ها) بزرگ‌تر باشد، اندازه هر قطعه کوچک‌تر می‌شود.
            </p>
          </div>
        )}

        {activeTab === "scale" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">ترازوی سنجش و مقایسه کسرها</h3>
                <p className="text-xs text-slate-500 mt-0.5">کسرهای دو کفه را انتخاب کنید تا ببینید کدام سنگین‌تر (بزرگ‌تر) است.</p>
              </div>
            </div>

            {/* Selection chips */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
                <span className="text-xs font-bold text-blue-900 block mb-2">کسر کفه چپ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "1/2", value: 0.5 },
                    { label: "1/3", value: 0.333 },
                    { label: "1/4", value: 0.25 },
                    { label: "3/4", value: 0.75 },
                  ].map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setScaleLeft(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        scaleLeft.label === f.label
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-800 border-blue-200"
                      }`}
                      dir="ltr"
                    >
                      {toPersianDigits(f.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-2">کسر کفه راست:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "1/4", value: 0.25 },
                    { label: "1/6", value: 0.166 },
                    { label: "2/3", value: 0.666 },
                    { label: "1/8", value: 0.125 },
                  ].map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setScaleRight(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        scaleRight.label === f.label
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-emerald-800 border-emerald-200"
                      }`}
                      dir="ltr"
                    >
                      {toPersianDigits(f.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Balance Scale */}
            <BalanceScale
              leftValue={scaleLeft.value}
              rightValue={scaleRight.value}
              leftLabel={scaleLeft.label}
              rightLabel={scaleRight.label}
            />

            <p className="text-xs text-center text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-2xl font-medium mt-3">
              کفه‌ای که پایین‌تر می‌رود نشان‌دهنده کسر بزرگ‌تر است.
            </p>
          </div>
        )}

        {activeTab === "grid" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">شبکه مساحت و کسرهای مساوی</h3>
                <p className="text-xs text-slate-500 mt-0.5">روی خانه‌ها ضربه بزنید تا سطح مورد نظر را بسازید.</p>
              </div>
            </div>

            <AreaGrid
              rows={2}
              cols={4}
              initialColored={gridColored}
              interactive={true}
              onChange={(c) => setGridColored(c)}
            />

            <p className="text-xs text-center text-slate-600 bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl font-medium mt-3">
              تعداد خانه‌های رنگ‌شده: <b className="text-indigo-700">{toPersianDigits(gridColored)}</b> از <b className="text-indigo-700">{toPersianDigits(8)}</b> خانه کل مستطیل.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
