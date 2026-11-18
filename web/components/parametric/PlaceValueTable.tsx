"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export type PlaceValueTier = "billions" | "millions" | "thousands" | "ones" | "decimals";

export interface PlaceValueTableProps {
  number?: number;
  digits?: (number | string)[]; // explicit digits from left to right
  decimalDigits?: (number | string)[]; // explicit decimal digits (tenths, hundredths, thousandths)
  tiers?: PlaceValueTier[];
  highlightColumn?: string; // e.g. "دهگان‌هزار", "صدگان", "یکان‌میلیارد", "صدم"
  hiddenSlot?: string; // e.g. "دهگان‌هزار"
  hiddenHeader?: string; // column key or label whose subheader is masked with '؟'
  showLabels?: boolean;
  label?: string;
  hideFullNumber?: boolean;
}

interface ColumnDef {
  key: string;
  label: string;
  tier: PlaceValueTier;
  tierTitle: string;
  order: number;
}

const ALL_COLUMNS: ColumnDef[] = [
  // Billions (Grade 5)
  { key: "صدگان‌میلیارد", label: "صدگان", tier: "billions", tierTitle: "میلیاردها", order: 11 },
  { key: "دهگان‌میلیارد", label: "دهگان", tier: "billions", tierTitle: "میلیاردها", order: 10 },
  { key: "یکان‌میلیارد", label: "یکان", tier: "billions", tierTitle: "میلیاردها", order: 9 },

  // Millions
  { key: "صدگان‌میلیون", label: "صدگان", tier: "millions", tierTitle: "میلیون‌ها", order: 8 },
  { key: "دهگان‌میلیون", label: "دهگان", tier: "millions", tierTitle: "میلیون‌ها", order: 7 },
  { key: "یکان‌میلیون", label: "یکان", tier: "millions", tierTitle: "میلیون‌ها", order: 6 },

  // Thousands
  { key: "صدگان‌هزار", label: "صدگان", tier: "thousands", tierTitle: "هزارها", order: 5 },
  { key: "دهگان‌هزار", label: "دهگان", tier: "thousands", tierTitle: "هزارها", order: 4 },
  { key: "یکان‌هزار", label: "یکان", tier: "thousands", tierTitle: "هزارها", order: 3 },

  // Ones
  { key: "صدگان", label: "صدگان", tier: "ones", tierTitle: "یکی‌ها", order: 2 },
  { key: "دهگان", label: "دهگان", tier: "ones", tierTitle: "یکی‌ها", order: 1 },
  { key: "یکان", label: "یکان", tier: "ones", tierTitle: "یکی‌ها", order: 0 },

  // Decimals (Grade 5)
  { key: "دهم", label: "دهم", tier: "decimals", tierTitle: "اعشار", order: -1 },
  { key: "صدم", label: "صدم", tier: "decimals", tierTitle: "اعشار", order: -2 },
  { key: "هزارم", label: "هزارم", tier: "decimals", tierTitle: "اعشار", order: -3 },
];

export const PlaceValueTable: React.FC<PlaceValueTableProps> = ({
  number,
  digits,
  decimalDigits,
  tiers = ["thousands", "ones"],
  highlightColumn,
  hiddenSlot,
  hiddenHeader,
  showLabels = true,
  label,
  hideFullNumber = false,
}) => {
  // Determine active tiers
  const hasBillions = tiers.includes("billions") || (number !== undefined && number >= 1_000_000_000);
  const hasMillions = tiers.includes("millions") || (number !== undefined && number >= 1_000_000);
  const hasDecimals = tiers.includes("decimals");

  const activeTiers: PlaceValueTier[] = [];
  if (hasBillions) activeTiers.push("billions");
  if (hasMillions || hasBillions) activeTiers.push("millions");
  activeTiers.push("thousands", "ones");
  if (hasDecimals) activeTiers.push("decimals");

  const activeColumns = ALL_COLUMNS.filter((c) => activeTiers.includes(c.tier));
  const intColumns = activeColumns.filter((c) => c.tier !== "decimals");
  const decColumns = activeColumns.filter((c) => c.tier === "decimals");
  const totalDigitsCount = activeColumns.length;

  // Extract digits
  let displayDigits: (string | number)[] = [];
  if (digits && digits.length === totalDigitsCount) {
    displayDigits = digits;
  } else if (number !== undefined) {
    // If number has decimals or integer part
    const intPart = Math.floor(Math.abs(number));
    const intStr = intPart.toString().padStart(intColumns.length, "0").slice(-intColumns.length);
    const intDigits = intStr.split("");

    let decPartDigits: string[] = [];
    if (hasDecimals) {
      if (decimalDigits && decimalDigits.length === 3) {
        decPartDigits = decimalDigits.map(String);
      } else {
        const decStr = (number.toString().split(".")[1] || "").padEnd(3, "0").slice(0, 3);
        decPartDigits = decStr.split("");
      }
    }

    displayDigits = [...intDigits, ...decPartDigits];
  } else {
    displayDigits = Array(totalDigitsCount).fill("۰");
  }

  // Tier color styling
  const getTierColor = (tier: PlaceValueTier) => {
    switch (tier) {
      case "billions":
        return {
          headerBg: "bg-rose-100 text-rose-900 border-rose-200",
          subBg: "bg-rose-50 text-rose-800",
          cellBg: "bg-rose-50/30",
        };
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
      case "decimals":
        return {
          headerBg: "bg-amber-100 text-amber-900 border-amber-200",
          subBg: "bg-amber-50 text-amber-800",
          cellBg: "bg-amber-50/30",
        };
      default:
        return {
          headerBg: "bg-blue-100 text-blue-900 border-blue-200",
          subBg: "bg-blue-50 text-blue-800",
          cellBg: "bg-blue-50/30",
        };
    }
  };

  const getTierTitle = (tier: PlaceValueTier) => {
    switch (tier) {
      case "billions":
        return "طبقه میلیاردها";
      case "millions":
        return "طبقه میلیون‌ها";
      case "thousands":
        return "طبقه هزارها";
      case "decimals":
        return "مرتبه‌های اعشاری";
      default:
        return "طبقه یکی‌ها";
    }
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-lg overflow-x-auto shadow-sm rounded-2xl border-2 border-slate-300 bg-white">
        <table className="w-full border-collapse text-center" dir="ltr">
          {/* Tier Top Headers */}
          <thead>
            <tr>
              {activeTiers.map((tier) => {
                const colSpan = 3;
                const colors = getTierColor(tier);
                const title = getTierTitle(tier);
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
                  const isHeaderHidden = hiddenHeader === col.key || hiddenHeader === col.label;
                  return (
                    <th
                      key={col.key + idx}
                      className={`py-1.5 text-[11px] sm:text-xs font-bold border-l border-slate-200 ${
                        isHighlighted ? "bg-amber-200 text-amber-950 font-black" : colors.subBg
                      }`}
                    >
                      {isHeaderHidden ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md border-2 border-dashed border-amber-600 bg-amber-100 text-amber-950 font-black text-xs animate-pulse">
                          ؟
                        </span>
                      ) : (
                        col.label
                      )}
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

      {number !== undefined && !hiddenSlot && !hideFullNumber && (
        <div className="mt-2 text-xs font-bold text-slate-500 flex items-center gap-1.5" dir="rtl">
          <span className="text-slate-500">عدد کامل:</span>
          <span className="font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 text-sm tracking-normal shadow-2xs" dir="ltr">
            {toPersianDigits(number.toLocaleString())}
          </span>
        </div>
      )}
    </div>
  );
};
