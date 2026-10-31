"use server";

import { prisma } from "@/lib/db/prisma";

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
 * Persists an assessment session and student latent mastery states to PostgreSQL.
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

    // 4. Update Latent Mastery States for each assessed Knowledge Component
    for (const [kcId, masteryProb] of Object.entries(payload.masteries)) {
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
          lastAssessedAt: new Date(),
        },
        create: {
          learnerId: learner.id,
          kcId,
          masteryProbability: masteryProb,
          opportunityCount: 1,
          lastAssessedAt: new Date(),
        },
      });
    }

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    // If DB is unreachable (e.g. offline or pending cloud URL), return safe fallback flag
    return {
      success: false,
      offline: true,
      error: error?.message || "Database connection unavailable",
    };
  }
}

/**
 * Retrieves the latest latent mastery state of a student from PostgreSQL.
 * Conforms to Rule 7: returns empty array if no data exists; no in-code mock fallbacks.
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

    if (!learner || !learner.masteryStates) {
      return { success: true, masteries: [] };
    }

    return {
      success: true,
      masteries: learner.masteryStates.map((state) => ({
        kcId: state.kcId,
        title: state.kc.title,
        masteryProbability: state.masteryProbability,
        isMastered: state.masteryProbability >= 0.85,
        opportunityCount: state.opportunityCount,
      })),
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
