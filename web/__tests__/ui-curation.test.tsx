/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurationStudio } from "../components/curation/CurationStudio";

const mockItems = [
  {
    id: "ITEM-CUR-01",
    kc_id: "KC-01",
    stem: "کسر مساوی با ۲/۳ را مشخص کنید",
    difficulty: 0.4,
    guess_param: 0.2,
    slip_param: 0.1,
    visual_template: {
      type: "FractionStrip",
      props: { totalSegments: 6, initialColored: 4 },
    },
    distractors: [
      { id: "D-1", label: "الف", content: "4/6", is_correct: true, misconception_id: null, rationale: "پاسخ صحیح" },
      { id: "D-2", label: "ب", content: "3/4", is_correct: false, misconception_id: "MIS-01", rationale: "بدفهمی جمع ۱ به صورت و مخرج" },
    ],
  },
  {
    id: "ITEM-CUR-02",
    kc_id: "KC-02",
    stem: "مقایسه دو کسر را انجام دهید",
    difficulty: 0.5,
    guess_param: 0.2,
    slip_param: 0.1,
    visual_template: null,
    distractors: [
      { id: "D-3", label: "الف", content: "1/2 > 1/4", is_correct: true, misconception_id: null, rationale: "پاسخ صحیح" },
    ],
  },
];

const mockMisconceptions = [
  { id: "MIS-01", title: "جمع عدد ثابت به صورت و مخرج", counter_example_blueprint: {} },
];

describe("Teacher Curation Studio Component", () => {
  it("renders teacher review dashboard and item preview", () => {
    render(
      <CurationStudio
        initialItems={mockItems}
        misconceptions={mockMisconceptions}
        subjectTitle="فصل دوم: کسرها"
      />
    );

    expect(screen.getByText("میز کار آموزگار و بازبینی سوالات")).toBeInTheDocument();
    expect(screen.getByText("کسر مساوی با ۲/۳ را مشخص کنید")).toBeInTheDocument();
    expect(screen.getByText(/بدفهمی جمع ۱ به صورت و مخرج/)).toBeInTheDocument();
  });

  it("approves item when teacher clicks approve button", () => {
    render(
      <CurationStudio
        initialItems={mockItems}
        misconceptions={mockMisconceptions}
        subjectTitle="فصل دوم: کسرها"
      />
    );

    const approveBtn = screen.getByText(/تایید نهایی و آماده انتشار/);
    fireEvent.click(approveBtn);

    // After approval of item 1, it automatically advances to item 2
    expect(screen.getByText("مقایسه دو کسر را انجام دهید")).toBeInTheDocument();
    // 1 item approved badge
    expect(screen.getByText(/1 از 2 سوال تایید شده/)).toBeInTheDocument();
  });
});
