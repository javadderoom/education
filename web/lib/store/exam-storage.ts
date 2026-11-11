import { DiagnosticItemData, DistractorItem } from "@/components/assessment/AssessmentCarousel";

export interface ActiveExamSession {
  sessionId: string;
  subjectId: string;
  studentUsername: string;
  studentName: string;
  selectedTopicIds: string[];
  currentIndex: number;
  items: DiagnosticItemData[];
  history: Array<{
    itemId: string;
    kcId: string;
    isCorrect: boolean;
    isNotSure: boolean;
    timestamp: number;
  }>;
  masteries: Record<string, number>;
  targetSessionLimit: number;
  shuffledDistractors?: Record<string, DistractorItem[]>;
  startedAt: number;
  lastUpdatedAt: number;
}

const STORAGE_PREFIX = "edu_active_exam_v2";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours validity

function getStorageKey(subjectId: string, username: string = "guest"): string {
  return `${STORAGE_PREFIX}_${username}_${subjectId}`;
}

/**
 * Saves the current state of an active exam session to local storage.
 */
export function saveActiveExamSession(session: ActiveExamSession): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const key = getStorageKey(session.subjectId, session.studentUsername);
    const payload = JSON.stringify({
      ...session,
      lastUpdatedAt: Date.now(),
    });
    window.localStorage.setItem(key, payload);
  } catch (err) {
    console.warn("Failed to save active exam session to localStorage:", err);
  }
}

/**
 * Loads an in-progress active exam session from local storage.
 * Returns null if not found, malformed, or expired.
 */
export function loadActiveExamSession(
  subjectId: string,
  username: string = "guest"
): ActiveExamSession | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const key = getStorageKey(subjectId, username);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const data: ActiveExamSession = JSON.parse(raw);

    // Check expiration
    if (Date.now() - (data.lastUpdatedAt || data.startedAt) > EXPIRY_MS) {
      clearActiveExamSession(subjectId, username);
      return null;
    }

    if (!data.sessionId || !Array.isArray(data.items) || data.items.length === 0) {
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Failed to load active exam session from localStorage:", err);
    return null;
  }
}

/**
 * Clears an active exam session upon completion or manual restart.
 */
export function clearActiveExamSession(
  subjectId: string,
  username: string = "guest"
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const key = getStorageKey(subjectId, username);
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn("Failed to clear active exam session from localStorage:", err);
  }
}

