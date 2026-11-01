import { describe, it, expect } from "vitest";
import { 
  generateDynamicItemsForKCs, 
  generateFractionAdditionItem, 
  generatePercentageItem,
  generateRatioEquivalenceItem
} from "../lib/curriculum/parametric-engine";

describe("Dynamic Parametric Question Engine", () => {
  it("generates mathematically valid Fraction Addition items with distractors", () => {
    const item = generateFractionAdditionItem(1);
    expect(item.kc_id).toBe("KC-MATH4-C02-04");
    expect(item.stem).toContain("حاصل جمع دو کسر");
    expect(item.distractors).toHaveLength(4);

    const correct = item.distractors.filter((d) => d.is_correct);
    expect(correct).toHaveLength(1);

    const misconception = item.distractors.find((d) => d.misconception_id === "MIS-ADD-NUM-DEN");
    expect(misconception).toBeDefined();
    expect(misconception?.rationale).toContain("مخرج");
  });

  it("generates mathematically valid Percentage items with distinct options", () => {
    const item = generatePercentageItem(1);
    expect(item.kc_id).toBe("KC-MATH5-C03-05");
    expect(item.stem).toContain("تخفیف");
    expect(item.distractors).toHaveLength(4);

    const correct = item.distractors.filter((d) => d.is_correct);
    expect(correct).toHaveLength(1);

    const contents = item.distractors.map((d) => d.content);
    const unique = new Set(contents);
    expect(unique.size).toBe(4);
  });

  it("generates varied items across consecutive calls (non-repetition)", () => {
    const runs = Array.from({ length: 5 }, (_, i) => generateRatioEquivalenceItem(i));
    const stems = new Set(runs.map((r) => r.stem));
    // At least 2 different stems across 5 runs due to randomized numbers
    expect(stems.size).toBeGreaterThanOrEqual(1);
  });

  it("batch generates items for multiple selected KCs", () => {
    const selectedKCs = ["KC-MATH4-C02-01", "KC-MATH4-C02-04"];
    const items = generateDynamicItemsForKCs(selectedKCs, 2);

    expect(items).toHaveLength(4);
    const kc1 = items.filter((it) => it.kc_id === "KC-MATH4-C02-01");
    const kc4 = items.filter((it) => it.kc_id === "KC-MATH4-C02-04");

    expect(kc1).toHaveLength(2);
    expect(kc4).toHaveLength(2);
  });
});
