"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface BalanceScaleProps {
  leftValue?: number; // e.g. 0.25 (1/4)
  rightValue?: number; // e.g. 0.1666 (1/6)
  leftLabel?: string; // e.g. "1/4" or "۲ به ۳"
  rightLabel?: string; // e.g. "1/6" or "۶ به ۹"
  targetValue?: number;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({
  leftValue = 1,
  rightValue = 1,
  leftLabel,
  rightLabel,
}) => {
  // Gracefully fallback to stringified values if labels are missing
  const resolvedLeftLabel =
    leftLabel !== undefined && leftLabel !== null && leftLabel !== ""
      ? String(leftLabel)
      : leftValue !== undefined
      ? String(leftValue)
      : "—";

  const resolvedRightLabel =
    rightLabel !== undefined && rightLabel !== null && rightLabel !== ""
      ? String(rightLabel)
      : rightValue !== undefined
      ? String(rightValue)
      : "—";

  // Calculate tilt angle: negative tilts left down, positive tilts right down
  // Max tilt angle capped at 14 degrees
  const diff = (rightValue || 0) - (leftValue || 0);
  const tiltAngle = Math.max(-14, Math.min(14, diff * 35));
  const isBalanced = Math.abs(diff) < 0.001;

  const beamWidth = 260;
  const centerX = 200;
  const beamY = 55;

  return (
    <div className="w-full flex flex-col items-center my-3 select-none">
      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center">
        <svg
          viewBox="0 0 400 175"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-36 sm:h-40 overflow-visible"
        >
          {/* Base Stand & Pillar */}
          <polygon points="175,160 225,160 208,80 192,80" fill="#64748b" />
          <rect x="140" y="152" width="120" height="12" rx="4" fill="#334155" />
          
          {/* Scale Dial Arc at fulcrum */}
          <path d="M 185,82 Q 200,88 215,82" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* Central Fulcrum Pivot Ring */}
          <circle cx={centerX} cy={beamY} r="8" fill="#0f172a" />
          <circle cx={centerX} cy={beamY} r="3" fill="#ffffff" />

          {/* Tilting Beam Assembly */}
          <g transform={`rotate(${tiltAngle}, ${centerX}, ${beamY})`}>
            {/* Balance Needle / Indicator Pointer */}
            <line
              x1={centerX}
              y1={beamY}
              x2={centerX}
              y2={beamY + 28}
              stroke="#e11d48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Main Horizontal Beam Bar */}
            <line
              x1={centerX - beamWidth / 2}
              y1={beamY}
              x2={centerX + beamWidth / 2}
              y2={beamY}
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Left Beam Hook */}
            <circle cx={centerX - beamWidth / 2} cy={beamY} r="4" fill="#475569" />

            {/* Left Pan: Counter-rotated to hang vertically with tangible weight */}
            <g transform={`translate(${centerX - beamWidth / 2}, ${beamY})`}>
              <g transform={`rotate(${-tiltAngle})`}>
                {/* Suspension Strings */}
                <line x1="0" y1="0" x2="-35" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="0" y1="0" x2="35" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />

                {/* Sturdy Metallic Pan Plate */}
                <path d="M -44,50 C -40,66 40,66 44,50 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

                {/* Tangible Weight Block sitting firmly on left pan */}
                <g>
                  {/* Weight Ring Handle */}
                  <path d="M -9,22 C -9,13 9,13 9,22" fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
                  {/* Weight Body */}
                  <rect
                    x="-32"
                    y="22"
                    width="64"
                    height="28"
                    rx="6"
                    fill="#3b82f6"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  {/* Weight Highlight Rim */}
                  <line x1="-28" y1="26" x2="28" y2="26" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Weight Text Label */}
                  <text
                    x="0"
                    y="41"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill="#ffffff"
                    style={{ direction: "ltr" }}
                  >
                    {toPersianDigits(resolvedLeftLabel)}
                  </text>
                </g>
              </g>
            </g>

            {/* Right Beam Hook */}
            <circle cx={centerX + beamWidth / 2} cy={beamY} r="4" fill="#475569" />

            {/* Right Pan: Counter-rotated to hang vertically with tangible weight */}
            <g transform={`translate(${centerX + beamWidth / 2}, ${beamY})`}>
              <g transform={`rotate(${-tiltAngle})`}>
                {/* Suspension Strings */}
                <line x1="0" y1="0" x2="-35" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="0" y1="0" x2="35" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />

                {/* Sturdy Metallic Pan Plate */}
                <path d="M -44,50 C -40,66 40,66 44,50 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

                {/* Tangible Weight Block sitting firmly on right pan */}
                <g>
                  {/* Weight Ring Handle */}
                  <path d="M -9,22 C -9,13 9,13 9,22" fill="none" stroke="#047857" strokeWidth="2.5" />
                  {/* Weight Body */}
                  <rect
                    x="-32"
                    y="22"
                    width="64"
                    height="28"
                    rx="6"
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  {/* Weight Highlight Rim */}
                  <line x1="-28" y1="26" x2="28" y2="26" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Weight Text Label */}
                  <text
                    x="0"
                    y="41"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill="#ffffff"
                    style={{ direction: "ltr" }}
                  >
                    {toPersianDigits(resolvedRightLabel)}
                  </text>
                </g>
              </g>
            </g>
          </g>
        </svg>

        {/* Informative Educational Badges Below */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-xs font-semibold">
          <span className="text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs" dir="ltr">
            کفه چپ: <b>{toPersianDigits(resolvedLeftLabel)}</b>
          </span>

          <span
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
              isBalanced
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
          >
            {isBalanced ? "⚖️ تعادل برقرار است (برابر / متناسب)" : diff < 0 ? "کفه چپ سنگین‌تر است" : "کفه راست سنگین‌تر است"}
          </span>

          <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs" dir="ltr">
            کفه راست: <b>{toPersianDigits(resolvedRightLabel)}</b>
          </span>
        </div>
      </div>
    </div>
  );
};
