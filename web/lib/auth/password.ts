import crypto from "crypto";

/**
 * Hashes a password using standard Node.js scrypt with salt.
 * 100% Free and Open Source (FOSS), zero external dependencies.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Normalizes and validates 4-digit PIN for kids.
 */
export function isValidPin(pin?: string | null): boolean {
  if (!pin) return true; // PIN can be optional for younger kids
  return /^\d{4}$/.test(pin.trim());
}
