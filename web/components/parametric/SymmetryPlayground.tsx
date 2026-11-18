"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { FlipHorizontal, RotateCw, Sparkles, HelpCircle } from "lucide-react";

export interface SymmetryPlaygroundProps {
  initialMode?: "axial" | "central";
  initialShape?: "parallelogram" | "triangle" | "l_shape" | "butterfly";
  initialAxis?: "vertical" | "horizontal";
  interactive?: boolean;
  className?: string;
  label?: string;
}

interface Point {
  x: number;
  y: number;
}

const PRESET_SHAPES: Record<string, { title: string; points: Point[]; hasAxial: boolean; hasCentral: boolean; note: string }> = {
  parallelogram: {
    title: "متوازی‌الاضلاع",
    points: [
      { x: -50, y: -30 },
      { x: 30, y: -30 },
      { x: 50, y: 30 },
      { x: -30, y: 30 },
    ],
    hasAxial: false,
    hasCentral: true,
    note: "متوازی‌الاضلاع خط تقارن ندارد، ولی مرکز تقارن دارد (با چرخش ۱۸۰ درجه روی خودش منطبق می‌شود).",
  },
  triangle: {
    title: "مثلث متساوی‌الساقین",
    points: [
      { x: 0, y: -50 },
      { x: 45, y: 35 },
      { x: -45, y: 35 },
    ],
    hasAxial: true,
    hasCentral: false,
    note: "مثلث متساوی‌الساقین دارای یک خط تقارن است ولی مرکز تقارن ندارد.",
  },
  l_shape: {
    title: "شکل ال (L)",
    points: [
      { x: -40, y: -50 },
      { x: -10, y: -50 },
      { x: -10, y: 15 },
      { x: 35, y: 15 },
      { x: 35, y: 45 },
      { x: -40, y: 45 },
    ],
    hasAxial: false,
    hasCentral: false,
    note: "این شکل نامتقارن است و چرخش ۱۸۰ درجه شکل وارونه متفاوتی پدید می‌آورد.",
  },
  butterfly: {
    title: "شکل پروانه",
    points: [
      { x: 0, y: -30 },
      { x: 45, y: -50 },
      { x: 30, y: 0 },
      { x: 50, y: 45 },
      { x: 0, y: 25 },
      { x: -50, y: 45 },
      { x: -30, y: 0 },
      { x: -45, y: -50 },
    ],
    hasAxial: true,
    hasCentral: false,
    note: "شکل پروانه دارای تقارن آینه‌ای عمودی بی‌نظیری است.",
  },
};

