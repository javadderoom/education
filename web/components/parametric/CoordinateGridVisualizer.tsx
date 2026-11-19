"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Grid, Move, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";

export interface GridPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
}

export interface CoordinateGridVisualizerProps {
  initialPoints?: GridPoint[];
  initialShape?: Array<[number, number]>;
  quadrantMode?: "quadrant1" | "all4";
  showProjections?: boolean;
  showSymmetry?: boolean;
  symmetryType?: "none" | "x_axis" | "y_axis" | "origin";
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const CoordinateGridVisualizer: React.FC<CoordinateGridVisualizerProps> = ({
  initialPoints = [
    { id: "A", label: "الف", x: 4, y: 3, color: "#4f46e5" },
    { id: "B", label: "ب", x: 2, y: 5, color: "#059669" },
  ],
  initialShape,
  quadrantMode = "quadrant1",
  showProjections = true,
  showSymmetry = true,
  symmetryType = "none",
  interactive = true,
  className = "",
  label = "دستگاه مختصات دو بعدی و بازنمایی طول و عرض",
}) => {
  const [mode, setMode] = useState<"quadrant1" | "all4">(quadrantMode);
  const [symType, setSymType] = useState<"none" | "x_axis" | "y_axis" | "origin">(symmetryType);
  const [activePointX, setActivePointX] = useState<number>(initialPoints[0]?.x ?? 4);
  const [activePointY, setActivePointY] = useState<number>(initialPoints[0]?.y ?? 3);
  const [selectedShape, setSelectedShape] = useState<"point" | "triangle" | "rectangle">(
    initialShape ? "triangle" : "point"
  );

  // Bounds
  const minX = mode === "quadrant1" ? 0 : -6;
  const maxX = mode === "quadrant1" ? 8 : 6;
  const minY = mode === "quadrant1" ? 0 : -6;
  const maxY = mode === "quadrant1" ? 8 : 6;

  // SVG dimensions
  const svgWidth = 440;
  const svgHeight = 360;
  const padding = 35;
  const plotWidth = svgWidth - 2 * padding;
  const plotHeight = svgHeight - 2 * padding;

  const toSvgX = (x: number) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (y: number) => svgHeight - padding - ((y - minY) / (maxY - minY)) * plotHeight;

  // Shapes
  const triangleCoords: Array<[number, number]> = [
    [2, 1],
    [6, 1],
    [4, 5],
  ];

  const rectangleCoords: Array<[number, number]> = [
    [1, 2],
    [5, 2],
    [5, 6],
    [1, 6],
  ];

  // Symmetry transformation
  const transformPoint = (x: number, y: number): [number, number] => {
    switch (symType) {
      case "x_axis":
        return [x, -y];
      case "y_axis":
        return [-x, y];
      case "origin":
        return [-x, -y];
      default:
        return [x, y];
    }
  };

  // Generate grid lines
  const xTicks: number[] = [];
  for (let x = minX; x <= maxX; x++) xTicks.push(x);

  const yTicks: number[] = [];
  for (let y = minY; y <= maxY; y++) yTicks.push(y);

  // Active point projection coordinates
  const currX = activePointX;
  const currY = activePointY;
  const [refX, refY] = transformPoint(currX, currY);

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              طول (محور افقی) و عرض (محور عمودی) در صفحه مختصات
            </p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("quadrant1");
                if (activePointX < 0) setActivePointX(2);
                if (activePointY < 0) setActivePointY(2);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "quadrant1" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              ناحیه ۱ (مختصات مثبت)
            </button>
            <button
              type="button"
              onClick={() => setMode("all4")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "all4" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              چهار ناحیه
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative flex justify-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible"
          role="img"
          aria-label="دستگاه مختصات دو بعدی"
        >
          <defs>
            <marker
              id="arrow-x"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
            </marker>
            <marker
              id="arrow-y"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
            </marker>
          </defs>

          {/* Grid lines */}
          {xTicks.map((x) => (
            <line
              key={`grid-x-${x}`}
              x1={toSvgX(x)}
              y1={padding}
              x2={toSvgX(x)}
              y2={svgHeight - padding}
              stroke={x === 0 ? "#475569" : "#e2e8f0"}
              strokeWidth={x === 0 ? 2 : 1}
              strokeDasharray={x === 0 ? undefined : "3,3"}
            />
          ))}

          {yTicks.map((y) => (
            <line
              key={`grid-y-${y}`}
              x1={padding}
              y1={toSvgY(y)}
              x2={svgWidth - padding}
              y2={toSvgY(y)}
              stroke={y === 0 ? "#475569" : "#e2e8f0"}
              strokeWidth={y === 0 ? 2 : 1}
              strokeDasharray={y === 0 ? undefined : "3,3"}
            />
          ))}

          {/* X Axis & Arrow */}
          <line
            x1={padding - 10}
            y1={toSvgY(0)}
            x2={svgWidth - padding + 15}
            y2={toSvgY(0)}
            stroke="#1e293b"
            strokeWidth={2.5}
            markerEnd="url(#arrow-x)"
          />
          <text
            x={svgWidth - padding + 18}
            y={toSvgY(0) + 4}
            fontSize="11"
            fontWeight="bold"
            fill="#1e293b"
            textAnchor="start"
          >
            طول (x)
          </text>

          {/* Y Axis & Arrow */}
          <line
            x1={toSvgX(0)}
            y1={svgHeight - padding + 10}
            x2={toSvgX(0)}
            y2={padding - 15}
            stroke="#1e293b"
            strokeWidth={2.5}
            markerEnd="url(#arrow-y)"
          />
          <text
            x={toSvgX(0)}
            y={padding - 20}
            fontSize="11"
            fontWeight="bold"
            fill="#1e293b"
            textAnchor="middle"
          >
            عرض (y)
          </text>

          {/* X Ticks & Labels */}
          {xTicks.map(
            (x) =>
              x !== 0 && (
                <g key={`lbl-x-${x}`}>
                  <line
                    x1={toSvgX(x)}
                    y1={toSvgY(0) - 3}
                    x2={toSvgX(x)}
                    y2={toSvgY(0) + 3}
                    stroke="#334155"
                    strokeWidth={1.5}
                  />
                  <text
                    x={toSvgX(x)}
                    y={toSvgY(0) + 14}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {toPersianDigits(x)}
                  </text>
                </g>
              )
          )}

          {/* Y Ticks & Labels */}
          {yTicks.map(
            (y) =>
              y !== 0 && (
                <g key={`lbl-y-${y}`}>
                  <line
                    x1={toSvgX(0) - 3}
                    y1={toSvgY(y)}
                    x2={toSvgX(0) + 3}
                    y2={toSvgY(y)}
                    stroke="#334155"
                    strokeWidth={1.5}
                  />
                  <text
                    x={toSvgX(0) - 7}
                    y={toSvgY(y) + 3.5}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#64748b"
                    textAnchor="end"
                  >
                    {toPersianDigits(y)}
                  </text>
                </g>
              )
          )}

          {/* Origin Label (0,0) */}
          <text
            x={toSvgX(0) - 7}
            y={toSvgY(0) + 14}
            fontSize="10"
            fontWeight="bold"
            fill="#475569"
            textAnchor="end"
          >
            {toPersianDigits(0)}
          </text>

          {/* Preset Shapes */}
          {selectedShape === "triangle" && (
            <polygon
              points={triangleCoords.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(" ")}
              fill="rgba(79, 70, 229, 0.15)"
              stroke="#4f46e5"
              strokeWidth={2}
            />
          )}

          {selectedShape === "rectangle" && (
            <polygon
              points={rectangleCoords.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(" ")}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10b981"
              strokeWidth={2}
            />
          )}

          {/* Projections for Active Point */}
          {showProjections && selectedShape === "point" && (
            <>
              {/* Projection to X Axis (Vertical Line) */}
              <line
                x1={toSvgX(currX)}
                y1={toSvgY(currY)}
                x2={toSvgX(currX)}
                y2={toSvgY(0)}
                stroke="#4f46e5"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
              {/* Projection to Y Axis (Horizontal Line) */}
              <line
                x1={toSvgX(currX)}
                y1={toSvgY(currY)}
                x2={toSvgX(0)}
                y2={toSvgY(currY)}
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            </>
          )}

          {/* Symmetry Image of Active Point if enabled */}
          {symType !== "none" && selectedShape === "point" && (
            <>
              <line
                x1={toSvgX(currX)}
                y1={toSvgY(currY)}
                x2={toSvgX(refX)}
                y2={toSvgY(refY)}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3,3"
              />
              <circle
                cx={toSvgX(refX)}
                cy={toSvgY(refY)}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
                className="drop-shadow-xs"
              />
              <text
                x={toSvgX(refX) + 8}
                y={toSvgY(refY) - 8}
                fontSize="11"
                fontWeight="black"
                fill="#d97706"
              >
                قرینه [{toPersianDigits(refX)}, {toPersianDigits(refY)}]
              </text>
            </>
          )}

          {/* Render Active Point */}
          {selectedShape === "point" && (
            <g>
              <circle
                cx={toSvgX(currX)}
                cy={toSvgY(currY)}
                r={7}
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth={2.5}
                className="drop-shadow-sm transition-all duration-150"
              />
              {/* Point Coordinate Badge */}
              <rect
                x={toSvgX(currX) - 25}
                y={toSvgY(currY) - 26}
                width={50}
                height={20}
                rx={6}
                fill="#1e1b4b"
                opacity={0.9}
              />
              <text
                x={toSvgX(currX)}
                y={toSvgY(currY) - 12}
                fontSize="11"
                fontWeight="black"
                fill="#ffffff"
                textAnchor="middle"
              >
                [{toPersianDigits(currX)}, {toPersianDigits(currY)}]
              </text>
            </g>
          )}

          {/* Triangle Vertices Badges */}
          {selectedShape === "triangle" &&
            triangleCoords.map(([x, y], idx) => (
              <g key={`tri-vert-${idx}`}>
                <circle cx={toSvgX(x)} cy={toSvgY(y)} r={5} fill="#4f46e5" stroke="#ffffff" strokeWidth={2} />
                <text
                  x={toSvgX(x)}
                  y={toSvgY(y) - 8}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#4338ca"
                  textAnchor="middle"
                >
                  [{toPersianDigits(x)}, {toPersianDigits(y)}]
                </text>
              </g>
            ))}

          {/* Rectangle Vertices Badges */}
          {selectedShape === "rectangle" &&
            rectangleCoords.map(([x, y], idx) => (
              <g key={`rect-vert-${idx}`}>
                <circle cx={toSvgX(x)} cy={toSvgY(y)} r={5} fill="#059669" stroke="#ffffff" strokeWidth={2} />
                <text
                  x={toSvgX(x)}
                  y={toSvgY(y) - 8}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#047857"
                  textAnchor="middle"
                >
                  [{toPersianDigits(x)}, {toPersianDigits(y)}]
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* Coordinate Display Banner */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
        <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-2.5">
          <div className="text-[11px] font-bold text-indigo-700 mb-0.5">طول نقطه (محور افقی X)</div>
          <div className="text-base font-black text-indigo-900" dir="ltr">
            {toPersianDigits(currX)}
          </div>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5">
          <div className="text-[11px] font-bold text-emerald-700 mb-0.5">عرض نقطه (محور عمودی Y)</div>
          <div className="text-base font-black text-emerald-900" dir="ltr">
            {toPersianDigits(currY)}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Shape Selector */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>حالت نمایش:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedShape("point")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedShape === "point" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                تک نقطه پویا
              </button>
              <button
                type="button"
                onClick={() => setSelectedShape("triangle")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedShape === "triangle" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                مثلث
              </button>
              <button
                type="button"
                onClick={() => setSelectedShape("rectangle")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedShape === "rectangle" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                مستطیل
              </button>
            </div>
          </div>

          {/* Point Sliders */}
          {selectedShape === "point" && (
            <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>تغییر طول (X):</span>
                <span className="text-indigo-600" dir="ltr">
                  {toPersianDigits(activePointX)}
                </span>
              </div>
              <input
                type="range"
                min={minX}
                max={maxX}
                value={activePointX}
                onChange={(e) => setActivePointX(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
                <span>تغییر عرض (Y):</span>
                <span className="text-emerald-600" dir="ltr">
                  {toPersianDigits(activePointY)}
                </span>
              </div>
              <input
                type="range"
                min={minY}
                max={maxY}
                value={activePointY}
                onChange={(e) => setActivePointY(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          {/* Symmetry Controls */}
          {showSymmetry && selectedShape === "point" && (
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
              <span>تقارن نسبت به:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSymType("none")}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    symType === "none" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  بدون تقارن
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("all4");
                    setSymType("x_axis");
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    symType === "x_axis" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  محور طول (X)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("all4");
                    setSymType("y_axis");
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    symType === "y_axis" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  محور عرض (Y)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("all4");
                    setSymType("origin");
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    symType === "origin" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  مبدا مختصات
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
