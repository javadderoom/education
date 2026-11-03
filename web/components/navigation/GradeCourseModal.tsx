"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Check, 
  SplitSquareVertical, 
  Calculator, 
  Scale, 
  Layers,
  Search,
  ChevronLeft,
  School,
  Building2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  getSubjectsByGrade, 
  getAvailableGrades 
} from "@/lib/data/curriculum-taxonomy";
import { toPersianDigits } from "@/lib/math/persian-digits";

export interface EducationalStage {
  id: string;
  label: string;
  icon: React.ElementType;
}

const EDUCATIONAL_STAGES: EducationalStage[] = [
  { id: "all", label: "همه دوره‌ها و پایه‌ها", icon: Layers },
  { id: "elementary2", label: "دوره دوم ابتدایی (۴ تا ۶)", icon: School },
  { id: "elementary1", label: "دوره اول ابتدایی (۱ تا ۳)", icon: School },
  { id: "middle", label: "متوسطه اول (۷ تا ۹)", icon: GraduationCap },
  { id: "high", label: "متوسطه دوم و کنکور (۱۰ تا ۱۲)", icon: GraduationCap },
  { id: "higher_ed", label: "دانشگاه و تخصص‌ها", icon: Building2 },
];

export const GradeCourseModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    selectedGrade, 
    selectedSubjectId, 
    isSelectorOpen, 
    closeSelector, 
    setSubject,
    tierDefinitions,
    treeNodes,
  } = useCurriculumStore();

  const tier1 = tierDefinitions?.find((t) => t.depth === 1);
  const tier2 = tierDefinitions?.find((t) => t.depth === 2);
  const tier3 = tierDefinitions?.find((t) => t.depth === 3);

  // Active Grade / Major Tab inside modal
  const [activeGradeTab, setActiveGradeTab] = useState<number>(selectedGrade);
  // Period / Stage Filter
  const [activeStage, setActiveStage] = useState<string>("all");
  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Mobile step toggler: 1 = Grade Selection, 2 = Course/Chapter Selection
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isSelectorOpen) {
      setActiveGradeTab(selectedGrade);
      setSearchQuery("");
      setMobileStep(1);
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

  // Canonical grades + dynamic database grades
  const availableGrades = getAvailableGrades();
  const allSubjects: SubjectTaxonomy[] = Object.values(CANONICAL_TAXONOMIES);

  // Helper title for Grade
  const getGradeTitle = (grade: number) => {
    if (grade === 4) return "پایه چهارم دبستان";
    if (grade === 5) return "پایه پنجم دبستان";
    if (grade === 6) return "پایه ششم دبستان";
    if (grade <= 6) return `پایه ${toPersianDigits(grade)} ابتدایی`;
    if (grade <= 9) return `پایه ${toPersianDigits(grade)} متوسطه اول`;
    return `پایه ${toPersianDigits(grade)} متوسطه دوم`;
  };

  const getGradeSubtitle = (grade: number) => {
    const subs = getSubjectsByGrade(grade);
    if (subs.length > 0) {
      return subs.map((s) => s.chapterTitle.replace(/^فصل\s+[^\:]+\:\s*/, "")).join("، ");
    }
    return `${toPersianDigits(subs.length)} کتاب و سرفصل آموزشی`;
  };

  // Filter grades based on stage and search
  const filteredGrades = availableGrades.filter((grade) => {
    // Stage filtering
    if (activeStage === "elementary2" && (grade < 4 || grade > 6)) return false;
    if (activeStage === "elementary1" && grade > 3) return false;
    if (activeStage === "middle" && (grade < 7 || grade > 9)) return false;
    if (activeStage === "high" && (grade < 10 || grade > 12)) return false;
    if (activeStage === "higher_ed" && grade <= 12) return false;

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const title = getGradeTitle(grade).toLowerCase();
      const subtitle = getGradeSubtitle(grade).toLowerCase();
      const subs = getSubjectsByGrade(grade);
      const subMatches = subs.some(
        (s) => s.title.toLowerCase().includes(q) || s.chapterTitle.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
      return title.includes(q) || subtitle.includes(q) || subMatches;
    }
    return true;
  });

  // Chapters for the currently active grade
  const gradeChapters = getSubjectsByGrade(activeGradeTab);

  // Filter chapters if search query is present
  const displayedChapters = searchQuery.trim()
    ? allSubjects.filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.title.toLowerCase().includes(q) ||
          s.chapterTitle.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
        );
      })
    : gradeChapters;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={closeSelector} 
        aria-hidden="true" 
      />

      <div 
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب پایه و کتاب درسی"
        className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Top Header: Title, Search Bar & Close */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  انتخاب پایه، رشته و سرفصل آموزشی
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  پایه یا دوره مدنظر خود را برگزینید تا کتاب‌ها و فصل‌های فعال نمایش داده شوند
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSelector}
              className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search & Filter Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع در نام پایه‌ها، رشته‌ها، کتاب‌ها یا مباحث درسی..."
              className="w-full pl-3 pr-10 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Educational Period / Stage Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none no-scrollbar">
            {EDUCATIONAL_STAGES.map((stg) => {
              const Icon = stg.icon;
              const isActive = activeStage === stg.id;
              return (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => {
                    setActiveStage(stg.id);
                    setSearchQuery("");
                  }}
                  className={`py-1 px-2.5 sm:px-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Step Toggler (only visible on mobile screens < 640px) */}
          <div className="grid grid-cols-2 gap-2 sm:hidden pt-1">
            <button
              type="button"
              onClick={() => setMobileStep(1)}
              className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                mobileStep === 1
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>مرحله ۱: انتخاب پایه</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileStep(2)}
              className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                mobileStep === 2
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مرحله ۲: کتاب و فصل</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Master-Detail Two Column View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100">
          
          {/* RIGHT PANE: Master List of Grades / Majors (38% on Desktop) */}
          <div className={`sm:col-span-5 p-3 sm:p-4 overflow-y-auto space-y-2 bg-slate-50/40 ${
            mobileStep === 2 ? "hidden sm:block" : "block"
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>مرحله ۱: انتخاب {tier1?.title || "پایه تحصیلی"}:</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {toPersianDigits(filteredGrades.length)} پایه
              </span>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                پایه‌ای منطبق با جستجو یافت نشد.
              </div>
            ) : (
              filteredGrades.map((grade) => {
                const isSelected = activeGradeTab === grade;
                const chapterCount = getSubjectsByGrade(grade).length;
                const title = getGradeTitle(grade);
                const subtitle = getGradeSubtitle(grade);

                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => {
                      setActiveGradeTab(grade);
                      setMobileStep(2); // On mobile, automatically advance to chapters view
                    }}
                    className={`w-full text-right p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? grade === 5
                          ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                          : "border-indigo-500 bg-indigo-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? grade === 5 ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {toPersianDigits(grade)}
                      </div>

                      <div className="min-w-0">
                        <span className="font-black text-xs sm:text-sm text-slate-900 block truncate">
                          {title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5">
                          {subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mr-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? grade === 5 ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {toPersianDigits(chapterCount)} فصل
                      </span>
                      <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-300"
                      }`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* LEFT PANE: Detail List of Courses & Chapters (62% on Desktop) */}
          <div className={`sm:col-span-7 p-3 sm:p-5 overflow-y-auto space-y-3 bg-white ${
            mobileStep === 1 ? "hidden sm:block" : "block"
          }`}>
            {/* Header / Mobile Back Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {mobileStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setMobileStep(1)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 sm:hidden cursor-pointer"
                    title="بازگشت به انتخاب پایه"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>
                      {searchQuery
                        ? `نتایج جستجو برای «${searchQuery}»:`
                        : "مرحله ۲: انتخاب کتاب و فصل درسی:"}
                    </span>
                    {!searchQuery && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                        {activeGradeTab === 4 ? "پایه ۴" : activeGradeTab === 5 ? "پایه ۵" : `پایه ${toPersianDigits(activeGradeTab)}`}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {toPersianDigits(displayedChapters.length)} گزینه در دسترس
                  </span>
                </div>
              </div>
            </div>

            {/* Chapters Cards */}
            <div className="space-y-2.5">
              {displayedChapters.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  هیچ فصلی برای این انتخاب یافت نشد.
                </div>
              ) : (
                displayedChapters.map((chapter) => {
                  const isCurrentActive = selectedSubjectId === chapter.id;
                  const Icon = getChapterIcon(chapter.id, chapter.gradeLevel);

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => handleSelectChapter(chapter.id)}
                      className={`w-full text-right p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrentActive
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isCurrentActive 
                            ? "bg-indigo-600 text-white shadow-2xs" 
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-slate-900">
                              {chapter.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {chapter.chapterTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
                            {chapter.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mr-2">
                        <span className="text-[11px] font-bold text-slate-400 hidden md:inline">
                          {toPersianDigits(chapter.topics.length)} سرفصل
                        </span>

                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                          isCurrentActive
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                        }`}>
                          <Check className="w-4 h-4 stroke-3" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">انتخاب شما به صورت خودکار در تمام صفحات ذخیره می‌گردد.</span>
          <button
            type="button"
            onClick={closeSelector}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};
