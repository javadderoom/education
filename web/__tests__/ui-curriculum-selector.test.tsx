/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurriculumProvider, useCurriculumStore } from "../lib/store/curriculum-store";
import { GradeCourseModal } from "../components/navigation/GradeCourseModal";
import { Header } from "../components/navigation/Header";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => "/student",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth action
vi.mock("@/actions/auth", () => ({
  getCurrentUserAction: vi.fn().mockResolvedValue(null),
  logoutAction: vi.fn().mockResolvedValue(undefined),
}));

// Test harness component to trigger selector
const SelectorTestHarness: React.FC = () => {
  const { openSelector, selectedGrade, selectedSubjectId } = useCurriculumStore();
  return (
    <div>
      <span data-testid="active-grade">{selectedGrade}</span>
      <span data-testid="active-subject">{selectedSubjectId}</span>
      <button onClick={openSelector}>باز کردن انتخابگر</button>
      <GradeCourseModal />
    </div>
  );
};

describe("Two-Tier Grade & Course Selection System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("does not render modal when selector is closed", () => {
    render(
      <CurriculumProvider>
        <SelectorTestHarness />
      </CurriculumProvider>
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens modal and displays two distinct steps: Grade Level and Course Chapter", () => {
    render(
      <CurriculumProvider>
        <SelectorTestHarness />
      </CurriculumProvider>
    );

    // Open modal
    fireEvent.click(screen.getByText("باز کردن انتخابگر"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/مرحله ۱: انتخاب پایه تحصیلی/i)).toBeInTheDocument();
    expect(screen.getByText(/مرحله ۲: انتخاب کتاب و فصل درسی/i)).toBeInTheDocument();

    // Verify both grades are available
    expect(screen.getByText(/پایه چهارم دبستان/i)).toBeInTheDocument();
    expect(screen.getByText(/پایه پنجم دبستان/i)).toBeInTheDocument();

    // Grade 4 active by default -> shows Grade 4 chapters (Fractions + Multiplication/Division)
    expect(screen.getByText(/فصل دوم: مفهوم و محاسبات کسرها/i)).toBeInTheDocument();
    expect(screen.getByText(/فصل سوم: ضرب و تقسیم/i)).toBeInTheDocument();
  });

  it("switches grade tab in Step 1 to show Grade 5 chapter in Step 2", () => {
    render(
      <CurriculumProvider>
        <SelectorTestHarness />
      </CurriculumProvider>
    );

    fireEvent.click(screen.getByText("باز کردن انتخابگر"));

    // Switch to Grade 5
    fireEvent.click(screen.getByText(/پایه پنجم دبستان/i));

    // Step 2 should now display Grade 5 chapter
    expect(screen.getByText(/فصل سوم: نسبت، تناسب و درصد/i)).toBeInTheDocument();
    expect(screen.queryByText(/فصل دوم: مفهوم و محاسبات کسرها/i)).toBeNull();
  });

  it("selects a chapter, updates global store and local storage, and closes modal", () => {
    render(
      <CurriculumProvider>
        <SelectorTestHarness />
      </CurriculumProvider>
    );

    fireEvent.click(screen.getByText("باز کردن انتخابگر"));

    // Select Grade 4 Chapter 3 (Multiplication & Division)
    fireEvent.click(screen.getByText(/فصل سوم: ضرب و تقسیم/i));

    // Modal should close
    expect(screen.queryByRole("dialog")).toBeNull();

    // Store state should be updated
    expect(screen.getByTestId("active-subject")).toHaveTextContent("SUBJ-MATH4-CH03");
    expect(screen.getByTestId("active-grade")).toHaveTextContent("4");

    // Local storage should have been persisted
    const saved = localStorage.getItem("edtech_active_curriculum");
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual({ grade: 4, subjectId: "SUBJ-MATH4-CH03" });
  });

  it("closes modal when clicking the close button", () => {
    render(
      <CurriculumProvider>
        <SelectorTestHarness />
      </CurriculumProvider>
    );

    fireEvent.click(screen.getByText("باز کردن انتخابگر"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("بستن"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders Header with grade badge and chapter pill and opens modal on click", () => {
    render(
      <CurriculumProvider>
        <Header />
      </CurriculumProvider>
    );

    // Initial state: Grade 4 Fractions
    expect(screen.getByText("ریاضی چهارم ابتدایی")).toBeInTheDocument();
    expect(screen.getByText("فصل دوم: مفهوم و محاسبات کسرها")).toBeInTheDocument();

    // Click Header trigger button
    fireEvent.click(screen.getByLabelText("تغییر پایه یا کتاب درسی"));

    // Modal opens
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
