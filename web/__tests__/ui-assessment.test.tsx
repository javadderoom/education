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

    // Tap option with misconception content "2/10" -> "۲/۱۰" (regardless of shuffled letter label)
    const optionWithMisconception = screen.getByText(/۲\/۱۰/).closest("button");
    expect(optionWithMisconception).not.toBeNull();
    fireEvent.click(optionWithMisconception!);

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

  it("randomly shuffles distractors while maintaining standard Persian labels", () => {
    render(
      <AssessmentCarousel
        items={mockItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        shuffleOptions={true}
      />
    );

    // Labels should always exist sequentially
    expect(screen.getByText("الف")).toBeInTheDocument();
    expect(screen.getByText("ب")).toBeInTheDocument();
    expect(screen.getByText("ج")).toBeInTheDocument();
    expect(screen.getByText("د")).toBeInTheDocument();

    // All option contents should be present with Persian digits
    expect(screen.getAllByText(/۲\/۵/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/۲\/۱۰/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/۳\/۵/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/۱\/۵/).length).toBeGreaterThan(0);
  });

  it("allows student to end exam early and confirms submission", async () => {
    const multiItems = [
      ...mockItems,
      {
        ...mockItems[0],
        id: "ITEM-02",
        stem: "سوال دوم آزمون",
      },
    ];

    render(
      <AssessmentCarousel
        items={multiItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        studentName="سارا محمدی"
      />
    );

    // Answer first question
    const firstOption = screen.getByText(/۲\/۵/).closest("button");
    expect(firstOption).not.toBeNull();
    fireEvent.click(firstOption!);

    // Click early finish button
    const earlyFinishBtn = screen.getByTitle("پایان زودهنگام آزمون");
    expect(earlyFinishBtn).toBeInTheDocument();
    fireEvent.click(earlyFinishBtn);

    // Early finish confirmation modal should be visible
    expect(screen.getByText("اتمام زودهنگام آزمون")).toBeInTheDocument();
    expect(screen.getByText(/ثبت و مشاهده کارنامه/)).toBeInTheDocument();

    // Confirm early submission
    const confirmBtn = screen.getByText(/ثبت و مشاهده کارنامه/).closest("button");
    fireEvent.click(confirmBtn!);

    // Completion view should show
    await waitFor(() => {
      expect(screen.getByText("ارزیابی به پایان رسید!")).toBeInTheDocument();
    });
  });

  it("persists and restores active exam session state across remounts", () => {
    const multiItems = [
      ...mockItems,
      {
        ...mockItems[0],
        id: "ITEM-02",
        stem: "سوال دوم آزمون",
      },
    ];

    // Mock initial active session state
    const savedState = {
      sessionId: "sess_test_123",
      subjectId: "SUBJ-MATH4-FRACTIONS",
      studentUsername: "student_ali",
      studentName: "علی رضایی",
      selectedTopicIds: ["KC-01"],
      currentIndex: 1,
      items: multiItems,
      history: [
        {
          itemId: "ITEM-01",
          kcId: "KC-01",
          isCorrect: true,
          isNotSure: false,
          timestamp: Date.now(),
        },
      ],
      masteries: { "KC-01": 0.55 },
      targetSessionLimit: 2,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    render(
      <AssessmentCarousel
        items={multiItems}
        knowledgeComponents={mockKCs}
        misconceptions={mockMisconceptions}
        studentName="علی رضایی"
        studentUsername="student_ali"
        initialSessionState={savedState}
      />
    );

    // It should render the second question because currentIndex was 1
    expect(screen.getByText("سوال دوم آزمون")).toBeInTheDocument();
    // Progress should reflect 1 answered question
    expect(screen.getByText(/سوال ۲ از ۲/)).toBeInTheDocument();
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

  it("hides answer counters when hideCounter is true in assessment mode", () => {
    const { container } = render(
      <FractionStrip totalSegments={7} showSumMode={true} operandA={2} operandB={3} hideCounter={true} />
    );
    expect(container.textContent).not.toContain("۵ / ۷");
  });

  it("renders NumberLine with partition ticks and hides intermediate fractions in assessment mode", () => {
    const { container } = render(
      <NumberLine min={0} max={1} partitions={4} targetPoint={0.5} hideFractions={true} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("line").length).toBeGreaterThan(5);
    // Should not reveal intermediate fraction 2/4
    expect(container.textContent).not.toContain("۲/۴");
    // Should show question mark for target point
    expect(container.textContent).toContain("؟");
  });

  it("renders AreaGrid and hides answer equality badge in assessment mode", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <AreaGrid rows={2} cols={3} initialColored={4} highlightFractionA="2/3" highlightFractionB="4/6" hideBadge={true} onChange={handleChange} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(6);
    expect(container.textContent).not.toContain("نمایش تساوی");
    expect(container.textContent).not.toContain("۴ / ۶");
  });

  it("renders BalanceScale with tilt angle and respects hideBadge prop", () => {
    const { container, rerender } = render(
      <BalanceScale leftValue={0.5} rightValue={0.25} leftLabel="1/2" rightLabel="1/4" hideBadge={true} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).toContain("۱/۲");
    expect(container.textContent).toContain("۱/۴");
    expect(container.textContent).not.toContain("کفه چپ سنگین‌تر است");

    // When hideBadge is false, status badge should be present
    rerender(<BalanceScale leftValue={0.5} rightValue={0.25} leftLabel="1/2" rightLabel="1/4" hideBadge={false} />);
    expect(container.textContent).toContain("کفه چپ سنگین‌تر است");
  });

  it("renders BalanceScale with mixed Persian text and numbers using proper BiDi direction", () => {
    const { container, rerender } = render(
      <BalanceScale leftValue={1} rightValue={1} leftLabel="۲ به ۳" rightLabel="۶ به ؟" />
    );
    const texts = container.querySelectorAll("svg text");
    expect(texts.length).toBe(2);
    // Left text with Persian words must be RTL
    expect(texts[0].getAttribute("direction")).toBe("rtl");
    expect(texts[0].textContent).toBe("۲ به ۳");
    // Right text with Persian words must be RTL
    expect(texts[1].getAttribute("direction")).toBe("rtl");
    expect(texts[1].textContent).toBe("۶ به ؟");

    // Pure math fraction must be LTR
    rerender(<BalanceScale leftValue={0.5} rightValue={0.25} leftLabel="1/2" rightLabel="1/4" />);
    const fractionTexts = container.querySelectorAll("svg text");
    expect(fractionTexts[0].getAttribute("direction")).toBe("ltr");
    expect(fractionTexts[1].getAttribute("direction")).toBe("ltr");
  });
});
