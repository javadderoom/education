"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Scissors, RefreshCw, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export interface ApproximationRulerProps {
  initialNumber?: number;
  initialPrecision?: 10 | 100 | 1000;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const ApproximationRuler: React.FC<ApproximationRulerProps> = ({
  initialNumber = 276,
  initialPrecision = 10,
  interactive = true,
  className = "",
  label = "خط‌کش تعاملی تقریب: مقایسه روش قطع کردن و گرد کردن",
}) => {
  const [num, setNum] = useState<number>(initialNumber);
  const [precision, setPrecision] = useState<10 | 100 | 1000>(initialPrecision);
  const [activeTab, setActiveTab] = useState<"compare" | "truncate" | "round">("compare");

  // Mathematical Calculations
  // Truncation (قطع کردن): zero out everything below precision
  const truncated = Math.floor(num / precision) * precision;
  const truncateError = Math.abs(num - truncated);

  // Rounding (گرد کردن): check next digit
  const rounded = Math.round(num / precision) * precision;
  const roundError = Math.abs(num - rounded);

  // Interval bounds for ruler
  const lowerBound = Math.floor(num / precision) * precision;
  const upperBound = lowerBound + precision;
  const midpoint = lowerBound + precision / 2;

  // Next digit that determines rounding
  const nextDigit = Math.floor((num % precision) / (precision / 10));

  // SVG Geometry
  const svgWidth = 440;
  const svgHeight = 160;
  const paddingX = 45;
  const lineY = 85;
  const rulerWidth = svgWidth - 2 * paddingX;

  const toSvgX = (val: number) => {
    const clamped = Math.max(lowerBound, Math.min(upperBound, val));
    return paddingX + ((clamped - lowerBound) / precision) * rulerWidth;
  };

  const precisionLabel =
    precision === 10 ? "کمتر از ۱۰ (دهگان)" : precision === 100 ? "کمتر از ۱۰۰ (صدگان)" : "کمتر از ۱۰۰۰ (هزارگان)";

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              بررسی مرتبه تقریب، مرز میانی (رقم ۵) و تفاوت روش‌ها
            </p>
          </div>
        </div>

        {/* Precision Selector */}
        {interactive && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrecision(10)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                precision === 10 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              کمتر از ۱۰
            </button>
            <button
              type="button"
              onClick={() => setPrecision(100)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                precision === 100 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              کمتر از ۱۰۰
            </button>
            <button
              type="button"
              onClick={() => setPrecision(1000)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                precision === 1000 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              کمتر از ۱۰۰۰
            </button>
          </div>
        )}
      </div>

      {/* Main Comparison Banner */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 text-center">
        {/* Truncation Card */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5">
          <div className="text-[11px] font-bold text-amber-800 mb-0.5">روش قطع کردن (حذف ارقام)</div>
          <div className="text-lg font-black text-amber-900" dir="ltr">
            {toPersianDigits(truncated)}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-1">
            خطای تقریب: {toPersianDigits(truncateError)} واحد
          </div>
        </div>

        {/* Rounding Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5">
          <div className="text-[11px] font-bold text-emerald-800 mb-0.5">روش گرد کردن (نزدیک‌ترین)</div>
          <div className="text-lg font-black text-emerald-900" dir="ltr">
            {toPersianDigits(rounded)}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">
            خطای تقریب: {toPersianDigits(roundError)} واحد
          </div>
        </div>
      </div>

      {/* SVG Dynamic Ruler */}
      <div className="relative flex justify-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible"
          role="img"
          aria-label="خط‌کش تقریب"
        >
          {/* Shaded zone: closer to lower bound vs closer to upper bound */}
          <rect
            x={paddingX}
            y={lineY - 30}
            width={rulerWidth / 2}
            height={40}
            fill="#f59e0b"
            fillOpacity={0.08}
            rx={6}
          />
          <rect
            x={paddingX + rulerWidth / 2}
            y={lineY - 30}
            width={rulerWidth / 2}
            height={40}
            fill="#10b981"
            fillOpacity={0.08}
            rx={6}
          />

          {/* Main Axis Line */}
          <line
            x1={paddingX - 10}
            y1={lineY}
            x2={svgWidth - paddingX + 10}
            y2={lineY}
            stroke="#334155"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Lower Bound Tick */}
          <line x1={paddingX} y1={lineY - 12} x2={paddingX} y2={lineY + 12} stroke="#1e293b" strokeWidth={2.5} />
          <text
            x={paddingX}
            y={lineY + 28}
            fontSize="11"
            fontWeight="black"
            fill="#1e293b"
            textAnchor="middle"
            direction="ltr"
          >
            {toPersianDigits(lowerBound)}
          </text>

          {/* Upper Bound Tick */}
          <line
            x1={svgWidth - paddingX}
            y1={lineY - 12}
            x2={svgWidth - paddingX}
            y2={lineY + 12}
            stroke="#1e293b"
            strokeWidth={2.5}
          />
          <text
            x={svgWidth - paddingX}
            y={lineY + 28}
            fontSize="11"
            fontWeight="black"
            fill="#1e293b"
            textAnchor="middle"
            direction="ltr"
          >
            {toPersianDigits(upperBound)}
          </text>

          {/* Midpoint Tick (Threshold: 5) */}
          <line
            x1={toSvgX(midpoint)}
            y1={lineY - 8}
            x2={toSvgX(midpoint)}
            y2={lineY + 8}
            stroke="#64748b"
            strokeWidth={1.5}
            strokeDasharray="2,2"
          />
          <text
            x={toSvgX(midpoint)}
            y={lineY - 16}
            fontSize="10"
            fontWeight="bold"
            fill="#64748b"
            textAnchor="middle"
            direction="ltr"
          >
            مرز ۵ ({toPersianDigits(midpoint)})
          </text>

          {/* Current Number Marker */}
          <g>
            {/* Projection line */}
            <line
              x1={toSvgX(num)}
              y1={lineY - 35}
              x2={toSvgX(num)}
              y2={lineY}
              stroke="#4f46e5"
              strokeWidth={2}
              strokeDasharray="2,2"
            />
            {/* Circle dot */}
            <circle
              cx={toSvgX(num)}
              cy={lineY}
              r={7}
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth={2.5}
              className="drop-shadow-sm"
            />
            {/* Value Badge */}
            <rect
              x={toSvgX(num) - 24}
              y={lineY - 55}
              width={48}
              height={20}
              rx={6}
              fill="#312e81"
            />
            <text
              x={toSvgX(num)}
              y={lineY - 41}
              fontSize="11"
              fontWeight="black"
              fill="#ffffff"
              textAnchor="middle"
              direction="ltr"
            >
              {toPersianDigits(num)}
            </text>
          </g>
        </svg>
      </div>

      {/* Explanatory Rule Banner */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs space-y-2">
        <div className="flex items-center justify-between font-bold">
          <span className="text-slate-700">مرتبه تقریب: {precisionLabel}</span>
          <span className="text-indigo-700">
            رقم بعد از مرتبه تقریب: <strong className="text-sm font-black" dir="ltr">{toPersianDigits(nextDigit)}</strong>
          </span>
        </div>

        <div className="text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2 space-y-1">
          <div>
            ✂️ <strong>در قطع کردن:</strong> بدون توجه به رقم‌های بعدی، تمام رقم‌های کمتر از مرتبه تقریب صفر می‌شوند (پاسخ:{" "}
            <span className="font-black text-amber-700" dir="ltr">{toPersianDigits(truncated)}</span>).
          </div>
          <div>
            🔄 <strong>در گرد کردن:</strong> چون رقم بعد از مرتبه تقریب برابر{" "}
            <span className="font-black" dir="ltr">{toPersianDigits(nextDigit)}</span> است (
            {nextDigit >= 5 ? "۵ یا بیشتر است" : "کمتر از ۵ است"}
            )، {nextDigit >= 5 ? "یک واحد به رقم مرتبه تقریب اضافه می‌شود" : "رقم مرتبه تقریب تغییر نمی‌کند"} (پاسخ:{" "}
            <span className="font-black text-emerald-700" dir="ltr">{toPersianDigits(rounded)}</span>).
          </div>
        </div>
      </div>

      {/* Interactive Slider */}
      {interactive && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>تغییر عدد ورودی:</span>
            <span className="text-indigo-700 font-black text-sm" dir="ltr">
              {toPersianDigits(num)}
            </span>
          </div>
          <input
            type="range"
            min={precision}
            max={precision * 10}
            value={num}
            onChange={(e) => setNum(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
