"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { ArrowLeftRight, Sparkles, Thermometer, Waves, Compass, RotateCcw } from "lucide-react";

export interface IntegerNumberLineProps {
  initialValue?: number;
  initialCompareValue?: number;
  min?: number;
  max?: number;
  showComparison?: boolean;
  showOpposite?: boolean;
  contextMode?: "standard" | "thermometer" | "sea_level";
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const IntegerNumberLine: React.FC<IntegerNumberLineProps> = ({
  initialValue = -3,
  initialCompareValue = 2,
  min = -8,
  max = 8,
  showComparison = true,
  showOpposite = true,
  contextMode = "standard",
  interactive = true,
  className = "",
  label = "محور اعداد صحیح، جهت‌ها و مقایسه اعداد منفی و مثبت",
}) => {
  const [valA, setValA] = useState<number>(initialValue);
  const [valB, setValB] = useState<number>(initialCompareValue);
  const [mode, setMode] = useState<"standard" | "thermometer" | "sea_level">(contextMode);
  const [activeFeature, setActiveFeature] = useState<"compare" | "opposite" | "distance">("compare");

  // Calculations
  const oppositeA = -valA;
  const distance = Math.abs(valA - valB);
  const isALessThanB = valA < valB;
  const isAGreaterThanB = valA > valB;

  // SVG layout
  const svgWidth = 440;
  const svgHeight = 200;
  const paddingX = 40;
  const lineY = 110;
  const plotWidth = svgWidth - 2 * paddingX;

  const toSvgX = (v: number) => paddingX + ((v - min) / (max - min)) * plotWidth;

  const ticks: number[] = [];
  for (let i = min; i <= max; i++) {
    ticks.push(i);
  }

  // Format signed number in Persian with LTR safety
  const formatSigned = (n: number) => {
    if (n > 0) return `+${toPersianDigits(n)}`;
    if (n < 0) return `-${toPersianDigits(Math.abs(n))}`;
    return toPersianDigits(0);
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              مبدا صفر، جهت مثبت (راست) و جهت منفی (چپ)
            </p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("standard")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "standard" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              محور استاندارد
            </button>
            <button
              type="button"
              onClick={() => setMode("thermometer")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "thermometer" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              دماسنج
            </button>
            <button
              type="button"
              onClick={() => setMode("sea_level")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "sea_level" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              سطح دریا
            </button>
          </div>
        )}
      </div>

      {/* Real-world Metaphor Banner */}
      {mode === "thermometer" && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-2xl p-2.5 mb-3 text-xs text-amber-900 font-bold">
          <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            در دماسنج: اعداد مثبت نشان‌دهنده دمای <strong>بالای صفر (گرمی)</strong> و اعداد منفی نشان‌دهنده دمای{" "}
            <strong>زیر صفر (یخبندان)</strong> هستند.
          </span>
        </div>
      )}

      {mode === "sea_level" && (
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200/80 rounded-2xl p-2.5 mb-3 text-xs text-sky-900 font-bold">
          <Waves className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            در ارتفاع‌سنجی: سطح دریا مبدا صفر است؛ <strong>بالای سطح دریا مثبت</strong> (کوه، پرواز) و{" "}
            <strong>زیر سطح دریا منفی</strong> (عمق آب، غواصی) است.
          </span>
        </div>
      )}

      {/* SVG Axis */}
      <div className="relative flex justify-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible"
          role="img"
          aria-label="محور اعداد صحیح"
        >
          <defs>
            <marker
              id="arrow-left"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 10 1 L 0 5 L 10 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-right"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
          </defs>

          {/* Shaded Background zones for negative and positive */}
          <rect
            x={paddingX}
            y={lineY - 45}
            width={toSvgX(0) - paddingX}
            height={90}
            fill="#ef4444"
            fillOpacity={0.06}
            rx={8}
          />
          <rect
            x={toSvgX(0)}
            y={lineY - 45}
            width={svgWidth - paddingX - toSvgX(0)}
            height={90}
            fill="#10b981"
            fillOpacity={0.06}
            rx={8}
          />

          {/* Negative & Positive Direction Labels */}
          <text x={paddingX + 10} y={lineY - 30} fontSize="10" fontWeight="black" fill="#dc2626">
            منفی‌ها (سمت چپ)
          </text>
          <text
            x={svgWidth - paddingX - 10}
            y={lineY - 30}
            fontSize="10"
            fontWeight="black"
            fill="#059669"
            textAnchor="end"
          >
            مثبت‌ها (سمت راست)
          </text>

          {/* Main Number Line */}
          <line
            x1={paddingX - 15}
            y1={lineY}
            x2={svgWidth - paddingX + 15}
            y2={lineY}
            stroke="#334155"
            strokeWidth={2.5}
            markerStart="url(#arrow-left)"
            markerEnd="url(#arrow-right)"
          />

          {/* Tick marks & labels */}
          {ticks.map((t) => {
            const tx = toSvgX(t);
            const isOrigin = t === 0;
            return (
              <g key={`tick-${t}`}>
                <line
                  x1={tx}
                  y1={lineY - (isOrigin ? 10 : 5)}
                  x2={tx}
                  y2={lineY + (isOrigin ? 10 : 5)}
                  stroke={isOrigin ? "#4f46e5" : "#64748b"}
                  strokeWidth={isOrigin ? 3 : 1.5}
                />
                <text
                  x={tx}
                  y={lineY + (isOrigin ? 26 : 22)}
                  fontSize={isOrigin ? "12" : "10"}
                  fontWeight={isOrigin ? "black" : "bold"}
                  fill={isOrigin ? "#4f46e5" : t < 0 ? "#b91c1c" : "#047857"}
                  textAnchor="middle"
                  direction="ltr"
                >
                  {formatSigned(t)}
                </text>
              </g>
            );
          })}

          {/* Origin Flag Badge */}
          <text
            x={toSvgX(0)}
            y={lineY - 14}
            fontSize="10"
            fontWeight="black"
            fill="#4f46e5"
            textAnchor="middle"
          >
            مبدا (صفر)
          </text>

          {/* Opposite Arc (قرینه) */}
          {activeFeature === "opposite" && (
            <g>
              <path
                d={`M ${toSvgX(valA)} ${lineY - 10} Q ${toSvgX(0)} ${lineY - 55} ${toSvgX(oppositeA)} ${lineY - 10}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
              <circle
                cx={toSvgX(oppositeA)}
                cy={lineY}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
                className="drop-shadow-xs"
              />
              <text
                x={toSvgX(oppositeA)}
                y={lineY - 18}
                fontSize="10"
                fontWeight="black"
                fill="#d97706"
                textAnchor="middle"
              >
                قرینه: {formatSigned(oppositeA)}
              </text>
            </g>
          )}

          {/* Distance Bracket */}
          {activeFeature === "distance" && (
            <g>
              <line
                x1={toSvgX(Math.min(valA, valB))}
                y1={lineY - 25}
                x2={toSvgX(Math.max(valA, valB))}
                y2={lineY - 25}
                stroke="#6366f1"
                strokeWidth={2}
              />
              <text
                x={(toSvgX(valA) + toSvgX(valB)) / 2}
                y={lineY - 32}
                fontSize="11"
                fontWeight="black"
                fill="#4338ca"
                textAnchor="middle"
              >
                فاصله: {toPersianDigits(distance)} واحد
              </text>
            </g>
          )}

          {/* Point A Marker */}
          <g>
            <circle
              cx={toSvgX(valA)}
              cy={lineY}
              r={7}
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth={2.5}
              className="drop-shadow-sm"
            />
            <rect
              x={toSvgX(valA) - 20}
              y={lineY - 48}
              width={40}
              height={18}
              rx={5}
              fill="#312e81"
            />
            <text
              x={toSvgX(valA)}
              y={lineY - 35}
              fontSize="10"
              fontWeight="black"
              fill="#ffffff"
              textAnchor="middle"
              direction="ltr"
            >
              {formatSigned(valA)}
            </text>
          </g>

          {/* Point B Marker (if comparing or distance) */}
          {activeFeature !== "opposite" && (
            <g>
              <circle
                cx={toSvgX(valB)}
                cy={lineY}
                r={7}
                fill="#059669"
                stroke="#ffffff"
                strokeWidth={2.5}
                className="drop-shadow-sm"
              />
              <rect
                x={toSvgX(valB) - 20}
                y={lineY - 48}
                width={40}
                height={18}
                rx={5}
                fill="#064e3b"
              />
              <text
                x={toSvgX(valB)}
                y={lineY - 35}
                fontSize="10"
                fontWeight="black"
                fill="#ffffff"
                textAnchor="middle"
                direction="ltr"
              >
                {formatSigned(valB)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Mathematical Comparison / Result Card */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
        {activeFeature === "compare" && (
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">مقایسه دو عدد:</span>
            <div className="flex items-center gap-2 text-sm font-black" dir="ltr">
              <span className="text-indigo-700">{formatSigned(valA)}</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                {valA < valB ? "<" : valA > valB ? ">" : "="}
              </span>
              <span className="text-emerald-700">{formatSigned(valB)}</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {valA < valB
                ? "عدد سمت چپ روی محور همواره کوچکتر است"
                : valA > valB
                ? "عدد سمت راست روی محور همواره بزرگتر است"
                : "دو عدد برابرند"}
            </span>
          </div>
        )}

        {activeFeature === "opposite" && (
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">مفهوم قرینه:</span>
            <div className="text-sm font-black text-amber-700">
              قرینه {formatSigned(valA)} نسبت به صفر، عدد{" "}
              <span dir="ltr" className="text-indigo-700 font-black">
                {formatSigned(oppositeA)}
              </span>{" "}
              است.
            </div>
            <span className="text-[11px] text-slate-500">فاصله هر دو از صفر برابر است</span>
          </div>
        )}

        {activeFeature === "distance" && (
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">فاصله روی محور:</span>
            <div className="text-sm font-black text-indigo-700">
              فاصله بین {formatSigned(valA)} و {formatSigned(valB)} برابر{" "}
              <span className="text-emerald-700">{toPersianDigits(distance)} واحد</span> است.
            </div>
            <span className="text-[11px] text-slate-500">فاصله همواره مقداری نامنفی است</span>
          </div>
        )}
      </div>

      {/* Interactive Feature Selectors & Sliders */}
      {interactive && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Feature Tabs */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>بررسی مفهوم:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFeature("compare")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeFeature === "compare" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                مقایسه دو عدد
              </button>
              <button
                type="button"
                onClick={() => setActiveFeature("opposite")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeFeature === "opposite" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                قرینه عدد
              </button>
              <button
                type="button"
                onClick={() => setActiveFeature("distance")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeFeature === "distance" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                محاسبه فاصله
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>تغییر عدد اول:</span>
              <span className="text-indigo-600" dir="ltr">
                {formatSigned(valA)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={valA}
              onChange={(e) => setValA(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            {activeFeature !== "opposite" && (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
                  <span>تغییر عدد دوم:</span>
                  <span className="text-emerald-600" dir="ltr">
                    {formatSigned(valB)}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
