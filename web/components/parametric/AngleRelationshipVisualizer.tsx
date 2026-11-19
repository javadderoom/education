"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Compass, Sparkles, MoveRight, Eye } from "lucide-react";

export interface AngleRelationshipVisualizerProps {
  initialMode?: "vertical" | "complementary" | "supplementary";
  initialAngle?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const AngleRelationshipVisualizer: React.FC<AngleRelationshipVisualizerProps> = ({
  initialMode = "vertical",
  initialAngle = 55,
  interactive = true,
  className = "",
  label = "روابط زاویه‌ها: متقابل به رأس، متمم و مکمل",
}) => {
  const [mode, setMode] = useState<"vertical" | "complementary" | "supplementary">(initialMode);
  const [angle, setAngle] = useState<number>(initialAngle);

  // Derived angles
  // For complementary: angle and 90 - angle
  const compOther = 90 - angle;
  // For supplementary: angle and 180 - angle
  const suppOther = 180 - angle;
  // For vertical: angle, 180 - angle, angle, 180 - angle
  const vertOpposite = angle;
  const vertAdjacent = 180 - angle;

  // SVG Geometry
  const svgWidth = 440;
  const svgHeight = 280;
  const cx = svgWidth / 2;
  const cy = 140;
  const rayLen = 130;

  // Helper to convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY - radius * Math.sin(angleInRadians),
    };
  };

  // SVG arc path generator
  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(" ");
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              ویژگی‌های هندسی خطوط متقاطع و مجموع زاویه‌ها
            </p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("vertical");
                if (angle >= 170 || angle <= 10) setAngle(55);
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "vertical" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              متقابل به رأس
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("complementary");
                if (angle >= 85 || angle <= 5) setAngle(40);
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "complementary" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              متمم (۹۰°)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("supplementary");
                if (angle >= 175 || angle <= 5) setAngle(65);
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "supplementary" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              مکمل (۱۸۰°)
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
          aria-label="نمودار زاویه‌ها"
        >
          {/* 1. VERTICAL ANGLES MODE */}
          {mode === "vertical" && (
            <g>
              {/* Line 1 (Horizontal) */}
              <line
                x1={cx - rayLen}
                y1={cy}
                x2={cx + rayLen}
                y2={cy}
                stroke="#334155"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* Line 2 (Tilted at `angle`) */}
              {(() => {
                const p1 = polarToCartesian(cx, cy, rayLen, angle);
                const p2 = polarToCartesian(cx, cy, rayLen, angle + 180);
                return (
                  <line
                    x1={p2.x}
                    y1={p2.y}
                    x2={p1.x}
                    y2={p1.y}
                    stroke="#334155"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Vertex Center Dot */}
              <circle cx={cx} cy={cy} r={5} fill="#1e293b" />
              <text x={cx} y={cy + 18} fontSize="11" fontWeight="bold" fill="#64748b" textAnchor="middle">
                رأس (O)
              </text>

              {/* Angle 1: Arc from 0 to angle (Indigo) */}
              <path
                d={describeArc(cx, cy, 45, 0, angle)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 65, angle / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#4338ca"
                    textAnchor="middle"
                  >
                    {toPersianDigits(angle)}°
                  </text>
                );
              })()}

              {/* Angle 3: Opposite Arc from 180 to 180 + angle (Indigo) */}
              <path
                d={describeArc(cx, cy, 45, 180, 180 + angle)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 65, 180 + angle / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#4338ca"
                    textAnchor="middle"
                  >
                    {toPersianDigits(vertOpposite)}°
                  </text>
                );
              })()}

              {/* Angle 2: Adjacent Arc from angle to 180 (Emerald) */}
              <path
                d={describeArc(cx, cy, 35, angle, 180)}
                fill="none"
                stroke="#059669"
                strokeWidth={2.5}
                strokeDasharray="3,3"
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 55, (angle + 180) / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#047857"
                    textAnchor="middle"
                  >
                    {toPersianDigits(vertAdjacent)}°
                  </text>
                );
              })()}

              {/* Angle 4: Adjacent Arc from 180 + angle to 360 (Emerald) */}
              <path
                d={describeArc(cx, cy, 35, 180 + angle, 360)}
                fill="none"
                stroke="#059669"
                strokeWidth={2.5}
                strokeDasharray="3,3"
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 55, (180 + angle + 360) / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#047857"
                    textAnchor="middle"
                  >
                    {toPersianDigits(vertAdjacent)}°
                  </text>
                );
              })()}
            </g>
          )}

          {/* 2. COMPLEMENTARY ANGLES MODE (90°) */}
          {mode === "complementary" && (
            <g transform="translate(0, 30)">
              {/* Baseline Horizontal Ray */}
              <line
                x1={cx - 30}
                y1={cy}
                x2={cx + rayLen}
                y2={cy}
                stroke="#334155"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* Vertical 90° Ray */}
              <line
                x1={cx - 30}
                y1={cy}
                x2={cx - 30}
                y2={cy - rayLen}
                stroke="#334155"
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* 90° Corner Square */}
              <path
                d={`M ${cx - 30 + 16} ${cy} L ${cx - 30 + 16} ${cy - 16} L ${cx - 30} ${cy - 16}`}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.5}
              />

              {/* Splitting Ray at `angle` */}
              {(() => {
                const p = polarToCartesian(cx - 30, cy, rayLen, angle);
                return (
                  <line
                    x1={cx - 30}
                    y1={cy}
                    x2={p.x}
                    y2={p.y}
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Arc 1: 0 to angle (Indigo) */}
              <path
                d={describeArc(cx - 30, cy, 50, 0, angle)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx - 30, cy, 70, angle / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#4338ca"
                    textAnchor="middle"
                  >
                    {toPersianDigits(angle)}°
                  </text>
                );
              })()}

              {/* Arc 2: angle to 90 (Amber) */}
              <path
                d={describeArc(cx - 30, cy, 45, angle, 90)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx - 30, cy, 65, (angle + 90) / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#d97706"
                    textAnchor="middle"
                  >
                    {toPersianDigits(compOther)}°
                  </text>
                );
              })()}

              {/* Vertex Dot */}
              <circle cx={cx - 30} cy={cy} r={5} fill="#1e293b" />
            </g>
          )}

          {/* 3. SUPPLEMENTARY ANGLES MODE (180°) */}
          {mode === "supplementary" && (
            <g transform="translate(0, 30)">
              {/* Straight Baseline (180°) */}
              <line
                x1={cx - rayLen}
                y1={cy}
                x2={cx + rayLen}
                y2={cy}
                stroke="#334155"
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Splitting Ray at `angle` */}
              {(() => {
                const p = polarToCartesian(cx, cy, rayLen, angle);
                return (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={p.x}
                    y2={p.y}
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Arc 1: 0 to angle (Indigo) */}
              <path
                d={describeArc(cx, cy, 50, 0, angle)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 70, angle / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#4338ca"
                    textAnchor="middle"
                  >
                    {toPersianDigits(angle)}°
                  </text>
                );
              })()}

              {/* Arc 2: angle to 180 (Emerald) */}
              <path
                d={describeArc(cx, cy, 45, angle, 180)}
                fill="none"
                stroke="#059669"
                strokeWidth={3}
              />
              {(() => {
                const lbl = polarToCartesian(cx, cy, 68, (angle + 180) / 2);
                return (
                  <text
                    x={lbl.x}
                    y={lbl.y + 4}
                    fontSize="12"
                    fontWeight="black"
                    fill="#047857"
                    textAnchor="middle"
                  >
                    {toPersianDigits(suppOther)}°
                  </text>
                );
              })()}

              {/* Vertex Dot */}
              <circle cx={cx} cy={cy} r={5} fill="#1e293b" />
            </g>
          )}
        </svg>
      </div>

      {/* Proof / Pedagogical Banner */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
        {mode === "vertical" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">قاعده زاویه‌های متقابل به رأس:</span>
              <span className="text-indigo-700 font-black">
                زاویه‌های روبه‌رو همواره با هم برابرند
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-slate-200/60">
              <span>
                زاویه ۱ = زاویه ۳ ={" "}
                <span className="text-indigo-700 font-black" dir="ltr">
                  {toPersianDigits(angle)}°
                </span>
              </span>
              <span>
                زاویه ۲ = زاویه ۴ ={" "}
                <span className="text-emerald-700 font-black" dir="ltr">
                  {toPersianDigits(vertAdjacent)}°
                </span>
              </span>
            </div>
          </div>
        )}

        {mode === "complementary" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">قاعده زاویه‌های متمم:</span>
              <span className="text-indigo-700 font-black">مجموع دو زاویه برابر ۹۰ درجه است</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 pt-1 border-t border-slate-200/60" dir="ltr">
              <span className="text-indigo-700">{toPersianDigits(angle)}°</span>
              <span>+</span>
              <span className="text-amber-700">{toPersianDigits(compOther)}°</span>
              <span>=</span>
              <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {toPersianDigits(90)}°
              </span>
            </div>
          </div>
        )}

        {mode === "supplementary" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">قاعده زاویه‌های مکمل:</span>
              <span className="text-indigo-700 font-black">مجموع دو زاویه برابر ۱۸۰ درجه است</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 pt-1 border-t border-slate-200/60" dir="ltr">
              <span className="text-indigo-700">{toPersianDigits(angle)}°</span>
              <span>+</span>
              <span className="text-emerald-700">{toPersianDigits(suppOther)}°</span>
              <span>=</span>
              <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {toPersianDigits(180)}°
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Angle Slider */}
      {interactive && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>تغییر اندازه زاویه:</span>
            <span className="text-indigo-700 font-black" dir="ltr">
              {toPersianDigits(angle)}°
            </span>
          </div>
          <input
            type="range"
            min={mode === "complementary" ? 10 : 20}
            max={mode === "complementary" ? 80 : 160}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
