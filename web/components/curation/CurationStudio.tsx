"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, Eye, ShieldCheck, Check, BarChart3, ListFilter } from "lucide-react";
import { MathRenderer } from "../ui/MathRenderer";
import { FractionStrip } from "../parametric/FractionStrip";
import { NumberLine } from "../parametric/NumberLine";
import { AreaGrid } from "../parametric/AreaGrid";
import { BalanceScale } from "../parametric/BalanceScale";
import { BucketSort } from "../parametric/BucketSort";
import { DiagnosticItemData } from "../assessment/AssessmentCarousel";
import { toPersianDigits } from "../../lib/math/persian-digits";
import { DiagnosticHeatmap, KCMasteryStat, MisconceptionStat } from "./DiagnosticHeatmap";
import { StudentMasteryMatrixRow } from "../../actions/analytics";

export interface CurationStudioProps {
  initialItems: DiagnosticItemData[];
  misconceptions: Array<{ id: string; title: string; counter_example_blueprint: any }>;
  subjectTitle?: string;
  kcStats?: KCMasteryStat[];
  misconceptionStats?: MisconceptionStat[];
  totalStudents?: number;
  classAverageMastery?: number;
  mostPrevalentMisconception?: string | null;
  matrixStudents?: StudentMasteryMatrixRow[];
  classrooms?: Array<{
    id: string;
    name: string;
    schoolName: string | null;
    gradeLevel: number;
    studentsCount: number;
  }>;
}

export const CurationStudio: React.FC<CurationStudioProps> = ({
  initialItems,
  misconceptions,
  subjectTitle = "فصل ۲: کسرها (پایه چهارم دبستان)",
  kcStats = [],
  misconceptionStats = [],
  totalStudents = 0,
  classAverageMastery = 0,
  mostPrevalentMisconception = null,
  matrixStudents = [],
  classrooms = [],
}) => {
  const [items, setItems] = useState<DiagnosticItemData[]>(initialItems);
  const [viewMode, setViewMode] = useState<"questions" | "heatmap">("questions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [revisionIds, setRevisionIds] = useState<Set<string>>(new Set());

  const currentItem = items[selectedIndex];

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setRevisionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedIndex + 1 < items.length) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const handleRequestRevision = (id: string) => {
    setRevisionIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setApprovedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const renderVisualTemplate = () => {
    if (!currentItem.visual_template) return null;
    const { type, props } = currentItem.visual_template;

    switch (type) {
      case "FractionStrip":
        return <FractionStrip {...props} hideCounter={true} />;
      case "NumberLine":
        return <NumberLine {...props} hideFractions={true} />;
      case "AreaGrid":
        return <AreaGrid {...props} hideBadge={true} />;
      case "BalanceScale":
        return <BalanceScale {...props} />;
      case "BucketSort":
        return <BucketSort {...props} />;
      default:
        return null;
    }
  };

  const isApproved = approvedIds.has(currentItem.id);
  const isRevision = revisionIds.has(currentItem.id);

  return (
    <div className="w-full max-w-4xl mx-auto py-2 select-none">
      {/* Top Bar for Teachers */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            میز کار آموزگار و بازبینی سوالات
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-2">{subjectTitle}</h2>
          <p className="text-xs text-slate-500">
            تایید نهایی سوالات، تحلیل بدفهمی‌ها و رصد میزان تسلط دانش‌آموزان
          </p>
        </div>

        {/* View Switcher: Questions vs Heatmap */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {toPersianDigits(approvedIds.size)} از {toPersianDigits(items.length)} سوال تایید شده
          </span>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode("questions")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "questions"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>سوالات ({toPersianDigits(items.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("heatmap")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "heatmap"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>نقشه حرارتی کلاس</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "heatmap" ? (
        <DiagnosticHeatmap
          kcStats={kcStats}
          misconceptionStats={misconceptionStats}
          totalStudents={totalStudents}
          classAverageMastery={classAverageMastery}
          mostPrevalentMisconception={mostPrevalentMisconception}
          matrixStudents={matrixStudents}
          classrooms={classrooms}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Questions List (Mobile horizontal scroll / Tablet list) */}
        <div className="md:col-span-4 bg-white border-2 border-slate-200 rounded-3xl p-3 shadow-xs flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px]">
          {items.map((item, idx) => {
            const approved = approvedIds.has(item.id);
            const revision = revisionIds.has(item.id);
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`shrink-0 md:w-full text-right p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                    سوال شماره {toPersianDigits(idx + 1)}
                  </span>
                </div>

                {approved && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {revision && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Question Preview & Pedagogical Inspector */}
        <div className="md:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header of Item */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-500">
                پیش‌نمایش زنده در دستگاه دانش‌آموز (سوال {toPersianDigits(selectedIndex + 1)})
              </span>
              <div className="flex gap-2">
                {isApproved && (
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> تایید شده
                  </span>
                )}
                {isRevision && (
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> نیاز به بازنویسی
                  </span>
                )}
              </div>
            </div>

            {/* Question Stem */}
            <div className="text-base font-bold text-slate-900 mb-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <MathRenderer content={currentItem.stem} />
            </div>

            {/* Visual Template Preview */}
            <div className="my-3 flex justify-center bg-slate-50/50 p-3 rounded-2xl border border-slate-200">
              {renderVisualTemplate()}
            </div>

            {/* Distractor Rationale Analysis for Teachers */}
            <h4 className="text-xs font-bold text-slate-700 mt-4 mb-2">
              تحلیل آموزشی گزینه‌ها و بدفهمی‌های هدف:
            </h4>
            <div className="space-y-2">
              {currentItem.distractors.map((dis) => (
                <div
                  key={dis.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    dis.is_correct
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                      : dis.misconception_id
                      ? "bg-amber-50/60 border-amber-200 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span className="font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                    {dis.label}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-0.5">
                      <MathRenderer content={dis.content} />
                    </div>
                    {dis.rationale && (
                      <p className="text-[11px] opacity-90 leading-relaxed mt-1">
                        {dis.rationale}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Decision Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 justify-between items-center">
            <button
              type="button"
              onClick={() => handleRequestRevision(currentItem.id)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 active:scale-98 transition-all cursor-pointer"
            >
              <AlertCircle className="w-4 h-4" />
              <span>علامت‌گذاری برای ویرایش یا تغییر</span>
            </button>

            <button
              type="button"
              onClick={() => handleApprove(currentItem.id)}
              className="min-h-[46px] flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تایید نهایی و آماده انتشار</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
