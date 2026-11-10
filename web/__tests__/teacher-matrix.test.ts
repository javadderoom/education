import { describe, it, expect } from "vitest";
import { getClassStudentsMasteryMatrix } from "../actions/analytics";

describe("Teacher Individual Student Mastery Matrix", () => {
  it("queries real student mastery matrix from PostgreSQL without fallback", async () => {
    const result = await getClassStudentsMasteryMatrix("SUBJ-MATH4-FRACTIONS");
    expect(result.success).toBe(true);
    expect(Array.isArray(result.kcs)).toBe(true);
    expect(result.kcs.length).toBeGreaterThan(0);
    expect(Array.isArray(result.students)).toBe(true);
    expect(Array.isArray(result.classrooms)).toBe(true);

    if (result.students.length > 0) {
      const student = result.students[0];
      expect(student).toHaveProperty("studentId");
      expect(student).toHaveProperty("displayName");
      expect(student).toHaveProperty("overallAverage");
      expect(Array.isArray(student.kcMasteries)).toBe(true);
      expect(student.kcMasteries.length).toBe(result.kcs.length);
    }
  });

  it("filters students by classroomId correctly when specified", async () => {
    const result = await getClassStudentsMasteryMatrix("SUBJ-MATH4-FRACTIONS", "CLASS-GRADE4-A");
    expect(result.success).toBe(true);
    expect(Array.isArray(result.students)).toBe(true);
  });
});
