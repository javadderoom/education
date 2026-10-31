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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border-t-2 sm:border-2 border-indigo-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] relative animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Header Badge */}
        <div className="flex items-center gap-3 text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl mb-4">
          <Lightbulb className="w-6 h-6 shrink-0 text-amber-600 animate-bounce" />
          <div>
            <h3 className="font-bold text-sm">نکته آموزشی و تفکر بیشتر</h3>
            {misconceptionTitle && (
              <p className="text-xs text-amber-900/80 mt-0.5 font-medium">
                <MathRenderer content={misconceptionTitle} />
              </p>
            )}
          </div>
        </div>

        {/* Counter-example / Pedagogical conflict scenario */}
        <div className="space-y-3.5 my-3">
          {rationale && (
            <div className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1 text-xs">علت این پاسخ:</span>
              <MathRenderer content={rationale} />
            </div>
          )}

          {parsedBlueprint?.scenario && (
            <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-indigo-900 block mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                مثال نقض برای درک بهتر:
              </span>
              <div className="text-sm text-indigo-950 font-medium leading-relaxed">
                <MathRenderer content={parsedBlueprint.scenario} />
              </div>
            </div>
          )}
        </div>

        {/* Action Button (Large Touch Area) */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>متوجه شدم، سوال بعدی</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
