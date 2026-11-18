"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Clock, Plus, Minus, ArrowLeftRight, Sparkles } from "lucide-react";

export interface CompoundUnitProps {
  initialOp?: "subtract" | "add";
  initialH1?: number;
  initialM1?: number;
  initialS1?: number;
  initialH2?: number;
  initialM2?: number;
  initialS2?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const CompoundUnitCalculator: React.FC<CompoundUnitProps> = ({
  initialOp = "subtract",
  initialH1 = 4,
  initialM1 = 15,
  initialS1 = 20,
  initialH2 = 1,
  initialM2 = 40,
  initialS2 = 45,
  interactive = true,
  className = "",
  label = "ماشین حساب و بازنمایی بصری زمان‌های مرکب (ساعت/دقیقه/ثانیه)",
}) => {
  const [op, setOp] = useState<"subtract" | "add">(initialOp);
  const [h1, setH1] = useState<number>(initialH1);
  const [m1, setM1] = useState<number>(initialM1);
  const [s1, setS1] = useState<number>(initialS1);
  const [h2, setH2] = useState<number>(initialH2);
  const [m2, setM2] = useState<number>(initialM2);
  const [s2, setS2] = useState<number>(initialS2);
  const [step, setStep] = useState<number>(1); // 1: initial, 2: borrowed / converted, 3: final

  // Calculate results
  const totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
  const totalSeconds2 = h2 * 3600 + m2 * 60 + s2;

  let resTotalSec = op === "add" ? totalSeconds1 + totalSeconds2 : Math.max(0, totalSeconds1 - totalSeconds2);
  const resH = Math.floor(resTotalSec / 3600);
  resTotalSec %= 3600;
  const resM = Math.floor(resTotalSec / 60);
  const resS = resTotalSec % 60;

  // Borrowing details for subtraction
  let needBorrowSec = op === "subtract" && s1 < s2;
  let needBorrowMin = op === "subtract" && (needBorrowSec ? m1 - 1 < m2 : m1 < m2);

  let borrowedS1 = s1;
  let borrowedM1 = m1;
  let borrowedH1 = h1;

  if (needBorrowSec) {
    borrowedM1 -= 1;
    borrowedS1 += 60;
  }
  if (borrowedM1 < m2 && op === "subtract") {
    borrowedH1 -= 1;
    borrowedM1 += 60;
  }

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">قرض گرفتن ۶۰تایی در زمان به جای ده‌دهی</p>
          </div>
        </div>

        {interactive && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setOp("subtract");
                setStep(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                op === "subtract" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>تفریق زمان</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOp("add");
                setStep(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                op === "add" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>جمع زمان</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Step Switcher */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 1 ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
          }`}
        >
          ۱. نمایش ستونی
        </button>
        {op === "subtract" ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2 ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600"
            }`}
          >
            ۲. قرض گرفتن ۶۰تایی
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2 ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600"
            }`}
          >
            ۲. جمع مستقیم
          </button>
        )}
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            step === 3 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
          }`}
        >
          ۳. پاسخ نهایی
        </button>
      </div>

      {/* Main Column-Based Visual Calculation Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3">
        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 pb-2 border-b-2 border-slate-300 text-center font-black text-xs text-slate-700">
          <span className="bg-indigo-100/70 py-1 rounded-lg text-indigo-900">ساعت</span>
          <span className="bg-sky-100/70 py-1 rounded-lg text-sky-900">دقیقه</span>
          <span className="bg-amber-100/70 py-1 rounded-lg text-amber-900">ثانیه</span>
        </div>

        {/* Borrowed / Converted Row in Step 2 or 3 */}
        {step >= 2 && op === "subtract" && (needBorrowSec || needBorrowMin) && (
          <div className="grid grid-cols-3 gap-2 py-1.5 text-center font-bold text-xs text-amber-600 animate-in fade-in">
            <span className="bg-amber-50 rounded py-0.5 border border-dashed border-amber-300">
              {toPersianDigits(borrowedH1)}
            </span>
            <span className="bg-amber-50 rounded py-0.5 border border-dashed border-amber-300">
              {toPersianDigits(borrowedM1)}
            </span>
            <span className="bg-amber-50 rounded py-0.5 border border-dashed border-amber-300">
              {toPersianDigits(borrowedS1)}
            </span>
          </div>
        )}

        {/* Row 1 (Time A) */}
        <div className="grid grid-cols-3 gap-2 py-2 text-center font-black text-sm text-slate-800">
          <span className={step >= 2 && op === "subtract" && borrowedH1 !== h1 ? "line-through text-slate-400" : ""}>
            {toPersianDigits(h1)}
          </span>
          <span className={step >= 2 && op === "subtract" && borrowedM1 !== m1 ? "line-through text-slate-400" : ""}>
            {toPersianDigits(m1)}
          </span>
          <span className={step >= 2 && op === "subtract" && borrowedS1 !== s1 ? "line-through text-slate-400" : ""}>
            {toPersianDigits(s1)}
          </span>
        </div>

        {/* Operation Symbol & Row 2 (Time B) */}
        <div className="relative grid grid-cols-3 gap-2 py-2 text-center font-black text-sm text-slate-700 border-b-2 border-slate-800">
          <span className="absolute -right-3 top-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
            {op === "subtract" ? "-" : "+"}
          </span>
          <span>{toPersianDigits(h2)}</span>
          <span>{toPersianDigits(m2)}</span>
          <span>{toPersianDigits(s2)}</span>
        </div>

        {/* Result Row */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 text-center font-black text-sm sm:text-base text-emerald-700">
          {step === 3 ? (
            <>
              <span className="bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                {toPersianDigits(resH)}
              </span>
              <span className="bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                {toPersianDigits(resM)}
              </span>
              <span className="bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                {toPersianDigits(resS)}
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-300">؟</span>
              <span className="text-slate-300">؟</span>
              <span className="text-slate-300">؟</span>
            </>
          )}
        </div>
      </div>

      {/* Critical Pedagogical Alert on Borrowing Rule */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-900 block font-bold mb-0.5">قاعده طلایی عددهای مرکب:</strong>
          <span className="leading-relaxed">
            {op === "subtract"
              ? "در زمان، هنگامی که از ستون بغلی قرض می‌گیریم، ۶۰ واحد (نه ۱۰ واحد!) به ستون فعلی اضافه می‌شود؛ چون هر ۱ ساعت برابر ۶۰ دقیقه، و هر ۱ دقیقه برابر ۶۰ ثانیه است."
              : "اگر حاصل جمع ثانیه‌ها یا دقیقه‌ها از ۶۰ بیشتر شد، به ازای هر ۶۰ واحد، ۱ واحد به ستون سمت چپ اضافه می‌کنیم."}
          </span>
        </div>
      </div>
    </div>
  );
};
