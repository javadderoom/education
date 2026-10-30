"use client";

import React from "react";

export interface BalanceScaleProps {
  leftValue: number; // e.g. 0.25 (1/4)
  rightValue: number; // e.g. 0.1666 (1/6)
  leftLabel: string; // e.g. "1/4"
  rightLabel: string; // e.g. "1/6"
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
}) => {
  // Calculate tilt angle: negative tilts left down, positive tilts right down
  // Max tilt angle capped at 15 degrees
  const diff = rightValue - leftValue;
  const tiltAngle = Math.max(-14, Math.min(14, diff * 60));

  const beamWidth = 260;
  const centerX = 200;
  const beamY = 60;

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      <div className="w-full max-w-sm bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
        <svg viewBox="0 0 400 170" className="w-full h-36 overflow-visible">
          {/* Base Stand */}
          <polygon points="175,150 225,150 210,90 190,90" fill="#64748b" />
          <rect x="150" y="145" width="100" height="10" rx="4" fill="#334155" />
          <circle cx={centerX} cy={beamY} r="7" fill="#0f172a" />

          {/* Tilting Beam */}
          <g transform={`rotate(${tiltAngle}, ${centerX}, ${beamY})`}>
            {/* Horizontal Bar */}
            <line
              x1={centerX - beamWidth / 2}
              y1={beamY}
              x2={centerX + beamWidth / 2}
              y2={beamY}
              stroke="#0f172a"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Left Pan Strings & Plate */}
            <g transform={`translate(${centerX - beamWidth / 2}, ${beamY})`}>
              <line x1="0" y1="0" x2="-25" y2="45" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="0" x2="25" y2="45" stroke="#94a3b8" strokeWidth="2" />
              <path d="M -35,45 Q 0,60 35,45 Z" fill="#3b82f6" />
              <text
                x="0"
                y="38"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#1e3a8a"
                style={{ direction: "ltr" }}
              >
                {leftLabel}
              </text>
            </g>

            {/* Right Pan Strings & Plate */}
            <g transform={`translate(${centerX + beamWidth / 2}, ${beamY})`}>
              <line x1="0" y1="0" x2="-25" y2="45" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="0" x2="25" y2="45" stroke="#94a3b8" strokeWidth="2" />
              <path d="M -35,45 Q 0,60 35,45 Z" fill="#10b981" />
              <text
                x="0"
                y="38"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#064e3b"
                style={{ direction: "ltr" }}
              >
                {rightLabel}
              </text>
            </g>
          </g>
        </svg>

        <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-600">
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200" dir="ltr">
            کفه چپ: {leftLabel}
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" dir="ltr">
            کفه راست: {rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
