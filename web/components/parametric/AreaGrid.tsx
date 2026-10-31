"use client";

import React, { useState } from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface AreaGridProps {
  rows?: number;
  cols?: number;
  initialColored?: number;
  interactive?: boolean;
  highlightFractionA?: string;
  highlightFractionB?: string;
  onChange?: (coloredCells: number) => void;
}

export const AreaGrid: React.FC<AreaGridProps> = ({
  rows = 2,
  cols = 3,
  initialColored = 4,
  interactive = false,
  highlightFractionA,
  highlightFractionB,
  onChange,
}) => {
  const totalCells = rows * cols;
  const [selectedCells, setSelectedCells] = useState<boolean[]>(
    Array.from({ length: totalCells }, (_, i) => i < initialColored)
  );

  const toggleCell = (index: number) => {
    if (!interactive) return;
    const next = [...selectedCells];
    next[index] = !next[index];
    setSelectedCells(next);
    onChange?.(next.filter(Boolean).length);
  };

  const coloredCount = selectedCells.filter(Boolean).length;

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
        <div
          className="grid gap-1.5 p-2 bg-white rounded-lg border border-slate-300 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
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
                  ? "bg-indigo-600 border-indigo-700 text-white shadow-sm"
                  : "bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200"
              } ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"}`}
            >
              {isColored ? "✓" : ""}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
          <span dir="ltr" className="font-mono bg-slate-200 px-2 py-1 rounded">
            {toPersianDigits(coloredCount)} / {toPersianDigits(totalCells)}
          </span>
          {highlightFractionA && highlightFractionB && (
            <span className="text-indigo-700">
              نمایش تساوی: <b dir="ltr">{toPersianDigits(highlightFractionA)} = {toPersianDigits(highlightFractionB)}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
