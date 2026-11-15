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
      // Chain of squares: stage 1 = 1 square (4 sticks), stage 2 = 2 squares (7 sticks), stage n = 3n + 1
      const count = stageNum;
      const boxSize = 28;
      const totalWidth = count * boxSize + 24;
      const height = 50;

      return (
        <svg viewBox={`0 0 ${totalWidth} ${height}`} className="h-16 sm:h-20 max-w-full">
          {Array.from({ length: count }).map((_, i) => {
            const left = 12 + i * boxSize;
            const right = left + boxSize;
            const top = 11;
            const bottom = top + boxSize;

            const sticks: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

            // Top horizontal: left -> right (head at left-top)
            sticks.push({ x1: left, y1: top, x2: right, y2: top, key: `top-${i}` });
            // Right vertical: top -> bottom (head at right-top)
            sticks.push({ x1: right, y1: top, x2: right, y2: bottom, key: `right-${i}` });
            // Bottom horizontal: right -> left (head at right-bottom)
            sticks.push({ x1: right, y1: bottom, x2: left, y2: bottom, key: `bot-${i}` });
            // Left vertical (only for first square): bottom -> top (head at left-bottom)
            if (i === 0) {
              sticks.push({ x1: left, y1: bottom, x2: left, y2: top, key: `left-${i}` });
            }

            return (
              <g key={i}>
                {/* 1. Render all wooden sticks first */}
                {sticks.map((s) => (
                  <line
                    key={`line-${s.key}`}
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    stroke="#d97706"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                ))}
                {/* 2. Render all sulfur tips on top so sticks never occlude them */}
                {sticks.map((s) => (
                  <circle
                    key={`tip-${s.key}`}
                    cx={s.x1}
                    cy={s.y1}
                    r={4}
                    fill="#ef4444"
                    stroke="#b91c1c"
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      );
    }

    // Connected alternating triangles (مثلث‌های به‌هم‌پیوسته طبق کتاب درسی ریاضی چهارم)
    // Stage 1 = 1 triangle (3 sticks)
    // Stage 2 = 2 connected triangles sharing an edge (5 sticks)
    // Stage 3 = 3 connected triangles sharing edges (7 sticks)
    // Stage n = 2n + 1 sticks
    const count = stageNum;
    const halfBase = 15;
    const baseW = 30;
    const peakH = 32;
    const totalW = (count + 1) * halfBase + 24;
    const totalH = 50;
    const yBase = 42;
    const yPeak = yBase - peakH; // 10

    return (
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="h-16 sm:h-20 max-w-full">
        {Array.from({ length: count }).map((_, i) => {
          const sticks: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

          if (i === 0) {
            // First triangle (points up): 3 sticks (left slope, right slope, base)
            const x0 = 12;
            const x1 = 12 + halfBase; // 27
            const x2 = 12 + baseW; // 42
            // Left slope: bottom-left -> peak (head at bottom-left)
            sticks.push({ x1: x0, y1: yBase, x2: x1, y2: yPeak, key: "ls-0" });
            // Right slope: peak -> bottom-right (head at peak)
            sticks.push({ x1: x1, y1: yPeak, x2: x2, y2: yBase, key: "rs-0" });
            // Base horizontal: bottom-right -> bottom-left (head at bottom-right)
            sticks.push({ x1: x2, y1: yBase, x2: x0, y2: yBase, key: "base-0" });
          } else if (i % 2 === 1) {
            // Odd index (1, 3, 5... points down): shares previous right slope
            // Adds top horizontal and new right slope
            const xTopLeft = 12 + i * halfBase;
            const xTopRight = xTopLeft + baseW;
            const xBottom = xTopLeft + halfBase;
            sticks.push({ x1: xTopLeft, y1: yPeak, x2: xTopRight, y2: yPeak, key: `top-${i}` });
            sticks.push({ x1: xTopRight, y1: yPeak, x2: xBottom, y2: yBase, key: `rs-${i}` });
          } else {
            // Even index (2, 4, 6... points up): shares previous right slope
            // Adds bottom horizontal and new right slope
            const xBottomLeft = 12 + i * halfBase;
            const xBottomRight = xBottomLeft + baseW;
            const xTop = xBottomLeft + halfBase;
            sticks.push({ x1: xBottomRight, y1: yBase, x2: xBottomLeft, y2: yBase, key: `base-${i}` });
            sticks.push({ x1: xTop, y1: yPeak, x2: xBottomRight, y2: yBase, key: `rs-${i}` });
          }

          return (
            <g key={i}>
              {/* 1. Render all wooden sticks */}
              {sticks.map((s) => (
                <line
                  key={`line-${s.key}`}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke="#d97706"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
              ))}
              {/* 2. Render all sulfur tips on top */}
              {sticks.map((s) => (
                <circle
                  key={`tip-${s.key}`}
                  cx={s.x1}
                  cy={s.y1}
                  r={4}
                  fill="#ef4444"
                  stroke="#b91c1c"
                  strokeWidth={1}
                />
              ))}
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
