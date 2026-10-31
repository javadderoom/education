import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "edu_session_token";
const SECRET_KEY = process.env.AUTH_SECRET || "edu_platform_secret_key_production_foss_2026";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: "student" | "teacher" | "admin";
  gradeLevel?: number;
  classroomId?: string | null;
  schoolName?: string | null;
}

/**
 * Creates a signed tamper-proof cookie payload.
 */
function signPayload(data: SessionUser): string {
  const json = JSON.stringify(data);
  const hmac = crypto.createHmac("sha256", SECRET_KEY).update(json).digest("hex");
  return `${Buffer.from(json).toString("base64url")}.${hmac}`;
}

/**
 * Verifies and decodes a signed cookie payload.
 */
function verifyPayload(token: string): SessionUser | null {
  try {
    const [encoded, hmac] = token.split(".");
    if (!encoded || !hmac) return null;

    const json = Buffer.from(encoded, "base64url").toString("utf-8");
    const expectedHmac = crypto.createHmac("sha256", SECRET_KEY).update(json).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Sets session cookie for authenticated user.
 */
export async function setAuthSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = signPayload(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clears authentication session cookie.
 */
export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Retrieves current authenticated user from session cookie.
 */
export async function getAuthSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyPayload(token);
  } catch {
    return null;
  }
}
