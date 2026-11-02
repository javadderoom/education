"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HubHero } from "./HubHero";
import { HubNavTabs, HubTabKey } from "./HubNavTabs";
import { CourseCatalog } from "./CourseCatalog";
import { AssessmentsHub } from "./AssessmentsHub";
import { MasteryOverview } from "./MasteryOverview";
import { ReportsAndWorkshops } from "./ReportsAndWorkshops";

export interface LearningHubProps {
  studentName?: string;
  masteredCount?: number;
  totalKCs?: number;
  averageMastery?: number;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  studentName,
  masteredCount = 0,
  totalKCs = 15,
  averageMastery = 0,
}) => {
  const [activeTab, setActiveTab] = useState<HubTabKey>("all");

  return (
    <div className="w-full max-w-4xl mx-auto py-3 sm:py-6 px-1 select-none animate-in fade-in duration-300">
      {/* 1. Hero Welcome Header */}
      <HubHero studentName={studentName} />

      {/* 2. Hub Navigation Segment Tabs (لیست درس‌ها / امتحانات / پیشرفت / گزارش) */}
      <HubNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Section 1: لیست درس‌ها (Course Catalog) */}
      {(activeTab === "all" || activeTab === "courses") && (
        <section aria-label="لیست درس‌ها">
          <CourseCatalog />
        </section>
      )}

      {/* 4. Section 2: امتحانات و ارزیابی (Assessments Hub) */}
      {(activeTab === "all" || activeTab === "exams") && (
        <section aria-label="امتحانات">
          <AssessmentsHub />
        </section>
      )}

      {/* 5. Section 3: پیشرفت و تسلط شناختی (Mastery & Progress) */}
      {(activeTab === "all" || activeTab === "progress") && (
        <section aria-label="پیشرفت">
          <MasteryOverview
            masteredCount={masteredCount}
            totalKCs={totalKCs}
            averageMastery={averageMastery}
          />
        </section>
      )}

      {/* 6. Section 4: گزارش‌ها و کارگاه‌های دست‌ورزی (Reports & Workshops) */}
      {(activeTab === "all" || activeTab === "reports") && (
        <section aria-label="گزارش و کارگاه">
          <ReportsAndWorkshops />
        </section>
      )}

      {/* Standards & Staff Footer */}
      <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400 font-medium pb-4">
        <span>بر اساس استاندارد رسمی کتاب‌های درسی ریاضی دوره دوم ابتدایی (پایگاه کتاب‌های درسی ایران - chap.sch.ir)</span>
        <div className="flex items-center gap-1.5">
          <span>کادر آموزشی و مدارس:</span>
          <Link
            href="/login?role=staff"
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ورود همکاران
          </Link>
        </div>
      </div>
    </div>
  );
};
