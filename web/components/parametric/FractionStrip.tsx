"use client";

import React, { useState } from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface FractionStripProps {
  totalSegments?: number;
  initialColored?: number;
  interactive?: boolean;
  showSumMode?: boolean;
  operandA?: number;
  operandB?: number;
  label?: string;
  hideCounter?: boolean;
  showLabels?: boolean;
  segmentRatios?: number[];
  coloredSegments?: number[];
  onChange?: (coloredCount: number) => void;
}

export const FractionStrip: React.FC<FractionStripProps> = ({
  totalSegments = 7,
  initialColored = 0,
  interactive = false,
  showSumMode = false,
  operandA = 0,
  operandB = 0,
  label,
  hideCounter = false,
  showLabels,
  segmentRatios,
  coloredSegments,
  onChange,
}) => {
  const isUnequal = Boolean(segmentRatios && segmentRatios.length > 0);
  const effectiveTotal = isUnequal ? segmentRatios!.length : totalSegments;

  const [coloredCount, setColoredCount] = useState(initialColored);

  const handleSegmentClick = (index: number) => {
    if (!interactive) return;
    const newCount = index + 1 === coloredCount ? index : index + 1;
    setColoredCount(newCount);
    onChange?.(newCount);
  };

  // Pre-calculate segment coordinates
  const segments = React.useMemo(() => {
    const totalSvgWidth = 500;
    if (isUnequal && segmentRatios) {
      const sumRatios = segmentRatios.reduce((acc, val) => acc + val, 0);
      let currX = 0;
      return segmentRatios.map((ratio, i) => {
        const w = (ratio / sumRatios) * totalSvgWidth;
        const seg = { x: currX, width: w, index: i };
        currX += w;
        return seg;
      });
    }

    const uniformW = totalSvgWidth / effectiveTotal;
    return Array.from({ length: effectiveTotal }, (_, i) => ({
      x: i * uniformW,
      width: uniformW,
      index: i,
    }));
  }, [isUnequal, segmentRatios, effectiveTotal]);

  const shouldShowLabels = showLabels ?? !isUnequal;
  const shouldShowCounter = !hideCounter && !isUnequal;

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      {label && <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>}
      
      <div className="w-full max-w-md bg-slate-50 border-2 border-slate-300 rounded-xl p-3 shadow-inner">
        <svg
          viewBox="0 0 500 70"
          className="w-full h-16 rounded-lg overflow-hidden border border-slate-300 bg-white"
        >
          {segments.map(({ x, width, index: i }) => {
            let isColored = false;
            let fillColor = "#f8fafc"; // uncolored slate-50

            if (coloredSegments && coloredSegments.length > 0) {
              isColored = coloredSegments.includes(i);
            } else if (showSumMode) {
              if (i < operandA) {
                fillColor = "#3b82f6"; // blue-500
                isColored = true;
              } else if (i < operandA + operandB) {
                fillColor = "#10b981"; // emerald-500
                isColored = true;
              }
            } else if (i < coloredCount) {
              isColored = true;
            }

            if (isColored && !showSumMode) {
              fillColor = "#6366f1"; // indigo-500
            }

            return (
              <g
                key={i}
                onClick={() => handleSegmentClick(i)}
                className={interactive ? "cursor-pointer transition-colors duration-200" : ""}
              >
                <rect
                  x={x}
                  y={0}
                  width={width}
                  height={70}
                  fill={fillColor}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                {shouldShowLabels && (
                  <text
                    x={x + width / 2}
                    y={42}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="600"
                    fill={isColored ? "#ffffff" : "#64748b"}
                  >
                    {`${toPersianDigits(1)}/${toPersianDigits(effectiveTotal)}`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {shouldShowCounter && (
          <div className="flex justify-between items-center mt-2 px-1 text-xs text-slate-400 font-semibold" dir="ltr">
            <span>{toPersianDigits(0)}</span>
            <span className="text-slate-600 font-semibold">
              {showSumMode
                ? `${toPersianDigits(operandA + operandB)} / ${toPersianDigits(effectiveTotal)}`
                : `${toPersianDigits(coloredCount)} / ${toPersianDigits(effectiveTotal)}`}
            </span>
            <span>{toPersianDigits(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
