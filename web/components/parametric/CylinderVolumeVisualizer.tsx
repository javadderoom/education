"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Cylinder, Sparkles, Layers, Box, Eye, RefreshCw } from "lucide-react";

export interface CylinderVolumeVisualizerProps {
  initialRadius?: number;
  initialHeight?: number;
  piValue?: number; // 3 or 3.14
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const CylinderVolumeVisualizer: React.FC<CylinderVolumeVisualizerProps> = ({
  initialRadius = 3,
  initialHeight = 5,
  piValue = 3.14,
  interactive = true,
  className = "",
  label = "حجم و مساحت جانبی استوانه و گسترده آن",
}) => {
  const [radius, setRadius] = useState<number>(initialRadius);
  const [height, setHeight] = useState<number>(initialHeight);
  const [viewMode, setViewMode] = useState<"3d" | "net">("3d");
  const [activeTab, setActiveTab] = useState<"volume" | "lateral" | "total">("volume");

  // Calculations
  const pi = piValue;
  const baseArea = pi * radius * radius;
  const circumference = 2 * pi * radius;
  const lateralArea = circumference * height;
  const totalArea = lateralArea + 2 * baseArea;
  const volume = baseArea * height;

  // SVG Geometry
  const svgWidth = 440;
  const svgHeight = 280;
  const cx = svgWidth / 2;

  // 3D Cylinder parameters
  const rx = Math.min(80, Math.max(35, radius * 18));
  const ry = rx * 0.35;
  const hPx = Math.min(130, Math.max(50, height * 18));
  const topCenterY = 85;
  const bottomCenterY = topCenterY + hPx;

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Cylinder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              شعاع قاعده (r)، ارتفاع (h) و باز کردن سطح جانبی
            </p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "3d" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              نمای استوانه
            </button>
            <button
              type="button"
              onClick={() => setViewMode("net")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "net" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              گسترده (باز شده)
            </button>
          </div>
        )}
      </div>

      {/* SVG Rendering */}
      <div className="relative flex justify-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible"
          role="img"
          aria-label="نمایش تصویری استوانه"
        >
          {/* VIEW MODE 1: 3D CYLINDER */}
          {viewMode === "3d" && (
            <g>
              {/* Bottom Base Fill & Shadow */}
              <ellipse
                cx={cx}
                cy={bottomCenterY}
                rx={rx}
                ry={ry}
                fill="#4338ca"
                fillOpacity={0.12}
              />

              {/* Lateral Body Fill */}
              <path
                d={`M ${cx - rx} ${topCenterY} L ${cx - rx} ${bottomCenterY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomCenterY} L ${cx + rx} ${topCenterY} Z`}
                fill="url(#cylinderGradient)"
                stroke="#6366f1"
                strokeWidth={2}
              />

              {/* Bottom Hidden Dashed Arc */}
              <path
                d={`M ${cx - rx} ${bottomCenterY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bottomCenterY}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />

              {/* Bottom Visible Front Arc */}
              <path
                d={`M ${cx - rx} ${bottomCenterY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomCenterY}`}
                fill="none"
                stroke="#4338ca"
                strokeWidth={2}
              />

              {/* Top Base (Full Ellipse) */}
              <ellipse
                cx={cx}
                cy={topCenterY}
                rx={rx}
                ry={ry}
                fill="#e0e7ff"
                stroke="#4338ca"
                strokeWidth={2}
              />

              {/* Top Base Center & Radius Line */}
              <circle cx={cx} cy={topCenterY} r={3.5} fill="#4338ca" />
              <line
                x1={cx}
                y1={topCenterY}
                x2={cx + rx}
                y2={topCenterY}
                stroke="#ef4444"
                strokeWidth={2}
              />
              <text
                x={cx + rx / 2}
                y={topCenterY - 6}
                fontSize="11"
                fontWeight="black"
                fill="#dc2626"
                textAnchor="middle"
              >
                r = {toPersianDigits(radius)}
              </text>

              {/* Height Dimension Line */}
              <line
                x1={cx + rx + 25}
                y1={topCenterY}
                x2={cx + rx + 25}
                y2={bottomCenterY}
                stroke="#059669"
                strokeWidth={2}
              />
              <line
                x1={cx + rx + 18}
                y1={topCenterY}
                x2={cx + rx + 32}
                y2={topCenterY}
                stroke="#059669"
                strokeWidth={1.5}
              />
              <line
                x1={cx + rx + 18}
                y1={bottomCenterY}
                x2={cx + rx + 32}
                y2={bottomCenterY}
                stroke="#059669"
                strokeWidth={1.5}
              />
              <text
                x={cx + rx + 40}
                y={(topCenterY + bottomCenterY) / 2 + 4}
                fontSize="11"
                fontWeight="black"
                fill="#047857"
                textAnchor="start"
              >
                h = {toPersianDigits(height)}
              </text>
            </g>
          )}

          {/* VIEW MODE 2: UNROLLED NET */}
          {viewMode === "net" && (
            <g transform="translate(0, 10)">
              {/* Unrolled Rectangle (Lateral Surface) */}
              {(() => {
                const rectW = 200;
                const rectH = 110;
                const rxNet = 28;
                const rectX = cx - rectW / 2;
                const rectY = 85;

                return (
                  <>
                    {/* Top Circle Base */}
                    <circle
                      cx={cx}
                      cy={rectY - rxNet}
                      r={rxNet}
                      fill="#e0e7ff"
                      stroke="#4338ca"
                      strokeWidth={2}
                    />
                    <line
                      x1={cx}
                      y1={rectY - rxNet}
                      x2={cx + rxNet}
                      y2={rectY - rxNet}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                    <text
                      x={cx}
                      y={rectY - rxNet - 6}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#4338ca"
                      textAnchor="middle"
                    >
                      قاعده بالا
                    </text>

                    {/* Unrolled Lateral Rectangle */}
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      fill="#e0e7ff"
                      fillOpacity={0.6}
                      stroke="#4f46e5"
                      strokeWidth={2}
                      rx={4}
                    />
                    <text
                      x={cx}
                      y={rectY + rectH / 2}
                      fontSize="12"
                      fontWeight="black"
                      fill="#312e81"
                      textAnchor="middle"
                    >
                      سطح جانبی (مستطیل)
                    </text>

                    {/* Bottom Circle Base */}
                    <circle
                      cx={cx}
                      cy={rectY + rectH + rxNet}
                      r={rxNet}
                      fill="#e0e7ff"
                      stroke="#4338ca"
                      strokeWidth={2}
                    />
                    <text
                      x={cx}
                      y={rectY + rectH + rxNet + 16}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#4338ca"
                      textAnchor="middle"
                    >
                      قاعده پایین
                    </text>

                    {/* Dimension: Rectangle Width = Circumference */}
                    <text
                      x={cx}
                      y={rectY - 6}
                      fontSize="11"
                      fontWeight="black"
                      fill="#b91c1c"
                      textAnchor="middle"
                    >
                      طول مستطیل = محیط دایره ({toPersianDigits(2)} × π × r)
                    </text>

                    {/* Dimension: Rectangle Height = Cylinder Height */}
                    <text
                      x={rectX - 12}
                      y={rectY + rectH / 2}
                      fontSize="11"
                      fontWeight="black"
                      fill="#047857"
                      textAnchor="end"
                    >
                      عرض = ارتفاع ({toPersianDigits(height)})
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          <defs>
            <linearGradient id="cylinderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Pedagogical Feature Tabs */}
      <div className="flex items-center justify-center gap-1.5 mt-3 p-1 bg-slate-100 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("volume")}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === "volume" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
          }`}
        >
          حجم استوانه
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lateral")}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === "lateral" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
          }`}
        >
          مساحت جانبی
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("total")}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === "total" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
          }`}
        >
          مساحت کل
        </button>
      </div>

