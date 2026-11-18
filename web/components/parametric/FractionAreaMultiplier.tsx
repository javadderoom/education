"use client";

import React, { useState } from "react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { Grid, Sparkles, Layers } from "lucide-react";

export interface FractionAreaMultiplierProps {
  initialNumA?: number;
  initialDenA?: number;
  initialNumB?: number;
  initialDenB?: number;
  mode?: "fraction" | "decimal";
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const FractionAreaMultiplier: React.FC<FractionAreaMultiplierProps> = ({
  initialNumA = 2,
  initialDenA = 3,
  initialNumB = 4,
  initialDenB = 5,
  mode = "fraction",
  interactive = true,
  className = "",
  label = "مدل مساحت مستطیلی ضرب کسرها و اعشار",
}) => {
  const [numA, setNumA] = useState<number>(Math.max(1, Math.min(initialNumA, initialDenA)));
  const [denA, setDenA] = useState<number>(Math.max(2, Math.min(6, initialDenA)));
  const [numB, setNumB] = useState<number>(Math.max(1, Math.min(initialNumB, initialDenB)));
  const [denB, setDenB] = useState<number>(Math.max(2, Math.min(6, initialDenB)));
  const [activeLayer, setActiveLayer] = useState<"all" | "vertical" | "horizontal">("all");

  const totalCells = denA * denB;
  const overlapCells = numA * numB;

  const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
  const factor = gcd(overlapCells, totalCells);
  const simpNum = overlapCells / factor;
  const simpDen = totalCells / factor;

  const squareSize = 240;
  const colWidth = squareSize / denA;
  const rowHeight = squareSize / denB;

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border-2 border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-xs select-none ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800">{label}</h3>
            <p className="text-[11px] text-slate-400">درک شهودی چرایی ضرب صورت‌ها در صورت و مخرج‌ها در مخرج</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveLayer("all")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeLayer === "all" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            هم‌پوشانی
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("vertical")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeLayer === "vertical" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            کسر اول
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("horizontal")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeLayer === "horizontal" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            کسر دوم
          </button>
        </div>
      </div>

      {/* Interactive Sliders for Fractions */}
      {interactive && (
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-3 text-xs">
          {/* Fraction A (Vertical) */}
          <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
            <span className="block text-indigo-800 font-bold mb-1.5 flex items-center justify-between">
              <span>کسر عمودی (آبی):</span>
              <span className="font-black text-sm" dir="ltr">
                {toPersianDigits(numA)} / {toPersianDigits(denA)}
              </span>
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">صورت:</span>
                <input
                  type="range"
                  min={1}
                  max={denA}
                  value={numA}
                  onChange={(e) => setNumA(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                  aria-label="تغییر صورت کسر اول"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">مخرج:</span>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={denA}
                  onChange={(e) => {
                    const nd = Number(e.target.value);
                    setDenA(nd);
                    if (numA > nd) setNumA(nd);
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                  aria-label="تغییر مخرج کسر اول"
                />
              </div>
            </div>
          </div>

          {/* Fraction B (Horizontal) */}
          <div className="bg-white p-2.5 rounded-xl border border-amber-100">
            <span className="block text-amber-800 font-bold mb-1.5 flex items-center justify-between">
              <span>کسر افقی (زرد):</span>
              <span className="font-black text-sm" dir="ltr">
                {toPersianDigits(numB)} / {toPersianDigits(denB)}
              </span>
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">صورت:</span>
                <input
                  type="range"
                  min={1}
                  max={denB}
                  value={numB}
                  onChange={(e) => setNumB(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                  aria-label="تغییر صورت کسر دوم"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">مخرج:</span>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={denB}
                  onChange={(e) => {
                    const nd = Number(e.target.value);
                    setDenB(nd);
                    if (numB > nd) setNumB(nd);
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                  aria-label="تغییر مخرج کسر دوم"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas for Overlapping 2D Model */}
      <div className="relative w-full h-[270px] bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100 flex items-center justify-center">
        <svg
          viewBox="0 0 320 270"
          className="w-full h-full max-h-[270px]"
          role="img"
          aria-label={`نمایش ضرب کسر ${numA}/${denA} در ${numB}/${denB}`}
        >
          {/* Unit Square Background */}
          <g transform="translate(40, 15)">
            <rect width={squareSize} height={squareSize} fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />

            {/* Render all sub-cells */}
            {Array.from({ length: denB }).map((_, r) =>
              Array.from({ length: denA }).map((_, c) => {
                const inA = c < numA;
                const inB = r < numB;
                let cellFill = "#ffffff";

                if (activeLayer === "vertical" && inA) {
                  cellFill = "#bae6fd"; // sky-200
                } else if (activeLayer === "horizontal" && inB) {
                  cellFill = "#fde68a"; // amber-200
                } else if (activeLayer === "all") {
                  if (inA && inB) {
                    cellFill = "#10b981"; // emerald-500 (intersection / product)
                  } else if (inA) {
                    cellFill = "#7dd3fc"; // sky-300
                  } else if (inB) {
                    cellFill = "#fde047"; // amber-300
                  }
                }

                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * colWidth}
                    y={r * rowHeight}
                    width={colWidth}
                    height={rowHeight}
                    fill={cellFill}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    className="transition-colors duration-150"
                  />
                );
              })
            )}

            {/* Bold Outline around the Overlapping Product Region */}
            {activeLayer === "all" && (
              <rect
                x={0}
                y={0}
                width={numA * colWidth}
                height={numB * rowHeight}
                fill="none"
                stroke="#047857"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            )}
          </g>

          {/* Top Column Labels for Fraction A */}
          <g transform="translate(40, 5)">
            <text x={squareSize / 2} y="8" textAnchor="middle" fill="#0369a1" fontSize="11" fontWeight="bold">
              {toPersianDigits(numA)} ستون از {toPersianDigits(denA)} ستون
            </text>
          </g>

          {/* Right Row Labels for Fraction B */}
          <g transform="translate(290, 15)">
            <text
              x="8"
              y={squareSize / 2}
              textAnchor="middle"
              fill="#b45309"
              fontSize="11"
              fontWeight="bold"
              transform={`rotate(90, 8, ${squareSize / 2})`}
            >
              {toPersianDigits(numB)} سطر از {toPersianDigits(denB)} سطر
            </text>
          </g>
        </svg>

        {/* Overlap Stats Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] font-bold text-slate-700 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>مساحت هم‌پوشانی: {toPersianDigits(overlapCells)} سلول از {toPersianDigits(totalCells)} سلول کل</span>
        </div>
      </div>

      {/* Math Calculation Banner */}
      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div>
          <span className="text-xs font-bold text-slate-700 block">رابطه ریاضی ضرب کسرها:</span>
          <span className="text-[11px] text-indigo-700 font-bold">
            (ضرب صورت‌ها) تقسیم بر (ضرب مخرج‌ها)
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs text-xs sm:text-sm font-black text-indigo-900" dir="ltr">
          {/* Fraction A */}
          <span className="inline-flex flex-col items-center">
            <span>{toPersianDigits(numA)}</span>
            <span className="w-full h-0.5 bg-slate-400 my-0.5" />
            <span>{toPersianDigits(denA)}</span>
          </span>

          <span className="text-slate-400">×</span>

          {/* Fraction B */}
          <span className="inline-flex flex-col items-center">
            <span>{toPersianDigits(numB)}</span>
            <span className="w-full h-0.5 bg-slate-400 my-0.5" />
            <span>{toPersianDigits(denB)}</span>
          </span>

          <span className="text-slate-400">=</span>

          {/* Result */}
          <span className="inline-flex flex-col items-center text-emerald-700">
            <span>{toPersianDigits(overlapCells)}</span>
            <span className="w-full h-0.5 bg-emerald-600 my-0.5" />
            <span>{toPersianDigits(totalCells)}</span>
          </span>

          {/* Simplified Fraction if different */}
          {factor > 1 && (
            <>
              <span className="text-slate-400">=</span>
              <span className="inline-flex flex-col items-center text-indigo-600 font-black">
                <span>{toPersianDigits(simpNum)}</span>
                <span className="w-full h-0.5 bg-indigo-600 my-0.5" />
                <span>{toPersianDigits(simpDen)}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal mr-1" dir="rtl">(ساده‌شده)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
