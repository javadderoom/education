/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "../components/navigation/BottomNav";

// Mock next/navigation usePathname and useSearchParams
const mockUsePathname = vi.fn();
const mockUseSearchParams = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

describe("Bottom Navigation Component (Mobile App Tab Bar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders 4 student tabs with proper labels and icons on student paths", () => {
    mockUsePathname.mockReturnValue("/student");
    render(<BottomNav />);

    expect(screen.getByText("خانه")).toBeInTheDocument();
    expect(screen.getByText("سنجش و تمرین")).toBeInTheDocument();
    expect(screen.getByText("کارگاه دست‌ورزی")).toBeInTheDocument();
    expect(screen.getByText("کارنامه تسلط")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /خانه/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const assessmentLink = screen.getByRole("link", { name: /سنجش و تمرین/i });
    expect(assessmentLink).toHaveAttribute("href", "/student");

    const workshopLink = screen.getByRole("link", { name: /کارگاه دست‌ورزی/i });
    expect(workshopLink).toHaveAttribute("href", "/student/workshop");

    const masteryLink = screen.getByRole("link", { name: /کارنامه تسلط/i });
    expect(masteryLink).toHaveAttribute("href", "/student/mastery");
  });

  it("hides the student bottom navigation on teacher and admin pages", () => {
    mockUsePathname.mockReturnValue("/teacher");
    const { container: teacherContainer } = render(<BottomNav />);
    expect(teacherContainer.firstChild).toBeNull();

    mockUsePathname.mockReturnValue("/admin");
    const { container: adminContainer } = render(<BottomNav />);
    expect(adminContainer.firstChild).toBeNull();
  });
});
