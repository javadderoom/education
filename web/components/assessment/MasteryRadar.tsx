"use client";

import React from "react";
import { CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

export interface KCMasteryInfo {
  id: string;
  title: string;
  masteryProbability: number; // 0.0 to 1.0
  isMastered: boolean;
}

export interface MasteryRadarProps {
  masteryList: KCMasteryInfo[];
}

export const MasteryRadar: React.FC<MasteryRadarProps> = ({ masteryList }) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800">نقشه تسلط شناختی بیزی (BKT)</h3>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
          فصل ۲: کسرها
        </span>
      </div>

      <div className="space-y-3">
        {masteryList.map((kc) => {
          const percent = Math.round(kc.masteryProbability * 100);
          const isMastered = kc.masteryProbability >= 0.85;
          const isAtRisk = kc.masteryProbability < 0.40;

          let barColor = "bg-indigo-600";
          let badgeColor = "text-indigo-700 bg-indigo-50";

          if (isMastered) {
            barColor = "bg-emerald-500";
            badgeColor = "text-emerald-700 bg-emerald-50";
          } else if (isAtRisk) {
            barColor = "bg-amber-500";
            badgeColor = "text-amber-700 bg-amber-50";
          }

          return (
            <div key={kc.id} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700 truncate max-w-[260px]">
                  {kc.title}
                </span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${badgeColor}`} dir="ltr">
                  {percent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
