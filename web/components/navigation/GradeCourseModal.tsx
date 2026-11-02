"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Check, 
  SplitSquareVertical, 
  Calculator, 
  Scale, 
  Sparkles,
  ArrowLeft,
  Layers
} from "lucide-react";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  getSubjectsByGrade, 
  getAvailableGrades 
} from "@/lib/data/curriculum-taxonomy";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const GradeCourseModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    selectedGrade, 
    selectedSubjectId, 
    isSelectorOpen, 
    closeSelector, 
    setSubject,
    setGrade
  } = useCurriculumStore();

  // Local active grade tab inside modal to let student explore without committing
  const [activeGradeTab, setActiveGradeTab] = useState<number>(selectedGrade);

  useEffect(() => {
    if (isSelectorOpen) {
      setActiveGradeTab(selectedGrade);
    }
  }, [isSelectorOpen, selectedGrade]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectorOpen) {
        closeSelector();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectorOpen, closeSelector]);

  if (!isSelectorOpen) return null;

  const availableGrades = getAvailableGrades();
  const gradeChapters = getSubjectsByGrade(activeGradeTab);

  const handleSelectChapter = (chapterId: string) => {
    setSubject(chapterId);
    closeSelector();

    // Preserve route while updating query parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("subject", chapterId);
      if (pathname === "/student") {
        params.delete("topics");
        params.delete("start");
      }
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    }
  };

  const getChapterIcon = (subjectId: string, grade: number) => {
    if (subjectId.includes("CH03") || subjectId.includes("MULT")) return Calculator;
    if (grade === 5) return Scale;
    return SplitSquareVertical;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={closeSelector} 
        aria-hidden="true" 
      />

      <div 
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب پایه و کتاب درسی"
        className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                انتخاب پایه و سرفصل آموزشی
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                ابتدا پایه تحصیلی، سپس کتاب و فصل مورد نظر خود را مشخص کنید
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSelector}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* 1. Step 1: Grade Selection Cards */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5 px-0.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>مرحله ۱: انتخاب پایه تحصیلی:</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableGrades.map((grade) => {
                const isSelected = activeGradeTab === grade;
                const chapterCount = getSubjectsByGrade(grade).length;

                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setActiveGradeTab(grade)}
                    className={`text-right p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? grade === 5
                          ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                          : "border-indigo-500 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        isSelected
                          ? grade === 5 ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {toPersianDigits(grade)}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? grade === 5 ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {toPersianDigits(chapterCount)} فصل فعال
                      </span>
                    </div>

                    <div>
                      <span className="font-black text-sm text-slate-900 block">
                        پایه {grade === 4 ? "چهارم" : "پنجم"} دبستان
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {grade === 4 ? "کسرها، ضرب و تقسیم" : "نسبت، تناسب و درصد"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Step 2: Book / Chapter Selection for the chosen Grade */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>مرحله ۲: انتخاب کتاب و فصل درسی (پایه {activeGradeTab === 4 ? "چهارم" : "پنجم"}):</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                {toPersianDigits(gradeChapters.length)} گزینه در دسترس
              </span>
            </div>

            <div className="space-y-2.5">
              {gradeChapters.map((chapter) => {
                const isCurrentActive = selectedSubjectId === chapter.id;
                const Icon = getChapterIcon(chapter.id, chapter.gradeLevel);

                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`w-full text-right p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isCurrentActive
                        ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrentActive 
                          ? "bg-indigo-600 text-white shadow-2xs" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">
                            {chapter.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {chapter.chapterTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1 max-w-sm sm:max-w-md">
                          {chapter.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mr-2">
                      <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                        {toPersianDigits(chapter.topics.length)} سرفصل
                      </span>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isCurrentActive
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>انتخاب شما به صورت خودکار در تمام صفحات ذخیره می‌گردد.</span>
          <button
            type="button"
            onClick={closeSelector}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};
