"use client";

import React, { useState } from "react";

export interface FractionStripProps {
  totalSegments: number;
  initialColored?: number;
  interactive?: boolean;
  showSumMode?: boolean;
  operandA?: number;
  operandB?: number;
  label?: string;
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
  onChange,
}) => {
  const [coloredCount, setColoredCount] = useState(initialColored);

  const handleSegmentClick = (index: number) => {
    if (!interactive) return;
    const newCount = index + 1 === coloredCount ? index : index + 1;
    setColoredCount(newCount);
    onChange?.(newCount);
  };

  const segmentWidth = 100 / totalSegments;

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      {label && <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>}
      
      <div className="w-full max-w-md bg-slate-50 border-2 border-slate-300 rounded-xl p-3 shadow-inner">
        <svg
          viewBox="0 0 500 70"
          className="w-full h-16 rounded-lg overflow-hidden border border-slate-300 bg-white"
        >
          {Array.from({ length: totalSegments }).map((_, i) => {
            const x = (i * 500) / totalSegments;
            const width = 500 / totalSegments;

            let fillColor = "#f8fafc"; // uncolored slate-50
            if (showSumMode) {
              if (i < operandA) {
                fillColor = "#3b82f6"; // blue-500
              } else if (i < operandA + operandB) {
                fillColor = "#10b981"; // emerald-500
              }
            } else if (i < coloredCount) {
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
                <text
                  x={x + width / 2}
                  y={42}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="600"
                  fill={
                    (showSumMode && (i < operandA || i < operandA + operandB)) || i < coloredCount
                      ? "#ffffff"
                      : "#64748b"
                  }
                >
                  {`1/${totalSegments}`}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between items-center mt-2 px-1 text-xs text-slate-500 font-mono" dir="ltr">
          <span>0</span>
          <span>
            {showSumMode
              ? `${operandA + operandB} / ${totalSegments}`
              : `${coloredCount} / ${totalSegments}`}
          </span>
          <span>1</span>
        </div>
      </div>
    </div>
  );
};
