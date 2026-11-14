import { describe, it, expect } from "vitest";
import { CANONICAL_TAXONOMIES, getSubjectTaxonomy } from "@/lib/data/curriculum-taxonomy";
import { getCanonicalCartridge, listAvailableCartridges } from "@/lib/data/cartridge";
import { DYNAMIC_GENERATORS, generateDynamicItemsForKCs } from "@/lib/curriculum/parametric-engine";

describe("Grade 4 Canonical Curriculum Integration", () => {
  const grade4Chapters = [
    { chapter: 1, subjectId: "SUBJ-MATH4-CH01", file: "grade4_math_ch1.json", expectedKCs: 5 },
    { chapter: 2, subjectId: "SUBJ-MATH4-FRACTIONS", file: "grade4_math_ch2.json", expectedKCs: 5 },
    { chapter: 3, subjectId: "SUBJ-MATH4-CH03", file: "grade4_math_ch3.json", expectedKCs: 5 },
    { chapter: 4, subjectId: "SUBJ-MATH4-CH04", file: "grade4_math_ch4.json", expectedKCs: 5 },
    { chapter: 5, subjectId: "SUBJ-MATH4-CH05", file: "grade4_math_ch5.json", expectedKCs: 5 },
    { chapter: 6, subjectId: "SUBJ-MATH4-CH06", file: "grade4_math_ch6.json", expectedKCs: 5 },
    { chapter: 7, subjectId: "SUBJ-MATH4-CH07", file: "grade4_math_ch7.json", expectedKCs: 5 },
  ];

  it("verifies that all 7 chapters of Grade 4 are present in listAvailableCartridges", () => {
    const available = listAvailableCartridges();
    const filenames = available.map((a) => a.filename);

    for (const item of grade4Chapters) {
      expect(filenames).toContain(item.file);
    }
  });

  it("verifies each Grade 4 cartridge schema, items and knowledge components", () => {
    for (const item of grade4Chapters) {
      const cartridge = getCanonicalCartridge(item.file);
      expect(cartridge.cartridge_id).toBeDefined();
      expect(cartridge.subject.grade_level).toBe(4);
      expect(cartridge.knowledge_components.length).toBe(item.expectedKCs);
      expect(cartridge.diagnostic_items.length).toBeGreaterThanOrEqual(item.expectedKCs);

      // Verify that every item has 4 distractors and exactly 1 correct answer
      for (const diagnosticItem of cartridge.diagnostic_items) {
        expect(diagnosticItem.distractors.length).toBe(4);
        const correctOnes = diagnosticItem.distractors.filter((d) => d.is_correct);
        expect(correctOnes.length).toBe(1);
      }
    }
  });

  it("verifies that CANONICAL_TAXONOMIES covers all 7 Grade 4 chapters", () => {
    for (const item of grade4Chapters) {
      const taxonomy = CANONICAL_TAXONOMIES[item.subjectId];
      expect(taxonomy).toBeDefined();
      expect(taxonomy.gradeLevel).toBe(4);
      expect(taxonomy.cartridgeFile).toBe(item.file);
      expect(taxonomy.topics.length).toBe(item.expectedKCs);
    }
  });

  it("resolves subject taxonomy by keywords and IDs seamlessly", () => {
    expect(getSubjectTaxonomy("SUBJ-MATH4-CH01").id).toBe("SUBJ-MATH4-CH01");
    expect(getSubjectTaxonomy("SUBJ-MATH4-CH04").id).toBe("SUBJ-MATH4-CH04");
    expect(getSubjectTaxonomy("CH05").id).toBe("SUBJ-MATH4-CH05");
    expect(getSubjectTaxonomy("GEOM").id).toBe("SUBJ-MATH4-CH06");
    expect(getSubjectTaxonomy("PROB").id).toBe("SUBJ-MATH4-CH07");
  });

  it("verifies dynamic parametric generators for Grade 4 Chapter 1 (Numbers & Patterns)", () => {
    const ch1Kcs = [
      "KC-MATH4-C01-01",
      "KC-MATH4-C01-02",
      "KC-MATH4-C01-03",
      "KC-MATH4-C01-04",
      "KC-MATH4-C01-05",
    ];

    for (const kcId of ch1Kcs) {
      expect(DYNAMIC_GENERATORS[kcId]).toBeDefined();
      const item = DYNAMIC_GENERATORS[kcId](0);
      expect(item.kc_id).toBe(kcId);
      expect(item.stem.length).toBeGreaterThan(10);
      expect(item.distractors.length).toBe(4);

      const correctChoices = item.distractors.filter((d: any) => d.is_correct);
      expect(correctChoices.length).toBe(1);

      // Verify mathematical uniqueness of distractor contents
      const contents = item.distractors.map((d: any) => d.content.trim());
      const uniqueContents = new Set(contents);
      expect(uniqueContents.size).toBe(4);
    }

    const batch = generateDynamicItemsForKCs(ch1Kcs, 2);
    expect(batch.length).toBe(10);
  });

  it("verifies Grade 4 Chapter 1 has 15 rich canonical diagnostic items with 3 items per KC", () => {
    const ch1 = getCanonicalCartridge("grade4_math_ch1.json");
    expect(ch1.diagnostic_items.length).toBe(15);

    const kcItemCounts: Record<string, number> = {};
    for (const item of ch1.diagnostic_items) {
      kcItemCounts[item.kc_id] = (kcItemCounts[item.kc_id] || 0) + 1;
      expect(item.distractors.length).toBe(4);
      expect(item.distractors.filter((d: any) => d.is_correct).length).toBe(1);

      // Unique contents per item
      const contents = item.distractors.map((d: any) => d.content.trim());
      expect(new Set(contents).size).toBe(4);
    }

    for (const kc of ch1.knowledge_components) {
      expect(kcItemCounts[kc.id]).toBe(3);
    }
  });
});
