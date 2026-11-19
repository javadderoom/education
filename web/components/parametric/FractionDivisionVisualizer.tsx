"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Divide, Sparkles, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

export interface FractionDivisionPreset {
  id: string;
  label: string;
  dividendNum: number;
  dividendDen: number;
  divisorNum: number;
  divisorDen: number;
  units: number; // total units on strip (usually 1 or 2)
}

const PRESETS: FractionDivisionPreset[] = [
  { id: "p1", label: "۳/۴ ÷ ۱/۸", dividendNum: 3, dividendDen: 4, divisorNum: 1, divisorDen: 8, units: 1 },
  { id: "p2", label: "۲/۳ ÷ ۱/۶", dividendNum: 2, dividendDen: 3, divisorNum: 1, divisorDen: 6, units: 1 },
  { id: "p3", label: "۱/۲ ÷ ۱/۴", dividendNum: 1, dividendDen: 2, divisorNum: 1, divisorDen: 4, units: 1 },
  { id: "p4", label: "۴/۵ ÷ ۲/۵", dividendNum: 4, dividendDen: 5, divisorNum: 2, divisorDen: 5, units: 1 },
  { id: "p5", label: "۲ ÷ ۱/۳", dividendNum: 2, dividendDen: 1, divisorNum: 1, divisorDen: 3, units: 2 },
];

