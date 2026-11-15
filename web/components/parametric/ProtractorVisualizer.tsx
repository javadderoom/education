"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface ProtractorVisualizerProps {
  angleDegree: number; // e.g. 30, 45, 90, 120, 150
  showProtractor?: boolean;
  startRayAngle?: number; // usually 0 (horizontal pointing right)
  vertexLabel?: string;
  showDegreeLabel?: boolean;
  showClassification?: boolean;
  label?: string;
}

export const ProtractorVisualizer: React.FC<ProtractorVisualizerProps> = ({
  angleDegree = 60,
  showProtractor = true,
  startRayAngle = 0,
  vertexLabel = "ب",
  showDegreeLabel = true,
  showClassification = true,
  label,
}) => {
  const cx = 200;
  const cy = 180;
  const radius = 140;

  // Classify angle
  const getAngleCategory = (deg: number) => {
    if (deg === 90) return { text: "زاویه راست (قائمه)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (deg < 90) return { text: "زاویه تند (حاده)", color: "bg-blue-100 text-blue-800 border-blue-300" };
    return { text: "زاویه باز (منفرجه)", color: "bg-purple-100 text-purple-800 border-purple-300" };
  };

  const angleCat = getAngleCategory(angleDegree);

  // Convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // SVG Ray coordinates
  // Ray 1: Base ray along startRayAngle (relative to 180-0 protractor orientation)
  const baseRad = (startRayAngle * Math.PI) / 180;
  const ray1X = cx + radius * 1.15 * Math.cos(baseRad);
  const ray1Y = cy - radius * 1.15 * Math.sin(baseRad);

  // Ray 2: Target ray along startRayAngle + angleDegree
  const targetRad = ((startRayAngle + angleDegree) * Math.PI) / 180;
  const ray2X = cx + radius * 1.15 * Math.cos(targetRad);
  const ray2Y = cy - radius * 1.15 * Math.sin(targetRad);

  // Arc path for angle
  const arcRadius = 45;
  const arcStart = {
    x: cx + arcRadius * Math.cos(baseRad),
    y: cy - arcRadius * Math.sin(baseRad),
  };
  const arcEnd = {
    x: cx + arcRadius * Math.cos(targetRad),
    y: cy - arcRadius * Math.sin(targetRad),
  };
  const largeArcFlag = angleDegree > 180 ? 1 : 0;
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${arcEnd.x} ${arcEnd.y}`;

  // Protractor major ticks (every 10 degrees from 0 to 180)
  const ticks = Array.from({ length: 19 }, (_, i) => i * 10);

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <svg viewBox="0 0 400 220" className="w-full h-auto max-h-56 overflow-visible">
          {/* Protractor Semi-Circle Body */}
          {showProtractor && (
            <g>
              {/* Outer Semi-circle body */}
              <path
                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy} Z`}
                fill="#e0f2fe"
                fillOpacity={0.45}
                stroke="#0284c7"
                strokeWidth={2}
              />
              {/* Inner cutout semi-circle */}
              <path
                d={`M ${cx - radius * 0.45} ${cy} A ${radius * 0.45} ${radius * 0.45} 0 0 1 ${cx + radius * 0.45} ${cy} Z`}
                fill="#ffffff"
                stroke="#7dd3fc"
                strokeWidth={1.5}
              />

              {/* Baseline */}
              <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="#0369a1" strokeWidth={2} />

              {/* Center Origin Mark */}
              <circle cx={cx} cy={cy} r={4} fill="#0284c7" />
              <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="#0284c7" strokeWidth={1.5} />
              <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="#0284c7" strokeWidth={1.5} />

              {/* Degree Ticks and Numbers */}
              {ticks.map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const isMajor = deg % 30 === 0;
                const tickLen = isMajor ? 12 : 7;

                const xOuter = cx + radius * Math.cos(rad);
                const yOuter = cy - radius * Math.sin(rad);
                const xInner = cx + (radius - tickLen) * Math.cos(rad);
                const yInner = cy - (radius - tickLen) * Math.sin(rad);

                const xText = cx + (radius - 22) * Math.cos(rad);
                const yText = cy - (radius - 22) * Math.sin(rad) + 4;

                return (
                  <g key={deg}>
                    <line x1={xOuter} y1={yOuter} x2={xInner} y2={yInner} stroke="#0369a1" strokeWidth={isMajor ? 1.5 : 1} />
                    {isMajor && (
                      <text x={xText} y={yText} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0c4a6e">
                        {toPersianDigits(deg)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Measured Angle Rays */}
          {/* Base Ray (Thick Orange/Indigo) */}
          <line x1={cx} y1={cy} x2={ray1X} y2={ray1Y} stroke="#ea580c" strokeWidth={3.5} strokeLinecap="round" />
          {/* Target Ray */}
          <line x1={cx} y1={cy} x2={ray2X} y2={ray2Y} stroke="#4f46e5" strokeWidth={3.5} strokeLinecap="round" />

          {/* Vertex Dot & Label */}
          <circle cx={cx} cy={cy} r={5} fill="#ea580c" stroke="#ffffff" strokeWidth={1.5} />
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={13} fontWeight="900" fill="#1e293b">
            راس ({vertexLabel})
          </text>

          {/* Angle Arc Indicator */}
          <path d={arcPath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeDasharray={angleDegree === 90 ? "none" : "none"} />

          {/* Square marker if right angle (90 deg) */}
          {angleDegree === 90 && (
            <path
              d={`M ${cx + 18} ${cy} L ${cx + 18} ${cy - 18} L ${cx} ${cy - 18}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
            />
          )}

          {/* Degree text badge */}
          {showDegreeLabel && (
            <g>
              <rect
                x={cx + 30 * Math.cos(((startRayAngle + angleDegree / 2) * Math.PI) / 180) - 16}
                y={cy - 30 * Math.sin(((startRayAngle + angleDegree / 2) * Math.PI) / 180) - 10}
                width={32}
                height={20}
                rx={6}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={1.5}
              />
              <text
                x={cx + 30 * Math.cos(((startRayAngle + angleDegree / 2) * Math.PI) / 180)}
                y={cy - 30 * Math.sin(((startRayAngle + angleDegree / 2) * Math.PI) / 180) + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="900"
                fill="#312e81"
              >
                {toPersianDigits(angleDegree)}°
              </text>
            </g>
          )}
        </svg>

        {/* Classification Badge Below */}
        {showClassification && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl border text-xs font-black shadow-xs ${angleCat.color}`}>
              {angleCat.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
