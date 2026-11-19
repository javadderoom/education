"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Shapes, Sparkles, ArrowRight, Layers } from "lucide-react";

export interface PolygonAreaDecomposerProps {
  initialShapeType?: "trapezoid" | "rhombus";
  baseA?: number; // قاعده کوچک ذوزنقه
  baseB?: number; // قاعده بزرگ ذوزنقه
  height?: number; // ارتفاع
  diag1?: number; // قطر بزرگ لوزی
  diag2?: number; // قطر کوچک لوزی
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const PolygonAreaDecomposer: React.FC<PolygonAreaDecomposerProps> = ({
  initialShapeType = "trapezoid",
  baseA = 6,
  baseB = 10,
  height = 5,
  diag1 = 10,
  diag2 = 6,
  interactive = true,
  className = "",
  label = "اثبات بصری مساحت ذوزنقه و لوزی به کمک تبدیل هندسی",
}) => {
  const [shapeType, setShapeType] = useState<"trapezoid" | "rhombus">(initialShapeType);
  const [step, setStep] = useState<1 | 2 | 3>(3); // 1: shape, 2: duplicate, 3: assembled

  // Trapezoid math
  const trapArea = ((baseA + baseB) * height) / 2;
  const parallelogramArea = (baseA + baseB) * height;

  // Rhombus math
  const rhombusArea = (diag1 * diag2) / 2;
  const rectArea = diag1 * diag2;

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Shapes className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">چرا فرمول مساحت ذوزنقه و لوزی دارای تقسیم بر ۲ است؟</p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setShapeType("trapezoid");
                setStep(3);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                shapeType === "trapezoid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              ذوزنقه
            </button>
            <button
              type="button"
              onClick={() => {
                setShapeType("rhombus");
                setStep(3);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                shapeType === "rhombus" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              لوزی
            </button>
          </div>
        )}
      </div>

      {/* Step Selector Buttons */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 1 ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ۱. شکل اصلی
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 2 ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ۲. تولید شکل قرینه
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 3 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ۳. سرهم‌بندی و اثبات فرمول
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[230px] bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100 overflow-hidden flex items-center justify-center">
        {shapeType === "trapezoid" ? (
          <svg viewBox="0 0 380 230" className="w-full h-full max-h-[230px]" role="img" aria-label="اثبات مساحت ذوزنقه">
            {/* Dimensions: Scale 1 unit = 14px */}
            {/* Original Trapezoid (Blue): (50, 160) to (50 + 10*14 = 190, 160) to (50 + 8*14 = 162, 160 - 5*14 = 90) to (50 + 2*14 = 78, 90) */}
            <g id="trapOriginal">
              <polygon
                points="50,160 190,160 162,90 78,90"
                fill="rgba(99, 102, 241, 0.35)"
                stroke="#4338ca"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <text x="120" y="178" textAnchor="middle" fill="#312e81" fontSize="11" fontWeight="bold">
                قاعده بزرگ ({toPersianDigits(baseB)})
              </text>
              <text x="120" y="80" textAnchor="middle" fill="#312e81" fontSize="11" fontWeight="bold">
                قاعده کوچک ({toPersianDigits(baseA)})
              </text>

              {/* Height Dashed Line */}
              <line x1="78" y1="90" x2="78" y2="160" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
              <text x="65" y="130" fill="#dc2626" fontSize="10" fontWeight="bold">
                h={toPersianDigits(height)}
              </text>
            </g>

            {/* Symmetrical / Duplicate Trapezoid (Amber/Green) */}
            {step >= 2 && (
              <g
                id="trapDuplicate"
                transform={step === 3 ? "rotate(180, 176, 125)" : "translate(150, 0)"}
                className="transition-transform duration-500 ease-out"
              >
                <polygon
                  points="50,160 190,160 162,90 78,90"
                  fill="rgba(245, 158, 11, 0.35)"
                  stroke="#b45309"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeDasharray={step === 2 ? "4 3" : undefined}
                />
              </g>
            )}

            {/* Step 3 Parallelogram Outline & Explanation */}
            {step === 3 && (
              <g id="assembledParallelogram">
                <text x="176" y="30" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="black">
                  متوازی‌الاضلاع کامل با قاعده کل ({toPersianDigits(baseA + baseB)})
                </text>
                <line x1="50" y1="195" x2="274" y2="195" stroke="#047857" strokeWidth="1.5" />
                <text x="162" y="212" textAnchor="middle" fill="#047857" fontSize="11" fontWeight="bold">
                  قاعده جدید = قاعده بزرگ + قاعده کوچک ({toPersianDigits(baseB)} + {toPersianDigits(baseA)} = {toPersianDigits(baseA + baseB)})
                </text>
              </g>
            )}
          </svg>
        ) : (
          <svg viewBox="0 0 380 230" className="w-full h-full max-h-[230px]" role="img" aria-label="اثبات مساحت لوزی">
            {/* Center: (190, 115) */}
            {/* Rhombus Vertices: (190 - 70, 115) = (120, 115), (190, 115 - 45) = (190, 70), (190 + 70, 115) = (260, 115), (190, 115 + 45) = (190, 160) */}
            {/* Surrounding Rectangle: (120, 70) width 140 height 90 */}
            {step >= 2 && (
              <g id="surroundingRect">
                <rect
                  x="120"
                  y="70"
                  width="140"
                  height="90"
                  fill="rgba(245, 158, 11, 0.15)"
                  stroke="#b45309"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <text x="190" y="55" textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="bold">
                  مستطیل محیطی با ابعاد قطرها ({toPersianDigits(diag1)} × {toPersianDigits(diag2)})
                </text>
              </g>
            )}

            {/* Rhombus Shape */}
            <polygon
              points="120,115 190,70 260,115 190,160"
              fill="rgba(99, 102, 241, 0.45)"
              stroke="#4338ca"
              strokeWidth="2.5"
            />

            {/* Diagonals */}
            <line x1="120" y1="115" x2="260" y2="115" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="190" y1="70" x2="190" y2="160" stroke="#047857" strokeWidth="2" strokeDasharray="3 3" />

            <text x="190" y="110" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">
              قطر بزرگ ({toPersianDigits(diag1)})
            </text>
            <text x="200" y="145" fill="#047857" fontSize="10" fontWeight="bold">
              قطر کوچک ({toPersianDigits(diag2)})
            </text>

            {step === 3 && (
              <text x="190" y="195" textAnchor="middle" fill="#047857" fontSize="11" fontWeight="bold">
                مساحت لوزی دقیقاً نصف مساحت مستطیل محیطی است (تقسیم بر ۲)
              </text>
            )}
          </svg>
        )}
      </div>

      {/* Formula Derivation Conclusion Banner */}
      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            {shapeType === "trapezoid" ? "فرمول مساحت ذوزنقه:" : "فرمول مساحت لوزی:"}
          </span>
          <span className="text-[11px] text-indigo-700 font-bold">
            {shapeType === "trapezoid"
              ? "(مجموع دو قاعده × ارتفاع) تقسیم بر ۲"
              : "(قطر بزرگ × قطر کوچک) تقسیم بر ۲"}
          </span>
        </div>

        <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs text-xs sm:text-sm font-black text-indigo-900" dir="ltr">
          {shapeType === "trapezoid" ? (
            <div className="flex items-center gap-1.5">
              <span>S =</span>
              <span className="inline-flex flex-col items-center">
                <span>({toPersianDigits(baseA)} + {toPersianDigits(baseB)}) × {toPersianDigits(height)}</span>
                <span className="w-full h-0.5 bg-slate-400 my-0.5" />
                <span>۲</span>
              </span>
              <span>=</span>
              <span className="text-emerald-600 text-sm sm:text-base">{toPersianDigits(trapArea)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>S =</span>
              <span className="inline-flex flex-col items-center">
                <span>{toPersianDigits(diag1)} × {toPersianDigits(diag2)}</span>
                <span className="w-full h-0.5 bg-slate-400 my-0.5" />
                <span>۲</span>
              </span>
              <span>=</span>
              <span className="text-emerald-600 text-sm sm:text-base">{toPersianDigits(rhombusArea)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
