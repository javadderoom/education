/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudentAssessmentView } from "../components/assessment/StudentAssessmentView";
import { CanonicalCartridge } from "@/lib/data/cartridge";
import * as examStorage from "@/lib/store/exam-storage";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock audio/speech
vi.mock("@/lib/audio/speech", () => ({
  speakQuestion: vi.fn(),
  stopPersianSpeech: vi.fn(),
  isSpeechSupported: () => false,
}));

// Mock parametric dynamic items generator to keep test deterministic
vi.mock("@/lib/curriculum/parametric-engine", () => ({
  generateDynamicItemsForKCs: vi.fn().mockReturnValue([]),
}));

const mockCartridge: CanonicalCartridge = {
  cartridge_version: "2.0.0",
  schema_version: "2.0.0",
  metadata: {
    locale: "fa-IR",
    created_at: "2026-01-01T00:00:00Z",
    total_kcs: 2,
    total_items: 2,
    total_misconceptions: 1,
  },
  subject: {
    id: "SUBJ-MATH4-FRACTIONS",
    title: "ریاضی چهارم - کسرها",
    grade_level: 4,
    domain: "کسر",
  },
  knowledge_components: [
    {
      id: "KC-MATH4-C02-01",
      title: "مفهوم کسر به عنوان جزء از کل",
      description: "شناخت مفهوم کسر",
      prerequisites: [],
    },
    {
      id: "KC-MATH4-C02-02",
      title: "کسرهای مساوی و ساده کردن",
      description: "یافتن کسرهای مساوی",
      prerequisites: ["KC-MATH4-C02-01"],
    },
  ],
  misconceptions: [
    {
      id: "MIS-01",
      title: "جمع مخرج‌ها",
      description: "دانش‌آموز مخرج‌ها را جمع می‌کند",
      remediation_strategy: "استفاده از شکل واحد",
      counter_example_blueprint: {
        scenario: "پیتزا",
      },
    },
  ],
  diagnostic_items: [
    {
      id: "ITEM-TEST-01",
      kc_id: "KC-MATH4-C02-01",
      stem: "کدام گزینه نشان‌دهنده کسر دو پنجم است؟",
      difficulty: 0.2,
      guess_param: 0.25,
      slip_param: 0.1,
      distractors: [
        { id: "D-1", label: "الف", content: "2/5", is_correct: true, misconception_id: null },
        { id: "D-2", label: "ب", content: "5/2", is_correct: false, misconception_id: "MIS-01" },
        { id: "D-3", label: "ج", content: "1/5", is_correct: false, misconception_id: null },
        { id: "D-4", label: "د", content: "3/5", is_correct: false, misconception_id: null },
      ],
    },
    {
      id: "ITEM-TEST-02",
      kc_id: "KC-MATH4-C02-02",
      stem: "کسر مساوی با یک دوم کدام است؟",
      difficulty: 0.3,
      guess_param: 0.25,
      slip_param: 0.1,
      distractors: [
        { id: "D-1", label: "الف", content: "2/4", is_correct: true, misconception_id: null },
        { id: "D-2", label: "ب", content: "2/3", is_correct: false, misconception_id: null },
        { id: "D-3", label: "ج", content: "1/4", is_correct: false, misconception_id: null },
        { id: "D-4", label: "د", content: "3/4", is_correct: false, misconception_id: null },
      ],
    },
  ],
};

const mockCartridges: Record<string, CanonicalCartridge> = {
  "SUBJ-MATH4-FRACTIONS": mockCartridge,
};

describe("StudentAssessmentView Integration Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders ExamTopicSelector by default when initialStarted is false", () => {
    render(
      <StudentAssessmentView
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        initialStarted={false}
        studentName="علی رضایی"
        studentUsername="student_ali"
        cartridges={mockCartridges}
      />
    );

    expect(screen.getByText("تنظیم هوشمند سرفصل‌های آزمون تشخیصی")).toBeInTheDocument();
    expect(screen.getByText(/شروع آزمون/i)).toBeInTheDocument();
  });

  it("renders AssessmentCarousel directly when initialStarted is true", () => {
    render(
      <StudentAssessmentView
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        initialStarted={true}
        initialTopicIds={["KC-MATH4-C02-01"]}
        studentName="علی رضایی"
        studentUsername="student_ali"
        cartridges={mockCartridges}
      />
    );

    // Carousel should be visible with question stem and honesty button
    expect(screen.getByText("کدام گزینه نشان‌دهنده کسر دو پنجم است؟")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /مطمئن نیستم/i })).toBeInTheDocument();
    expect(screen.getByTitle("پایان زودهنگام آزمون")).toBeInTheDocument();
  });

  it("starts the exam when start button is clicked and updates navigation", () => {
    render(
      <StudentAssessmentView
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        initialStarted={false}
        initialTopicIds={["KC-MATH4-C02-01"]}
        studentName="علی رضایی"
        studentUsername="student_ali"
        cartridges={mockCartridges}
      />
    );

    const startBtn = screen.getByRole("button", { name: /شروع آزمون/i });
    fireEvent.click(startBtn);

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("start=1")
    );
    // Carousel should now be rendered
    expect(screen.getByText("کدام گزینه نشان‌دهنده کسر دو پنجم است؟")).toBeInTheDocument();
  });

  it("switches back to configurator when onConfigureTopics is triggered in carousel", () => {
    render(
      <StudentAssessmentView
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        initialStarted={true}
        initialTopicIds={["KC-MATH4-C02-01"]}
        studentName="علی رضایی"
        studentUsername="student_ali"
        cartridges={mockCartridges}
      />
    );

    // Click topic configuration button in carousel header
    const configBtn = screen.getByTitle("تغییر سرفصل‌های آزمون");
    fireEvent.click(configBtn);

    // ExamTopicSelector should be displayed again
    expect(screen.getByText("تنظیم هوشمند سرفصل‌های آزمون تشخیصی")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith(
      expect.not.stringContaining("start=1")
    );
  });

  it("discards stale active exam session when initialTopicIds from URL do not match saved session", () => {
    // Prepopulate localStorage with session for KC-02
    examStorage.saveActiveExamSession({
      sessionId: "stale-session-123",
      subjectId: "SUBJ-MATH4-FRACTIONS",
      studentUsername: "student_ali",
      studentName: "علی رضایی",
      selectedTopicIds: ["KC-MATH4-C02-02"],
      currentIndex: 1,
      items: mockCartridge.diagnostic_items,
      history: [],
      masteries: {},
      targetSessionLimit: 10,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    });

    // Verify it is saved before render
    expect(examStorage.loadActiveExamSession("SUBJ-MATH4-FRACTIONS", "student_ali")).not.toBeNull();

    render(
      <StudentAssessmentView
        initialSubjectId="SUBJ-MATH4-FRACTIONS"
        initialStarted={true}
        initialTopicIds={["KC-MATH4-C02-01"]} // different topic requested!
        studentName="علی رضایی"
        studentUsername="student_ali"
        cartridges={mockCartridges}
      />
    );

    // Stale session must be cleared from storage and replaced with the new topics session
    const currentSession = examStorage.loadActiveExamSession("SUBJ-MATH4-FRACTIONS", "student_ali");
    expect(currentSession).not.toBeNull();
    expect(currentSession?.sessionId).not.toBe("stale-session-123");
    expect(currentSession?.selectedTopicIds).toEqual(["KC-MATH4-C02-01"]);
  });
});
