"use client";

import React from "react";
import { AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import { MathRenderer } from "../ui/MathRenderer";

export interface RemediationModalProps {
  isOpen: boolean;
  misconceptionTitle?: string;
  counterExampleBlueprint?: any;
  rationale?: string | null;
  onDismiss: () => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  isOpen,
  misconceptionTitle,
  counterExampleBlueprint,
  rationale,
  onDismiss,
}) => {
  if (!isOpen) return null;

  let parsedBlueprint = counterExampleBlueprint;
  if (typeof counterExampleBlueprint === "string") {
    try {
      parsedBlueprint = JSON.parse(counterExampleBlueprint);
    } catch {
      parsedBlueprint = { scenario: counterExampleBlueprint };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-indigo-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative">
        {/* Header Badge */}
        <div className="flex items-center gap-3 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl mb-4">
          <Lightbulb className="w-6 h-6 shrink-0 text-amber-600 animate-bounce" />
          <div>
            <h3 className="font-bold text-sm">نکته هوشمند و رفع ابهام آموزشی</h3>
            {misconceptionTitle && (
              <p className="text-xs text-amber-800/80 mt-0.5">{misconceptionTitle}</p>
            )}
          </div>
        </div>

        {/* Counter-example / Pedagogical conflict scenario */}
        <div className="space-y-4 my-4">
          {rationale && (
            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">دلیل گزینه انتخابی:</span>
              <MathRenderer content={rationale} />
            </div>
          )}

          {parsedBlueprint?.scenario && (
            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                مثال نقض برای تفکر بیشتر:
              </span>
              <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                {parsedBlueprint.scenario}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>متوجه شدم، سوال بعدی</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
