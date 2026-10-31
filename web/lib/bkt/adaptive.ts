/**
 * Adaptive Item Selection Engine for Cognitive Diagnostic Assessment
 * Uses Bayesian Knowledge Tracing (BKT) uncertainty & information gain
 * to select the optimal next diagnostic question, minimizing cognitive fatigue.
 */

export interface AdaptiveCandidateItem {
  id: string;
  kc_id: string;
  stem: string;
  difficulty: number;
  guess_param: number;
  slip_param: number;
  visual_template?: any;
  distractors: any[];
}

export interface AdaptiveSelectionState {
  answeredItemIds: Set<string>;
  masteries: Record<string, number>;
  knowledgeComponents: Array<{ id: string; title: string }>;
  maxItemsPerSession?: number;
}

/**
 * Calculates cognitive uncertainty for a given mastery probability.
 * Maximum uncertainty (1.0) occurs at P(L) = 0.50 (complete coin-toss ambiguity).
 * Minimum uncertainty (0.0) occurs at P(L) = 0.0 or 1.0 (certain state).
 */
export function calculateMasteryUncertainty(probability: number): number {
  return 1.0 - 2 * Math.abs(probability - 0.5);
}

/**
 * Selects the next optimal diagnostic question.
 * Prioritizes:
 * 1. Knowledge Components with highest uncertainty (closest to P(L)=0.50).
 * 2. Knowledge Components with mastery < 0.70 (identifying misconceptions).
 * 3. Matching item difficulty to student's current proficiency level.
 */
export function selectNextAdaptiveItem(
  candidateItems: AdaptiveCandidateItem[],
  state: AdaptiveSelectionState
): AdaptiveCandidateItem | null {
  const unasked = candidateItems.filter((item) => !state.answeredItemIds.has(item.id));
  if (unasked.length === 0) return null;

  // If session length cap is reached
  const maxItems = state.maxItemsPerSession ?? 7;
  if (state.answeredItemIds.size >= maxItems) {
    return null;
  }

  // Calculate priority score for each Knowledge Component
  const kcPriors: Record<string, number> = {};
  for (const kc of state.knowledgeComponents) {
    const p = state.masteries[kc.id] ?? 0.15;
    const uncertainty = calculateMasteryUncertainty(p);
    
    // Higher priority if uncertain or if student is struggling and needs diagnosis
    const needPracticeBonus = p < 0.70 ? 0.35 : 0.0;
    kcPriors[kc.id] = uncertainty + needPracticeBonus;
  }

  // Sort unasked items by KC priority and difficulty proximity
  const sorted = [...unasked].sort((a, b) => {
    const priorityA = kcPriors[a.kc_id] ?? 0;
    const priorityB = kcPriors[b.kc_id] ?? 0;

    if (Math.abs(priorityA - priorityB) > 0.15) {
      return priorityB - priorityA; // Higher priority KC first
    }

    // Match item difficulty to current estimated mastery
    const studentMasteryA = state.masteries[a.kc_id] ?? 0.15;
    const studentMasteryB = state.masteries[b.kc_id] ?? 0.15;

    const diffDiffA = Math.abs(a.difficulty - studentMasteryA);
    const diffDiffB = Math.abs(b.difficulty - studentMasteryB);

    return diffDiffA - diffDiffB;
  });

  return sorted[0] || null;
}
