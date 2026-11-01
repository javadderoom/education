"use client";

import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Square, 
  Check, 
  Sparkles, 
  Clock, 
  ArrowLeft, 
  SplitSquareVertical, 
  Scale,
  RotateCcw,
  ListChecks,
  Compass,
  Calculator
} from "lucide-react";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  TopicMetadata, 
  getSubjectTaxonomy 
} from "@/lib/data/curriculum-taxonomy";
import { toPersianDigits } from "@/lib/math/persian-digits";

export interface ExamTopicSelectorProps {
  initialSubjectId?: string;
  initialSelectedTopicIds?: string[];
  onStartExam: (subjectId: string, selectedTopicIds: string[]) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const ExamTopicSelector: React.FC<ExamTopicSelectorProps> = ({
  initialSubjectId = "SUBJ-MATH4-FRACTIONS",
  initialSelectedTopicIds,
  onStartExam,
  onCancel,
  isModal = false,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const taxonomy: SubjectTaxonomy = useMemo(
    () => getSubjectTaxonomy(selectedSubjectId),
    [selectedSubjectId]
  );

  // Initialize selected topics: if initial provided for this subject use it, otherwise default to all
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(() => {
    if (initialSelectedTopicIds && initialSelectedTopicIds.length > 0) {
      return initialSelectedTopicIds;
    }
    return taxonomy.topics.map((t) => t.id);
  });

  // Handle switching course
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const nextTaxonomy = getSubjectTaxonomy(subjectId);
    setSelectedTopicIds(nextTaxonomy.topics.map((t) => t.id));
  };

  // Toggle single topic
  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Toggle whole category (batch selection)
  const toggleCategory = (categoryTopicIds: string[]) => {
    const allSelected = categoryTopicIds.every((id) => selectedTopicIds.includes(id));
    if (allSelected) {
      // Deselect category
      setSelectedTopicIds((prev) => prev.filter((id) => !categoryTopicIds.includes(id)));
    } else {
      // Select all in category
      setSelectedTopicIds((prev) => Array.from(new Set([...prev, ...categoryTopicIds])));
    }
  };

  // Preset: Select All
  const handleSelectAll = () => {
    setSelectedTopicIds(taxonomy.topics.map((t) => t.id));
  };

  // Preset: Deselect All
  const handleDeselectAll = () => {
    setSelectedTopicIds([]);
  };

  // Preset: Foundations only (Category 1)
  const handleSelectFoundations = () => {
    const foundationCat = taxonomy.chapters[0]?.categories[0];
    if (foundationCat) {
      setSelectedTopicIds(foundationCat.topicIds);
    }
  };

  // Preset: Calculations / Advanced (Categories 2 & 3)
  const handleSelectOperations = () => {
    const cats = taxonomy.chapters[0]?.categories.slice(1) || [];
    const ids = cats.flatMap((c) => c.topicIds);
    setSelectedTopicIds(ids);
  };

  // Calculate live exam metrics
  const activeTopics = useMemo(
    () => taxonomy.topics.filter((t) => selectedTopicIds.includes(t.id)),
    [taxonomy, selectedTopicIds]
  );

  const totalQuestions = useMemo(
    () => activeTopics.reduce((acc, t) => acc + t.itemCount, 0),
    [activeTopics]
  );

  const totalEstimatedMinutes = useMemo(
    () => activeTopics.reduce((acc, t) => acc + t.estimatedMinutes, 0),
    [activeTopics]
  );

  const isGrade5 = selectedSubjectId.includes("5") || selectedSubjectId.includes("RATIO");
  const isAllSelected = selectedTopicIds.length === taxonomy.topics.length;
  const isNoneSelected = selectedTopicIds.length === 0;

  return (
    <div className={`w-full max-w-3xl mx-auto select-none ${isModal ? "p-4" : "py-4 sm:py-6 px-2"} animate-in fade-in duration-300`}>
      {/* Top Banner Card */}
      <div className="bg-gradient-to-b from-indigo-50/70 via-white to-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>تنظیم هوشمند سرفصل‌های آزمون تشخیصی</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
          سرفصل‌های مورد نظر برای ارزیابی را مشخص کنید
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          می‌توانید کل فصل را انتخاب کنید یا سرفصل‌های خاصی از مباحث را جهت تمرین و سنجش هدفمند برگزینید.
        </p>
      </div>

      {/* 1. Course Selection Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2.5 px-1">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>انتخاب کتاب و فصل درسی:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(CANONICAL_TAXONOMIES).map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            const isG5 = sub.gradeLevel === 5;
            const isCh3 = sub.id === "SUBJ-MATH4-CH03";
            const Icon = isCh3 ? Calculator : isG5 ? Scale : SplitSquareVertical;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSelectSubject(sub.id)}
                className={`text-right p-3.5 sm:p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? isCh3
                      ? "border-amber-500 bg-amber-50/40 shadow-xs"
                      : isG5
                      ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                      : "border-indigo-500 bg-indigo-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-2xs shrink-0 ${
                      isSelected
                        ? isCh3
                          ? "bg-amber-600 text-white"
                          : isG5
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-black text-xs sm:text-sm text-slate-900">{sub.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isCh3 ? "bg-amber-100 text-amber-800" : isG5 ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                      }`}>
                        پایه {toPersianDigits(sub.gradeLevel)}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 line-clamp-1">{sub.chapterTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mr-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? isCh3
                          ? "bg-amber-600 border-amber-600 text-white"
                          : isG5
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Fast Batch Presets Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-1">
            <ListChecks className="w-4 h-4 text-indigo-600" />
            <span>انتخاب سریع:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAllSelected
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              انتخاب همه مباحث
            </button>

            <button
              type="button"
              onClick={handleSelectFoundations}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-indigo-500" />
              <span>مفاهیم پایه</span>
            </button>

            <button
              type="button"
              onClick={handleSelectOperations}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-indigo-500" />
              <span>محاسبات و حل مسئله</span>
            </button>

            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={isNoneSelected}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              پاک کردن
            </button>
          </div>
        </div>
      </div>

      {/* 3. Detailed Hierarchical Syllabus Tree (ریز فهرست سرفصل‌ها) */}
      <div className="space-y-4 mb-24">
        {taxonomy.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-3.5">
            {chapter.categories.map((category, catIndex) => {
              const categoryTopics = taxonomy.topics.filter((t) =>
                category.topicIds.includes(t.id)
              );
              const selectedCount = categoryTopics.filter((t) =>
                selectedTopicIds.includes(t.id)
              ).length;
              const isCategoryFull = selectedCount === categoryTopics.length;
              const isCategoryPartial = selectedCount > 0 && !isCategoryFull;

              return (
                <div
                  key={category.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs transition-all hover:border-slate-300"
                >
                  {/* Category Header with Master Batch Checkbox */}
                  <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shadow-2xs">
                        {toPersianDigits(catIndex + 1)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                          {category.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">{category.subtitle}</p>
                      </div>
                    </div>

                    {/* Master Category Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.topicIds)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCategoryFull
                          ? isGrade5
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-indigo-600 text-white shadow-2xs"
                          : isCategoryPartial
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                          : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isCategoryFull ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : isCategoryPartial ? (
                        <div className="w-3 h-3 bg-indigo-600 rounded-xs" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>
                        {isCategoryFull
                          ? "کل بخش انتخاب شد"
                          : isCategoryPartial
                          ? `${toPersianDigits(selectedCount)} از ${toPersianDigits(categoryTopics.length)}`
                          : "انتخاب کل بخش"}
                      </span>
                    </button>
                  </div>

                  {/* Subtopics List inside Category */}
                  <div className="divide-y divide-slate-100 p-1.5">
                    {categoryTopics.map((topic) => {
                      const isSelected = selectedTopicIds.includes(topic.id);

                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? isGrade5
                                ? "bg-emerald-50/50 hover:bg-emerald-50/80 text-emerald-950"
                                : "bg-indigo-50/50 hover:bg-indigo-50/80 text-indigo-950"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {/* Checkbox Icon */}
                            <div className="mt-0.5 shrink-0">
                              <div
                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? isGrade5
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                              </div>
                            </div>

                            {/* Topic Details */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`font-bold text-xs sm:text-sm leading-tight ${
                                  isSelected ? "text-slate-900" : "text-slate-800"
                                }`}>
                                  {topic.title}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {topic.description}
                              </p>
                            </div>
                          </div>

                          {/* Topic Meta Badges */}
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {topic.pedagogicalLevel}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                              {toPersianDigits(topic.itemCount)} سوال
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 4. Sticky Bottom Floating Summary Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-xl p-3 sm:p-4 z-40">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Summary Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-tight">سرفصل‌های انتخابی:</span>
                <span className="text-xs font-black text-slate-800">
                  {toPersianDigits(activeTopics.length)} از {toPersianDigits(taxonomy.topics.length)} مبحث
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block leading-tight">تعداد کل سوالات:</span>
              <span className="text-xs font-black text-indigo-700 font-mono" dir="ltr">
                {toPersianDigits(totalQuestions)} سوال تشخیصی
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block leading-tight">زمان تقریبی:</span>
              <span className="text-xs font-bold text-slate-700 font-mono" dir="ltr">
                حدود {toPersianDigits(totalEstimatedMinutes)} دقیقه
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
            )}

            <button
              type="button"
              disabled={isNoneSelected}
              onClick={() => onStartExam(selectedSubjectId, selectedTopicIds)}
              className={`flex-1 sm:flex-initial py-3 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
                isNoneSelected
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : isGrade5
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <span>
                {isNoneSelected
                  ? "حداقل یک سرفصل را انتخاب کنید"
                  : `شروع آزمون با ${toPersianDigits(totalQuestions)} سوال`}
              </span>
              {!isNoneSelected && <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
