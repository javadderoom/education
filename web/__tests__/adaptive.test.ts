import { describe, it, expect } from "vitest";
import {
  calculateMasteryUncertainty,
  selectNextAdaptiveItem,
  calculateAdaptiveSessionLimit,
} from "../lib/bkt/adaptive";

describe("Adaptive Question Selection Engine", () => {
  it("calculates mastery uncertainty correctly", () => {
    expect(calculateMasteryUncertainty(0.5)).toBeCloseTo(1.0);
    expect(calculateMasteryUncertainty(0.85)).toBeCloseTo(0.3);
    expect(calculateMasteryUncertainty(1.0)).toBeCloseTo(0.0);
    expect(calculateMasteryUncertainty(0.0)).toBeCloseTo(0.0);
  });

  it("calculates dynamic adaptive session limits proportional to selected concepts", () => {
    // 1 concept with 5 items => max(4, 1*2) = 4 items
    expect(calculateAdaptiveSessionLimit(1, 5)).toBe(4);

    // 2 concepts with 10 items => max(4, 2*2) = 4 items
    expect(calculateAdaptiveSessionLimit(2, 10)).toBe(4);

    // 3 concepts with 15 items => max(4, 3*2) = 6 items
    expect(calculateAdaptiveSessionLimit(3, 15)).toBe(6);

    // 5 concepts with 25 items => max(4, 5*2) = 10 items
    expect(calculateAdaptiveSessionLimit(5, 25)).toBe(10);

    // Bounded by pool size if pool is smaller than target
    expect(calculateAdaptiveSessionLimit(5, 7)).toBe(7);

    // Empty candidates pool returns 0
    expect(calculateAdaptiveSessionLimit(3, 0)).toBe(0);
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
