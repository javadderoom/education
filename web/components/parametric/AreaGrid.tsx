"use client";

import React, { useState } from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface AreaGridProps {
  rows?: number;
  cols?: number;
  columnRatios?: number[];
  initialColored?: number;
  coloredCount?: number;
  color?: "indigo" | "emerald" | "amber" | "sky" | "purple" | string;
  interactive?: boolean;
  highlightFractionA?: string;
  highlightFractionB?: string;
  hideBadge?: boolean;
  onChange?: (coloredCells: number) => void;
}

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-600 border-indigo-700 shadow-sm",
  emerald: "bg-emerald-600 border-emerald-700 shadow-sm",
  amber: "bg-amber-500 border-amber-600 shadow-sm",
  sky: "bg-sky-500 border-sky-600 shadow-sm",
  purple: "bg-purple-600 border-purple-700 shadow-sm",
};

export const AreaGrid: React.FC<AreaGridProps> = ({
  rows = 2,
  cols = 3,
  columnRatios,
  initialColored,
  coloredCount,
  color = "indigo",
  interactive = false,
  highlightFractionA,
  highlightFractionB,
  hideBadge = false,
  onChange,
}) => {
  const effectiveCols = columnRatios && columnRatios.length > 0 ? columnRatios.length : cols;
  const totalCells = rows * effectiveCols;
  const targetColored = coloredCount ?? initialColored ?? 0;

  const [selectedCells, setSelectedCells] = useState<boolean[]>(
    Array.from({ length: totalCells }, (_, i) => i < targetColored)
  );

  React.useEffect(() => {
    const target = coloredCount ?? initialColored ?? 0;
    setSelectedCells(Array.from({ length: totalCells }, (_, i) => i < target));
  }, [coloredCount, initialColored, totalCells]);

  const toggleCell = (index: number) => {
    if (!interactive) return;
    const next = [...selectedCells];
    next[index] = !next[index];
    setSelectedCells(next);
    onChange?.(next.filter(Boolean).length);
  };

  const actualColoredCount = selectedCells.filter(Boolean).length;
  const coloredClass = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
        <div
          className="grid gap-1.5 p-2 bg-white rounded-lg border border-slate-300 shadow-inner w-full max-w-sm"
          style={{
            gridTemplateColumns:
              columnRatios && columnRatios.length > 0
                ? columnRatios.map((r) => `${r}fr`).join(" ")
                : `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {selectedCells.map((isColored, i) => (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => toggleCell(i)}
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-md border-2 transition-all duration-150 flex items-center justify-center font-bold text-sm ${
                isColored
                  ? coloredClass
                  : "bg-slate-100 border-slate-300 hover:bg-slate-200"
              } ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"}`}
            />
          ))}
        </div>

        {!hideBadge && (
          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
            <span dir="ltr" className="font-bold bg-slate-200 px-2 py-1 rounded">
              {toPersianDigits(actualColoredCount)} / {toPersianDigits(totalCells)}
            </span>
            {highlightFractionA && highlightFractionB && (
              <span className="text-indigo-700">
                نمایش تساوی: <b dir="ltr">{toPersianDigits(highlightFractionA)} = {toPersianDigits(highlightFractionB)}</b>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