export const SymmetryPlayground: React.FC<SymmetryPlaygroundProps> = ({
  initialMode = "central",
  initialShape = "parallelogram",
  initialAxis = "vertical",
  interactive = true,
  className = "",
  label = "آزمایشگاه تقارن محوری و تقارن مرکزی",
}) => {
  const [mode, setMode] = useState<"axial" | "central">(initialMode);
  const [shapeKey, setShapeKey] = useState<string>(initialShape);
  const [axis, setAxis] = useState<"vertical" | "horizontal">(initialAxis);
  const [rotationAngle, setRotationAngle] = useState<number>(180);
  const [showRays, setShowRays] = useState<boolean>(true);

  const currentShape = PRESET_SHAPES[shapeKey] || PRESET_SHAPES.parallelogram;

  // Viewbox coordinates: center is (180, 150)
  const cx = 180;
  const cy = 150;

  // Transform points based on mode
  const basePoints = currentShape.points;

  // Axial reflection
  const getAxialPoint = (p: Point): Point => {
    if (axis === "vertical") {
      return { x: -p.x, y: p.y };
    } else {
      return { x: p.x, y: -p.y };
    }
  };

  // Central rotation around O(0,0) by rotationAngle
  const rad = (rotationAngle * Math.PI) / 180;
  const getCentralPoint = (p: Point): Point => {
    return {
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    };
  };

  const transformedPoints = basePoints.map((p) =>
    mode === "axial" ? getAxialPoint(p) : getCentralPoint(p)
  );

  const baseSvgPoly = basePoints.map((p) => `${cx + p.x},${cy + p.y}`).join(" ");
  const transSvgPoly = transformedPoints.map((p) => `${cx + p.x},${cy + p.y}`).join(" ");

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            {mode === "central" ? <RotateCw className="w-4 h-4" /> : <FlipHorizontal className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">کشف تفاوت خط تقارن و مرکز تقارن</p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {interactive && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("central")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "central" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              تقارن مرکزی (۱۸۰°)
            </button>
            <button
              type="button"
              onClick={() => setMode("axial")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "axial" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              تقارن محوری (خطی)
            </button>
          </div>
        )}
      </div>

      {/* Shape Selector & Controls */}
      {interactive && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 mb-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-slate-500 font-bold shrink-0">شکل:</span>
            {Object.entries(PRESET_SHAPES).map(([k, s]) => (
              <button
                key={k}
                type="button"
                onClick={() => setShapeKey(k)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] shrink-0 transition-all cursor-pointer ${
                  shapeKey === k
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {mode === "axial" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">محور:</span>
              <button
                type="button"
                onClick={() => setAxis(axis === "vertical" ? "horizontal" : "vertical")}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 font-bold text-[11px] hover:bg-indigo-50 cursor-pointer"
              >
                {axis === "vertical" ? "خط تقارن عمودی" : "خط تقارن افقی"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-slate-500 font-bold text-[11px] shrink-0">زاویه دوران:</span>
              <input
                type="range"
                min={0}
                max={180}
                step={5}
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-28 accent-indigo-600 cursor-pointer"
                aria-label="تغییر زاویه دوران حول مرکز تقارن"
              />
              <span className="font-bold text-indigo-700 w-10 text-left" dir="ltr">
                {toPersianDigits(rotationAngle)}°
              </span>
            </div>
          )}
        </div>
      )}

      {/* Interactive SVG Stage Canvas */}
      <div className="relative w-full h-[250px] bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 360 300"
          className="w-full h-full max-h-[250px]"
          role="img"
          aria-label={`میز کار تقارن برای شکل ${currentShape.title}`}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="symGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="360" height="300" fill="url(#symGrid)" />

          {/* Central Point O or Axis Line */}
          {mode === "central" ? (
            <g id="centerPointGroup">
              {/* Radiating Ray Lines from points through O to transformed points */}
              {showRays &&
                basePoints.map((p, idx) => {
                  const tp = transformedPoints[idx];
                  return (
                    <line
                      key={idx}
                      x1={cx + p.x}
                      y1={cy + p.y}
                      x2={cx + tp.x}
                      y2={cy + tp.y}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  );
                })}

              {/* Point O Marker */}
              <circle cx={cx} cy={cy} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x={cx + 10} y={cy - 6} fill="#b91c1c" fontSize="12" fontWeight="bold">
                مرکز تقارن (O)
              </text>
            </g>
          ) : (
            <g id="axisLineGroup">
              {axis === "vertical" ? (
                <>
                  <line x1={cx} y1="10" x2={cx} y2="290" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" />
                  <text x={cx + 8} y="25" fill="#b91c1c" fontSize="11" fontWeight="bold">
                    خط تقارن
                  </text>
                </>
              ) : (
                <>
                  <line x1="10" y1={cy} x2="350" y2={cy} stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" />
                  <text x="25" y={cy - 8} fill="#b91c1c" fontSize="11" fontWeight="bold">
                    خط تقارن
                  </text>
                </>
              )}

              {/* Dotted Perpendicular Distances */}
              {showRays &&
                basePoints.map((p, idx) => {
                  const tp = transformedPoints[idx];
                  return (
                    <line
                      key={idx}
                      x1={cx + p.x}
                      y1={cy + p.y}
                      x2={cx + tp.x}
                      y2={cy + tp.y}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  );
                })}
            </g>
          )}

          {/* Original Base Shape (Blue) */}
          <polygon
            points={baseSvgPoly}
            fill="rgba(99, 102, 241, 0.22)"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Base Shape Vertices */}
          {basePoints.map((p, idx) => (
            <circle key={idx} cx={cx + p.x} cy={cy + p.y} r="3.5" fill="#4f46e5" />
          ))}

          {/* Transformed / Symmetrical Shape (Emerald / Amber) */}
          <polygon
            points={transSvgPoly}
            fill={
              rotationAngle === 180 || mode === "axial"
                ? "rgba(16, 185, 129, 0.25)"
                : "rgba(245, 158, 11, 0.25)"
            }
            stroke={rotationAngle === 180 || mode === "axial" ? "#059669" : "#d97706"}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeDasharray={rotationAngle < 180 && mode === "central" ? "4 3" : undefined}
          />

          {/* Transformed Vertices */}
          {transformedPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={cx + p.x}
              cy={cy + p.y}
              r="3.5"
              fill={rotationAngle === 180 || mode === "axial" ? "#059669" : "#d97706"}
            />
          ))}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            شکل اولیه
          </span>
          <span className="flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded border border-emerald-200 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            قرینه {mode === "central" ? "مرکزی (۱۸۰°)" : "محوری (آینه‌ای)"}
          </span>
        </div>
      </div>

      {/* Pedagogical Rule & Misconception Callout */}
      <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-900 block font-bold mb-0.5">نکته مفهومی کتاب ریاضی پنجم:</strong>
          <span className="leading-relaxed">{currentShape.note}</span>
        </div>
      </div>
    </div>
  );
};
