"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface PatternStage {
  stageNumber: number;
  count: number;
  isTarget?: boolean;
}

export interface MatchstickPatternProps {
  patternKind?: "triangles" | "squares";
  stages?: PatternStage[];
  label?: string;
  showCounts?: boolean;
}

export const MatchstickPattern: React.FC<MatchstickPatternProps> = ({
  patternKind = "triangles",
  stages = [
    { stageNumber: 1, count: 3 },
    { stageNumber: 2, count: 5 },
    { stageNumber: 3, count: 7 },
    { stageNumber: 4, count: 9, isTarget: true },
  ],
  label,
  showCounts = true,
}) => {
  // Render a matchstick SVG element with wooden body and red/amber sulfur tip
  const renderMatchstick = (x1: number, y1: number, x2: number, y2: number, key: string | number) => {
    // Sulfur head position at x1, y1
    return (
      <g key={key}>
        {/* Matchstick wooden stick */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#d97706" // amber-600 (wood)
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        {/* Matchstick sulfur tip */}
        <circle
          cx={x1}
          cy={y1}
          r={4}
          fill="#ef4444" // red-500
          stroke="#b91c1c"
          strokeWidth={1}
        />
      </g>
    );
  };

  // Render matchstick arrangement for a given stage
  const renderStageShape = (stageNum: number, isTarget?: boolean) => {
    if (isTarget) {
      return (
        <div className="w-24 h-20 sm:w-28 sm:h-24 flex items-center justify-center border-2 border-dashed border-amber-400 bg-amber-50/50 rounded-2xl">
          <span className="text-3xl font-black text-amber-500 animate-pulse">؟</span>
        </div>
      );
    }

    if (patternKind === "squares") {
      // Chain of squares: stage 1 = 1 square (4 sticks), stage 2 = 2 squares (7 sticks)
      const count = stageNum;
      const boxSize = 28;
      const totalWidth = count * boxSize + 20;
      const height = 48;

      return (
        <svg viewBox={`0 0 ${totalWidth} ${height}`} className="h-16 sm:h-20 max-w-full">
          {Array.from({ length: count }).map((_, i) => {
            const left = 10 + i * boxSize;
            const right = left + boxSize;
            const top = 10;
            const bottom = top + boxSize;

            return (
              <g key={i}>
                {/* Top horizontal */}
                {renderMatchstick(left, top, right, top, `top-${i}`)}
                {/* Bottom horizontal */}
                {renderMatchstick(left, bottom, right, bottom, `bot-${i}`)}
                {/* Left vertical (only for first square) */}
                {i === 0 && renderMatchstick(left, top, left, bottom, `left-${i}`)}
                {/* Right vertical */}
                {renderMatchstick(right, top, right, bottom, `right-${i}`)}
              </g>
            );
          })}
        </svg>
      );
    }

    // Default: Chain of connected triangles
    // Stage 1 = 1 triangle (3 sticks)
    // Stage 2 = 2 connected triangles (5 sticks)
    // Stage 3 = 3 connected triangles (7 sticks)
    const count = stageNum;
    const baseW = 28;
    const peakH = 32;
    const totalW = count * baseW + 20;
    const totalH = 50;

    return (
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="h-16 sm:h-20 max-w-full">
        {Array.from({ length: count }).map((_, i) => {
          const xLeft = 10 + i * baseW;
          const xMid = xLeft + baseW / 2;
          const xRight = xLeft + baseW;
          const yBase = 40;
          const yPeak = yBase - peakH;

          return (
            <g key={i}>
              {/* Left slope */}
              {renderMatchstick(xMid, yPeak, xLeft, yBase, `ls-${i}`)}
              {/* Right slope */}
              {renderMatchstick(xMid, yPeak, xRight, yBase, `rs-${i}`)}
              {/* Bottom horizontal */}
              {renderMatchstick(xLeft, yBase, xRight, yBase, `base-${i}`)}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-xl bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="ltr">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                stage.isTarget
                  ? "bg-amber-100/50 border-amber-300 ring-2 ring-amber-300 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <span className="text-xs font-black text-slate-700 mb-2" dir="rtl">
                شکل ({toPersianDigits(stage.stageNumber)})
              </span>

              <div className="flex items-center justify-center my-1 min-h-16">
                {renderStageShape(stage.stageNumber, stage.isTarget)}
              </div>

              {showCounts && (
                <span
                  className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-md ${
                    stage.isTarget
                      ? "bg-amber-200 text-amber-900"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  dir="rtl"
                >
                  {stage.isTarget ? "؟ چوب‌کبریت" : `${toPersianDigits(stage.count)} چوب‌کبریت`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
