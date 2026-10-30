/**
 * Bayesian Knowledge Tracing (BKT) and Cognitive Diagnostic Engine Types
 */

export interface BKTParameters {
  /** P(L_0): Initial probability of student having mastered the KC */
  prior: number;
  /** P(T): Probability of transitioning from unmastered to mastered state */
  learn: number;
  /** P(G): Probability of guessing correctly while in unmastered state */
  guess: number;
  /** P(S): Probability of slipping (incorrect answer) while in mastered state */
  slip: number;
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  prior: 0.15,
  learn: 0.20,
  guess: 0.20,
  slip: 0.08,
};

export interface MasteryUpdateResult {
  priorMastery: number;
  posteriorMastery: number;
  predictedNextMastery: number;
  isMastered: boolean;
  isAtRisk: boolean;
}

export interface DiagnosisResult {
  isCorrect: boolean;
  isNotSure: boolean;
  diagnosedMisconceptionId: string | null;
  misconceptionTitle?: string;
  remediationRequired: boolean;
  counterExampleBlueprint?: any;
}
