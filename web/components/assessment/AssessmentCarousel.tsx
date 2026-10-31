"use client";

import React, { useState } from "react";
import { HelpCircle, Award, RotateCcw, BarChart2, X, Sparkles, Check } from "lucide-react";
import { MathRenderer } from "../ui/MathRenderer";
import { FractionStrip } from "../parametric/FractionStrip";
import { NumberLine } from "../parametric/NumberLine";
import { AreaGrid } from "../parametric/AreaGrid";
import { BalanceScale } from "../parametric/BalanceScale";
import { BucketSort } from "../parametric/BucketSort";
import { RemediationModal } from "../remediation/RemediationModal";
import { RemediationPathway } from "../remediation/RemediationPathway";
import { MasteryRadar, KCMasteryInfo } from "./MasteryRadar";
import { updateMastery } from "../../lib/bkt/engine";
import { evaluateDiagnosticResponse } from "../../lib/bkt/diagnostics";
import { saveOfflineSession } from "../../lib/offline/storage";

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
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDistractorId, setSelectedDistractorId] = useState<string | null>(null);
  const [showMasterySheet, setShowMasterySheet] = useState(false);
  const [activeWorkshopKC, setActiveWorkshopKC] = useState<{ id: string; title: string } | null>(null);
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
      initial[kc.id] = 0.15; // default initial prior
    }
    return initial;
  });

  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [history, setHistory] = useState<Array<{
    itemId: string;
    kcId: string;
    isCorrect: boolean;
    isNotSure: boolean;
    timestamp: number;
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

  const persistToOfflineDB = (newHistory: typeof history, isFinished: boolean = false) => {
    saveOfflineSession({
      sessionId,
      learnerName: studentName,
      subjectTitle: "فصل دوم: کسرها",
      startedAt: Date.now(),
      completedAt: isFinished ? Date.now() : undefined,
      responses: newHistory,
      synced: false,
    });
  };

  const handleSelectOption = (distractor: DistractorItem) => {
    if (selectedDistractorId) return; // Prevent double taps
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

    // Update Mastery for this item's KC
    const prior = masteries[currentItem.kc_id] ?? 0.15;
    const bktResult = updateMastery(prior, distractor.is_correct, false);

    setMasteries((prev) => ({
      ...prev,
      [currentItem.kc_id]: bktResult.posteriorMastery,
    }));

    const newHistory = [
      ...history,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: distractor.is_correct,
        isNotSure: false,
        timestamp: Date.now(),
      },
    ];
    setHistory(newHistory);
    persistToOfflineDB(newHistory, currentIndex + 1 >= items.length);

    // Check if misconception modal should appear
    if (!distractor.is_correct && distractor.misconception_id) {
      setActiveRemediation({
        isOpen: true,
        title: diagnosis.misconceptionTitle,
        blueprint: diagnosis.counterExampleBlueprint,
        rationale: distractor.rationale,
      });
    } else {
      setTimeout(() => advanceToNext(), 500);
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

    const newHistory = [
      ...history,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: false,
        isNotSure: true,
        timestamp: Date.now(),
      },
    ];
    setHistory(newHistory);
    persistToOfflineDB(newHistory, currentIndex + 1 >= items.length);

    setTimeout(() => advanceToNext(), 400);
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
    setActiveWorkshopKC(null);
    setHistory([]);
    const resetMasteries: Record<string, number> = {};
    for (const kc of knowledgeComponents) {
      resetMasteries[kc.id] = 0.15;
    }
    setMasteries(resetMasteries);
  };

  const handleCompleteWorkshop = (kcId: string) => {
    setMasteries((prev) => ({
      ...prev,
      [kcId]: Math.max(0.78, (prev[kcId] || 0.15) + 0.40),
    }));
    setActiveWorkshopKC(null);
  };

  const masteryRadarList: KCMasteryInfo[] = knowledgeComponents.map((kc) => ({
    id: kc.id,
    title: kc.title,
    masteryProbability: masteries[kc.id] ?? 0.15,
    isMastered: (masteries[kc.id] ?? 0.15) >= 0.85,
  }));

  // Identify KC needing reinforcement
  const needsPracticeKC = knowledgeComponents.find(
    (kc) => (masteries[kc.id] ?? 0.15) < 0.70
  );

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

  // If in interactive workshop mode
  if (activeWorkshopKC) {
    return (
      <RemediationPathway
        kcTitle={activeWorkshopKC.title}
        onComplete={() => handleCompleteWorkshop(activeWorkshopKC.id)}
        onBack={() => setActiveWorkshopKC(null)}
      />
    );
  }

  if (sessionCompleted) {
    const correctCount = history.filter((h) => h.isCorrect).length;
    const averageMastery = Math.round(
      (Object.values(masteries).reduce((a, b) => a + b, 0) /
        Object.values(masteries).length) *
        100
    );

    return (
      <div className="w-full max-w-lg mx-auto py-4 px-2 text-center animate-in fade-in duration-300">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Award className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">ارزیابی به پایان رسید!</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-5">
            آفرین {studentName} عزیز، نتیجه میزان تسلط شما بر کسرها:
          </p>

          <div className="mb-5 text-right">
            <MasteryRadar masteryList={masteryRadarList} />
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 text-center">
            <div className="p-1">
              <span className="text-[11px] text-slate-500 block mb-1">پاسخ‌های صحیح</span>
              <span className="text-lg font-black text-emerald-600 font-mono" dir="ltr">
                {correctCount} / {items.length}
              </span>
            </div>
            <div className="p-1 border-x border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">بدون اطمینان</span>
              <span className="text-lg font-black text-amber-600 font-mono" dir="ltr">
                {history.filter((h) => h.isNotSure).length}
              </span>
            </div>
            <div className="p-1">
              <span className="text-[11px] text-slate-500 block mb-1">میانگین تسلط</span>
              <span className="text-lg font-black text-indigo-600 font-mono" dir="ltr">
                {averageMastery}%
              </span>
            </div>
          </div>

          {/* Interactive Workshop Recommendation */}
          {needsPracticeKC && (
            <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 mb-5 text-right">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>فرصت طلایی تقویت یادگیری:</span>
              </div>
              <p className="text-xs text-indigo-950 mb-3 font-medium">
                مبحث «{needsPracticeKC.title}» نیاز به تمرین دارد. با دست‌ورزی تعاملی تسلط خود را ارتقا دهید.
              </p>
              <button
                type="button"
                onClick={() => setActiveWorkshopKC(needsPracticeKC)}
                className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>شروع کارگاه دست‌ورزی تعاملی</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRestart}
            className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer select-none"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تکرار مجدد آزمون</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1 justify-between select-none">
      {/* Top Tablet/Mobile Progress & Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
            <span>سوال {currentIndex + 1} از {items.length}</span>
            <span className="font-mono text-indigo-600" dir="ltr">
              {Math.round(((currentIndex + 1) / items.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick Drawer Button to View Mastery */}
        <button
          type="button"
          onClick={() => setShowMasterySheet(true)}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
          title="مشاهده میزان تسلط"
        >
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">میزان تسلط</span>
        </button>
      </div>

      {/* Main Diagnostic Question Card */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col flex-1 justify-between mb-3">
        <div>
          {/* Question Stem */}
          <div className="text-base sm:text-lg font-bold text-slate-900 mb-3 leading-relaxed">
            <MathRenderer content={currentItem.stem} />
          </div>

          {/* Parametric Visual Template */}
          <div className="my-2 flex justify-center">
            {renderVisualTemplate()}
          </div>

          {/* Distractor Options Grid (Touch-First Large Buttons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
            {currentItem.distractors.map((dis) => {
              const isSelected = selectedDistractorId === dis.id;
              let btnStyle =
                "border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800";

              if (isSelected) {
                btnStyle = dis.is_correct
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 shadow-sm"
                  : "border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-200 shadow-sm";
              }

              return (
                <button
                  key={dis.id}
                  type="button"
                  disabled={selectedDistractorId !== null}
                  onClick={() => handleSelectOption(dis)}
                  className={`min-h-[58px] flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 font-medium text-base transition-all duration-150 cursor-pointer text-right active:scale-[0.98] ${btnStyle}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs shadow-xs">
                    {dis.label}
                  </span>
                  <span className="flex-1 font-semibold text-sm sm:text-base">
                    <MathRenderer content={dis.content} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Thumb-Friendly Area: Not Sure Button + Offline Sync Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
          <button
            type="button"
            disabled={selectedDistractorId !== null}
            onClick={handleNotSure}
            className="min-h-[46px] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-slate-200 active:scale-98 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>هنوز مطمئن نیستم (بدون جریمه)</span>
          </button>

          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>ذخیره در دستگاه</span>
          </span>
        </div>
      </div>

      {/* Slide-over Sheet / Modal for Mastery View on Mobile/Tablet */}
      {showMasterySheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-800">وضعیت تسلط بر مفاهیم</h3>
              <button
                type="button"
                onClick={() => setShowMasterySheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <MasteryRadar masteryList={masteryRadarList} />
            </div>

            <button
              type="button"
              onClick={() => setShowMasterySheet(false)}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl cursor-pointer text-sm"
            >
              بازگشت به آزمون
            </button>
          </div>
        </div>
      )}

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
