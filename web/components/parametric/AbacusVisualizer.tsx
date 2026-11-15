"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface AbacusColumn {
  label: string;
  count: number;
  tier?: "ones" | "thousands" | "millions";
  highlight?: boolean;
  hidden?: boolean;
  hiddenLabel?: boolean;
}

export interface AbacusVisualizerProps {
  columns?: AbacusColumn[];
  number?: number; // if passed, automatically builds columns up to millions or thousands
  maxBeads?: number;
  label?: string;
  showDigitBadges?: boolean;
  highlightRod?: string | number; // rod label or index to highlight
  hiddenLabel?: string | number; // rod label or index whose label is masked with '؟'
}

export const AbacusVisualizer: React.FC<AbacusVisualizerProps> = ({
  columns,
  number,
  maxBeads = 9,
  label,
  showDigitBadges = true,
  highlightRod,
  hiddenLabel,
}) => {
  // If number is provided, automatically derive columns
  let effectiveColumns: AbacusColumn[] = [];

  if (columns && columns.length > 0) {
    effectiveColumns = columns;
  } else if (number !== undefined) {
    const hasMillions = number >= 1_000_000;
    const labels = hasMillions
      ? ["یکان‌میلیون", "صدگان‌هزار", "دهگان‌هزار", "یکان‌هزار", "صدگان", "دهگان", "یکان"]
      : ["صدگان‌هزار", "دهگان‌هزار", "یکان‌هزار", "صدگان", "دهگان", "یکان"];

    const numStr = Math.floor(Math.abs(number)).toString().padStart(labels.length, "0");
    const digits = numStr.slice(-labels.length).split("").map((d) => parseInt(d, 10));

    effectiveColumns = labels.map((lbl, idx) => {
      let tier: "ones" | "thousands" | "millions" = "ones";
      if (lbl.includes("میلیون")) tier = "millions";
      else if (lbl.includes("هزار")) tier = "thousands";

      return {
        label: lbl,
        count: digits[idx],
        tier,
      };
    });
  } else {
    // Default 6-column thousands abacus
    effectiveColumns = [
      { label: "صدگان‌هزار", count: 3, tier: "thousands" },
      { label: "دهگان‌هزار", count: 0, tier: "thousands" },
      { label: "یکان‌هزار", count: 4, tier: "thousands" },
      { label: "صدگان", count: 2, tier: "ones" },
      { label: "دهگان", count: 5, tier: "ones" },
      { label: "یکان", count: 1, tier: "ones" },
    ];
  }

  const getTierColors = (tier?: string) => {
    switch (tier) {
      case "millions":
        return {
          beadFill: "#a855f7", // purple-500
          beadStroke: "#7e22ce", // purple-700
          badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
        };
      case "thousands":
        return {
          beadFill: "#10b981", // emerald-500
          beadStroke: "#047857", // emerald-700
          badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
      default:
        return {
          beadFill: "#3b82f6", // blue-500
          beadStroke: "#1d4ed8", // blue-700
          badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
        };
    }
  };

  const colCount = effectiveColumns.length;
  const svgWidth = 600;
  const svgHeight = 280;
  const baseLineY = 230;
  const rodTopY = 30;
  const beadHeight = 18;
  const beadWidth = 36;
  const colSpacing = svgWidth / (colCount + 1);

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-lg bg-slate-50 border-2 border-slate-300 rounded-3xl p-3 shadow-sm overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-64 rounded-2xl bg-white border border-slate-200"
        >
          {/* Wooden / Slate Base Bar */}
          <rect
            x={20}
            y={baseLineY}
            width={svgWidth - 40}
            height={28}
            rx={8}
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* Abacus Columns */}
          {effectiveColumns.map((col, idx) => {
            const cx = (idx + 1) * colSpacing;
            const colors = getTierColors(col.tier);
            const clampedCount = Math.min(Math.max(col.count, 0), maxBeads);
            const isRodHighlighted =
              col.highlight ||
              highlightRod === col.label ||
              highlightRod === idx ||
              highlightRod === idx + 1;
            const isLabelHidden =
              col.hiddenLabel ||
              hiddenLabel === col.label ||
              hiddenLabel === idx ||
              hiddenLabel === idx + 1;

            return (
              <g key={col.label + idx}>
                {/* Highlight Glow behind rod if selected */}
                {isRodHighlighted && (
                  <rect
                    x={cx - beadWidth / 2 - 4}
                    y={rodTopY - 4}
                    width={beadWidth + 8}
                    height={baseLineY - rodTopY + 8}
                    rx={12}
                    fill="#fef3c7"
                    opacity={0.6}
                  />
                )}

                {/* Vertical Rod */}
                <line
                  x1={cx}
                  y1={rodTopY}
                  x2={cx}
                  y2={baseLineY}
                  stroke={isRodHighlighted ? "#f59e0b" : "#cbd5e1"}
                  strokeWidth={isRodHighlighted ? 5 : 4}
                  strokeLinecap="round"
                />

                {/* Rod Tip Bead */}
                <circle cx={cx} y={rodTopY} r={isRodHighlighted ? 5 : 4} fill={isRodHighlighted ? "#f59e0b" : "#94a3b8"} />

                {/* Stacked Beads */}
                {!col.hidden &&
                  Array.from({ length: clampedCount }).map((_, bIdx) => {
                    const beadY = baseLineY - (bIdx + 1) * beadHeight + 2;
                    return (
                      <g key={bIdx}>
                        {/* 3D Bead Ellipse */}
                        <ellipse
                          cx={cx}
                          cy={beadY}
                          rx={beadWidth / 2}
                          ry={beadHeight / 2 - 1}
                          fill={isRodHighlighted ? "#f59e0b" : colors.beadFill}
                          stroke={isRodHighlighted ? "#b45309" : colors.beadStroke}
                          strokeWidth={1.5}
                        />
                        {/* Shading highlight */}
                        <ellipse
                          cx={cx - 5}
                          cy={beadY - 2}
                          rx={beadWidth / 4}
                          ry={beadHeight / 5}
                          fill="#ffffff"
                          opacity={0.35}
                        />
                      </g>
                    );
                  })}

                {/* Hidden slot Question Mark */}
                {col.hidden && (
                  <text
                    x={cx}
                    y={baseLineY - 40}
                    textAnchor="middle"
                    fill="#f59e0b"
                    fontSize={28}
                    fontWeight="900"
                  >
                    ؟
                  </text>
                )}

                {/* Highlight background in base bar */}
                {isRodHighlighted && (
                  <rect
                    x={cx - colSpacing / 2 + 4}
                    y={baseLineY + 3}
                    width={colSpacing - 8}
                    height={22}
                    rx={6}
                    fill="#fef3c7"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                  />
                )}

                {/* Rod Label inside Base */}
                <text
                  x={cx}
                  y={baseLineY + 18}
                  textAnchor="middle"
                  fill={isRodHighlighted ? "#78350f" : "#334155"}
                  fontSize={isLabelHidden ? 15 : 11}
                  fontWeight="bold"
                >
                  {isLabelHidden ? "؟" : col.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Digit Badges Below */}
        {showDigitBadges && (
          <div className="grid mt-3 gap-1" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
            {effectiveColumns.map((col, idx) => {
              const colors = getTierColors(col.tier);
              return (
                <div key={col.label + idx} className="flex flex-col items-center">
                  {col.hidden ? (
                    <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 text-amber-700 font-black text-sm">
                      ؟
                    </span>
                  ) : (
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border font-black text-xs sm:text-sm shadow-xs ${colors.badgeBg}`}
                      dir="ltr"
                    >
                      {toPersianDigits(col.count)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
