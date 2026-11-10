import { describe, it, expect } from "vitest";
import { joinClassroomAction } from "../actions/auth";

describe("Student Join Classroom Action", () => {
  it("rejects when no active session is present", async () => {
    const res = await joinClassroomAction("CLASS-GRADE4-A");
    expect(res.success).toBe(false);
    expect(res.error).toContain("ابتدا باید وارد حساب کاربری");
  });

  it("rejects empty code input", async () => {
    const res = await joinClassroomAction("   ");
    expect(res.success).toBe(false);
  });
});
