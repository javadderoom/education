/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamTopicSelector } from "../components/curriculum/ExamTopicSelector";

describe("ExamTopicSelector Component", () => {
  it("renders course selection tabs and canonical Grade 4 syllabus by default", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={handleStart}
      />
    );

    // Header & title
    expect(screen.getByText("تنظیم هوشمند سرفصل‌های آزمون تشخیصی")).toBeInTheDocument();
    expect(screen.getByText("ریاضی چهارم ابتدایی")).toBeInTheDocument();
    expect(screen.getByText("ریاضی پنجم ابتدایی")).toBeInTheDocument();

    // Check categories for Grade 4
    expect(screen.getByText("بخش ۱: مبانی و شناخت کسر")).toBeInTheDocument();
    expect(screen.getByText("بخش ۲: مقایسه و محاسبات کسرها")).toBeInTheDocument();
    expect(screen.getByText("بخش ۳: تجسم و محور اعداد")).toBeInTheDocument();

    // Check individual topic
    expect(
      screen.getByText("شناخت مفهوم کسر به عنوان رابطه جزء از کل و تفکیک واحد")
    ).toBeInTheDocument();
  });

  it("switches course to Grade 5 and loads Ratio/Percentage syllabus", () => {
    const handleStart = vi.fn();
    render(
      <ExamTopicSelector
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        onStartExam={handleStart}
      />
    );

    const grade5Tab = screen.getByText("ریاضی پنجم ابتدایی").closest("button");
    expect(grade5Tab).toBeInTheDocument();
    fireEvent.click(grade5Tab!);

    // Grade 5 categories should now be visible
    expect(screen.getByText("بخش ۱: شناخت نسبت و روابط تناسبی")).toBeInTheDocument();
    expect(screen.getByText("بخش ۲: جدول تناسب و مسائل تسهیم")).toBeInTheDocument();
    expect(screen.getByText("بخش ۳: درصد و کاربردهای مالی")).toBeInTheDocument();
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
