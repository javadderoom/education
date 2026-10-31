"use client";

import React from "react";
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, Users } from "lucide-react";
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
  classNameTitle?: string;
}

export const DiagnosticHeatmap: React.FC<DiagnosticHeatmapProps> = ({
  kcStats = [
    {
      id: "KC-MATH4-C02-01",
      title: "شناخت مفهوم کسر به عنوان جزء از کل و تفکیک واحد",
      averageMastery: 84,
      masteredCount: 21,
      totalStudents: 25,
    },
    {
      id: "KC-MATH4-C02-02",
      title: "شناخت و تولید کسرهای مساوی با ضرب یا تقسیم",
      averageMastery: 68,
      masteredCount: 17,
      totalStudents: 25,
    },
    {
      id: "KC-MATH4-C02-03",
      title: "مقایسه کسرها با مخرج‌های مساوی یا نامساوی",
      averageMastery: 72,
      masteredCount: 18,
      totalStudents: 25,
    },
    {
      id: "KC-MATH4-C02-04",
      title: "جمع و تفریق کسرهای هم‌مخرج و حفظ مخرج مشترک",
      averageMastery: 52,
      masteredCount: 13,
      totalStudents: 25,
    },
    {
      id: "KC-MATH4-C02-05",
      title: "نمایش کسرها و فواصل روی محور اعداد",
      averageMastery: 60,
      masteredCount: 15,
      totalStudents: 25,
    },
  ],
  misconceptionStats = [
    {
      id: "MIS-ADD-NUM-DEN",
      title: "جمع همزمان صورت‌ها و مخرج‌ها با یکدیگر",
      prevalencePercent: 36,
      detectedCount: 9,
      recommendedAction: "تمرین دست‌ورزی با نوارهای تاخورده ۵ یا ۸ قسمتی برای تثبیت عدم تغییر اندازه واحد در جمع.",
    },
    {
      id: "MIS-BIGGER-DEN-BIGGER-VAL",
      title: "پنداشت اینکه مخرج بزرگتر نشان‌دهنده کسر بزرگتر است",
      prevalencePercent: 28,
      detectedCount: 7,
      recommendedAction: "استفاده از ترازوی مقایسه و شبیه‌سازی برش کیک مساوی بین افراد بیشتر.",
    },
    {
      id: "MIS-NUMBERLINE-TICK-COUNT",
      title: "شمارش خطوط تقسیم به جای فواصل روی محور اعداد",
      prevalencePercent: 24,
      detectedCount: 6,
      recommendedAction: "رنگ‌آمیزی بازه‌های بین خطوط روی محور برای تفکیک خط نشانه‌گذاری از فاصله پیموده‌شده.",
    },
    {
      id: "MIS-NUM-AS-SEPARATE-INTS",
      title: "تلقی صورت و مخرج به عنوان دو عدد مستقل (افزودن عدد ثابت)",
      prevalencePercent: 16,
      detectedCount: 4,
      recommendedAction: "بررسی تساوی مساحت‌ها در شبکه مستطیلی برای نمایش عدم تساوی پس از جمع ثابت.",
    },
    {
      id: "MIS-UNEQUAL-PARTITIONS",
      title: "نادیده گرفتن شرط برابری قطعات در تعریف کسر",
      prevalencePercent: 12,
      detectedCount: 3,
      recommendedAction: "برش اشکال نامتقارن و نامساوی و تاکید بر تعریف مساحت‌های هم‌اندازه.",
    },
  ],
  classNameTitle = "کلاس چهارم الف (۲۵ دانش‌آموز)",
}) => {
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
            <span className="text-sm font-bold text-slate-800">{classNameTitle}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">میانگین تسلط کلاسی:</span>
            <span className="text-sm font-black text-emerald-700 font-mono" dir="ltr">
              {toPersianDigits(67)}٪
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
              جمع همزمان صورت و مخرج
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
                    <span className="font-mono font-bold text-slate-900" dir="ltr">
                      {toPersianDigits(kc.averageMastery)}٪
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${kc.averageMastery}%` }}
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
                <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0" dir="ltr">
                  {toPersianDigits(item.prevalencePercent)}٪ شیوع ({toPersianDigits(item.detectedCount)} نفر)
                </span>
              </div>

              {/* Progress Bar of Misconception Prevalence */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.prevalencePercent}%` }}
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
    </div>
  );
};
