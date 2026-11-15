"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface BrokenLineGraphProps {
  xLabels: string[]; // e.g. ["شنبه", "۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه"]
  yValues: number[]; // e.g. [12, 16, 14, 20, 18]
  yMin?: number;
  yMax?: number;
  yStep?: number;
  xTitle?: string;
  yTitle?: string;
  label?: string;
  lineColor?: string;
}

export const BrokenLineGraph: React.FC<BrokenLineGraphProps> = ({
  xLabels = ["شنبه", "۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه"],
  yValues = [12, 16, 14, 20, 18],
  yMin = 0,
  yMax,
  yStep,
  xTitle = "روزهای هفته",
  yTitle = "درجه حرارت",
  label,
  lineColor = "#4f46e5", // indigo-600
}) => {
  const svgWidth = 360;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 45;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxVal = yMax !== undefined ? yMax : Math.max(...yValues, 20);
  const minVal = yMin !== undefined ? yMin : 0;
  const valRange = Math.max(maxVal - minVal, 1);

  const step = yStep || Math.ceil(valRange / 4);
  const yTicks: number[] = [];
  for (let val = minVal; val <= maxVal; val += step) {
    yTicks.push(val);
  }

  // Calculate points
  const points = yValues.map((val, idx) => {
    const x = padLeft + (idx / Math.max(xLabels.length - 1, 1)) * chartW;
    const yRatio = (val - minVal) / valRange;
    const y = padTop + (1 - yRatio) * chartH;
    return { x, y, val, label: xLabels[idx] };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-56">
          {/* Grid lines and Y-axis ticks */}
          {yTicks.map((tickVal) => {
            const yRatio = (tickVal - minVal) / valRange;
            const y = padTop + (1 - yRatio) * chartH;

            return (
              <g key={tickVal}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight="bold"
                  fill="#64748b"
                >
                  {toPersianDigits(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Coordinate Axes */}
          {/* Y Axis */}
          <line
            x1={padLeft}
            y1={padTop - 5}
            x2={padLeft}
            y2={padTop + chartH}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          {/* X Axis */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={padLeft + chartW + 5}
            y2={padTop + chartH}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />

          {/* X-axis ticks and labels */}
          {points.map((p, idx) => (
            <g key={idx}>
              <line
                x1={p.x}
                y1={padTop + chartH}
                x2={p.x}
                y2={padTop + chartH + 4}
                stroke="#64748b"
                strokeWidth={1}
              />
              <text
                x={p.x}
                y={padTop + chartH + 18}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fill="#334155"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Connected Broken Line */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polylineStr}
          />

          {/* Data Points (Dots with Value Badges) */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth={2.5}
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize={10}
                fontWeight="900"
                fill={lineColor}
              >
                {toPersianDigits(p.val)}
              </text>
            </g>
          ))}
        </svg>

        {/* Axis Labels Below */}
        <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2 px-3">
          <span>محور عمودی: {yTitle}</span>
          <span>محور افقی: {xTitle}</span>
        </div>
      </div>
    </div>
  );
};
