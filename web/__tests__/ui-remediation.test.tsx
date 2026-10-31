/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RemediationPathway } from "../components/remediation/RemediationPathway";

describe("Adaptive Remediation Pathway Component", () => {
  it("renders interactive manipulative workshop", () => {
    const handleComplete = vi.fn();
    const handleBack = vi.fn();

    render(
      <RemediationPathway
        kcTitle="جمع و تفریق کسرهای هم‌مخرج"
        onComplete={handleComplete}
        onBack={handleBack}
      />
    );

    expect(screen.getByText("کارگاه دست‌ورزی و تقویت مفهوم")).toBeInTheDocument();
    expect(screen.getByText("جمع و تفریق کسرهای هم‌مخرج")).toBeInTheDocument();
  });

  it("completes hands-on challenge when student colors target segments", () => {
    const handleComplete = vi.fn();
    const handleBack = vi.fn();

    const { container } = render(
      <RemediationPathway
        kcTitle="جمع و تفریق کسرهای هم‌مخرج"
        onComplete={handleComplete}
        onBack={handleBack}
      />
    );

    // Initial state: not resolved
    expect(screen.queryByText("بسیار عالی و دقیق!")).not.toBeInTheDocument();

    // Click 3 segments on the fraction strip
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(5);

    // Click 3rd segment (index 2) -> colors 3 segments
    fireEvent.click(rects[2]);

    // Positive pedagogical feedback should appear
    expect(screen.getByText("بسیار عالی و دقیق!")).toBeInTheDocument();

    // Click completion button
    const completeBtn = screen.getByText("آموختم، ثبت در کارنامه");
    fireEvent.click(completeBtn);
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
