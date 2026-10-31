/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssessmentCarousel } from "../components/assessment/AssessmentCarousel";
import { FractionStrip } from "../components/parametric/FractionStrip";
import { NumberLine } from "../components/parametric/NumberLine";
import { AreaGrid } from "../components/parametric/AreaGrid";
import { BalanceScale } from "../components/parametric/BalanceScale";

const mockKCs = [
  { id: "KC-01", title: "مفهوم کسر به عنوان جزء از کل" },
  { id: "KC-02", title: "کسرهای مساوی" },
];

const mockMisconceptions = [
  {
    id: "MIS-ADD-DENOM",
    title: "جمع مخرج‌ها با هم",
    counter_example_blueprint: {
      scenario: "یک پیتزا به ۵ برش تقسیم شده است، اگر ۲ برش بخورید پیتزا ۱۰ برش نمی‌شود!",
    },
  },
];

const mockItems = [
  {
    id: "ITEM-01",
    kc_id: "KC-01",
    stem: "حاصل کسر را بیابید",
    difficulty: 0.3,
    guess_param: 0.2,
    slip_param: 0.1,
    visual_template: {
      type: "FractionStrip",
      props: { totalSegments: 5, initialColored: 2 },
    },
    distractors: [
      { id: "D-1", label: "الف", content: "2/5", is_correct: true, misconception_id: null },
      { id: "D-2", label: "ب", content: "2/10", is_correct: false, misconception_id: "MIS-ADD-DENOM", rationale: "بدفهمی جمع مخرج‌ها" },
      { id: "D-3", label: "ج", content: "3/5", is_correct: false, misconception_id: null },
      { id: "D-4", label: "د", content: "1/5", is_correct: false, misconception_id: null },
    ],
  },
];

describe("Tablet & Mobile UI Assessment Flow", () => {
  it("renders the question stem, 4 touch-friendly options, and Not Sure button", () => {
    render(
      <AssessmentCarousel
        items={mockItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        studentName="سارا محمدی"
      />
    );

    // Question stem should be visible
    expect(screen.getByText("حاصل کسر را بیابید")).toBeInTheDocument();

    // 4 Option labels
    expect(screen.getByText("الف")).toBeInTheDocument();
    expect(screen.getByText("ب")).toBeInTheDocument();
    expect(screen.getByText("ج")).toBeInTheDocument();
    expect(screen.getByText("د")).toBeInTheDocument();

    // Honesty button
    expect(screen.getByText(/هنوز مطمئن نیستم/)).toBeInTheDocument();
  });

  it("opens Remediation Modal when a distractor with misconception is tapped", async () => {
    render(
      <AssessmentCarousel
        items={mockItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        studentName="سارا محمدی"
      />
    );

    // Tap option 'ب' which has misconception MIS-ADD-DENOM
    const optionB = screen.getByText("ب").closest("button");
    expect(optionB).not.toBeNull();
    fireEvent.click(optionB!);

    // Remediation modal should pop up
    await waitFor(() => {
      expect(screen.getByText("نکته آموزشی و تفکر بیشتر")).toBeInTheDocument();
      expect(screen.getByText(/یک پیتزا به ۵ برش تقسیم شده/)).toBeInTheDocument();
    });

    // Dismiss modal and proceed
    const dismissBtn = screen.getByText(/متوجه شدم، سوال بعدی/);
    fireEvent.click(dismissBtn);

    // After dismissing the last question, completion screen appears
    await waitFor(() => {
      expect(screen.getByText("ارزیابی به پایان رسید!")).toBeInTheDocument();
      expect(screen.getByText(/سارا محمدی/)).toBeInTheDocument();
    });
  });

  it("handles honest uncertainty button without throwing errors", async () => {
    render(
      <AssessmentCarousel
        items={mockItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        studentName="علی رضایی"
      />
    );

    const notSureBtn = screen.getByText(/هنوز مطمئن نیستم/);
    fireEvent.click(notSureBtn);

    await waitFor(() => {
      expect(screen.getByText("ارزیابی به پایان رسید!")).toBeInTheDocument();
    });
  });
});

describe("5 Parametric Visual Templates Rendering", () => {
  it("renders FractionStrip and responds to segment clicks in interactive mode", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <FractionStrip totalSegments={6} initialColored={2} interactive={true} onChange={handleChange} />
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(6);

    // Click 4th segment
    fireEvent.click(rects[3]);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("renders NumberLine with partition ticks", () => {
    const { container } = render(
      <NumberLine min={0} max={1} partitions={5} targetPoint={0.6} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("line").length).toBeGreaterThan(5);
  });

  it("renders AreaGrid and toggles cells on touch", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <AreaGrid rows={2} cols={3} initialColored={2} interactive={true} onChange={handleChange} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(6);

    // Toggle 3rd button
    fireEvent.click(buttons[2]);
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders BalanceScale with tilt angle", () => {
    const { container } = render(
      <BalanceScale leftValue={0.5} rightValue={0.25} leftLabel="1/2" rightLabel="1/4" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).toContain("1/2");
    expect(container.textContent).toContain("1/4");
  });
});
