/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "../components/navigation/BottomNav";

// Mock next/navigation usePathname
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Bottom Navigation Component (Mobile App Tab Bar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 4 student tabs with proper labels and icons on student paths", () => {
    mockUsePathname.mockReturnValue("/student");
    render(<BottomNav />);

    expect(screen.getByText("خانه")).toBeInTheDocument();
    expect(screen.getByText("آزمون کسرها")).toBeInTheDocument();
    expect(screen.getByText("کارگاه دست‌ورزی")).toBeInTheDocument();
    expect(screen.getByText("کارنامه تسلط")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /خانه/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const assessmentLink = screen.getByRole("link", { name: /آزمون کسرها/i });
    expect(assessmentLink).toHaveAttribute("href", "/student");

    const workshopLink = screen.getByRole("link", { name: /کارگاه دست‌ورزی/i });
    expect(workshopLink).toHaveAttribute("href", "/student/workshop");

    const masteryLink = screen.getByRole("link", { name: /کارنامه تسلط/i });
    expect(masteryLink).toHaveAttribute("href", "/student/mastery");
  });

  it("hides the student bottom navigation on teacher pages", () => {
    mockUsePathname.mockReturnValue("/teacher");
    const { container } = render(<BottomNav />);
    expect(container.firstChild).toBeNull();
  });
});
