"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface SpinnerSector {
  color: string;
  fraction: number; // e.g. 0.5 (half), 0.25 (quarter)
  label: string; // e.g. "قرمز", "آبی", "سبز"
}

export interface ProbabilitySpinnerProps {
  sectors?: SpinnerSector[];
  pointerAngle?: number; // degrees, default e.g. 45
  label?: string;
  showLegend?: boolean;
}

export const ProbabilitySpinner: React.FC<ProbabilitySpinnerProps> = ({
  sectors = [
    { color: "#ef4444", fraction: 0.5, label: "قرمز" },
    { color: "#3b82f6", fraction: 0.25, label: "آبی" },
    { color: "#10b981", fraction: 0.25, label: "سبز" },
  ],
  pointerAngle = 45,
  label,
  showLegend = true,
}) => {
  const size = 220;
  const center = size / 2;
  const radius = 85;

  // Build sector SVG path descriptors
  let currentCumulativeAngle = 0;
  const renderedSectors = sectors.map((sec, idx) => {
    const sweepAngle = sec.fraction * 360;
    const startAngle = currentCumulativeAngle - 90;
    const endAngle = currentCumulativeAngle + sweepAngle - 90;
    currentCumulativeAngle += sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Mid angle for text label placement
    const midRad = ((startAngle + sweepAngle / 2) * Math.PI) / 180;
    const labelX = center + radius * 0.62 * Math.cos(midRad);
    const labelY = center + radius * 0.62 * Math.sin(midRad) + 4;

    return {
      d,
      color: sec.color,
      label: sec.label,
      labelX,
      labelY,
      idx,
    };
  });

  // Pointer needle coordinates
  const pointerRad = ((pointerAngle - 90) * Math.PI) / 180;
  const needleLength = radius * 0.8;
  const needleX = center + needleLength * Math.cos(pointerRad);
  const needleY = center + needleLength * Math.sin(pointerRad);

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-xs bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48 sm:w-52 sm:h-52 overflow-visible">
          {/* Bezel shadow */}
          <circle cx={center} cy={center} r={radius + 6} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />

          {/* Render Sectors */}
          {renderedSectors.map((s) => (
            <g key={s.idx}>
              <path d={s.d} fill={s.color} stroke="#ffffff" strokeWidth={2} />
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                fontSize={11}
                fontWeight="900"
                fill="#ffffff"
                className="drop-shadow-sm pointer-events-none"
              >
                {s.label}
              </text>
            </g>
          ))}

          {/* Spinner Border */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#475569" strokeWidth={2.5} />

          {/* Arrow Needle */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            strokeWidth={4.5}
            strokeLinecap="round"
          />

          {/* Arrow Tip Triangle */}
          <polygon
            points={`${needleX},${needleY} ${needleX - 6 * Math.cos(pointerRad + 0.5)},${needleY - 6 * Math.sin(pointerRad + 0.5)} ${needleX - 6 * Math.cos(pointerRad - 0.5)},${needleY - 6 * Math.sin(pointerRad - 0.5)}`}
            fill="#0f172a"
          />

          {/* Center Hub Ring */}
          <circle cx={center} cy={center} r={7} fill="#e2e8f0" stroke="#0f172a" strokeWidth={2.5} />
          <circle cx={center} cy={center} r={2.5} fill="#ea580c" />
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {sectors.map((sec, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs shadow-xs"
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sec.color }} />
                <span className="font-bold text-slate-700">{sec.label}:</span>
                <span className="font-mono font-black text-slate-900" dir="ltr">
                  {toPersianDigits(Math.round(sec.fraction * 100))}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
