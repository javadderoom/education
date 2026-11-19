"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Circle, Sparkles, MoveRight, RotateCcw } from "lucide-react";

export interface CircleMeasurementProps {
  initialRadius?: number;
  initialMode?: "circumference" | "area_slices";
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const CircleMeasurementVisualizer: React.FC<CircleMeasurementProps> = ({
  initialRadius = 3,
  initialMode = "area_slices",
  interactive = true,
  className = "",
  label = "اثبات بصری محیط و مساحت دایره با برش قطاعی",
}) => {
  const [radius, setRadius] = useState<number>(Math.max(1, Math.min(6, initialRadius)));
  const [mode, setMode] = useState<"circumference" | "area_slices">(initialMode);
  const [isSpread, setIsSpread] = useState<boolean>(true); // For area slices spread into rectangle
  const [rollProgress, setRollProgress] = useState<number>(100); // 0 to 100%

  const pi = 3.14;
  const diameter = radius * 2;
  const circumference = +(2 * pi * radius).toFixed(2);
  const area = +(pi * radius * radius).toFixed(2);

  const numSlices = 16;
  const sliceAngle = 360 / numSlices; // 22.5 deg

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Circle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">کشف مفهوم عدد پی و تبدیل دایره به مستطیل</p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("area_slices")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "area_slices" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              مساحت (برش پیتزایی)
            </button>
            <button
              type="button"
              onClick={() => setMode("circumference")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mode === "circumference" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              محیط و عدد پی
            </button>
          </div>
        )}
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px]">شعاع دایره (r):</span>
            <input
              type="range"
              min={2}
              max={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-24 accent-indigo-600 cursor-pointer"
              aria-label="تغییر شعاع دایره"
            />
            <strong className="text-indigo-700 font-black">{toPersianDigits(radius)} سانتی‌متر</strong>
          </div>

          {mode === "area_slices" ? (
            <button
              type="button"
              onClick={() => setIsSpread((prev) => !prev)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                isSpread
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-indigo-600 text-white shadow-xs"
              }`}
            >
              {isSpread ? "بازگشت به شکل دایره" : "چیدن قطاع‌ها به صورت مستطیل"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold text-[11px]">غلتاندن دایره:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={rollProgress}
                onChange={(e) => setRollProgress(Number(e.target.value))}
                className="w-28 accent-indigo-600 cursor-pointer"
                aria-label="غلتاندن دایره روی خط‌کش"
              />
              <span className="text-slate-600 font-bold">{toPersianDigits(rollProgress)}%</span>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full h-[240px] bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100 overflow-hidden flex items-center justify-center">
        {mode === "area_slices" ? (
          <svg viewBox="0 0 380 240" className="w-full h-full max-h-[240px]" role="img" aria-label="اثبات مساحت دایره">
            {!isSpread ? (
              /* Assembled Circle with 16 alternating sectors */
              <g transform="translate(190, 120)">
                {Array.from({ length: numSlices }).map((_, i) => {
                  const startAngle = (i * sliceAngle * Math.PI) / 180;
                  const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
                  const r = radius * 18;
                  const x1 = r * Math.cos(startAngle);
                  const y1 = r * Math.sin(startAngle);
                  const x2 = r * Math.cos(endAngle);
                  const y2 = r * Math.sin(endAngle);

                  return (
                    <path
                      key={i}
                      d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={i % 2 === 0 ? "#6366f1" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  );
                })}
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  r={toPersianDigits(radius)}
                </text>
              </g>
            ) : (
              /* Interleaved rectangular arrangement of 16 sectors */
              <g transform="translate(75, 60)">
                {/* 8 top pointing wedges and 8 bottom pointing wedges */}
                {Array.from({ length: numSlices }).map((_, i) => {
                  const isTop = i % 2 === 0;
                  const sliceW = 18;
                  const sliceH = radius * 20;
                  const x = (i / 2) * sliceW * 2 + (isTop ? 0 : sliceW);

                  const p1 = `${x},${isTop ? sliceH : 0}`;
                  const p2 = `${x + sliceW},${isTop ? 0 : sliceH}`;
                  const p3 = `${x + 2 * sliceW},${isTop ? sliceH : 0}`;

                  return (
                    <polygon
                      key={i}
                      points={`${p1} ${p2} ${p3}`}
                      fill={isTop ? "#6366f1" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Dimension Arrows */}
                <line x1="0" y1={radius * 20 + 20} x2="288" y2={radius * 20 + 20} stroke="#047857" strokeWidth="2" />
                <text x="144" y={radius * 20 + 38} textAnchor="middle" fill="#047857" fontSize="11" fontWeight="bold">
                  قاعده مستطیل = نصف محیط دایره (π × r = {toPersianDigits(+(pi * radius).toFixed(2))})
                </text>

                <line x1="-10" y1="0" x2="-10" y2={radius * 20} stroke="#4338ca" strokeWidth="2" />
                <text x="-16" y={radius * 10 + 4} textAnchor="end" fill="#4338ca" fontSize="10" fontWeight="bold">
                  عرض = r ({toPersianDigits(radius)})
                </text>
              </g>
            )}
          </svg>
        ) : (
          <svg viewBox="0 0 380 240" className="w-full h-full max-h-[240px]" role="img" aria-label="اثبات محیط دایره">
            {/* Ruler Line on Ground */}
            <g transform="translate(30, 170)">
              <line x1="0" y1="0" x2="320" y2="0" stroke="#334155" strokeWidth="3" />
              {/* Ruler Tick Marks */}
              {Array.from({ length: 11 }).map((_, idx) => (
                <g key={idx} transform={`translate(${idx * 30}, 0)`}>
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="1.5" />
                  <text x="0" y="22" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                    {toPersianDigits(idx * 2)}
                  </text>
                </g>
              ))}
              <text x="320" y="-8" textAnchor="end" fill="#475569" fontSize="10" fontWeight="bold">
                خط‌کش بر حسب سانتی‌متر
              </text>
            </g>

            {/* Rolling Circle */}
            {(() => {
              const r = radius * 8;
              const maxRollX = Math.min(260, circumference * 15);
              const curX = 30 + r + (rollProgress / 100) * maxRollX;
              const curY = 170 - r;
              const rot = (rollProgress / 100) * 360;

              return (
                <g transform={`translate(${curX}, ${curY})`}>
                  {/* Rolled Trail on Floor */}
                  <line
                    x1={-(curX - 30 - r)}
                    y1={r}
                    x2={0}
                    y2={r}
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Circle Body */}
                  <circle
                    cx="0"
                    cy="0"
                    r={r}
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    transform={`rotate(${rot})`}
                  />
                  {/* Radius Needle */}
                  <line x1="0" y1="0" x2={r} y2="0" stroke="#dc2626" strokeWidth="2.5" transform={`rotate(${rot})`} />
                  <circle cx="0" cy="0" r="3" fill="#dc2626" />
                </g>
              );
            })()}

            {/* Unrolled Trail Callout */}
            <g transform="translate(190, 70)">
              <text x="0" y="0" textAnchor="middle" fill="#dc2626" fontSize="12" fontWeight="black">
                یک دور چرخش کامل = محیط دایره = {toPersianDigits(circumference)} سانتی‌متر
              </text>
              <text x="0" y="20" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">
                (محیط تقریباً ۳.۱۴ برابر قطر است: {toPersianDigits(diameter)} × ۳.۱۴ = {toPersianDigits(circumference)})
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* Formula Derivation Conclusion Banner */}
      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            {mode === "area_slices" ? "فرمول مساحت دایره:" : "فرمول محیط دایره:"}
          </span>
          <span className="text-[11px] text-indigo-700 font-bold">
            {mode === "area_slices" ? "شعاع × شعاع × عدد پی (۳.۱۴)" : "قطر × عدد پی (۳.۱۴)"}
          </span>
        </div>

        <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs text-xs sm:text-sm font-black text-indigo-900" dir="ltr">
          {mode === "area_slices" ? (
            <div className="flex items-center gap-1.5">
              <span>S =</span>
              <span>{toPersianDigits(radius)}</span>
              <span className="text-slate-400">×</span>
              <span>{toPersianDigits(radius)}</span>
              <span className="text-slate-400">×</span>
              <span>۳.۱۴</span>
              <span>=</span>
              <span className="text-emerald-600 text-sm sm:text-base">{toPersianDigits(area)}</span>
              <span className="text-[11px] text-slate-500 mr-1" dir="rtl">سانتی‌متر مربع</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>P =</span>
              <span>{toPersianDigits(diameter)}</span>
              <span className="text-slate-400">×</span>
              <span>۳.۱۴</span>
              <span>=</span>
              <span className="text-emerald-600 text-sm sm:text-base">{toPersianDigits(circumference)}</span>
              <span className="text-[11px] text-slate-500 mr-1" dir="rtl">سانتی‌متر</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
