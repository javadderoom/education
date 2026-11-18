"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Box, Layers, Eye, RefreshCw } from "lucide-react";

export interface VolumePrismProps {
  initialLength?: number;
  initialWidth?: number;
  initialHeight?: number;
  unitName?: string;
  showFormula?: boolean;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const VolumePrismVisualizer: React.FC<VolumePrismProps> = ({
  initialLength = 4,
  initialWidth = 3,
  initialHeight = 2,
  unitName = "سانتی‌متر مکعب",
  showFormula = true,
  interactive = true,
  className = "",
  label = "مکعب‌مستطیل و شمارش مکعب‌های واحد ۱ سانتی‌متری",
}) => {
  const [length, setLength] = useState<number>(Math.max(1, Math.min(6, initialLength)));
  const [width, setWidth] = useState<number>(Math.max(1, Math.min(5, initialWidth)));
  const [height, setHeight] = useState<number>(Math.max(1, Math.min(4, initialHeight)));
  const [activeLayer, setActiveLayer] = useState<number | "all">("all");
  const [isTransparent, setIsTransparent] = useState<boolean>(false);

  const totalVolume = length * width * height;
  const layerCount = length * width;

  // Isometric projection constants
  const cubeSize = Math.min(38, Math.max(22, Math.floor(180 / Math.max(length + width, height + 3))));
  const dx = cubeSize * Math.cos(Math.PI / 6); // ~ 0.866 * size
  const dy = cubeSize * Math.sin(Math.PI / 6); // ~ 0.5 * size
  const dz = cubeSize;

  const svgWidth = 440;
  const svgHeight = 320;
  // Center origin at back top corner
  const originX = svgWidth / 2 + (width - length) * (dx / 2);
  const originY = 90 + height * (dz / 3);

  // Generate cubes in painter's order (back-to-front, bottom-to-top)
  const cubes: Array<{ x: number; y: number; z: number; key: string }> = [];
  for (let z = 0; z < height; z++) {
    if (activeLayer !== "all" && z !== activeLayer) continue;
    for (let sum = 0; sum <= length - 1 + (width - 1); sum++) {
      for (let x = 0; x < length; x++) {
        const y = sum - x;
        if (y >= 0 && y < width) {
          cubes.push({ x, y, z, key: `${x}-${y}-${z}` });
        }
      }
    }
  }

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">محاسبه حجم به کمک چینش مکعب‌های واحد</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsTransparent((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              isTransparent
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title="حالت نمای شفاف جهت دیدن مکعب‌های پنهان"
          >
            <Eye className="w-3 h-3" />
            <span>نمای شفاف</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls (Sliders for Length, Width, Height) */}
      {interactive && (
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 mb-3 text-center">
          <div>
            <span className="block text-[11px] text-slate-500 font-bold mb-1">
              طول: <strong className="text-indigo-600 font-black">{toPersianDigits(length)}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={6}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
              aria-label="تغییر طول مکعب‌مستطیل"
            />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 font-bold mb-1">
              عرض: <strong className="text-indigo-600 font-black">{toPersianDigits(width)}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
              aria-label="تغییر عرض مکعب‌مستطیل"
            />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 font-bold mb-1">
              ارتفاع: <strong className="text-indigo-600 font-black">{toPersianDigits(height)}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={4}
              value={height}
              onChange={(e) => {
                const nh = Number(e.target.value);
                setHeight(nh);
                if (activeLayer !== "all" && activeLayer >= nh) {
                  setActiveLayer("all");
                }
              }}
              className="w-full accent-indigo-600 cursor-pointer"
              aria-label="تغییر ارتفاع مکعب‌مستطیل"
            />
          </div>
        </div>
      )}

