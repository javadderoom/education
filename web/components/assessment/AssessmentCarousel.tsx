"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle, Award, RotateCcw, ArrowRight } from "lucide-react";
import { MathRenderer } from "../ui/MathRenderer";
import { FractionStrip } from "../parametric/FractionStrip";
import { NumberLine } from "../parametric/NumberLine";
import { AreaGrid } from "../parametric/AreaGrid";
import { BalanceScale } from "../parametric/BalanceScale";
import { BucketSort } from "../parametric/BucketSort";
import { RemediationModal } from "../remediation/RemediationModal";
import { MasteryRadar, KCMasteryInfo } from "./MasteryRadar";
import { updateMastery } from "../../lib/bkt/engine";
import { evaluateDiagnosticResponse } from "../../lib/bkt/diagnostics";

export interface DistractorItem {
  id: string;
  label: string;
  content: string;
  is_correct: boolean;
  misconception_id?: string | null;
  rationale?: string | null;
}

export interface DiagnosticItemData {
  id: string;
  kc_id: string;
  stem: string;
  difficulty: number;
  guess_param: number;
  slip_param: number;
  visual_template?: {
    type: string;
    props: any;
  } | null;
  distractors: DistractorItem[];
}

export interface AssessmentCarouselProps {
  items: DiagnosticItemData[];
  knowledgeComponents: Array<{ id: string; title: string }>;
  misconceptions: Array<{ id: string; title: string; counter_example_blueprint: any }>;
  studentName?: string;
}

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({
  items,
  knowledgeComponents,
  misconceptions,
  studentName = "علی رضایی",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDistractorId, setSelectedDistractorId] = useState<string | null>(null);
  const [activeRemediation, setActiveRemediation] = useState<{
    isOpen: boolean;
    title?: string;
    blueprint?: any;
    rationale?: string | null;
  }>({ isOpen: false });

  // Map of KC Masteries
  const [masteries, setMasteries] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const kc of knowledgeComponents) {
      initial[kc.id] = 0.15; // default BKT prior P(L0)
    }
    return initial;
  });

  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [history, setHistory] = useState<Array<{
    itemId: string;
    kcId: string;
    isCorrect: boolean;
    isNotSure: boolean;
  }>>([]);

  const currentItem = items[currentIndex];

  // Helper map for misconceptions
  const misconceptionsMap = React.useMemo(() => {
    const map: Record<string, { title: string; counterExampleBlueprint: any }> = {};
    for (const m of misconceptions) {
      map[m.id] = {
        title: m.title,
        counterExampleBlueprint: m.counter_example_blueprint,
      };
    }
    return map;
  }, [misconceptions]);

  const handleSelectOption = (distractor: DistractorItem) => {
    if (selectedDistractorId) return; // Prevent double-clicks
    setSelectedDistractorId(distractor.id);

    const diagnosis = evaluateDiagnosticResponse(
      {
        id: distractor.id,
        label: distractor.label,
        content: distractor.content,
        isCorrect: distractor.is_correct,
        misconceptionId: distractor.misconception_id,
        rationale: distractor.rationale,
      },
      false,
      misconceptionsMap
    );

    // Update BKT Mastery for this item's KC
    const prior = masteries[currentItem.kc_id] ?? 0.15;
    const bktResult = updateMastery(prior, distractor.is_correct, false);
    
    setMasteries((prev) => ({
      ...prev,
      [currentItem.kc_id]: bktResult.posteriorMastery,
    }));

    setHistory((prev) => [
      ...prev,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: distractor.is_correct,
        isNotSure: false,
      },
    ]);

    // Check if misconception modal should appear
    if (!distractor.is_correct && distractor.misconception_id) {
      setActiveRemediation({
        isOpen: true,
        title: diagnosis.misconceptionTitle,
        blueprint: diagnosis.counterExampleBlueprint,
        rationale: distractor.rationale,
      });
    } else {
      setTimeout(() => advanceToNext(), 600);
    }
  };

  const handleNotSure = () => {
    if (selectedDistractorId) return;
    setSelectedDistractorId("not_sure");

    const prior = masteries[currentItem.kc_id] ?? 0.15;
    const bktResult = updateMastery(prior, false, true);

    setMasteries((prev) => ({
      ...prev,
      [currentItem.kc_id]: bktResult.posteriorMastery,
    }));

    setHistory((prev) => [
      ...prev,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: false,
        isNotSure: true,
      },
    ]);

    setTimeout(() => advanceToNext(), 500);
  };

  const advanceToNext = () => {
    setSelectedDistractorId(null);
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedDistractorId(null);
    setSessionCompleted(false);
    setHistory([]);
    const resetMasteries: Record<string, number> = {};
    for (const kc of knowledgeComponents) {
      resetMasteries[kc.id] = 0.15;
    }
    setMasteries(resetMasteries);
  };

  const masteryRadarList: KCMasteryInfo[] = knowledgeComponents.map((kc) => ({
    id: kc.id,
    title: kc.title,
    masteryProbability: masteries[kc.id] ?? 0.15,
    isMastered: (masteries[kc.id] ?? 0.15) >= 0.85,
  }));

  // Render Visual Template dynamically
  const renderVisualTemplate = () => {
    if (!currentItem.visual_template) return null;
    const { type, props } = currentItem.visual_template;

    switch (type) {
      case "FractionStrip":
        return <FractionStrip {...props} />;
      case "NumberLine":
        return <NumberLine {...props} />;
      case "AreaGrid":
        return <AreaGrid {...props} />;
      case "BalanceScale":
        return <BalanceScale {...props} />;
      case "BucketSort":
        return <BucketSort {...props} />;
      default:
        return null;
    }
  };

  if (sessionCompleted) {
    const correctCount = history.filter((h) => h.isCorrect).length;
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 bg-white border border-slate-200 rounded-3xl shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">ارزیابی به پایان رسید!</h2>
        <p className="text-sm text-slate-600 mb-6">
          آفرین {studentName} عزیز، نتایج تحلیل میزان تسلط شما بر مفاهیم آماده است:
        </p>

        <div className="mb-6">
          <MasteryRadar masteryList={masteryRadarList} />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex justify-around text-center">
          <div>
            <span className="text-xs text-slate-500 block">پاسخ‌های صحیح</span>
            <span className="text-xl font-bold text-emerald-600 font-mono" dir="ltr">
              {correctCount} / {items.length}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">سوالات بدون اطمینان</span>
            <span className="text-xl font-bold text-amber-600 font-mono" dir="ltr">
              {history.filter((h) => h.isNotSure).length}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">میانگین تسلط بر مفاهیم</span>
            <span className="text-xl font-bold text-indigo-600 font-mono" dir="ltr">
              {Math.round(
                (Object.values(masteries).reduce((a, b) => a + b, 0) /
                  Object.values(masteries).length) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>تکرار مجدد آزمون</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      {/* Top Header Progress */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 block">
            آزمون تشخیصی ریاضی چهارم • فصل دوم: کسرها
          </span>
          <h2 className="text-lg font-bold text-slate-800">
            سوال {currentIndex + 1} از {items.length}
          </h2>
        </div>
        <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Diagnostic Card (2 columns) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Question Stem */}
            <div className="text-base md:text-lg font-bold text-slate-900 mb-4 leading-relaxed">
              <MathRenderer content={currentItem.stem} />
            </div>

            {/* Parametric Visual Template */}
            {renderVisualTemplate()}

            {/* Distractor Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              {currentItem.distractors.map((dis) => {
                const isSelected = selectedDistractorId === dis.id;
                let btnStyle = "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800";
                
                if (isSelected) {
                  btnStyle = dis.is_correct
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                    : "border-rose-400 bg-rose-50 text-rose-900 shadow-sm";
                }

                return (
                  <button
                    key={dis.id}
                    type="button"
                    disabled={selectedDistractorId !== null}
                    onClick={() => handleSelectOption(dis)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-medium text-sm transition-all duration-150 cursor-pointer text-right active:scale-98 ${btnStyle}`}
                  >
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                      {dis.label}
                    </span>
                    <span className="flex-1 font-semibold">
                      <MathRenderer content={dis.content} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Honest Uncertainty Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              disabled={selectedDistractorId !== null}
              onClick={handleNotSure}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>هنوز مطمئن نیستم (بدون کسر نمره)</span>
            </button>
            <span className="text-xs text-slate-400">
              سوال {currentIndex + 1}
            </span>
          </div>
        </div>

        {/* Live Mastery Radar Sidebar (1 column) */}
        <div className="md:col-span-1">
          <MasteryRadar masteryList={masteryRadarList} />
        </div>
      </div>

      {/* Remediation Modal */}
      <RemediationModal
        isOpen={activeRemediation.isOpen}
        misconceptionTitle={activeRemediation.title}
        counterExampleBlueprint={activeRemediation.blueprint}
        rationale={activeRemediation.rationale}
        onDismiss={() => {
          setActiveRemediation({ isOpen: false });
          advanceToNext();
        }}
      />
    </div>
  );
};
