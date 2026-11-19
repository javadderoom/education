"use client";

import React, { useState } from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface NumberLineProps {
  min?: number;
  max?: number;
  partitions?: number;
  divisions?: number; // alias for partitions
  unitLength?: number;
  targetPoint?: number; // e.g. 0.5 for 2/4 or integer index
  targetFraction?: number; // alias for targetPoint
  targetLabel?: string;
  hideFractions?: boolean;
  interactive?: boolean;
  onPositionSelect?: (fraction: string, numericValue: number) => void;
}

export const NumberLine: React.FC<NumberLineProps> = ({
  min = 0,
  max,
  partitions,
  divisions,
  unitLength,
  targetPoint,
  targetFraction,
  targetLabel,
  hideFractions = false,
  interactive = false,
  onPositionSelect,
}) => {
  const effectivePartitions = Math.max(1, partitions ?? divisions ?? 4);

  const getEffectiveTarget = () => {
    const raw = targetPoint ?? targetFraction;
    if (raw === undefined) return 0.5;
    return raw <= 1 ? raw : Math.min(1, raw / effectivePartitions);
  };

  const [selectedTick, setSelectedTick] = useState<number | null>(
    Math.round(getEffectiveTarget() * effectivePartitions)
  );

  React.useEffect(() => {
    setSelectedTick(Math.round(getEffectiveTarget() * effectivePartitions));
  }, [targetPoint, targetFraction, partitions, divisions]);

  const paddingX = 40;
  const lineY = 60;
  const width = 460;
  const usableWidth = width - 2 * paddingX;

  const handleTickClick = (stepIndex: number) => {
    if (!interactive) return;
    setSelectedTick(stepIndex);
    const value = stepIndex / effectivePartitions;
    onPositionSelect?.(`${stepIndex}/${effectivePartitions}`, value);
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
        <svg viewBox="0 0 460 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 sm:h-28 overflow-visible">
          {/* Main Axis Line */}
          <line
            x1={paddingX}
            y1={lineY}
            x2={width - paddingX}
            y2={lineY}
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Arrows */}
          <polygon
            points={`${paddingX - 8},${lineY} ${paddingX},${lineY - 5} ${paddingX},${lineY + 5}`}
            fill="#334155"
          />
          <polygon
            points={`${width - paddingX + 8},${lineY} ${width - paddingX},${lineY - 5} ${width - paddingX},${lineY + 5}`}
            fill="#334155"
          />

          {/* Partition Ticks */}
          {Array.from({ length: effectivePartitions + 1 }).map((_, i) => {
            const x = paddingX + (i * usableWidth) / effectivePartitions;
            const isEndpoint = i === 0 || i === effectivePartitions;
            const tickHeight = isEndpoint ? 24 : 14;
            const isSelected = selectedTick === i;

            let tickText = "";
            if (unitLength !== undefined) {
              tickText = toPersianDigits(i * unitLength);
            } else if (isEndpoint) {
              tickText = i === 0 ? toPersianDigits(0) : toPersianDigits(max ?? 1);
            } else if (hideFractions) {
              tickText = isSelected ? "؟" : "";
            } else {
              tickText = `${toPersianDigits(i)}/${toPersianDigits(effectivePartitions)}`;
            }

            return (
              <g
                key={i}
                className={interactive ? "cursor-pointer" : ""}
                onClick={() => handleTickClick(i)}
              >
                {/* Click target hitbox */}
                <rect
                  x={x - 15}
                  y={lineY - 25}
                  width={30}
                  height={50}
                  fill="transparent"
                />

                {/* Vertical tick marker */}
                <line
                  x1={x}
                  y1={lineY - tickHeight / 2}
                  x2={x}
                  y2={lineY + tickHeight / 2}
                  stroke={isSelected ? "#4f46e5" : isEndpoint ? "#0f172a" : "#64748b"}
                  strokeWidth={isSelected ? 4 : isEndpoint ? 3 : 2}
                />

                {/* Number / Fraction Label */}
                <text
                  x={x}
                  y={lineY + 30}
                  textAnchor="middle"
                  fontSize={hideFractions && isSelected ? "16" : "14"}
                  fontWeight={isEndpoint || isSelected ? "700" : "500"}
                  fill={isSelected ? "#4f46e5" : isEndpoint ? "#0f172a" : "#64748b"}
                  style={{ direction: "ltr" }}
                >
                  {tickText}
                </text>

                {/* Target highlight dot */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={lineY}
                    r={7}
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {targetLabel && (
          <p className="text-center text-xs text-indigo-700 font-semibold mt-1">
            {toPersianDigits(targetLabel)}
          </p>
        )}
      </div>
    </div>
  );
};
