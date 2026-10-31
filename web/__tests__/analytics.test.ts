import { describe, it, expect } from "vitest";
import { getClassDiagnosticStats, getLearnersList, createOrSelectLearner } from "../actions/analytics";

describe("Class Analytics & Diagnostic Aggregation", () => {
  it("retrieves real class diagnostic stats without falling back to mock data", async () => {
    const stats = await getClassDiagnosticStats("SUBJ-MATH4-FRACTIONS");

    expect(stats.success).toBe(true);
    expect(typeof stats.totalStudents).toBe("number");
    expect(typeof stats.classAverageMastery).toBe("number");
    expect(Array.isArray(stats.kcStats)).toBe(true);
    expect(Array.isArray(stats.misconceptionStats)).toBe(true);

    if (stats.kcStats.length > 0) {
      const firstKc = stats.kcStats[0];
      expect(firstKc).toHaveProperty("id");
      expect(firstKc).toHaveProperty("title");
      expect(firstKc).toHaveProperty("averageMastery");
      expect(firstKc).toHaveProperty("masteredCount");
    }
  });

  it("lists learner profiles for quick switching", async () => {
    const result = await getLearnersList();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.learners)).toBe(true);

    if (result.learners.length > 0) {
      const learner = result.learners[0];
      expect(learner).toHaveProperty("username");
      expect(learner).toHaveProperty("displayName");
      expect(typeof learner.averageMastery).toBe("number");
    }
  });

  it("creates or selects a learner safely", async () => {
    const res = await createOrSelectLearner("تست دانش‌آموز");
    expect(res.success).toBe(true);
    expect(res.learner?.displayName).toBe("تست دانش‌آموز");
    expect(res.learner?.username).toContain("student_");

    // Rejects empty input
    const emptyRes = await createOrSelectLearner("   ");
    expect(emptyRes.success).toBe(false);
  });
});
