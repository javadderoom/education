"use client";

import React, { useState } from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface BucketItem {
  id: string;
  label: string; // e.g. "1/3", "3/4"
  value: number; // e.g. 0.333, 0.75
}

export interface BucketSortProps {
  items: BucketItem[];
  bucketALabel: string; // e.g. "کمتر از نصف (۱/۲)"
  bucketBLabel: string; // e.g. "بیشتر از نصف (۱/۲)"
  threshold?: number; // e.g. 0.5
  onComplete?: (score: number) => void;
}

export const BucketSort: React.FC<BucketSortProps> = ({
  items = [
    { id: "1", label: "1/4", value: 0.25 },
    { id: "2", label: "2/3", value: 0.666 },
    { id: "3", label: "1/8", value: 0.125 },
    { id: "4", label: "5/6", value: 0.833 },
  ],
  bucketALabel = "کوچک‌تر از ۱/۲",
  bucketBLabel = "بزرگ‌تر از ۱/۲",
  threshold = 0.5,
  onComplete,
}) => {
  const [unassigned, setUnassigned] = useState<BucketItem[]>(items);
  const [bucketA, setBucketA] = useState<BucketItem[]>([]);
  const [bucketB, setBucketB] = useState<BucketItem[]>([]);

  const moveToBucket = (item: BucketItem, target: "A" | "B") => {
    setUnassigned((prev) => prev.filter((i) => i.id !== item.id));
    if (target === "A") {
      setBucketA((prev) => [...prev, item]);
    } else {
      setBucketB((prev) => [...prev, item]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none">
      <div className="w-full max-w-md bg-slate-50 border-2 border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Unassigned Items Pool */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            روی هر کسر ضربه بزنید و سبد مناسب را انتخاب کنید:
          </p>
          <div className="flex flex-wrap gap-2 min-h-12 p-2 bg-white rounded-lg border border-slate-200">
            {unassigned.length === 0 ? (
              <span className="text-xs text-slate-400 m-auto">همه کسرها دسته‌بندی شدند ✓</span>
            ) : (
              unassigned.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold"
                  dir="ltr"
                >
                  <span>{toPersianDigits(item.label)}</span>
                  <div className="flex gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => moveToBucket(item, "A")}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm"
                      title="انتقال به سبد ۱"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveToBucket(item, "B")}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-sm"
                      title="انتقال به سبد ۲"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Two Target Buckets */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-3 flex flex-col min-h-28">
            <h4 className="text-xs font-bold text-blue-900 text-center mb-2 pb-1 border-b border-blue-200">
              {toPersianDigits(bucketALabel)}
            </h4>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {bucketA.map((item) => (
                <span
                  key={item.id}
                  className="text-xs font-bold bg-white text-blue-700 border border-blue-200 px-2 py-1 rounded shadow-sm"
                  dir="ltr"
                >
                  {toPersianDigits(item.label)}
                </span>
              ))}
            </div>
          </div>

          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl p-3 flex flex-col min-h-28">
            <h4 className="text-xs font-bold text-emerald-900 text-center mb-2 pb-1 border-b border-emerald-200">
              {toPersianDigits(bucketBLabel)}
            </h4>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {bucketB.map((item) => (
                <span
                  key={item.id}
                  className="text-xs font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-1 rounded shadow-sm"
                  dir="ltr"
                >
                  {toPersianDigits(item.label)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
