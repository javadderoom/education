/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudentProfileSwitcher } from "../components/navigation/StudentProfileSwitcher";

describe("Student Profile Switcher Component", () => {
  const mockLearners = [
    {
      id: "L-1",
      username: "student_ali",
      displayName: "علی رضایی",
      gradeLevel: 4,
      sessionsCount: 3,
      masteryCount: 4,
      averageMastery: 80,
      lastActive: new Date(),
    },
    {
      id: "L-2",
      username: "student_sara",
      displayName: "سارا محمدی",
      gradeLevel: 4,
      sessionsCount: 1,
      masteryCount: 2,
      averageMastery: 60,
      lastActive: new Date(),
    },
  ];

  it("renders active student name and opens switcher modal on click", () => {
    render(
      <StudentProfileSwitcher
        learners={mockLearners}
        activeUsername="student_ali"
      />
    );

    expect(screen.getByText("علی رضایی")).toBeInTheDocument();

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    expect(screen.getByText("انتخاب یا تغییر دانش‌آموز")).toBeInTheDocument();
    expect(screen.getByText("سارا محمدی")).toBeInTheDocument();
  });

  it("triggers callback when a different learner is selected", () => {
    const handleSelect = vi.fn();

    render(
      <StudentProfileSwitcher
        learners={mockLearners}
        activeUsername="student_ali"
        onSelectStudent={handleSelect}
      />
    );

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const saraBtn = screen.getByText("سارا محمدی");
    fireEvent.click(saraBtn);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "student_sara",
        displayName: "سارا محمدی",
      })
    );
  });
});
