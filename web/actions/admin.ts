"use server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getAuthSession } from "@/lib/auth/session";
import { listAvailableCartridges } from "@/lib/data/cartridge";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalSessions: number;
  totalItems: number;
  classrooms: Array<{
    id: string;
    name: string;
    gradeLevel: number;
    schoolName: string | null;
    teacherName: string | null;
    studentsCount: number;
  }>;
  curricula: Array<{
    cartridgeId: string;
    title: string;
    subjectId: string;
    subjectName: string;
    gradeLevel: number;
    itemCount: number;
  }>;
}

/**
 * Retrieves aggregate system administration statistics.
 */
export async function getAdminOverviewStats(): Promise<{
  success: boolean;
  stats?: AdminStats;
  error?: string;
}> {
  try {
    const [totalStudents, totalTeachers, totalClassrooms, totalSessions, totalItems, classroomsRaw] =
      await Promise.all([
        prisma.learner.count({ where: { role: "student" } }),
        prisma.learner.count({ where: { role: "teacher" } }),
        prisma.classroom.count(),
        prisma.assessmentSession.count(),
        prisma.diagnosticItem.count(),
        prisma.classroom.findMany({
          include: {
            teacher: { select: { displayName: true } },
            _count: { select: { students: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const classrooms = classroomsRaw.map((c) => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      schoolName: c.schoolName,
      teacherName: c.teacher?.displayName || "تعیین نشده",
      studentsCount: c._count.students,
    }));

    const curricula = listAvailableCartridges();

    return {
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClassrooms,
        totalSessions,
        totalItems,
        classrooms,
        curricula,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در دریافت آمار مدیریت" };
  }
}

/**
 * Fetches users list with optional role filtering.
 */
export async function getAdminUsersList(role?: string): Promise<{
  success: boolean;
  users: Array<{
    id: string;
    username: string;
    displayName: string;
    role: string;
    gradeLevel: number;
    phone: string | null;
    schoolName: string | null;
    classroomName: string | null;
    sessionsCount: number;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const whereClause: any = {};
    if (role && role !== "all") {
      whereClause.role = role;
    }

    const users = await prisma.learner.findMany({
      where: whereClause,
      include: {
        classroom: { select: { name: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        gradeLevel: u.gradeLevel,
        phone: u.phone,
        schoolName: u.schoolName,
        classroomName: u.classroom?.name || null,
        sessionsCount: u._count.sessions,
        createdAt: u.createdAt,
      })),
    };
  } catch (err: any) {
    return { success: false, users: [], error: err?.message || "خطا در دریافت کاربران" };
  }
}

/**
 * Creates a new Classroom.
 */
export async function createClassroomAction(params: {
  name: string;
  gradeLevel: number;
  schoolName?: string;
  teacherId?: string;
}): Promise<{ success: boolean; classroomId?: string; error?: string }> {
  try {
    if (!params.name.trim()) {
      return { success: false, error: "نام کلاس الزامی است." };
    }

    const classroom = await prisma.classroom.create({
      data: {
        name: params.name.trim(),
        gradeLevel: params.gradeLevel || 4,
        schoolName: params.schoolName?.trim() || null,
        teacherId: params.teacherId || null,
      },
    });

    return { success: true, classroomId: classroom.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در ایجاد کلاس" };
  }
}

/**
 * Deletes a user by ID.
 */
export async function deleteUserAction(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.learner.delete({ where: { id: userId } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در حذف کاربر" };
  }
}
