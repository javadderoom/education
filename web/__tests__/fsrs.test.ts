import { describe, it, expect } from "vitest";
import {
  calculateRetrievability,
  updateFSRS,
  getPedagogicalReviewStatus,
} from "../lib/bkt/fsrs";

describe("FSRS Spaced Repetition Engine", () => {
  it("calculates retrievability decaying over time", () => {
    const stability = 5.0; // 5 days stability
    const rDay0 = calculateRetrievability(0, stability);
    const rDay5 = calculateRetrievability(5, stability);
    const rDay20 = calculateRetrievability(20, stability);

    expect(rDay0).toBe(1.0);
    expect(rDay5).toBeLessThan(1.0);
    expect(rDay5).toBeGreaterThan(0.8);
    expect(rDay20).toBeLessThan(rDay5);
  });

  it("increases stability on correct responses", () => {
    const baseRecord = {
      stabilityScore: 2.0,
      difficultyScore: 5.0,
      lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      opportunityCount: 1,
    };

    const result = updateFSRS(baseRecord, "correct");

    expect(result.stabilityScore).toBeGreaterThan(baseRecord.stabilityScore);
    expect(result.difficultyScore).toBeLessThan(baseRecord.difficultyScore);
    expect(result.nextReviewDue.getTime()).toBeGreaterThan(Date.now());
  });

  it("decreases stability on incorrect responses without dropping to zero", () => {
    const baseRecord = {
      stabilityScore: 4.0,
      difficultyScore: 5.0,
      lastAssessedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      opportunityCount: 3,
    };

    const result = updateFSRS(baseRecord, "incorrect");

    expect(result.stabilityScore).toBeLessThan(baseRecord.stabilityScore);
    expect(result.stabilityScore).toBeGreaterThanOrEqual(0.3); // Safeguard minimum
    expect(result.difficultyScore).toBeGreaterThan(baseRecord.difficultyScore);
  });

  it("handles honest uncertainty button moderately", () => {
    const baseRecord = {
      stabilityScore: 3.0,
      difficultyScore: 5.0,
      lastAssessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      opportunityCount: 2,
    };

    const notSureResult = updateFSRS(baseRecord, "not_sure");
    const incorrectResult = updateFSRS(baseRecord, "incorrect");

    // Uncertainty retains more stability than a flat out failure
    expect(notSureResult.stabilityScore).toBeGreaterThan(incorrectResult.stabilityScore);
  });

  it("provides pedagogical zero-jargon review status", () => {
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const pastStatus = getPedagogicalReviewStatus(past, now);
    expect(pastStatus.isDue).toBe(true);
    expect(pastStatus.label).toContain("زمان مرور فرا رسیده");

    const tomorrowStatus = getPedagogicalReviewStatus(tomorrow, now);
    expect(tomorrowStatus.isDue).toBe(false);
    expect(tomorrowStatus.label).toContain("مرور فردا");

    const futureStatus = getPedagogicalReviewStatus(future, now);
    expect(futureStatus.isDue).toBe(false);
    expect(futureStatus.label).toContain("مرور در");
  });
});
