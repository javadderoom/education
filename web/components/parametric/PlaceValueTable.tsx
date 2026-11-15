"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface PlaceValueTableProps {
  number?: number;
  digits?: (number | string)[]; // explicit 6 or 9 digits from left to right
  tiers?: ("millions" | "thousands" | "ones")[];
  highlightColumn?: string; // e.g. "دهگان‌هزار", "صدگان", "یکان‌میلیون"
  hiddenSlot?: string; // e.g. "دهگان‌هزار"
  showLabels?: boolean;
  label?: string;
}

interface ColumnDef {
  key: string;
  label: string;
  tier: "millions" | "thousands" | "ones";
  tierTitle: string;
  order: number; // 8 down to 0
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "صدگان‌میلیون", label: "صدگان", tier: "millions", tierTitle: "میلیون‌ها", order: 8 },
  { key: "دهگان‌میلیون", label: "دهگان", tier: "millions", tierTitle: "میلیون‌ها", order: 7 },
  { key: "یکان‌میلیون", label: "یکان", tier: "millions", tierTitle: "میلیون‌ها", order: 6 },
  { key: "صدگان‌هزار", label: "صدگان", tier: "thousands", tierTitle: "هزارها", order: 5 },
  { key: "دهگان‌هزار", label: "دهگان", tier: "thousands", tierTitle: "هزارها", order: 4 },
  { key: "یکان‌هزار", label: "یکان", tier: "thousands", tierTitle: "هزارها", order: 3 },
  { key: "صدگان", label: "صدگان", tier: "ones", tierTitle: "یکی‌ها", order: 2 },
  { key: "دهگان", label: "دهگان", tier: "ones", tierTitle: "یکی‌ها", order: 1 },
  { key: "یکان", label: "یکان", tier: "ones", tierTitle: "یکی‌ها", order: 0 },
];

export const PlaceValueTable: React.FC<PlaceValueTableProps> = ({
  number,
  digits,
  tiers = ["thousands", "ones"],
  highlightColumn,
  hiddenSlot,
  showLabels = true,
  label,
}) => {
  // Determine if millions tier is active
  const hasMillions = tiers.includes("millions") || (number !== undefined && number >= 1_000_000);
  const activeTiers: ("millions" | "thousands" | "ones")[] = hasMillions
    ? ["millions", "thousands", "ones"]
    : ["thousands", "ones"];

  const activeColumns = ALL_COLUMNS.filter((c) => activeTiers.includes(c.tier));
  const totalDigitsCount = activeColumns.length;

  // Extract digits
  let displayDigits: (string | number)[] = [];
  if (digits && digits.length === totalDigitsCount) {
    displayDigits = digits;
  } else if (number !== undefined) {
    const numStr = Math.floor(Math.abs(number)).toString().padStart(totalDigitsCount, "0");
    const sliced = numStr.slice(-totalDigitsCount);
    displayDigits = sliced.split("");
  } else {
    displayDigits = Array(totalDigitsCount).fill("۰");
  }

  // Tier color styling
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "millions":
        return {
          headerBg: "bg-purple-100 text-purple-900 border-purple-200",
          subBg: "bg-purple-50 text-purple-800",
          cellBg: "bg-purple-50/30",
        };
      case "thousands":
        return {
          headerBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
          subBg: "bg-emerald-50 text-emerald-800",
          cellBg: "bg-emerald-50/30",
        };
      default:
        return {
          headerBg: "bg-blue-100 text-blue-900 border-blue-200",
          subBg: "bg-blue-50 text-blue-800",
          cellBg: "bg-blue-50/30",
        };
    }
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-lg overflow-x-auto shadow-sm rounded-2xl border-2 border-slate-300 bg-white">
        <table className="w-full border-collapse text-center">
          {/* Tier Top Headers */}
          <thead>
            <tr>
              {activeTiers.map((tier) => {
                const colSpan = 3;
                const colors = getTierColor(tier);
                const title = tier === "millions" ? "طبقه میلیون‌ها" : tier === "thousands" ? "طبقه هزارها" : "طبقه یکی‌ها";
                return (
                  <th
                    key={tier}
                    colSpan={colSpan}
                    className={`py-2 px-1 text-xs sm:text-sm font-black border-b-2 border-l border-slate-300 ${colors.headerBg}`}
                  >
                    {title}
                  </th>
                );
              })}
            </tr>

            {/* Sub Headers (صدگان، دهگان، یکان) */}
            {showLabels && (
              <tr className="border-b border-slate-300">
                {activeColumns.map((col, idx) => {
                  const colors = getTierColor(col.tier);
                  const isHighlighted = highlightColumn === col.key || highlightColumn === col.label;
                  return (
                    <th
                      key={col.key + idx}
                      className={`py-1.5 text-[11px] sm:text-xs font-bold border-l border-slate-200 ${
                        isHighlighted ? "bg-amber-200 text-amber-950 font-black" : colors.subBg
                      }`}
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          {/* Digits Row */}
          <tbody>
            <tr>
              {activeColumns.map((col, idx) => {
                const digit = displayDigits[idx];
                const isHidden = hiddenSlot === col.key || hiddenSlot === col.label;
                const isHighlighted = highlightColumn === col.key || highlightColumn === col.label;
                const colors = getTierColor(col.tier);

                return (
                  <td
                    key={col.key + idx}
                    className={`py-3 px-1 border-l border-slate-200 transition-colors ${
                      isHighlighted
                        ? "bg-amber-100 ring-2 ring-amber-400 font-black"
                        : colors.cellBg
                    }`}
                  >
                    {isHidden ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 text-amber-700 font-black text-sm sm:text-base animate-pulse">
                        ؟
                      </span>
                    ) : (
                      <span
                        className="text-base sm:text-lg font-black text-slate-800"
                        dir="ltr"
                      >
                        {toPersianDigits(digit)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {number !== undefined && !hiddenSlot && (
        <div className="mt-2 text-xs font-bold text-slate-500 flex items-center gap-1.5" dir="ltr">
          <span className="text-slate-400">عدد کامل:</span>
          <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {toPersianDigits(number.toLocaleString())}
          </span>
        </div>
      )}
    </div>
  );
};
