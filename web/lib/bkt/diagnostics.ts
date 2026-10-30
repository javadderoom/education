/**
 * Cognitive Diagnostic and Misconception Analyzer
 * Maps selected distractors directly to misconception IDs and blueprints cognitive conflict remediation.
 */

import { DiagnosisResult } from "./types";

export interface DistractorPayload {
  id: string;
  label: string;
  content: string;
  isCorrect: boolean;
  misconceptionId?: string | null;
  rationale?: string | null;
}

export function evaluateDiagnosticResponse(
  selectedDistractor: DistractorPayload | null,
  isNotSure: boolean,
  misconceptionsMap: Record<string, { title: string; counterExampleBlueprint: any }> = {}
): DiagnosisResult {
  if (isNotSure || !selectedDistractor) {
    return {
      isCorrect: false,
      isNotSure: true,
      diagnosedMisconceptionId: null,
      remediationRequired: true,
    };
  }

  if (selectedDistractor.isCorrect) {
    return {
      isCorrect: true,
      isNotSure: false,
      diagnosedMisconceptionId: null,
      remediationRequired: false,
    };
  }

  const misconceptionId = selectedDistractor.misconceptionId || null;
  const misconceptionMeta = misconceptionId ? misconceptionsMap[misconceptionId] : undefined;

  return {
    isCorrect: false,
    isNotSure: false,
    diagnosedMisconceptionId: misconceptionId,
    misconceptionTitle: misconceptionMeta?.title,
    remediationRequired: true,
    counterExampleBlueprint: misconceptionMeta?.counterExampleBlueprint,
  };
}
