/**
 * Pure TypeScript Bayesian Knowledge Tracing (BKT) Engine
 * Implements Corbett & Anderson (1995) Bayesian update rules
 * with honest "I'm Not Sure" adjustment to eliminate guessing noise.
 */

import { BKTParameters, DEFAULT_BKT_PARAMS, MasteryUpdateResult } from "./types";

/**
 * Updates latent mastery probability P(L_t) given the student's response.
 *
 * @param prior Current latent mastery probability P(L_{t-1})
 * @param isCorrect Whether the answer was correct
 * @param isNotSure Whether the student clicked "I'm Not Sure"
 * @param params BKT model parameters (prior, learn, guess, slip)
 * @returns Updated mastery probability and mastery classification
 */
export function updateMastery(
  prior: number,
  isCorrect: boolean,
  isNotSure: boolean = false,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): MasteryUpdateResult {
  // Clamp prior to open interval (0, 1) to avoid divide-by-zero or absorbing states
  const pPrior = Math.max(0.001, Math.min(0.999, prior));
  const { learn, guess, slip } = params;

  let posterior: number;

  if (isNotSure) {
    // Honest uncertainty: No guessing occurred.
    // Downscale prior gently without harsh penalty of a typical wrong guess.
    posterior = Math.max(0.05, pPrior * 0.90);
  } else if (isCorrect) {
    // P(L_t | Correct) = [ P(L_{t-1}) * (1 - S) ] / [ P(L_{t-1}) * (1 - S) + (1 - P(L_{t-1})) * G ]
    const numerator = pPrior * (1 - slip);
    const denominator = numerator + (1 - pPrior) * guess;
    posterior = numerator / denominator;
  } else {
    // P(L_t | Incorrect) = [ P(L_{t-1}) * S ] / [ P(L_{t-1}) * S + (1 - P(L_{t-1})) * (1 - G) ]
    const numerator = pPrior * slip;
    const denominator = numerator + (1 - pPrior) * (1 - guess);
    posterior = numerator / denominator;
  }

  // Predict mastery for next opportunity:
  // P(L_{t+1}) = P(L_t | Obs) + (1 - P(L_t | Obs)) * P(T)
  const predictedNext = posterior + (1 - posterior) * learn;

  const clampedPosterior = Math.max(0.001, Math.min(0.999, posterior));
  const clampedNext = Math.max(0.001, Math.min(0.999, predictedNext));

  return {
    priorMastery: pPrior,
    posteriorMastery: Number(clampedPosterior.toFixed(4)),
    predictedNextMastery: Number(clampedNext.toFixed(4)),
    isMastered: clampedPosterior >= 0.85,
    isAtRisk: clampedPosterior < 0.40,
  };
}
