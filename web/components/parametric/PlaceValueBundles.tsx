"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface ValueBundleGroup {
  count: number;
  unitValue: number;
  unitLabel: string;
  theme?: "purple" | "emerald" | "sky" | "amber" | "rose";
}

export interface PlaceValueBundlesProps {
  bundles: ValueBundleGroup[];
  label?: string;
  showCalculatedValues?: boolean; // if false, doesn't reveal sums
}

const THEME_STYLES = {
  purple: {
    bg: "bg-purple-50/70",
    border: "border-purple-200",
    headerBg: "bg-purple-100/90 text-purple-900 border-purple-300",
    badge: "bg-purple-600 text-white",
    bundleBg: "from-purple-500 to-indigo-600",
    bundleShadow: "shadow-purple-500/25",
    strapBg: "bg-amber-300 text-amber-950 border-amber-400",
    textColor: "text-purple-950",
  },
  emerald: {
    bg: "bg-emerald-50/70",
    border: "border-emerald-200",
    headerBg: "bg-emerald-100/90 text-emerald-900 border-emerald-300",
    badge: "bg-emerald-600 text-white",
    bundleBg: "from-emerald-500 to-teal-600",
    bundleShadow: "shadow-emerald-500/25",
    strapBg: "bg-emerald-200 text-emerald-950 border-emerald-300",
    textColor: "text-emerald-950",
  },
  sky: {
    bg: "bg-sky-50/70",
    border: "border-sky-200",
    headerBg: "bg-sky-100/90 text-sky-900 border-sky-300",
    badge: "bg-sky-600 text-white",
    bundleBg: "from-sky-500 to-blue-600",
    bundleShadow: "shadow-sky-500/25",
    strapBg: "bg-sky-200 text-sky-950 border-sky-300",
    textColor: "text-sky-950",
  },
  amber: {
    bg: "bg-amber-50/70",
    border: "border-amber-200",
    headerBg: "bg-amber-100/90 text-amber-900 border-amber-300",
    badge: "bg-amber-600 text-white",
    bundleBg: "from-amber-500 to-orange-600",
    bundleShadow: "shadow-amber-500/25",
    strapBg: "bg-amber-200 text-amber-950 border-amber-300",
    textColor: "text-amber-950",
  },
  rose: {
    bg: "bg-rose-50/70",
    border: "border-rose-200",
    headerBg: "bg-rose-100/90 text-rose-900 border-rose-300",
    badge: "bg-rose-600 text-white",
    bundleBg: "from-rose-500 to-red-600",
    bundleShadow: "shadow-rose-500/25",
    strapBg: "bg-rose-200 text-rose-950 border-rose-300",
    textColor: "text-rose-950",
  },
};

export const PlaceValueBundles: React.FC<PlaceValueBundlesProps> = ({
  bundles,
  label,
  showCalculatedValues = false,
}) => {
  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2.5">{label}</p>}

      <div className="w-full max-w-2xl bg-white border-2 border-slate-200 rounded-3xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5 sm:gap-3">
          {bundles.map((group, gIdx) => {
            const themeKey = group.theme || (gIdx === 0 ? "purple" : gIdx === 1 ? "emerald" : "sky");
            const style = THEME_STYLES[themeKey] || THEME_STYLES.purple;
            const isLast = gIdx === bundles.length - 1;

            return (
              <React.Fragment key={group.unitLabel + gIdx}>
                {/* Bundle Card Group */}
                <div
                  className={`flex-1 flex flex-col items-center p-3 rounded-2xl border ${style.border} ${style.bg} transition-all`}
                >
                  {/* Group Header Badge */}
                  <div
                    className={`w-full text-center py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black border ${style.headerBg} shadow-2xs mb-3 flex items-center justify-center gap-1.5`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black ${style.badge}`}
                    >
                      {toPersianDigits(group.count)}
                    </span>
                    <span>بسته {group.unitLabel}</span>
                  </div>

                  {/* Bundles Visual Container */}
                  <div className="w-full flex flex-wrap items-center justify-center gap-2 min-h-[70px] py-1">
                    {Array.from({ length: Math.min(group.count, 12) }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className={`relative flex items-center justify-center w-14 sm:w-16 h-8 sm:h-9 rounded-lg bg-linear-to-b ${style.bundleBg} text-white shadow-sm ${style.bundleShadow} border border-white/40 transform hover:-translate-y-0.5 transition-transform`}
                      >
                        {/* Banknote Texture lines */}
                        <div className="absolute inset-0.5 rounded border border-white/25 pointer-events-none" />

                        {/* Middle Packaging Strap */}
                        <div
                          className={`absolute inset-y-0 w-4.5 sm:w-5 flex items-center justify-center ${style.strapBg} border-x shadow-2xs`}
                        >
                          <span className="text-[9px] font-black leading-none">★</span>
                        </div>

                        {/* Stamped Numerical Value */}
                        <span
                          className="relative z-10 text-[9px] sm:text-[10px] font-black tracking-tighter opacity-95 text-white drop-shadow-xs"
                          dir="ltr"
                        >
                          {toPersianDigits(group.unitValue.toLocaleString())}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Unit Descriptor */}
                  <div className="mt-2 text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-1">
                    <span>{toPersianDigits(group.count)} تا</span>
                    <span className="font-black text-slate-800" dir="ltr">
                      {toPersianDigits(group.unitValue.toLocaleString())}
                    </span>
                    <span>تایی</span>
                  </div>

                  {showCalculatedValues && (
                    <div className="mt-1 text-xs font-black text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200" dir="ltr">
                      = {toPersianDigits((group.count * group.unitValue).toLocaleString())}
                    </div>
                  )}
                </div>

                {/* Connection Symbol Between Groups */}
                {!isLast && (
                  <div className="flex items-center justify-center self-center py-1 sm:py-0">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-sm border border-slate-300 shadow-2xs">
                      +
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
