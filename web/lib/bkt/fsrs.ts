/**
 * Free Spaced Repetition Scheduler (FSRS) Engine
 * Designed for elementary cognitive mastery tracking.
 * Calculates memory stability (S), item difficulty (D), and scheduled review intervals.
 */

export interface FSRSRecord {
  stabilityScore: number;    // S: Stability in days (how long retention stays >= 90%)
  difficultyScore: number;   // D: Inherent difficulty (1.0 = easy, 10.0 = hard)
  lastAssessedAt: Date;
  opportunityCount: number;
}

export interface FSRSResult {
  stabilityScore: number;
  difficultyScore: number;
  intervalDays: number;
  nextReviewDue: Date;
  retrievability: number; // 0.0 to 1.0 estimated current recall probability
}

/**
 * Calculates current memory retrievability R based on elapsed time and stability.
 * Formula: R(t, S) = (1 + 0.19 * (t / S))^(-1)
 */
export function calculateRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0.1;
  const factor = 0.19;
  return Math.max(0.01, Math.min(1.0, Math.pow(1 + (factor * elapsedDays) / stability, -1)));
}

/**
 * Updates FSRS memory state after a diagnostic or practice attempt.
 *
 * @param record - Current student memory state for this Knowledge Component
 * @param outcome - 'correct' | 'incorrect' | 'not_sure'
 * @param now - Current timestamp
 */
export function updateFSRS(
  record: FSRSRecord,
  outcome: "correct" | "incorrect" | "not_sure",
  now: Date = new Date()
): FSRSResult {
  const elapsedMs = Math.max(0, now.getTime() - record.lastAssessedAt.getTime());
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  let S = record.stabilityScore || 1.0;
  let D = record.difficultyScore || 5.0;
  const count = (record.opportunityCount || 0) + 1;

  const currentR = calculateRetrievability(elapsedDays, S);

  if (outcome === "correct") {
    // Correct response boosts stability, weighted inversely by difficulty
    const easeFactor = (11 - D) / 6.0;
    // Harder items when recalled correctly provide an even greater stability boost
    const recallSurprise = 1 + (1 - currentR);
    S = S * (1 + easeFactor * recallSurprise);
    D = Math.max(1.0, D - 0.4);
  } else if (outcome === "not_sure") {
    // Honest uncertainty button: mild lapse without penalizing like a blind wrong guess
    S = Math.max(0.5, S * 0.65);
    D = Math.min(9.5, D + 0.3);
  } else {
    // Incorrect answer: lapse
    S = Math.max(0.3, S * 0.35);
    D = Math.min(10.0, D + 0.8);
  }

  // Interval calculation based on desired 90% retention rate
  // S is defined as the time interval where R falls to 0.90
  // Target R = 0.90 => interval = S days
  const intervalDays = Math.max(0.25, Math.round(S * 10) / 10);
  const nextReviewDue = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    stabilityScore: Math.round(S * 100) / 100,
    difficultyScore: Math.round(D * 100) / 100,
    intervalDays,
    nextReviewDue,
    retrievability: Math.round(currentR * 100) / 100,
  };
}

/**
 * Returns pedagogical Persian description of the review status.
 * Zero tech jargon leak compliant (Rule 10).
 */
export function getPedagogicalReviewStatus(nextReviewDue: Date | null, now: Date = new Date()): {
  label: string;
  isDue: boolean;
  colorClass: string;
} {
  if (!nextReviewDue) {
    return {
      label: "آماده برای شروع",
      isDue: true,
      colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };
  }

  const diffMs = nextReviewDue.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      label: "زمان مرور فرا رسیده",
      isDue: true,
      colorClass: "text-rose-700 bg-rose-50 border-rose-200",
    };
  }

  if (diffDays === 1) {
    return {
      label: "مرور فردا",
      isDue: false,
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }

  return {
    label: `مرور در ${diffDays} روز دیگر`,
    isDue: false,
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  };
}
