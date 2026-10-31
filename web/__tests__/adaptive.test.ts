import { describe, it, expect } from "vitest";
import { calculateMasteryUncertainty, selectNextAdaptiveItem } from "../lib/bkt/adaptive";

describe("Adaptive Question Selection Engine", () => {
  it("calculates mastery uncertainty correctly", () => {
    expect(calculateMasteryUncertainty(0.5)).toBeCloseTo(1.0);
    expect(calculateMasteryUncertainty(0.85)).toBeCloseTo(0.3);
    expect(calculateMasteryUncertainty(1.0)).toBeCloseTo(0.0);
    expect(calculateMasteryUncertainty(0.0)).toBeCloseTo(0.0);
  });

  it("selects unasked items prioritizing uncertain knowledge components", () => {
    const candidateItems = [
      {
        id: "ITEM-A",
        kc_id: "KC-01",
        stem: "سوال مهارت ۱",
        difficulty: 0.4,
        guess_param: 0.2,
        slip_param: 0.1,
        distractors: [],
      },
      {
        id: "ITEM-B",
        kc_id: "KC-02",
        stem: "سوال مهارت ۲",
        difficulty: 0.5,
        guess_param: 0.2,
        slip_param: 0.1,
        distractors: [],
      },
    ];

    const state = {
      answeredItemIds: new Set<string>(),
      masteries: {
        "KC-01": 0.95, // Already highly mastered
        "KC-02": 0.50, // High uncertainty, needs assessment
      },
      knowledgeComponents: [
        { id: "KC-01", title: "مفهوم ۱" },
        { id: "KC-02", title: "مفهوم ۲" },
      ],
      maxItemsPerSession: 5,
    };

    const nextItem = selectNextAdaptiveItem(candidateItems, state);
    expect(nextItem).toBeDefined();
    // Should prioritize KC-02 because it has maximum uncertainty
    expect(nextItem?.id).toBe("ITEM-B");
  });

  it("returns null when all items are answered or session max cap reached", () => {
    const candidateItems = [
      {
        id: "ITEM-A",
        kc_id: "KC-01",
        stem: "سوال ۱",
        difficulty: 0.4,
        guess_param: 0.2,
        slip_param: 0.1,
        distractors: [],
      },
    ];

    const state = {
      answeredItemIds: new Set(["ITEM-A"]),
      masteries: { "KC-01": 0.8 },
      knowledgeComponents: [{ id: "KC-01", title: "مفهوم ۱" }],
      maxItemsPerSession: 1,
    };

    const nextItem = selectNextAdaptiveItem(candidateItems, state);
    expect(nextItem).toBeNull();
  });
});
