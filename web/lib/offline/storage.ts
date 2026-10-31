/**
 * Local-First IndexedDB Client Storage for Tablets and Mobile
 * Ensures zero-latency assessment execution and resilience against classroom internet dropouts.
 */

export interface OfflineSessionRecord {
  sessionId: string;
  learnerName: string;
  subjectTitle: string;
  startedAt: number;
  completedAt?: number;
  responses: Array<{
    itemId: string;
    kcId: string;
    isCorrect: boolean;
    isNotSure: boolean;
    timestamp: number;
  }>;
  synced: boolean;
}

const DB_NAME = "edtech_offline_store";
const DB_VERSION = 1;
const SESSIONS_STORE = "assessment_sessions";

export function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: "sessionId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineSession(session: OfflineSessionRecord): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return; // Environment without IndexedDB (e.g. server-side or test mock)
  }
  try {
    const db = await openOfflineDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, "readwrite");
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.put(session);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to persist offline session to IndexedDB:", err);
  }
}

export async function getOfflineSessions(): Promise<OfflineSessionRecord[]> {
  try {
    const db = await openOfflineDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, "readonly");
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to retrieve offline sessions:", err);
    return [];
  }
}

/**
 * Synchronizes un-synced offline sessions to PostgreSQL via Server Action when back online.
 */
export async function syncOfflineSessionsToCloud(
  saveAction: (payload: any) => Promise<{ success: boolean }>
): Promise<number> {
  if (typeof window === "undefined" || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return 0;
  }
  const sessions = await getOfflineSessions();
  const unsynced = sessions.filter((s) => !s.synced && s.completedAt);
  let syncedCount = 0;

  for (const session of unsynced) {
    try {
      const res = await saveAction({
        sessionId: session.sessionId,
        learnerDisplayName: session.learnerName,
        responses: session.responses.map((r) => ({
          itemId: r.itemId,
          kcId: r.kcId,
          isCorrect: r.isCorrect,
          isNotSure: r.isNotSure,
        })),
        masteries: {},
        isCompleted: true,
      });

      if (res.success) {
        session.synced = true;
        await saveOfflineSession(session);
        syncedCount++;
      }
    } catch {
      // Keep unsynced for next online retry
    }
  }

  return syncedCount;
}
