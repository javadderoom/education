"use server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword, isValidPin } from "@/lib/auth/password";
import { setAuthSession, clearAuthSession, getAuthSession, SessionUser } from "@/lib/auth/session";

export interface AuthResponse {
  success: boolean;
  user?: SessionUser;
  error?: string;
}

/**
 * Kid-friendly student login.
 * If PIN is set, checks PIN; otherwise logs in directly by username/selection.
 */
export async function loginStudentAction(username: string, pinCode?: string): Promise<AuthResponse> {
  try {
    const trimmedUser = username.trim().toLowerCase();
    const learner = await prisma.learner.findUnique({
      where: { username: trimmedUser },
    });

    if (!learner) {
      return { success: false, error: "دانش‌آموزی با این مشخصات یافت نشد." };
    }

    if (learner.role !== "student") {
      return { success: false, error: "این حساب کاربری متعلق به آموزگار یا مدیر است." };
    }

    if (learner.pinCode && pinCode) {
      if (learner.pinCode !== pinCode.trim()) {
        return { success: false, error: "کد پین ۴ رقمی وارد شده نادرست است." };
      }
    }

    const sessionUser: SessionUser = {
      id: learner.id,
      username: learner.username,
      displayName: learner.displayName,
      role: "student",
      gradeLevel: learner.gradeLevel,
      classroomId: learner.classroomId,
      schoolName: learner.schoolName,
    };

    await setAuthSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در ورود به سامانه" };
  }
}

/**
 * Teacher and Admin login with username and password.
 */
export async function loginStaffAction(username: string, password: string): Promise<AuthResponse> {
  try {
    const trimmedUser = username.trim().toLowerCase();
    const user = await prisma.learner.findUnique({
      where: { username: trimmedUser },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "نام کاربری یا رمز عبور نامعتبر است." };
    }

    if (user.role !== "teacher" && user.role !== "admin") {
      return { success: false, error: "دسترسی تنها برای آموزگاران و مدیران مجاز است." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "نام کاربری یا کلمه عبور نادرست است." };
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role as "teacher" | "admin",
      schoolName: user.schoolName,
    };

    await setAuthSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در ورود به سامانه" };
  }
}

/**
 * Registers a new student with simple friendly fields.
 */
export async function registerStudentAction(params: {
  displayName: string;
  gradeLevel: number;
  pinCode?: string;
  classroomId?: string;
  schoolName?: string;
}): Promise<AuthResponse> {
  try {
    const name = params.displayName.trim();
    if (!name) {
      return { success: false, error: "نام و نام خانوادگی الزامی است." };
    }

    if (params.pinCode && !isValidPin(params.pinCode)) {
      return { success: false, error: "کد پین باید دقیقاً ۴ رقم عددی باشد." };
    }

    // Generate unique username from name + timestamp suffix
    const slug = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_").toLowerCase();
    const username = `student_${slug}_${Math.floor(1000 + Math.random() * 9000)}`;

    const learner = await prisma.learner.create({
      data: {
        username,
        displayName: name,
        gradeLevel: params.gradeLevel || 4,
        role: "student",
        pinCode: params.pinCode?.trim() || null,
        classroomId: params.classroomId || null,
        schoolName: params.schoolName || null,
      },
    });

    const sessionUser: SessionUser = {
      id: learner.id,
      username: learner.username,
      displayName: learner.displayName,
      role: "student",
      gradeLevel: learner.gradeLevel,
      classroomId: learner.classroomId,
      schoolName: learner.schoolName,
    };

    await setAuthSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در ثبت نام دانش‌آموز" };
  }
}

/**
 * Registers a new Teacher.
 */
export async function registerTeacherAction(params: {
  displayName: string;
  username: string;
  password: string;
  phone?: string;
  schoolName?: string;
}): Promise<AuthResponse> {
  try {
    const name = params.displayName.trim();
    const user = params.username.trim().toLowerCase();
    const pwd = params.password;

    if (!name || !user || !pwd) {
      return { success: false, error: "تمام فیلدهای ستاره‌دار الزامی هستند." };
    }

    if (pwd.length < 6) {
      return { success: false, error: "کلمه عبور باید حداقل ۶ کاراکتر باشد." };
    }

    // Check existing
    const existing = await prisma.learner.findUnique({ where: { username: user } });
    if (existing) {
      return { success: false, error: "این نام کاربری قبلاً ثبت شده است." };
    }

    const passwordHash = hashPassword(pwd);

    const teacher = await prisma.learner.create({
      data: {
        username: user,
        displayName: name,
        passwordHash,
        role: "teacher",
        phone: params.phone?.trim() || null,
        schoolName: params.schoolName?.trim() || null,
      },
    });

    const sessionUser: SessionUser = {
      id: teacher.id,
      username: teacher.username,
      displayName: teacher.displayName,
      role: "teacher",
      schoolName: teacher.schoolName,
    };

    await setAuthSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در ثبت نام آموزگار" };
  }
}

/**
 * Logs out the current user.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  await clearAuthSession();
  return { success: true };
}

/**
 * Retrieves the currently active user session.
 */
export async function getCurrentUserAction(): Promise<SessionUser | null> {
  return await getAuthSession();
}

/**
 * Allows a student to join a classroom using the class code or identifier.
 */
export async function joinClassroomAction(codeOrId: string): Promise<{
  success: boolean;
  classroomName?: string;
  error?: string;
}> {
  try {
    const session = await getAuthSession();
    if (!session || !session.id) {
      return { success: false, error: "ابتدا باید وارد حساب کاربری خود شوید." };
    }

    const trimmed = codeOrId.trim();
    if (!trimmed) {
      return { success: false, error: "کد کلاس نمی‌تواند خالی باشد." };
    }

    const classroom = await prisma.classroom.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { id: { equals: trimmed, mode: "insensitive" } },
          { name: { contains: trimmed, mode: "insensitive" } },
        ],
      },
    });

    if (!classroom) {
      return { success: false, error: "کلاسی با این کد یافت نشد. لطفاً از آموزگار خود کد را مجدداً بپرسید." };
    }

    await prisma.learner.update({
      where: { id: session.id },
      data: {
        classroomId: classroom.id,
        schoolName: classroom.schoolName || session.schoolName,
      },
    });

    const updatedSession: SessionUser = {
      ...session,
      classroomId: classroom.id,
      schoolName: classroom.schoolName || session.schoolName,
    };
    await setAuthSession(updatedSession);

    return { success: true, classroomName: classroom.name };
  } catch (err: any) {
    return { success: false, error: err?.message || "خطا در پیوستن به کلاس" };
  }
}
