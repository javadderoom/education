"use server";

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getAuthSession } from "@/lib/auth/session";
import { listAvailableCartridges, resolveCanonicalDir, CanonicalCartridge } from "@/lib/data/cartridge";

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

/**
 * Ingests and imports a complete Curriculum Cartridge JSON package into PostgreSQL
 * and local canonical storage without requiring a git push or server restart.
 */
export async function importCartridgePackageAction(rawJsonString: string): Promise<{
  success: boolean;
  message?: string;
  cartridgeSummary?: {
    cartridgeId: string;
    title: string;
    subjectId: string;
    kcCount: number;
    itemCount: number;
    misconceptionCount: number;
  };
  error?: string;
}> {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "admin") {
      return { success: false, error: "دسترسی تنها برای مدیر ارشد سامانه مجاز است." };
    }

    if (!rawJsonString || !rawJsonString.trim()) {
      return { success: false, error: "محتوای فایل کارتریج نمی‌تواند خالی باشد." };
    }

    let cartridge: CanonicalCartridge;
    try {
      cartridge = JSON.parse(rawJsonString);
    } catch {
      return { success: false, error: "فایل بارگذاری شده حاوی قالب معتبر JSON نیست." };
    }

    // Validate structural requirements
    if (!cartridge.cartridge_id || !cartridge.title) {
      return { success: false, error: "فیلدهای کلیدی cartridge_id و title در بسته درسی یافت نشد." };
    }
    if (!cartridge.domain?.id || !cartridge.subject?.id) {
      return { success: false, error: "مشخصات حوزه درسی (domain) یا درس (subject) در کارتریج نامعتبر است." };
    }
    if (!Array.isArray(cartridge.knowledge_components) || cartridge.knowledge_components.length === 0) {
      return { success: false, error: "حداقل یک مفهوم کلیدی (Knowledge Component) در کارتریج الزامی است." };
    }
    if (!Array.isArray(cartridge.diagnostic_items) || cartridge.diagnostic_items.length === 0) {
      return { success: false, error: "حداقل یک سوال تشخیصی (Diagnostic Item) در کارتریج الزامی است." };
    }

    // 1. Upsert Domain
    await prisma.domain.upsert({
      where: { id: cartridge.domain.id },
      update: { name: cartridge.domain.name },
      create: {
        id: cartridge.domain.id,
        name: cartridge.domain.name,
        category: cartridge.domain.category || "k12",
      },
    });

    // 2. Upsert Subject
    await prisma.subject.upsert({
      where: { id: cartridge.subject.id },
      update: {
        name: cartridge.subject.name,
        gradeLevel: cartridge.subject.grade_level || 4,
      },
      create: {
        id: cartridge.subject.id,
        domainId: cartridge.domain.id,
        name: cartridge.subject.name,
        gradeLevel: cartridge.subject.grade_level || 4,
      },
    });

    // 3. Upsert Knowledge Components
    for (const kc of cartridge.knowledge_components) {
      await prisma.knowledgeComponent.upsert({
        where: { id: kc.id },
        update: {
          title: kc.title,
          bloomLevel: kc.bloom_level || "understand",
          description: kc.description || null,
        },
        create: {
          id: kc.id,
          subjectId: cartridge.subject.id,
          title: kc.title,
          bloomLevel: kc.bloom_level || "understand",
          description: kc.description || null,
        },
      });
    }

    // 4. Upsert Misconceptions
    if (Array.isArray(cartridge.misconceptions)) {
      for (const m of cartridge.misconceptions) {
        // Find matching KC or fallback to first KC of cartridge
        const matchedKc = cartridge.knowledge_components.find((k) =>
          m.id.toLowerCase().includes(k.id.toLowerCase())
        );
        const kcId = matchedKc ? matchedKc.id : cartridge.knowledge_components[0].id;

        await prisma.misconception.upsert({
          where: { id: m.id },
          update: {
            title: m.title,
            description: m.description,
            counterExampleBlueprint: JSON.stringify(m.counter_example_blueprint || {}),
          },
          create: {
            id: m.id,
            kcId,
            title: m.title,
            description: m.description,
            counterExampleBlueprint: JSON.stringify(m.counter_example_blueprint || {}),
          },
        });
      }
    }

    // 5. Upsert Diagnostic Items & Distractors
    for (const item of cartridge.diagnostic_items) {
      await prisma.diagnosticItem.upsert({
        where: { id: item.id },
        update: {
          stem: item.stem,
          difficulty: item.difficulty ?? 0.5,
          guessParam: item.guess_param ?? 0.2,
          slipParam: item.slip_param ?? 0.1,
          visualTemplateType: item.visual_template?.type || null,
          visualTemplateProps: item.visual_template?.props
            ? JSON.stringify(item.visual_template.props)
            : null,
        },
        create: {
          id: item.id,
          kcId: item.kc_id,
          stem: item.stem,
          difficulty: item.difficulty ?? 0.5,
          guessParam: item.guess_param ?? 0.2,
          slipParam: item.slip_param ?? 0.1,
          visualTemplateType: item.visual_template?.type || null,
          visualTemplateProps: item.visual_template?.props
            ? JSON.stringify(item.visual_template.props)
            : null,
        },
      });

      // Clear & re-create Distractors
      await prisma.distractor.deleteMany({ where: { itemId: item.id } });
      if (Array.isArray(item.distractors) && item.distractors.length > 0) {
        await prisma.distractor.createMany({
          data: item.distractors.map((d) => ({
            id: d.id,
            itemId: item.id,
            label: d.label,
            content: d.content,
            isCorrect: d.is_correct ?? false,
            misconceptionId: d.misconception_id || null,
            rationale: d.rationale || null,
          })),
        });
      }
    }

    // 6. Write file to canonical folder for instant availability
    try {
      const canonicalDir = resolveCanonicalDir();
      if (fs.existsSync(canonicalDir)) {
        const safeFilename = `${cartridge.cartridge_id.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.json`;
        const targetPath = path.resolve(canonicalDir, safeFilename);
        fs.writeFileSync(targetPath, JSON.stringify(cartridge, null, 2), "utf-8");
      }
    } catch {
      // Non-fatal if filesystem is read-only
    }

    return {
      success: true,
      message: `بسته درسی «${cartridge.title}» با موفقیت در پایگاه داده ثبت و بارگذاری گردید.`,
      cartridgeSummary: {
        cartridgeId: cartridge.cartridge_id,
        title: cartridge.title,
        subjectId: cartridge.subject.id,
        kcCount: cartridge.knowledge_components.length,
        itemCount: cartridge.diagnostic_items.length,
        misconceptionCount: cartridge.misconceptions?.length || 0,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "خطای پیش‌بینی نشده در بارگذاری بسته درسی",
    };
  }
}