export interface FractionDivisionVisualizerProps {
  initialPresetId?: string;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const FractionDivisionVisualizer: React.FC<FractionDivisionVisualizerProps> = ({
  initialPresetId = "p1",
  interactive = true,
  className = "",
  label = "مدل‌سازی دیداری تقسیم کسرها (چند بار جا می‌شود؟)",
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialPresetId);
  const [step, setStep] = useState<1 | 2 | 3>(3); // 1: dividend, 2: common den, 3: count
  const [showInvertRule, setShowInvertRule] = useState<boolean>(false);

  const preset = PRESETS.find((p) => p.id === selectedId) || PRESETS[0];
  const { dividendNum, dividendDen, divisorNum, divisorDen, units } = preset;

  // Find common denominator
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
  const commonDen = lcm(dividendDen, divisorDen);

  // Scaled numerators
  const scaledDividendNum = dividendNum * (commonDen / dividendDen);
  const scaledDivisorNum = divisorNum * (commonDen / divisorDen);

  // Result quotient
  const quotient = scaledDividendNum / scaledDivisorNum;

  // SVG layout
  const svgWidth = 440;
  const svgHeight = 220;
  const paddingX = 30;
  const stripWidth = svgWidth - 2 * paddingX;
  const stripHeight = 55;
  const stripY = 80;

  // Total segments in SVG across all units
  const totalSubdivisions = commonDen * units;
  const dividendTotalSubdivisions = scaledDividendNum;
  const subWidth = stripWidth / totalSubdivisions;

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Divide className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">
              مفهوم پیمانه‌ای تقسیم: کسر دوم چند بار درون کسر اول جا می‌گیرد؟
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              step === 1 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            مرحله ۱
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              step === 2 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            مرحله ۲
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              step === 3 ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            مرحله ۳
          </button>
        </div>
      </div>

      {/* Equation Banner */}
      <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-3 mb-3">
        <div className="text-xs font-bold text-indigo-900">
          مسئله: چه تعداد{" "}
          <span className="text-emerald-700 font-black" dir="ltr">
            {toPersianDigits(divisorNum)}/{toPersianDigits(divisorDen)}
          </span>{" "}
          در{" "}
          <span className="text-indigo-700 font-black" dir="ltr">
            {dividendDen === 1 ? toPersianDigits(dividendNum) : `${toPersianDigits(dividendNum)}/${toPersianDigits(dividendDen)}`}
          </span>{" "}
          وجود دارد؟
        </div>

        <div className="text-base font-black text-indigo-900 flex items-center gap-1.5" dir="ltr">
          <span>
            {dividendDen === 1 ? toPersianDigits(dividendNum) : `${toPersianDigits(dividendNum)}/${toPersianDigits(dividendDen)}`}
          </span>
          <span>÷</span>
          <span>{`${toPersianDigits(divisorNum)}/${toPersianDigits(divisorDen)}`}</span>
          <span>=</span>
          <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            {toPersianDigits(quotient)}
          </span>
        </div>
      </div>

      {/* SVG Strip Representation */}
      <div className="relative flex justify-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible"
          role="img"
          aria-label="نوار مدل تقسیم کسرها"
        >
          {/* Unit demarcations background */}
          <rect
            x={paddingX}
            y={stripY}
            width={stripWidth}
            height={stripHeight}
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth={2}
            rx={8}
          />

          {/* Shaded Dividend Area */}
          <rect
            x={paddingX}
            y={stripY}
            width={dividendTotalSubdivisions * subWidth}
            height={stripHeight}
            fill="#818cf8"
            fillOpacity={0.25}
            stroke="#4f46e5"
            strokeWidth={2}
            rx={8}
          />

          {/* Step 1: Initial Dividend Partition Lines */}
          {step === 1 && (
            <>
              {Array.from({ length: dividendDen * units + 1 }).map((_, i) => {
                const xPos = paddingX + i * (stripWidth / (dividendDen * units));
                return (
                  <line
                    key={`div-line-${i}`}
                    x1={xPos}
                    y1={stripY}
                    x2={xPos}
                    y2={stripY + stripHeight}
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                );
              })}
              <text
                x={paddingX + (dividendTotalSubdivisions * subWidth) / 2}
                y={stripY + stripHeight / 2 + 5}
                fontSize="13"
                fontWeight="black"
                fill="#312e81"
                textAnchor="middle"
              >
                مقسوم ({dividendDen === 1 ? toPersianDigits(dividendNum) : `${toPersianDigits(dividendNum)}/${toPersianDigits(dividendDen)}`})
              </text>
            </>
          )}

          {/* Step 2 & 3: Common Denominator Subdivisions */}
          {(step === 2 || step === 3) && (
            <>
              {Array.from({ length: totalSubdivisions + 1 }).map((_, i) => {
                const xPos = paddingX + i * subWidth;
                const isUnit = i % commonDen === 0;
                return (
                  <line
                    key={`sub-line-${i}`}
                    x1={xPos}
                    y1={stripY}
                    x2={xPos}
                    y2={stripY + stripHeight}
                    stroke={isUnit ? "#1e293b" : "#94a3b8"}
                    strokeWidth={isUnit ? 2.5 : 1}
                    strokeDasharray={isUnit ? undefined : "2,2"}
                  />
                );
              })}

              {/* Step 3: Quotient Pack Badges (groups of scaledDivisorNum) */}
              {step === 3 &&
                Array.from({ length: quotient }).map((_, packIdx) => {
                  const startX = paddingX + packIdx * scaledDivisorNum * subWidth;
                  const packW = scaledDivisorNum * subWidth;
                  return (
                    <g key={`pack-${packIdx}`}>
                      <rect
                        x={startX + 2}
                        y={stripY + 4}
                        width={packW - 4}
                        height={stripHeight - 8}
                        fill="#10b981"
                        fillOpacity={0.2}
                        stroke="#059669"
                        strokeWidth={1.5}
                        rx={6}
                      />
                      <circle
                        cx={startX + packW / 2}
                        cy={stripY + stripHeight / 2}
                        r={12}
                        fill="#059669"
                        className="drop-shadow-xs"
                      />
                      <text
                        x={startX + packW / 2}
                        y={stripY + stripHeight / 2 + 4}
                        fontSize="11"
                        fontWeight="black"
                        fill="#ffffff"
                        textAnchor="middle"
                      >
                        {toPersianDigits(packIdx + 1)}
                      </text>
                    </g>
                  );
                })}
            </>
          )}

          {/* Strip Top Label / Brackets */}
          <text
            x={paddingX + (dividendTotalSubdivisions * subWidth) / 2}
            y={stripY - 14}
            fontSize="12"
            fontWeight="black"
            fill="#4338ca"
            textAnchor="middle"
          >
            مقدار کل موجود: {dividendDen === 1 ? toPersianDigits(dividendNum) : `${toPersianDigits(dividendNum)}/${toPersianDigits(dividendDen)}`}
          </text>

          {/* Unit Boundaries Mark */}
          {Array.from({ length: units + 1 }).map((_, u) => {
            const ux = paddingX + u * (stripWidth / units);
            return (
              <g key={`unit-bound-${u}`}>
                <line
                  x1={ux}
                  y1={stripY + stripHeight}
                  x2={ux}
                  y2={stripY + stripHeight + 10}
                  stroke="#1e293b"
                  strokeWidth={2}
                />
                <text
                  x={ux}
                  y={stripY + stripHeight + 24}
                  fontSize="11"
                  fontWeight="black"
                  fill="#1e293b"
                  textAnchor="middle"
                >
                  {toPersianDigits(u)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step Explanation Card */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs font-bold text-slate-700">
        {step === 1 && (
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              ۱
            </span>
            <span>
              نوار بالا نشان‌دهنده مقدار کسر اول (مقسوم) است. ما می‌خواهیم بدانیم بسته‌های{" "}
              <span className="text-emerald-700 font-black" dir="ltr">
                {toPersianDigits(divisorNum)}/{toPersianDigits(divisorDen)}
              </span>{" "}
              چند بار در این فضا جا می‌شوند.
            </span>
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              ۲
            </span>
            <span>
              با هم‌مخرج کردن، نوار به قطعات مساوی{" "}
              <span className="text-indigo-700 font-black" dir="ltr">
                ۱/{toPersianDigits(commonDen)}
              </span>{" "}
              تقسیم می‌شود. مقسوم به{" "}
              <span className="text-indigo-700 font-black" dir="ltr">
                {toPersianDigits(scaledDividendNum)}/{toPersianDigits(commonDen)}
              </span>{" "}
              تبدیل می‌شود.
            </span>
          </div>
        )}

        {step === 3 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                ۳
              </span>
              <span>
                شمارش بسته‌ها: دقیقاً{" "}
                <span className="text-emerald-700 font-black text-sm">
                  {toPersianDigits(quotient)} بسته
                </span>{" "}
                از کسر مقسوم‌علیه درون مقسوم جا گرفت!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInvertRule(!showInvertRule)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              {showInvertRule ? "بستن فرمول" : "چرا معکوس و ضرب؟"}
            </button>
          </div>
        )}
      </div>

      {/* Invert & Multiply Proof Popup */}
      {showInvertRule && step === 3 && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
          <div className="font-bold text-amber-900">ارتباط مدل تصویری با قاعده ضرب در معکوس:</div>
          <div className="text-slate-700 leading-relaxed">
            وقتی بر کسر تقسیم می‌کنیم، در واقع می‌پرسیم در هر واحد کامل چند بسته از آن کسر وجود دارد؟ چون در هر واحد کامل{" "}
            <span className="font-black text-amber-900" dir="ltr">{toPersianDigits(divisorDen)}</span> بسته وجود دارد، مقسوم در معکوس کسر ضرب می‌شود:
          </div>
          <div className="flex items-center justify-center gap-2 py-1 bg-white rounded-xl border border-amber-200 font-black text-sm" dir="ltr">
            <span>{toPersianDigits(dividendNum)}/{toPersianDigits(dividendDen)}</span>
            <span>×</span>
            <span className="text-amber-700">{toPersianDigits(divisorDen)}/{toPersianDigits(divisorNum)}</span>
            <span>=</span>
            <span>{(dividendNum * divisorDen)}/{(dividendDen * divisorNum)}</span>
            <span>=</span>
            <span className="text-emerald-700">{toPersianDigits(quotient)}</span>
          </div>
        </div>
      )}

      {/* Preset Selector */}
      {interactive && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-600">انتخاب مسئله نمونه:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setStep(3);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedId === p.id ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                dir="ltr"
              >
                {toPersianDigits(p.label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