      {/* Calculation Banner */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
        {activeTab === "volume" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>فرمول حجم: مساحت قاعده × ارتفاع</span>
              <span className="text-indigo-700 font-black" dir="ltr">
                V = π × r² × h
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 pt-1 border-t border-slate-200/60" dir="ltr">
              <span>{toPersianDigits(pi)}</span>
              <span>×</span>
              <span className="text-red-700">({toPersianDigits(radius)} × {toPersianDigits(radius)})</span>
              <span>×</span>
              <span className="text-emerald-700">{toPersianDigits(height)}</span>
              <span>=</span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-sm">
                {toPersianDigits(Math.round(volume * 100) / 100)} واحد مکعب
              </span>
            </div>
          </div>
        )}

        {activeTab === "lateral" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>فرمول مساحت جانبی: محیط قاعده × ارتفاع</span>
              <span className="text-indigo-700 font-black" dir="ltr">
                S = ۲ × π × r × h
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 pt-1 border-t border-slate-200/60" dir="ltr">
              <span>{toPersianDigits(2)}</span>
              <span>×</span>
              <span>{toPersianDigits(pi)}</span>
              <span>×</span>
              <span className="text-red-700">{toPersianDigits(radius)}</span>
              <span>×</span>
              <span className="text-emerald-700">{toPersianDigits(height)}</span>
              <span>=</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-sm">
                {toPersianDigits(Math.round(lateralArea * 100) / 100)} واحد مربع
              </span>
            </div>
          </div>
        )}

        {activeTab === "total" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>فرمول مساحت کل: مساحت جانبی + مساحت دو قاعده</span>
              <span className="text-indigo-700 font-black" dir="ltr">
                A = S + ۲ × (π × r²)
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 pt-1 border-t border-slate-200/60" dir="ltr">
              <span className="text-emerald-700">{toPersianDigits(Math.round(lateralArea * 10) / 10)}</span>
              <span>+</span>
              <span className="text-red-700">{toPersianDigits(Math.round(2 * baseArea * 10) / 10)}</span>
              <span>=</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-600 text-white font-black text-sm">
                {toPersianDigits(Math.round(totalArea * 100) / 100)} واحد مربع
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sliders */}
      {interactive && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>شعاع قاعده (r):</span>
              <span className="text-red-600" dir="ltr">
                {toPersianDigits(radius)} واحد
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
              <span>ارتفاع استوانه (h):</span>
              <span className="text-emerald-600" dir="ltr">
                {toPersianDigits(height)} واحد
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
