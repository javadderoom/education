export const SESSION_COOKIE_NAME = "edu_session_token";

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
 * Signs a session payload using Web Crypto HMAC-SHA256.
 * Universally safe across Node.js, Next.js Middleware, and Edge.
 */
export async function signSessionToken(data: SessionUser): Promise<string> {
  const json = JSON.stringify(data);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(json));
  const hmacHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const encodedPayload = Buffer.from(json).toString("base64url");
  return `${encodedPayload}.${hmacHex}`;
}

/**
 * Verifies a signed session token using Web Crypto HMAC-SHA256.
 * Returns decoded SessionUser if signature is valid, null otherwise.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, providedHmac] = parts;
    if (!encodedPayload || !providedHmac) return null;

    const json = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(json));
    const expectedHmac = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (providedHmac !== expectedHmac) {
      return null;
    }

    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}
