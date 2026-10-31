import { describe, it, expect } from "vitest";
import { getCanonicalCartridge } from "../lib/data/cartridge";
import { selectNextAdaptiveItem } from "../lib/bkt/adaptive";
import { evaluateDiagnosticResponse } from "../lib/bkt/diagnostics";
import { updateMastery } from "../lib/bkt/engine";
import { saveAssessmentSession, getStudentMasteryStates } from "../actions/assessment";
import { getClassDiagnosticStats } from "../actions/analytics";

describe("Grade 5 Ratio, Proportion & Percentage Full Pipeline Verification", () => {
  it("loads Grade 5 Chapter 3 canonical cartridge with 15 diagnostic items and 5 KCs", () => {
    const cartridge = getCanonicalCartridge("grade5_math_ch3.json");

    expect(cartridge.subject.grade_level).toBe(5);
    expect(cartridge.subject.id).toBe("SUBJ-MATH5-RATIO");
    expect(cartridge.knowledge_components.length).toBe(5);
    expect(cartridge.misconceptions.length).toBe(5);
    expect(cartridge.diagnostic_items.length).toBe(15);

    // Verify all items have 4 distractors and at least 1 correct distractor
    for (const item of cartridge.diagnostic_items) {
      expect(item.distractors.length).toBe(4);
      expect(item.distractors.some((d) => d.is_correct)).toBe(true);
      expect(item.distractors.some((d) => !d.is_correct && d.misconception_id)).toBe(true);
    }
  });

  it("executes adaptive testing, cognitive misconception detection and BKT update", () => {
    const cartridge = getCanonicalCartridge("grade5_math_ch3.json");
    const misconceptionsMap: Record<string, { title: string; counterExampleBlueprint: any }> = {};
    for (const m of cartridge.misconceptions) {
      misconceptionsMap[m.id] = {
        title: m.title,
        counterExampleBlueprint: m.counter_example_blueprint,
      };
    }

    const masteries: Record<string, number> = {};
    for (const kc of cartridge.knowledge_components) {
      masteries[kc.id] = 0.15;
    }

    // 1. Select first adaptive item
    const item = selectNextAdaptiveItem(cartridge.diagnostic_items, {
      answeredItemIds: new Set<string>(),
      masteries,
      knowledgeComponents: cartridge.knowledge_components,
      maxItemsPerSession: 6,
    });
    expect(item).toBeDefined();

    // 2. Select misconception distractor
    const misconceptionDis = item!.distractors.find((d) => d.misconception_id !== null && !d.is_correct)!;
    const diagnosis = evaluateDiagnosticResponse(
      {
        id: misconceptionDis.id,
        label: misconceptionDis.label,
        content: misconceptionDis.content,
        isCorrect: false,
        misconceptionId: misconceptionDis.misconception_id,
        rationale: misconceptionDis.rationale,
      },
      false,
      misconceptionsMap
    );

    expect(diagnosis.diagnosedMisconceptionId).toBe(misconceptionDis.misconception_id);
    expect(diagnosis.misconceptionTitle).toBeDefined();
    expect(diagnosis.counterExampleBlueprint).toBeDefined();

    // 3. Update BKT
    const prior = masteries[item!.kc_id];
    const bkt = updateMastery(prior, false, false);
    expect(bkt.posteriorMastery).toBeLessThan(prior);
  });

  it("persists Grade 5 session and retrieves real class statistics from PostgreSQL", async () => {
    const cartridge = getCanonicalCartridge("grade5_math_ch3.json");
    const testUsername = `student_g5_vitest_${Date.now()}`;
    const testSessionId = `sess_vitest_${Date.now()}`;

    const saveRes = await saveAssessmentSession({
      sessionId: testSessionId,
      learnerUsername: testUsername,
      learnerDisplayName: "دانش‌آموز تستی پنجم",
      subjectId: cartridge.subject.id,
      responses: [
        {
          itemId: cartridge.diagnostic_items[0].id,
          kcId: cartridge.diagnostic_items[0].kc_id,
          isCorrect: true,
          isNotSure: false,
        },
      ],
      masteries: {
        [cartridge.knowledge_components[0].id]: 0.85,
      },
      isCompleted: true,
    });

    expect(saveRes.success).toBe(true);

    // Retrieve Student Mastery
    const studentRes = await getStudentMasteryStates(testUsername);
    expect(studentRes.success).toBe(true);
    expect(studentRes.masteries.length).toBeGreaterThan(0);

    // Retrieve Class Stats
    const classStats = await getClassDiagnosticStats(cartridge.subject.id);
    expect(classStats.success).toBe(true);
    expect(classStats.totalStudents).toBeGreaterThan(0);
    expect(classStats.kcStats.length).toBe(5);
  });
});
