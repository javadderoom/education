"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface FractionCircleProps {
  totalSlices: number; // e.g. 2, 3, 4, 6, 8
  shadedSlices: number;
  wholeUnits?: number; // for mixed numbers e.g. 1 whole + 3/4
  colorTheme?: "indigo" | "emerald" | "amber" | "rose";
  label?: string;
  showFractionBadge?: boolean;
  showSliceLabels?: boolean;
}

export const FractionCircle: React.FC<FractionCircleProps> = ({
  totalSlices = 4,
  shadedSlices = 3,
  wholeUnits = 0,
  colorTheme = "indigo",
  label,
  showFractionBadge = true,
  showSliceLabels = true,
}) => {
  const radius = 45;
  const size = 110;
  const center = size / 2;

  const getThemeColors = () => {
    switch (colorTheme) {
      case "emerald":
        return {
          shaded: "#10b981", // emerald-500
          border: "#059669",
          badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
        };
      case "amber":
        return {
          shaded: "#f59e0b", // amber-500
          border: "#d97706",
          badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
        };
      case "rose":
        return {
          shaded: "#f43f5e", // rose-500
          border: "#e11d48",
          badgeBg: "bg-rose-50 text-rose-800 border-rose-300",
        };
      default:
        return {
          shaded: "#4f46e5", // indigo-600
          border: "#4338ca",
          badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-300",
        };
    }
  };

  const colors = getThemeColors();

  // Helper to render a sector of a circle
  const renderSector = (sliceIdx: number, isShaded: boolean) => {
    const startAngle = (sliceIdx / totalSlices) * 360 - 90;
    const endAngle = ((sliceIdx + 1) / totalSlices) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = 360 / totalSlices > 180 ? 1 : 0;
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return (
      <path
        key={sliceIdx}
        d={d}
        fill={isShaded ? colors.shaded : "#f8fafc"}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-md bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        {/* Circles container */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Fully shaded whole units */}
          {Array.from({ length: wholeUnits }).map((_, wIdx) => (
            <div key={`whole-${wIdx}`} className="flex flex-col items-center">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-20 h-20 sm:w-24 sm:h-24">
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill={colors.shaded}
                  stroke={colors.border}
                  strokeWidth={2}
                />
              </svg>
              {showSliceLabels && (
                <span className="text-[11px] font-bold text-slate-500 mt-1">واحد کامل</span>
              )}
            </div>
          ))}

          {/* Partial fractional unit */}
          {totalSlices > 0 && (
            <div className="flex flex-col items-center">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-20 h-20 sm:w-24 sm:h-24">
                <circle cx={center} cy={center} r={radius} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
                {Array.from({ length: totalSlices }).map((_, i) =>
                  renderSector(i, i < shadedSlices)
                )}
                {/* Center Hub */}
                <circle cx={center} cy={center} r={3} fill="#475569" />
              </svg>
              {showSliceLabels && (
                <span className="text-[11px] font-bold text-slate-500 mt-1">
                  {toPersianDigits(shadedSlices)} از {toPersianDigits(totalSlices)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Fraction Badge */}
        {showFractionBadge && (
          <div className="mt-3 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-xl border text-xs font-black shadow-xs flex items-center gap-1.5 ${colors.badgeBg}`} dir="ltr">
              {wholeUnits > 0 && <span>{toPersianDigits(wholeUnits)}</span>}
              <span className="inline-flex flex-col items-center leading-none">
                <span>{toPersianDigits(shadedSlices)}</span>
                <span className="w-full border-t border-current my-0.5" />
                <span>{toPersianDigits(totalSlices)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
