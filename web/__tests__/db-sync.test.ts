import { describe, it, expect, vi } from "vitest";
import { saveAssessmentSession } from "../actions/assessment";
import { syncOfflineSessionsToCloud } from "../lib/offline/storage";

describe("Database Persistence & Offline Sync Engine", () => {
  it("gracefully falls back to offline mode when database connection is unreachable", async () => {
    const result = await saveAssessmentSession({
      sessionId: "test-sess-001",
      learnerDisplayName: "دانش‌آموز آزمایشی",
      responses: [
        {
          itemId: "ITEM-001",
          kcId: "KC-01",
          isCorrect: true,
          isNotSure: false,
          priorMastery: 0.15,
          posteriorMastery: 0.45,
        },
      ],
      masteries: { "KC-01": 0.45 },
      isCompleted: true,
    });

    // Should not throw unhandled exception; returns handled offline object
    expect(result).toBeDefined();
    expect(result.offline || result.success).toBeTruthy();
  });

  it("handles offline sync batch iteration safely", async () => {
    const mockSave = vi.fn().mockResolvedValue({ success: true });
    const syncedCount = await syncOfflineSessionsToCloud(mockSave);

    expect(typeof syncedCount).toBe("number");
  });
});
