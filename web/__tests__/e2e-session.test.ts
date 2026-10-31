import { describe, it, expect } from "vitest";
import { prisma } from "../lib/db/prisma";
import { saveAssessmentSession, getStudentMasteryStates } from "../actions/assessment";

describe("E2E Student Session & Database Flow", () => {
  it("persists student assessment session, responses and latent mastery to PostgreSQL", async () => {
    // 1. Verify seeded items exist in local database
    const items = await prisma.diagnosticItem.findMany({
      include: { distractors: true, kc: true },
    });
    expect(items.length).toBeGreaterThan(0);

    const firstItem = items[0];
    const correctDistractor = firstItem.distractors.find((d) => d.isCorrect);
    expect(correctDistractor).toBeDefined();

    // 2. Simulate session submission
    const studentUsername = `test_student_${Date.now()}`;
    const result = await saveAssessmentSession({
      sessionId: `sess_${Date.now()}`,
      learnerUsername: studentUsername,
      learnerDisplayName: "زهرا احمدی",
      subjectId: "SUBJ-MATH4-FRACTIONS",
      responses: [
        {
          itemId: firstItem.id,
          kcId: firstItem.kcId,
          selectedDistractorId: correctDistractor?.id,
          isCorrect: true,
          isNotSure: false,
          priorMastery: 0.15,
          posteriorMastery: 0.55,
        },
      ],
      masteries: {
        [firstItem.kcId]: 0.55,
      },
      isCompleted: true,
    });

    expect(result.success).toBe(true);

    // 3. Query back from database to verify persistence
    const masteryState = await getStudentMasteryStates(studentUsername);
    expect(masteryState.success).toBe(true);
    expect(masteryState.masteries.length).toBeGreaterThan(0);
    expect(masteryState.masteries[0].kcId).toBe(firstItem.kcId);
    expect(masteryState.masteries[0].masteryProbability).toBeCloseTo(0.55);
  });
});
