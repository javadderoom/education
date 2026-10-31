import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SessionUser,
  signSessionToken,
  verifySessionToken,
} from "./token";

export type { SessionUser };
export { SESSION_COOKIE_NAME, verifySessionToken };

/**
 * Sets session cookie for authenticated user.
 */
export async function setAuthSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = await signSessionToken(user);

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
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
