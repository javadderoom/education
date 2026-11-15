"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface ClockVisualizerProps {
  hours: number; // 1 to 12
  minutes: number; // 0 to 59
  elapsedMinutes?: number; // optional highlighted elapsed arc
  label?: string;
  showDigital?: boolean;
}

export const ClockVisualizer: React.FC<ClockVisualizerProps> = ({
  hours = 3,
  minutes = 15,
  elapsedMinutes,
  label,
  showDigital = true,
}) => {
  const size = 220;
  const center = size / 2;
  const radius = 90;

  // Angles (in degrees, 0 at 12 o'clock, clockwise)
  const minuteAngle = (minutes / 60) * 360;
  // Hour hand moves continuously as minutes advance: 30 deg per hour + 0.5 deg per min
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  // Numbers 1 to 12 on clock face
  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Elapsed wedge path if provided
  let elapsedPath = "";
  if (elapsedMinutes && elapsedMinutes > 0) {
    const startAngle = minuteAngle;
    const endAngle = (minuteAngle + (elapsedMinutes / 60) * 360) % 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * 0.85 * Math.cos(startRad);
    const y1 = center + radius * 0.85 * Math.sin(startRad);
    const x2 = center + radius * 0.85 * Math.cos(endRad);
    const y2 = center + radius * 0.85 * Math.sin(endRad);

    const largeArcFlag = elapsedMinutes > 30 ? 1 : 0;
    elapsedPath = `M ${center} ${center} L ${x1} ${y1} A ${radius * 0.85} ${radius * 0.85} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  // Calculate hand endpoints
  const hourRad = ((hourAngle - 90) * Math.PI) / 180;
  const hourHandLength = radius * 0.52;
  const hourX = center + hourHandLength * Math.cos(hourRad);
  const hourY = center + hourHandLength * Math.sin(hourRad);

  const minRad = ((minuteAngle - 90) * Math.PI) / 180;
  const minHandLength = radius * 0.78;
  const minX = center + minHandLength * Math.cos(minRad);
  const minY = center + minHandLength * Math.sin(minRad);

  // Digital time string
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-xs bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48 sm:w-52 sm:h-52">
          {/* Outer Bezel */}
          <circle
            cx={center}
            cy={center}
            r={radius + 8}
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth={4}
          />
          {/* Dial Face */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth={2}
          />

          {/* Minute tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHourTick = i % 5 === 0;
            const angle = (i / 60) * 360;
            const rad = ((angle - 90) * Math.PI) / 180;
            const rOuter = radius - 3;
            const rInner = isHourTick ? radius - 10 : radius - 6;

            return (
              <line
                key={i}
                x1={center + rOuter * Math.cos(rad)}
                y1={center + rOuter * Math.sin(rad)}
                x2={center + rInner * Math.cos(rad)}
                y2={center + rInner * Math.sin(rad)}
                stroke={isHourTick ? "#334155" : "#cbd5e1"}
                strokeWidth={isHourTick ? 2 : 1}
              />
            );
          })}

          {/* Elapsed time highlighted wedge */}
          {elapsedPath && (
            <path
              d={elapsedPath}
              fill="#fbbf24"
              fillOpacity={0.4}
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
          )}

          {/* Clock Numbers 1..12 */}
          {numbers.map((num) => {
            const angle = (num / 12) * 360;
            const rad = ((angle - 90) * Math.PI) / 180;
            const textR = radius - 22;
            const x = center + textR * Math.cos(rad);
            const y = center + textR * Math.sin(rad) + 4;

            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill="#1e293b"
              >
                {toPersianDigits(num)}
              </text>
            );
          })}

          {/* Hour Hand (Thick) */}
          <line
            x1={center}
            y1={center}
            x2={hourX}
            y2={hourY}
            stroke="#1e293b"
            strokeWidth={5}
            strokeLinecap="round"
          />

          {/* Minute Hand (Longer, colored) */}
          <line
            x1={center}
            y1={center}
            x2={minX}
            y2={minY}
            stroke="#2563eb"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Center Pin */}
          <circle cx={center} cy={center} r={5} fill="#ea580c" stroke="#ffffff" strokeWidth={1.5} />
        </svg>

        {/* Digital Time Badge */}
        {showDigital && (
          <div className="mt-3 flex flex-col items-center gap-1">
            <span
              className="text-base font-black px-3 py-1 rounded-xl bg-slate-900 text-white tracking-wider shadow-inner"
              dir="ltr"
            >
              {toPersianDigits(formattedHours)}:{toPersianDigits(formattedMinutes)}
            </span>
            {elapsedMinutes && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                زمان سپری‌شده: {toPersianDigits(elapsedMinutes)} دقیقه
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
