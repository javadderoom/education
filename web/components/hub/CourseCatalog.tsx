"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowLeft, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  SplitSquareVertical, 
  Calculator, 
  Scale, 
  Clock, 
  CheckCircle2,
  Layers
} from "lucide-react";
import { CANONICAL_TAXONOMIES, SubjectTaxonomy } from "@/lib/data/curriculum-taxonomy";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export interface CourseCatalogProps {
  initialGradeFilter?: number | "all";
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ initialGradeFilter = "all" }) => {
  const { setSubject, openSelector } = useCurriculumStore();
  const [gradeFilter, setGradeFilter] = useState<number | "all">(initialGradeFilter);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const allCourses: SubjectTaxonomy[] = Object.values(CANONICAL_TAXONOMIES);
  const grade4Count = allCourses.filter((c) => c.gradeLevel === 4).length;
  const grade5Count = allCourses.filter((c) => c.gradeLevel === 5).length;

  const filteredCourses = allCourses.filter((course) => {
    if (gradeFilter === "all") return true;
    return course.gradeLevel === gradeFilter;
  });

  const getCourseBadge = (courseId: string) => {
    if (courseId === "SUBJ-MATH5-RATIO") return "فصل جدید";
    if (courseId === "SUBJ-MATH4-FRACTIONS" || courseId === "SUBJ-MATH4-CH01") return "مفاهیم پایه";
    if (courseId.includes("CH06") || courseId.includes("GEOM")) return "هندسی";
    if (courseId.includes("CH07") || courseId.includes("STAT")) return "آمار و احتمال";
    return "محاسباتی";
  };

  const getCourseIcon = (courseId: string, grade: number) => {
    if (courseId.includes("CH03") || courseId.includes("MULT")) return Calculator;
    if (courseId.includes("CH06") || courseId.includes("GEOM")) return Layers;
    if (courseId.includes("CH07") || courseId.includes("STAT")) return Sparkles;
    if (grade === 5) return Scale;
    return SplitSquareVertical;
  };

  const getCourseTheme = (courseId: string, grade: number) => {
    if (courseId.includes("CH03")) {
      return {
        badge: "bg-amber-100 text-amber-800",
        border: "border-amber-200 hover:border-amber-400 bg-amber-50/20",
        btn: "bg-amber-600 hover:bg-amber-700 text-white",
        iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (grade === 5) {
      return {
        badge: "bg-emerald-100 text-emerald-800",
        border: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/20",
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
        iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    return {
      badge: "bg-indigo-100 text-indigo-800",
      border: "border-indigo-200 hover:border-indigo-400 bg-indigo-50/20",
      btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
      iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  };

  // Helper title for tests / display
  const getDisplayTitle = (sub: SubjectTaxonomy) => {
    if (sub.id === "SUBJ-MATH4-CH01") return "ریاضی چهارم: اعداد و الگوها";
    if (sub.id === "SUBJ-MATH4-FRACTIONS") return "ریاضی چهارم: مفهوم و محاسبات کسرها";
    if (sub.id === "SUBJ-MATH4-CH03") return "ریاضی چهارم: ضرب و تقسیم";
    if (sub.id === "SUBJ-MATH4-CH04") return "ریاضی چهارم: اندازه‌گیری";
    if (sub.id === "SUBJ-MATH4-CH05") return "ریاضی چهارم: عدد مخلوط و اعشار";
    if (sub.id === "SUBJ-MATH4-CH06") return "ریاضی چهارم: شکل‌های هندسی";
    if (sub.id === "SUBJ-MATH4-CH07") return "ریاضی چهارم: آمار و احتمال";
    if (sub.id === "SUBJ-MATH5-RATIO") return "ریاضی پنجم: نسبت، تناسب و درصد";
    return `${sub.title}: ${sub.chapterTitle}`;
  };

  return (
    <div className="mb-8">
      {/* Section Header & Grade Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>کتاب‌ها و سرفصل‌های درسی برگزیده:</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            فصل‌های شاخص برای شروع سریع، یا انتخاب سایر پایه‌ها و کتاب‌ها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Grade Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setGradeFilter("all")}
              className={`py-1 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                gradeFilter === "all"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              همه ({toPersianDigits(allCourses.length)})
            </button>
            <button
              type="button"
              onClick={() => setGradeFilter(4)}
              className={`py-1 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                gradeFilter === 4
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              چهارم ({toPersianDigits(grade4Count)})
            </button>
            <button
              type="button"
              onClick={() => setGradeFilter(5)}
              className={`py-1 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                gradeFilter === 5
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              پنجم ({toPersianDigits(grade5Count)})
            </button>
          </div>

          {/* Master Selector Button */}
          <button
            type="button"
            onClick={openSelector}
            className="min-h-[34px] px-3 py-1 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 shrink-0"
            title="مشاهده همه کتاب‌ها و پایه‌ها"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>همه پایه‌ها و کتاب‌ها</span>
          </button>
        </div>
      </div>

      {/* Courses Cards: Swipeable Carousel on Mobile, Responsive 3-col Grid on Desktop */}
      <div className="flex overflow-x-auto pb-4 pt-1 px-1 -mx-1 gap-3.5 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:p-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {filteredCourses.map((course) => {
          const Icon = getCourseIcon(course.id, course.gradeLevel);
          const theme = getCourseTheme(course.id, course.gradeLevel);
          const isExpanded = expandedCourseId === course.id;
          const displayTitle = getDisplayTitle(course);
          const badgeText = getCourseBadge(course.id);

          return (
            <div
              key={course.id}
              className={`w-[85vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink border-2 rounded-3xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between bg-white ${theme.border}`}
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                      پایه {toPersianDigits(course.gradeLevel)} دبستان
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {badgeText}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {toPersianDigits(course.topics.length)} سرفصل
                  </span>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-2xs shrink-0 ${theme.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                      {displayTitle}
                    </h2>
                    <span className="text-[11px] text-slate-500 font-semibold">{course.chapterTitle}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {course.description}
                </p>

                {/* Expandable Topic Outline Preview */}
                <button
                  type="button"
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                  className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded-xl mb-3 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>سرفصل‌های شناختی این فصل ({toPersianDigits(course.topics.length)})</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 mb-3 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100 animate-in fade-in">
                    {course.topics.map((t, idx) => (
                      <div key={t.id} className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-snug">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{t.shortTitle}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 mt-2">
                <Link
                  href={`/student?subject=${course.id}`}
                  onClick={() => setSubject(course.id)}
                  className={`min-h-[42px] flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-xl shadow-xs transition-all text-center ${theme.btn}`}
                >
                  <span>شروع آزمون</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/student/workshop?subject=${course.id}`}
                  onClick={() => setSubject(course.id)}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2 px-2.5 rounded-xl transition-all text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>کارگاه دست‌ورزی</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Swipe Hint & Quick Action */}
      <div className="flex md:hidden items-center justify-between text-[11px] text-slate-500 font-medium px-2 mt-1">
        <span className="flex items-center gap-1">
          <span>برای سایر درس‌ها ورق بزنید</span>
          <ArrowLeft className="w-3 h-3 text-slate-400" />
        </span>
        <button
          type="button"
          onClick={openSelector}
          className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>فهرست کامل پایه‌ها</span>
          <ArrowLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
