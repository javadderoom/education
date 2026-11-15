"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface DotStage {
  stageNumber: number;
  dotCount?: number;
  rows?: number;
  isTarget?: boolean;
}

export interface DotPatternVisualizerProps {
  shapeType?: "triangle" | "square";
  stages?: DotStage[];
  label?: string;
  showCounts?: boolean;
}

export const DotPatternVisualizer: React.FC<DotPatternVisualizerProps> = ({
  shapeType = "triangle",
  stages = [
    { stageNumber: 1, dotCount: 1, rows: 1 },
    { stageNumber: 2, dotCount: 3, rows: 2 },
    { stageNumber: 3, dotCount: 6, rows: 3 },
    { stageNumber: 4, dotCount: 10, rows: 4, isTarget: true },
  ],
  label,
  showCounts = true,
}) => {
  const renderDotsForStage = (stage: DotStage) => {
    if (stage.isTarget) {
      return (
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-2 border-dashed border-indigo-400 bg-indigo-50/50 rounded-2xl">
          <span className="text-3xl font-black text-indigo-500 animate-pulse">؟</span>
        </div>
      );
    }

    const rows = stage.rows || stage.stageNumber;
    const dotRadius = 4.5;
    const spacing = 14;

    if (shapeType === "square") {
      const size = rows * spacing + 10;
      return (
        <svg viewBox={`0 0 ${size} ${size}`} className="h-16 sm:h-20 max-w-full">
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: rows }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={c * spacing + spacing / 2 + 5}
                cy={r * spacing + spacing / 2 + 5}
                r={dotRadius}
                fill="#4f46e5" // indigo-600
                stroke="#3730a3"
                strokeWidth={1}
              />
            ))
          )}
        </svg>
      );
    }

    // Default: Triangle dots (مثلث نقطه‌ای)
    // Row 1: 1 dot (centered)
    // Row 2: 2 dots
    // Row n: n dots
    const totalW = rows * spacing + 20;
    const totalH = rows * spacing + 15;

    return (
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="h-16 sm:h-20 max-w-full">
        {Array.from({ length: rows }).map((_, r) => {
          const dotsInRow = r + 1;
          const y = r * spacing + 10;
          const rowStartX = (totalW - (dotsInRow - 1) * spacing) / 2;

          return Array.from({ length: dotsInRow }).map((_, d) => (
            <circle
              key={`${r}-${d}`}
              cx={rowStartX + d * spacing}
              cy={y}
              r={dotRadius}
              fill="#2563eb" // blue-600
              stroke="#1d4ed8"
              strokeWidth={1}
            />
          ));
        })}
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-xl bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                stage.isTarget
                  ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-300 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <span className="text-xs font-black text-slate-700 mb-2">
                شکل ({toPersianDigits(stage.stageNumber)})
              </span>

              <div className="flex items-center justify-center my-1 min-h-16">
                {renderDotsForStage(stage)}
              </div>

              {showCounts && (
                <span
                  className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-md ${
                    stage.isTarget
                      ? "bg-indigo-100 text-indigo-900"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  dir="ltr"
                >
                  {stage.isTarget ? "؟ نقطه" : `${toPersianDigits(stage.dotCount || 0)} نقطه`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
