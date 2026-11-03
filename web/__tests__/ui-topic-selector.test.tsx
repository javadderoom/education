/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamTopicSelector } from "../components/curriculum/ExamTopicSelector";
import { CANONICAL_TAXONOMIES } from "@/lib/data/curriculum-taxonomy";
import * as curriculumStore from "@/lib/store/curriculum-store";

describe("ExamTopicSelector Component", () => {
  it("renders active curriculum context banner and canonical Grade 4 syllabus by default", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={handleStart}
      />
    );

    // Header & title
    expect(screen.getByText("تنظیم هوشمند سرفصل‌های آزمون تشخیصی")).toBeInTheDocument();
    
    // Active curriculum context banner
    expect(screen.getByText(/مفهوم و محاسبات کسرها/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /تغییر کتاب یا پایه/i })).toBeInTheDocument();

    // Check categories for Grade 4 Chapter 2
    expect(screen.getByText("بخش ۱: مبانی و شناخت کسر")).toBeInTheDocument();
    expect(screen.getByText("بخش ۲: مقایسه و محاسبات کسرها")).toBeInTheDocument();
    expect(screen.getByText("بخش ۳: تجسم و محور اعداد")).toBeInTheDocument();

    // Check individual topic
    expect(
      screen.getByText("شناخت مفهوم کسر به عنوان رابطه جزء از کل و تفکیک واحد")
    ).toBeInTheDocument();
  });

  it("renders syllabus for Grade 4 Chapter 3 (Multiplication & Division)", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-CH03"
        onStartExam={handleStart}
      />
    );

    // Grade 4 Chapter 3 categories should be visible
    expect(screen.getAllByText(/ضرب و تقسیم/i).length).toBeGreaterThan(0);
    expect(screen.getByText("بخش ۱: الگوها و الگوریتم‌های ضرب")).toBeInTheDocument();
    expect(screen.getByText("بخش ۲: مفهوم و الگوریتم‌های تقسیم")).toBeInTheDocument();
    expect(screen.getByText("بخش ۳: تخمین و محاسبات تقریبی")).toBeInTheDocument();
  });

  it("renders syllabus for Grade 5 Ratio/Percentage", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH5-RATIO"
        onStartExam={handleStart}
      />
    );

    // Grade 5 categories should be visible
    expect(screen.getByText(/نسبت، تناسب و درصد/i)).toBeInTheDocument();
    expect(screen.getByText("بخش ۱: شناخت نسبت و روابط تناسبی")).toBeInTheDocument();
    expect(screen.getByText("بخش ۲: جدول تناسب و مسائل تسهیم")).toBeInTheDocument();
    expect(screen.getByText("بخش ۳: درصد و کاربردهای مالی")).toBeInTheDocument();
  });

  it("triggers openSelector when 'تغییر کتاب یا پایه' button is clicked", () => {
    const mockOpenSelector = vi.fn();
    vi.spyOn(curriculumStore, "useCurriculumStore").mockReturnValue({
      selectedGrade: 4,
      selectedSubjectId: "SUBJ-MATH4-FRACTIONS",
      activeTaxonomy: CANONICAL_TAXONOMIES["SUBJ-MATH4-FRACTIONS"],
      setGrade: vi.fn(),
      setSubject: vi.fn(),
      isSelectorOpen: false,
      openSelector: mockOpenSelector,
      closeSelector: vi.fn(),
      toggleSelector: vi.fn(),
      frameworks: [],
      activeFramework: null,
      tierDefinitions: curriculumStore.DEFAULT_TIER_DEFINITIONS,
      treeNodes: [],
      refreshCurriculumFromDb: vi.fn(),
    });

    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={vi.fn()}
      />
    );

    const changeBtn = screen.getByRole("button", { name: /تغییر کتاب یا پایه/i });
    fireEvent.click(changeBtn);

    expect(mockOpenSelector).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it("supports batch category toggle and preset buttons", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={handleStart}
      />
    );

    // Click 'پاک کردن' preset button to deselect all
    const clearBtn = screen.getByText("پاک کردن");
    fireEvent.click(clearBtn);

    // Start button should now be disabled
    const startBtn = screen.getByText("حداقل یک سرفصل را انتخاب کنید").closest("button");
    expect(startBtn).toBeDisabled();

    // Click 'مفاهیم پایه' preset button
    const foundationsBtn = screen.getByText("مفاهیم پایه");
    fireEvent.click(foundationsBtn);

    // Now start button should be enabled with 6 questions (2 topics * 3 items)
    expect(screen.getByText("شروع آزمون با ۶ سوال")).toBeInTheDocument();

    // Click 'انتخاب همه مباحث' preset
    const allBtn = screen.getByText("انتخاب همه مباحث");
    fireEvent.click(allBtn);

    expect(screen.getByText("شروع آزمون با ۱۵ سوال")).toBeInTheDocument();
  });

  it("submits selected topics on start button click", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={handleStart}
      />
    );

    const startBtn = screen.getByText("شروع آزمون با ۱۵ سوال").closest("button");
    fireEvent.click(startBtn!);

    expect(handleStart).toHaveBeenCalledWith(
      "SUBJ-MATH4-FRACTIONS",
      expect.arrayContaining([
        "KC-MATH4-C02-01",
        "KC-MATH4-C02-02",
        "KC-MATH4-C02-03",
        "KC-MATH4-C02-04",
        "KC-MATH4-C02-05",
      ])
    );
  });
});
