"use client";

import React from "react";
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, Users, Info } from "lucide-react";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface MisconceptionStat {
  id: string;
  title: string;
  prevalencePercent: number; // e.g. 35%
  detectedCount: number; // e.g. 14 students
  recommendedAction: string;
}

export interface KCMasteryStat {
  id: string;
  title: string;
  averageMastery: number; // 0 to 100
  masteredCount: number;
  totalStudents: number;
}

export interface DiagnosticHeatmapProps {
  kcStats?: KCMasteryStat[];
  misconceptionStats?: MisconceptionStat[];
  totalStudents?: number;
  classAverageMastery?: number;
  mostPrevalentMisconception?: string | null;
  classNameTitle?: string;
}

export const DiagnosticHeatmap: React.FC<DiagnosticHeatmapProps> = ({
  kcStats = [],
  misconceptionStats = [],
  totalStudents = 0,
  classAverageMastery = 0,
  mostPrevalentMisconception = null,
  classNameTitle = "کلاس ریاضی پایه چهارم",
}) => {
  const hasData = totalStudents > 0 && kcStats.length > 0;

  const calculatedAvgMastery =
    classAverageMastery ||
    (kcStats.length > 0
      ? Math.round(kcStats.reduce((acc, k) => acc + k.averageMastery, 0) / kcStats.length)
      : 0);

  const dominantMisconception =
    mostPrevalentMisconception ||
    (misconceptionStats.length > 0 && misconceptionStats[0].detectedCount > 0
      ? misconceptionStats[0].title
      : "موردی ثبت نشده است");

  if (!hasData) {
    return (
      <div className="w-full bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 text-center select-none animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
          هنوز اطلاعاتی برای این کلاس ثبت نشده است
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          به محض اینکه دانش‌آموزان در بخش آزمون تشخیصی کسرها شرکت کنند، نمودار تسلط سرفصل‌ها و آمار بدفهمی‌ها در این میز کار نمایش داده خواهد شد.
        </p>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-4 py-2 rounded-xl">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>پایگاه داده آماده ثبت پاسخ‌های زنده دانش‌آموزان است.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 select-none animate-in fade-in duration-300">
      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">جامعه آماری:</span>
            <span className="text-sm font-bold text-slate-800">
              {classNameTitle} ({toPersianDigits(totalStudents)} دانش‌آموز)
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">میانگین تسلط کلاسی:</span>
            <span className="text-sm font-black text-emerald-700" dir="ltr">
              {toPersianDigits(calculatedAvgMastery)}٪
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">بدفهمی با بیشترین شیوع:</span>
            <span className="text-xs font-bold text-amber-900 truncate max-w-[170px] block">
              {dominantMisconception}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: KC Class Mastery Distribution */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900">میزان تسلط کلاسی به تفکیک مهارت‌های پنج‌گانه</h3>
            <p className="text-xs text-slate-500 mt-0.5">درصد تسلط کلی دانش‌آموزان در هر سرفصل تشخیصی</p>
          </div>
        </div>

        <div className="space-y-4">
          {kcStats.map((kc) => {
            const isHigh = kc.averageMastery >= 80;
            const isMedium = kc.averageMastery >= 60 && kc.averageMastery < 80;

            let barColor = "bg-rose-500";
            let badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";
            let statusLabel = "نیازمند بازتدریس";

            if (isHigh) {
              barColor = "bg-emerald-500";
              badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
              statusLabel = "تسلط مطلوب";
            } else if (isMedium) {
              barColor = "bg-amber-500";
              badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
              statusLabel = "نیازمند تمرین دست‌ورزی";
            }

            return (
              <div key={kc.id} className="text-xs">
                <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                  <span className="font-bold text-slate-800">{kc.title}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                      {statusLabel}
                    </span>
                    <span className="font-bold text-slate-900" dir="ltr">
                      {toPersianDigits(kc.averageMastery)}٪
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, kc.averageMastery))}%` }}
                  />
                </div>

                <span className="text-[11px] text-slate-400 mt-1 block">
                  {toPersianDigits(kc.masteredCount)} نفر از {toPersianDigits(kc.totalStudents)} دانش‌آموز به تسلط کامل رسیده‌اند.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Misconception Frequency & Remediation Recommendations */}
      {misconceptionStats.length > 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">نقشه شیوع بدفهمی‌ها و خطاهای مفهومی در کلاس</h3>
              <p className="text-xs text-slate-500 mt-0.5">شناسایی ریشه پاسخ‌های نادرست و راهکار مداخله آموزشی</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {misconceptionStats.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-bold text-xs text-slate-900">{item.title}</span>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0" dir="ltr">
                    {toPersianDigits(item.prevalencePercent)}٪ شیوع ({toPersianDigits(item.detectedCount)} نفر)
                  </span>
                </div>

                {/* Progress Bar of Misconception Prevalence */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, item.prevalencePercent))}%` }}
                  />
                </div>

                {/* Teacher Guidance from Curriculum Guide */}
                <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <b className="text-slate-900">راهکار مداخله پیشنهادی کتاب معلم:</b> {item.recommendedAction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
