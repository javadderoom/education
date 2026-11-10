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

export interface StudentKCMasteryItem {
  kcId: string;
  kcTitle: string;
  probability: number;
  percent: number;
  status: "mastered" | "developing" | "struggling" | "unassessed";
}

export interface StudentMasteryMatrixRow {
  studentId: string;
  displayName: string;
  username: string;
  classroomName: string | null;
  overallAverage: number;
  lastActive: Date | null;
  kcMasteries: StudentKCMasteryItem[];
  hasMisconception: boolean;
}

export interface ClassStudentsMasteryMatrixResult {
  success: boolean;
  kcs: Array<{ id: string; title: string }>;
  students: StudentMasteryMatrixRow[];
  classrooms: Array<{
    id: string;
    name: string;
    schoolName: string | null;
    gradeLevel: number;
    studentsCount: number;
  }>;
  error?: string;
}

/**
 * Retrieves student-level 2D mastery matrix for a subject and optional classroom filter.
 * Strictly adheres to Rule 7 (all data fetched from PostgreSQL, zero hardcoded in-code mock data).
 */
export async function getClassStudentsMasteryMatrix(
  subjectId: string = "SUBJ-MATH4-FRACTIONS",
  classroomId?: string
): Promise<ClassStudentsMasteryMatrixResult> {
  try {
    const kcs = await prisma.knowledgeComponent.findMany({
      where: { subjectId },
      select: { id: true, title: true },
      orderBy: { id: "asc" },
    });

    const classrooms = await prisma.classroom.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { gradeLevel: "asc" },
    });

    const whereLearners: any = { role: "student" };
    if (classroomId && classroomId !== "all") {
      whereLearners.classroomId = classroomId;
    } else {
      whereLearners.OR = [
        { sessions: { some: { subjectId } } },
        { masteryStates: { some: { kc: { subjectId } } } },
      ];
    }

    const learners = await prisma.learner.findMany({
      where: whereLearners,
      include: {
        classroom: { select: { id: true, name: true } },
        masteryStates: {
          where: { kc: { subjectId } },
        },
        sessions: {
          where: { subjectId },
          orderBy: { startedAt: "desc" },
          take: 1,
          include: {
            responses: {
              where: { diagnosedMisconceptionId: { not: null } },
              take: 1,
            },
          },
        },
      },
      orderBy: { displayName: "asc" },
    });

    const students: StudentMasteryMatrixRow[] = learners.map((l) => {
      const stateMap = new Map(l.masteryStates.map((s) => [s.kcId, s.masteryProbability]));

      let sumPercent = 0;
      let assessedCount = 0;

      const kcMasteries: StudentKCMasteryItem[] = kcs.map((kc) => {
        const prob = stateMap.get(kc.id);
        if (prob === undefined) {
          return {
            kcId: kc.id,
            kcTitle: kc.title,
            probability: 0,
            percent: 0,
            status: "unassessed",
          };
        }

        const pct = Math.round(prob * 100);
        sumPercent += pct;
        assessedCount++;

        let status: "mastered" | "developing" | "struggling" = "developing";
        if (pct >= 85) status = "mastered";
        else if (pct < 60) status = "struggling";

        return {
          kcId: kc.id,
          kcTitle: kc.title,
          probability: prob,
          percent: pct,
          status,
        };
      });

      const overallAverage = assessedCount > 0 ? Math.round(sumPercent / assessedCount) : 0;
      const lastSession = l.sessions[0];
      const hasMisconception = (lastSession?.responses?.length || 0) > 0;

      return {
        studentId: l.id,
        displayName: l.displayName,
        username: l.username,
        classroomName: l.classroom?.name || null,
        overallAverage,
        lastActive: lastSession?.startedAt || null,
        kcMasteries,
        hasMisconception,
      };
    });

    return {
      success: true,
      kcs,
      students,
      classrooms: classrooms.map((c) => ({
        id: c.id,
        name: c.name,
        schoolName: c.schoolName,
        gradeLevel: c.gradeLevel,
        studentsCount: c._count.students,
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      kcs: [],
      students: [],
      classrooms: [],
      error: error?.message || "Failed to load class students mastery matrix",
    };
  }
}
