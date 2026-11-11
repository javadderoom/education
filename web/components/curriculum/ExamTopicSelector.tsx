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
  Calculator,
  Users,
  X,
  Share2
} from "lucide-react";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  TopicMetadata, 
  getSubjectTaxonomy 
} from "@/lib/data/curriculum-taxonomy";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { ActiveExamSession } from "@/lib/store/exam-storage";
import { joinClassroomAction } from "@/actions/auth";

export interface ExamTopicSelectorProps {
  initialSubjectId?: string;
  initialSelectedTopicIds?: string[];
  onStartExam: (subjectId: string, selectedTopicIds: string[]) => void;
  onCancel?: () => void;
  isModal?: boolean;
  activeExamSession?: ActiveExamSession | null;
  onResumeExam?: () => void;
  onDiscardExam?: () => void;
}

export const ExamTopicSelector: React.FC<ExamTopicSelectorProps> = ({
  initialSubjectId = "SUBJ-MATH4-FRACTIONS",
  initialSelectedTopicIds,
  onStartExam,
  onCancel,
  isModal = false,
  activeExamSession,
  onResumeExam,
  onDiscardExam,
}) => {
  const { openSelector, selectedSubjectId: storeSubjectId } = useCurriculumStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || storeSubjectId || "SUBJ-MATH4-FRACTIONS"
  );

  React.useEffect(() => {
    if (initialSubjectId && initialSubjectId !== selectedSubjectId) {
      setSelectedSubjectId(initialSubjectId);
      const nextTaxonomy = getSubjectTaxonomy(initialSubjectId);
      setSelectedTopicIds(nextTaxonomy.topics.map((t) => t.id));
    }
  }, [initialSubjectId]);

  React.useEffect(() => {
    if (initialSelectedTopicIds && initialSelectedTopicIds.length > 0) {
      setSelectedTopicIds(initialSelectedTopicIds);
    }
  }, [initialSelectedTopicIds]);

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

  // Classroom Join State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinStatus, setJoinStatus] = useState<{ loading: boolean; error?: string; successName?: string } | null>(null);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoinStatus({ loading: true });
    const res = await joinClassroomAction(joinCodeInput.trim());
    if (res.success) {
      setJoinStatus({ loading: false, successName: res.classroomName });
      setJoinCodeInput("");
    } else {
      setJoinStatus({ loading: false, error: res.error });
    }
  };

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

  // Dynamic adaptive questions count (target 2 items per selected KC, minimum 4)
  const adaptiveQuestionCount = useMemo(
    () => (activeTopics.length > 0 ? Math.max(4, activeTopics.length * 2) : 0),
    [activeTopics.length]
  );

  const totalEstimatedMinutes = useMemo(
    () => (adaptiveQuestionCount > 0 ? Math.round(adaptiveQuestionCount * 1.5) : 0),
    [adaptiveQuestionCount]
  );

  const isCh3 = selectedSubjectId.includes("CH03") || selectedSubjectId.includes("CH3");
  const isGrade5 = selectedSubjectId.includes("5") || selectedSubjectId.includes("RATIO");
  const CourseIcon = isCh3 ? Calculator : isGrade5 ? Scale : SplitSquareVertical;
  const isAllSelected = selectedTopicIds.length === taxonomy.topics.length;
  const isNoneSelected = selectedTopicIds.length === 0;

  return (
    <div className={`w-full max-w-3xl mx-auto select-none ${isModal ? "p-4" : "pt-4 sm:pt-6 px-2 pb-48 sm:pb-52"} animate-in fade-in duration-300`}>
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

      {/* 1. Active Curriculum Context Banner - Single Source of Truth */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-2xs shrink-0 ${
              isCh3 ? "bg-amber-600" : isGrade5 ? "bg-emerald-600" : "bg-indigo-600"
            }`}
          >
            <CourseIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isCh3
                    ? "bg-amber-100 text-amber-800"
                    : isGrade5
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                پایه {toPersianDigits(taxonomy.gradeLevel)} دبستان
              </span>
              <h2 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                {taxonomy.title}: {taxonomy.chapterTitle}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{taxonomy.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              setShowJoinModal(true);
              setJoinStatus(null);
            }}
            className="min-h-[40px] px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer justify-center flex-1 sm:flex-initial"
            title="پیوستن به کلاس آموزگار با کد"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>پیوستن به کلاس</span>
          </button>

          <button
            type="button"
            onClick={openSelector}
            className="min-h-[40px] px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 justify-center flex-1 sm:flex-initial"
            title="تغییر کتاب یا پایه تحصیلی"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>تغییر کتاب یا پایه</span>
          </button>
        </div>
      </div>

      {/* Active In-Progress Exam Resume Banner */}
      {activeExamSession && activeExamSession.history && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-amber-950">
                آزمون در حال اجرا دارید
              </h3>
              <p className="text-[11px] text-amber-800">
                پاسخ داده شده:{" "}
                <span className="font-bold font-mono" dir="ltr">
                  {toPersianDigits(activeExamSession.history.length)}
                </span>{" "}
                از{" "}
                <span className="font-bold font-mono" dir="ltr">
                  {toPersianDigits(activeExamSession.targetSessionLimit)}
                </span>{" "}
                سوال
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onResumeExam && (
              <button
                type="button"
                onClick={onResumeExam}
                className="flex-1 sm:flex-initial min-h-[38px] px-4 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ادامه آزمون</span>
              </button>
            )}
            {onDiscardExam && (
              <button
                type="button"
                onClick={onDiscardExam}
                className="flex-1 sm:flex-initial min-h-[38px] px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>شروع مجدد</span>
              </button>
            )}
          </div>
        </div>
      )}

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
                      aria-label={
                        isCategoryFull
                          ? "کل بخش انتخاب شد"
                          : isCategoryPartial
                          ? `${toPersianDigits(selectedCount)} از ${toPersianDigits(categoryTopics.length)} سرفصل انتخاب شده`
                          : "انتخاب کل بخش"
                      }
                      title={isCategoryFull ? "لغو انتخاب سرفصل‌های این بخش" : "انتخاب تمام سرفصل‌های این بخش"}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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
                        {isCategoryFull ? (
                          <>
                            <span className="hidden sm:inline">کل بخش انتخاب شد</span>
                            <span className="sm:hidden">همه</span>
                          </>
                        ) : isCategoryPartial ? (
                          `${toPersianDigits(selectedCount)} از ${toPersianDigits(categoryTopics.length)}`
                        ) : (
                          <>
                            <span className="hidden sm:inline">انتخاب کل بخش</span>
                            <span className="sm:hidden">انتخاب همه</span>
                          </>
                        )}
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

      {/* 4. Sticky Bottom Floating Summary Bar - Elevated Above BottomNav */}
      <div
        className={
          isModal
            ? "sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-30"
            : "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-20 left-0 right-0 z-30 flex justify-center pointer-events-none px-3"
        }
      >
        <div
          className={
            isModal
              ? "max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"
              : "w-full max-w-xl md:max-w-3xl lg:max-w-4xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3"
          }
        >
          {/* Summary Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-tight">سرفصل‌های انتخابی:</span>
                <span className="text-xs font-black text-slate-800">
                  {toPersianDigits(activeTopics.length)} از {toPersianDigits(taxonomy.topics.length)} مبحث
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block leading-tight">تعداد سوالات آزمون:</span>
              <span className="text-xs font-black text-indigo-700">
                {toPersianDigits(adaptiveQuestionCount)} سوال تشخیصی
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block leading-tight">زمان تقریبی:</span>
              <span className="text-xs font-bold text-slate-700">
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
                className="min-h-[44px] py-2.5 px-4 rounded-xl sm:rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
            )}

            <button
              type="button"
              disabled={isNoneSelected}
              onClick={() => onStartExam(selectedSubjectId, selectedTopicIds)}
              className={`flex-1 sm:flex-initial min-h-[44px] py-3 px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
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
                  : `شروع آزمون با ${toPersianDigits(adaptiveQuestionCount)} سوال`}
              </span>
              {!isNoneSelected && <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-md w-full select-none animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">پیوستن به کلاس آموزگار</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {joinStatus?.successName ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950">
                  شما با موفقیت به «{joinStatus.successName}» پیوستید!
                </h4>
                <p className="text-xs text-emerald-800">
                  از این پس نتایج ارزیابی شما در میز کار آموزگارتان قابل مشاهده و راهنمایی خواهد بود.
                </p>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-full min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  متوجه شدم
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinClass} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  کد کلاسی را که آموزگارتان به شما داده است وارد کنید:
                </p>

                <div>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="مثال: CLASS-GRADE4-A"
                    className="w-full text-center font-mono uppercase tracking-wider py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 text-sm font-bold bg-slate-50 focus:bg-white transition-all"
                    dir="ltr"
                    required
                  />
                </div>

                {joinStatus?.error && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                    {joinStatus.error}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={joinStatus?.loading || !joinCodeInput.trim()}
                    className="flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{joinStatus?.loading ? "در حال بررسی..." : "ثبت و عضویت در کلاس"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="min-h-[44px] px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