      {/* Layer Peeling Selector Tabs */}
      <div className="flex items-center justify-center gap-1.5 mb-2 overflow-x-auto py-1">
        <button
          type="button"
          onClick={() => setActiveLayer("all")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeLayer === "all"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          کل شکل ({toPersianDigits(height)} لایه)
        </button>
        {Array.from({ length: height }, (_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveLayer(idx)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeLayer === idx
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            لایه {toPersianDigits(idx + 1)}
          </button>
        ))}
      </div>

      {/* 3D Isometric View Canvas */}
      <div className="relative w-full h-[250px] sm:h-[280px] bg-gradient-to-b from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100/60 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[280px]"
          role="img"
          aria-label={`نمایش حجم مکعب‌مستطیل شامل ${toPersianDigits(totalVolume)} مکعب واحد`}
        >
          {/* Ground Grid Shadows */}
          <ellipse
            cx={originX + ((length - 1) - (width - 1)) * (dx / 2)}
            cy={originY + (length + width) * dy + 15}
            rx={Math.max(40, (length + width) * (dx * 0.55))}
            ry={Math.max(16, (length + width) * (dy * 0.5))}
            fill="#64748b"
            opacity="0.16"
          />

          {/* Render Cubes in Isometric Painter's Order */}
          {cubes.map(({ x, y, z, key }) => {
            const px = originX + (x - y) * dx;
            const py = originY + (x + y) * dy - z * dz;

            const isHighlighted = activeLayer === z;
            const topColor = isHighlighted ? "#fde68a" : isTransparent ? "rgba(224, 231, 255, 0.45)" : "#e0e7ff";
            const leftColor = isHighlighted ? "#f59e0b" : isTransparent ? "rgba(99, 102, 241, 0.45)" : "#6366f1";
            const rightColor = isHighlighted ? "#d97706" : isTransparent ? "rgba(67, 56, 202, 0.45)" : "#4338ca";
            const strokeColor = isHighlighted ? "#b45309" : "#312e81";

            // 3 visible isometric faces: Top, Front-Left, Front-Right
            const topPoints = `${px},${py - dz} ${px + dx},${py - dz + dy} ${px},${py - dz + 2 * dy} ${px - dx},${py - dz + dy}`;
            const leftPoints = `${px - dx},${py - dz + dy} ${px},${py - dz + 2 * dy} ${px},${py + 2 * dy} ${px - dx},${py + dy}`;
            const rightPoints = `${px},${py - dz + 2 * dy} ${px + dx},${py - dz + dy} ${px + dx},${py + dy} ${px},${py + 2 * dy}`;

            return (
              <g key={key} className="transition-all duration-200">
                {/* Left Face */}
                <polygon
                  points={leftPoints}
                  fill={leftColor}
                  stroke={strokeColor}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Right Face */}
                <polygon
                  points={rightPoints}
                  fill={rightColor}
                  stroke={strokeColor}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Top Face */}
                <polygon
                  points={topPoints}
                  fill={topColor}
                  stroke={strokeColor}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Dimension Callouts Floating */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none px-2 text-[10px] sm:text-xs font-bold text-slate-600">
          <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200">
            تعداد در یک طبقه: {toPersianDigits(length)} × {toPersianDigits(width)} = {toPersianDigits(layerCount)} مکعب
          </span>
          <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200">
            تعداد طبقات: {toPersianDigits(height)}
          </span>
        </div>
      </div>

      {/* Formula & Educational Conclusion Banner */}
      {showFormula && (
        <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              فرمول محاسبه حجم مکعب‌مستطیل:
            </span>
            <span className="text-xs text-indigo-700 font-bold">
              حجم = طول × عرض × ارتفاع
            </span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs font-black text-xs sm:text-sm text-indigo-900" dir="ltr">
            <span>{toPersianDigits(length)}</span>
            <span className="text-slate-400 mx-1">×</span>
            <span>{toPersianDigits(width)}</span>
            <span className="text-slate-400 mx-1">×</span>
            <span>{toPersianDigits(height)}</span>
            <span className="text-slate-400 mx-1">=</span>
            <span className="text-emerald-600 text-sm sm:text-base">{toPersianDigits(totalVolume)}</span>
            <span className="text-[11px] font-bold text-slate-600 mr-1.5" dir="rtl">{unitName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
