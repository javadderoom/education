"use server";

import { prisma } from "@/lib/db/prisma";
import { updateFSRS, getPedagogicalReviewStatus, FSRSRecord } from "@/lib/bkt/fsrs";

export interface SessionSubmissionPayload {
  sessionId?: string;
  learnerUsername?: string;
  learnerDisplayName?: string;
  subjectId?: string;
  responses: Array<{
    itemId: string;
    kcId: string;
    selectedDistractorId?: string | null;
    isCorrect: boolean;
    isNotSure: boolean;
    responseTimeMs?: number;
    priorMastery?: number;
    posteriorMastery?: number;
    diagnosedMisconceptionId?: string | null;
  }>;
  masteries: Record<string, number>;
  isCompleted?: boolean;
}

/**
 * Persists an assessment session, item responses, and updates latent mastery states
 * with both Bayesian Knowledge Tracing (BKT) and FSRS memory stability scheduling.
 * Gracefully handles offline / disconnected DB state so UI continues uninterrupted.
 */
export async function saveAssessmentSession(payload: SessionSubmissionPayload) {
  try {
    const username = payload.learnerUsername || "student_ali";
    const displayName = payload.learnerDisplayName || "علی رضایی";
    const subjectId = payload.subjectId || "SUBJ-MATH4-FRACTIONS";

    // 1. Ensure Learner exists
    const learner = await prisma.learner.upsert({
      where: { username },
      update: { displayName },
      create: {
        username,
        displayName,
        gradeLevel: 4,
      },
    });

    // 2. Create Assessment Session
    const session = await prisma.assessmentSession.create({
      data: {
        id: payload.sessionId,
        learnerId: learner.id,
        subjectId,
        completedAt: payload.isCompleted ? new Date() : null,
      },
    });

    // 3. Record individual item responses
    if (payload.responses && payload.responses.length > 0) {
      await prisma.itemResponse.createMany({
        data: payload.responses.map((res) => ({
          sessionId: session.id,
          itemId: res.itemId,
          selectedDistractorId: res.selectedDistractorId || null,
          isCorrect: res.isCorrect,
          isNotSure: res.isNotSure,
          responseTimeMs: res.responseTimeMs || 0,
          priorMastery: res.priorMastery ?? 0.15,
          posteriorMastery: res.posteriorMastery ?? 0.15,
          diagnosedMisconceptionId: res.diagnosedMisconceptionId || null,
        })),
        skipDuplicates: true,
      });
    }

    // 4. Update Latent Mastery States & FSRS scheduling for each assessed Knowledge Component
    for (const [kcId, masteryProb] of Object.entries(payload.masteries)) {
      // Find existing state to pass to FSRS
      const existing = await prisma.latentMasteryState.findUnique({
        where: {
          learnerId_kcId: {
            learnerId: learner.id,
            kcId,
          },
        },
      });

      const fsrsRecord: FSRSRecord = {
        stabilityScore: existing?.stabilityScore ?? 1.0,
        difficultyScore: existing?.difficultyScore ?? 5.0,
        lastAssessedAt: existing?.lastAssessedAt ?? new Date(),
        opportunityCount: existing?.opportunityCount ?? 0,
      };

      // Determine outcome for this KC
      const kcResponses = (payload.responses || []).filter((r) => r.kcId === kcId);
      let outcome: "correct" | "incorrect" | "not_sure" = "correct";
      if (kcResponses.some((r) => !r.isCorrect && !r.isNotSure)) {
        outcome = "incorrect";
      } else if (kcResponses.some((r) => r.isNotSure)) {
        outcome = "not_sure";
      } else if (kcResponses.length > 0 && kcResponses.every((r) => r.isCorrect)) {
        outcome = "correct";
      }

      const fsrsResult = updateFSRS(fsrsRecord, outcome);

      await prisma.latentMasteryState.upsert({
        where: {
          learnerId_kcId: {
            learnerId: learner.id,
            kcId,
          },
        },
        update: {
          masteryProbability: masteryProb,
          opportunityCount: { increment: 1 },
          stabilityScore: fsrsResult.stabilityScore,
          difficultyScore: fsrsResult.difficultyScore,
          lastAssessedAt: new Date(),
          nextReviewDue: fsrsResult.nextReviewDue,
        },
        create: {
          learnerId: learner.id,
          kcId,
          masteryProbability: masteryProb,
          opportunityCount: 1,
          stabilityScore: fsrsResult.stabilityScore,
          difficultyScore: fsrsResult.difficultyScore,
          lastAssessedAt: new Date(),
          nextReviewDue: fsrsResult.nextReviewDue,
        },
      });
    }

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    // If DB is unreachable (e.g. offline), return safe fallback flag
    return {
      success: false,
      offline: true,
      error: error?.message || "Database connection unavailable",
    };
  }
}

/**
 * Retrieves the latest latent mastery state and FSRS review schedule of a student from PostgreSQL.
 * Conforms strictly to Rule 7: returns empty array if no data exists; no in-code mock fallbacks.
 */
export async function getStudentMasteryStates(username: string = "student_ali") {
  try {
    const learner = await prisma.learner.findUnique({
      where: { username },
      include: {
        masteryStates: {
          include: {
            kc: true,
          },
        },
      },
    });

    if (!learner || !learner.masteryStates || learner.masteryStates.length === 0) {
      return { success: true, masteries: [] };
    }

    const now = new Date();

    return {
      success: true,
      learner: {
        id: learner.id,
        username: learner.username,
        displayName: learner.displayName,
      },
      masteries: learner.masteryStates.map((state) => {
        const reviewStatus = getPedagogicalReviewStatus(state.nextReviewDue, now);
        return {
          kcId: state.kcId,
          title: state.kc.title,
          masteryProbability: state.masteryProbability,
          isMastered: state.masteryProbability >= 0.85,
          opportunityCount: state.opportunityCount,
          stabilityScore: state.stabilityScore,
          nextReviewDue: state.nextReviewDue,
          reviewStatus,
        };
      }),
    };
  } catch (error: any) {
    return {
      success: false,
      offline: true,
      masteries: [],
      error: error?.message || "Database connection unavailable",
    };
  }
}
