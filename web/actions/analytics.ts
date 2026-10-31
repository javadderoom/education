"use server";

import { prisma } from "@/lib/db/prisma";
import { getPedagogicalReviewStatus } from "@/lib/bkt/fsrs";

export interface KCDiagnosticStat {
  id: string;
  title: string;
  averageMastery: number; // 0 to 100
  masteredCount: number;
  totalStudents: number;
}

export interface MisconceptionDiagnosticStat {
  id: string;
  title: string;
  prevalencePercent: number; // 0 to 100
  detectedCount: number;
  recommendedAction: string;
}

export interface ClassDiagnosticSummary {
  success: boolean;
  totalStudents: number;
  classAverageMastery: number;
  mostPrevalentMisconception: string | null;
  kcStats: KCDiagnosticStat[];
  misconceptionStats: MisconceptionDiagnosticStat[];
  error?: string;
}

export interface LearnerProfileSummary {
  id: string;
  username: string;
  displayName: string;
  gradeLevel: number;
  sessionsCount: number;
  masteryCount: number;
  averageMastery: number;
  lastActive: Date | null;
}

/**
 * Retrieves aggregate class-level diagnostic statistics from PostgreSQL.
 * Conforms strictly to Rule 7 (No in-code mock data).
 */
export async function getClassDiagnosticStats(
  subjectId: string = "SUBJ-MATH4-FRACTIONS"
): Promise<ClassDiagnosticSummary> {
  try {
    // 1. Get all KCs for this subject
    const kcs = await prisma.knowledgeComponent.findMany({
      where: { subjectId },
      include: {
        masteryStates: true,
      },
    });

    // 2. Get all Misconceptions for this subject
    const misconceptions = await prisma.misconception.findMany({
      where: {
        kc: {
          subjectId,
        },
      },
    });

    // 3. Count total active learners who have taken at least one session
    const totalStudents = await prisma.learner.count({
      where: {
        sessions: {
          some: { subjectId },
        },
      },
    });

    if (totalStudents === 0 || kcs.length === 0) {
      return {
        success: true,
        totalStudents: 0,
        classAverageMastery: 0,
        mostPrevalentMisconception: null,
        kcStats: kcs.map((kc) => ({
          id: kc.id,
          title: kc.title,
          averageMastery: 0,
          masteredCount: 0,
          totalStudents: 0,
        })),
        misconceptionStats: misconceptions.map((m) => ({
          id: m.id,
          title: m.title,
          prevalencePercent: 0,
          detectedCount: 0,
          recommendedAction: m.description,
        })),
      };
    }

    // 4. Compute per-KC mastery statistics
    const kcStats: KCDiagnosticStat[] = kcs.map((kc) => {
      const states = kc.masteryStates || [];
      const count = states.length;
      if (count === 0) {
        return {
          id: kc.id,
          title: kc.title,
          averageMastery: 0,
          masteredCount: 0,
          totalStudents: 0,
        };
      }

      const sumMastery = states.reduce((acc, s) => acc + s.masteryProbability, 0);
      const avg = Math.round((sumMastery / count) * 100);
      const mastered = states.filter((s) => s.masteryProbability >= 0.85).length;

      return {
        id: kc.id,
        title: kc.title,
        averageMastery: avg,
        masteredCount: mastered,
        totalStudents: count,
      };
    });

    // 5. Compute Misconception prevalence from Item Responses
    const misconceptionStats: MisconceptionDiagnosticStat[] = await Promise.all(
      misconceptions.map(async (m) => {
        // Count how many unique learners triggered this misconception
        const learnersWithMisconception = await prisma.itemResponse.findMany({
          where: {
            diagnosedMisconceptionId: m.id,
            session: { subjectId },
          },
          select: {
            session: {
              select: { learnerId: true },
            },
          },
          distinct: ["sessionId"],
        });

        const detectedCount = learnersWithMisconception.length;
        const prevalencePercent =
          totalStudents > 0
            ? Math.round((detectedCount / totalStudents) * 100)
            : 0;

        return {
          id: m.id,
          title: m.title,
          prevalencePercent,
          detectedCount,
          recommendedAction: m.description,
        };
      })
    );

    // 6. Overall class average and most prevalent misconception
    const sumAllKcAvg = kcStats.reduce((acc, k) => acc + k.averageMastery, 0);
    const classAverageMastery =
      kcStats.length > 0 ? Math.round(sumAllKcAvg / kcStats.length) : 0;

    const sortedMisconceptions = [...misconceptionStats].sort(
      (a, b) => b.detectedCount - a.detectedCount
    );
    const mostPrevalent =
      sortedMisconceptions.length > 0 && sortedMisconceptions[0].detectedCount > 0
        ? sortedMisconceptions[0].title
        : null;

    return {
      success: true,
      totalStudents,
      classAverageMastery,
      mostPrevalentMisconception: mostPrevalent,
      kcStats,
      misconceptionStats,
    };
  } catch (error: any) {
    return {
      success: false,
      totalStudents: 0,
      classAverageMastery: 0,
      mostPrevalentMisconception: null,
      kcStats: [],
      misconceptionStats: [],
      error: error?.message || "Failed to query class diagnostic stats",
    };
  }
}

/**
 * Retrieves all registered learner profiles for quick switching in student portal.
 */
export async function getLearnersList(): Promise<{
  success: boolean;
  learners: LearnerProfileSummary[];
  error?: string;
}> {
  try {
    const learners = await prisma.learner.findMany({
      include: {
        sessions: {
          select: { id: true, startedAt: true },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        masteryStates: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const summary: LearnerProfileSummary[] = learners.map((l) => {
      const masteries = l.masteryStates || [];
      const masteredCount = masteries.filter((m) => m.masteryProbability >= 0.85).length;
      const avgMastery =
        masteries.length > 0
          ? Math.round(
              (masteries.reduce((acc, m) => acc + m.masteryProbability, 0) /
                masteries.length) *
                100
            )
          : 15;

      const lastActive = l.sessions[0]?.startedAt || l.updatedAt || null;

      return {
        id: l.id,
        username: l.username,
        displayName: l.displayName,
        gradeLevel: l.gradeLevel,
        sessionsCount: l.sessions.length,
        masteryCount: masteredCount,
        averageMastery: avgMastery,
        lastActive,
      };
    });

    return { success: true, learners: summary };
  } catch (error: any) {
    return {
      success: false,
      learners: [],
      error: error?.message || "Failed to load learners list",
    };
  }
}

/**
 * Creates or gets a learner by display name.
 */
export async function createOrSelectLearner(displayName: string): Promise<{
  success: boolean;
  learner?: { id: string; username: string; displayName: string };
  error?: string;
}> {
  try {
    const trimmed = displayName.trim();
    if (!trimmed) {
      return { success: false, error: "نام دانش‌آموز نمی‌تواند خالی باشد" };
    }

    // Generate safe deterministic username from display name
    const sanitized = trimmed
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
      .toLowerCase();
    const username = `student_${sanitized}`;

    const learner = await prisma.learner.upsert({
      where: { username },
      update: { displayName: trimmed },
      create: {
        username,
        displayName: trimmed,
        gradeLevel: 4,
      },
    });

    return {
      success: true,
      learner: {
        id: learner.id,
        username: learner.username,
        displayName: learner.displayName,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to create or select learner",
    };
  }
}
