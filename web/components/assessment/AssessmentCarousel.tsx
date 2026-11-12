"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Award, RotateCcw, BarChart2, X, Sparkles, Check, Flag, Volume2, VolumeX, PenTool, ListChecks, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { MathRenderer } from "../ui/MathRenderer";
import { FractionStrip } from "../parametric/FractionStrip";
import { NumberLine } from "../parametric/NumberLine";
import { AreaGrid } from "../parametric/AreaGrid";
import { BalanceScale } from "../parametric/BalanceScale";
import { BucketSort } from "../parametric/BucketSort";
import { RemediationModal } from "../remediation/RemediationModal";
import { RemediationPathway } from "../remediation/RemediationPathway";
import { MasteryRadar, KCMasteryInfo } from "./MasteryRadar";
import { ScratchpadOverlay } from "./ScratchpadOverlay";
import { updateMastery } from "../../lib/bkt/engine";
import { evaluateDiagnosticResponse } from "../../lib/bkt/diagnostics";
import { selectNextAdaptiveItem, calculateAdaptiveSessionLimit } from "../../lib/bkt/adaptive";
import { saveOfflineSession } from "../../lib/offline/storage";
import { toPersianDigits } from "../../lib/math/persian-digits";
import { saveAssessmentSession } from "../../actions/assessment";
import { LearnerProfileSummary } from "../../actions/analytics";
import {
  ActiveExamSession,
  saveActiveExamSession,
  clearActiveExamSession,
} from "../../lib/store/exam-storage";
import { speakPersian, stopPersianSpeech } from "../../lib/audio/speech";
import { getSubjectTaxonomy } from "../../lib/data/curriculum-taxonomy";

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
  studentUsername?: string;
  subjectId?: string;
  learners?: LearnerProfileSummary[];
  selectedTopicIds?: string[];
  onConfigureTopics?: () => void;
  shuffleOptions?: boolean;
  initialSessionState?: ActiveExamSession | null;
}

const PERSIAN_OPTION_LABELS = ["الف", "ب", "ج", "د"];

/**
 * Performs an unbiased Fisher-Yates shuffle on distractors and re-assigns
 * standard Persian option labels ("الف", "ب", "ج", "د") sequentially.
 */
export function shuffleDistractors(distractors: DistractorItem[]): DistractorItem[] {
  if (!distractors || distractors.length <= 1) return distractors;
  const shuffled = [...distractors];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((d, index) => ({
    ...d,
    label: PERSIAN_OPTION_LABELS[index] || d.label,
  }));
}

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({
  items,
  knowledgeComponents,
  misconceptions,
  studentName = "علی رضایی",
  studentUsername = "student_ali",
  subjectId = "SUBJ-MATH4-FRACTIONS",
  learners = [],
  selectedTopicIds,
  onConfigureTopics,
  shuffleOptions = true,
  initialSessionState,
}) => {
  const [activeName, setActiveName] = useState(
    initialSessionState?.studentName || studentName
  );
  const [activeUsername, setActiveUsername] = useState(
    initialSessionState?.studentUsername || studentUsername
  );
  const [sessionId] = useState(
    () => initialSessionState?.sessionId || `sess_${Date.now()}`
  );
  const [currentIndex, setCurrentIndex] = useState(
    initialSessionState?.currentIndex ?? 0
  );
  const [selectedDistractorId, setSelectedDistractorId] = useState<string | null>(null);
  const [showMasterySheet, setShowMasterySheet] = useState(false);
  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWorkshopKC, setActiveWorkshopKC] = useState<{ id: string; title: string } | null>(null);
  const [activeRemediation, setActiveRemediation] = useState<{
    isOpen: boolean;
    title?: string;
    blueprint?: any;
    rationale?: string | null;
  }>({ isOpen: false });

  const activeTaxonomy = React.useMemo(() => getSubjectTaxonomy(subjectId), [subjectId]);
  const activeChapterTitle = activeTaxonomy?.chapterTitle || "فصل جاری";

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopPersianSpeech();
    };
  }, []);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopPersianSpeech();
      setIsSpeaking(false);
    } else if (currentItem) {
      speakPersian(currentItem.stem, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Filter items by selected topics if specified
  const activeItems = React.useMemo(() => {
    if (selectedTopicIds && selectedTopicIds.length > 0) {
      const filtered = items.filter((item) => selectedTopicIds.includes(item.kc_id));
      return filtered.length > 0 ? filtered : items;
    }
    return items;
  }, [items, selectedTopicIds]);

  // Dynamic adaptive session length based on number of selected topics
  const targetSessionLimit = React.useMemo(() => {
    if (initialSessionState?.targetSessionLimit) {
      return initialSessionState.targetSessionLimit;
    }
    const kcCount =
      selectedTopicIds && selectedTopicIds.length > 0
        ? selectedTopicIds.length
        : knowledgeComponents.length;
    return calculateAdaptiveSessionLimit(kcCount, activeItems.length);
  }, [selectedTopicIds, knowledgeComponents, activeItems.length, initialSessionState?.targetSessionLimit]);

  // Map of KC Masteries
  const [masteries, setMasteries] = useState<Record<string, number>>(() => {
    if (initialSessionState?.masteries) {
      return initialSessionState.masteries;
    }
    const initial: Record<string, number> = {};
    for (const kc of knowledgeComponents) {
      initial[kc.id] = 0.15; // default initial prior
    }
    return initial;
  });

  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [history, setHistory] = useState<Array<{
    itemId: string;
    kcId: string;
    isCorrect: boolean;
    isNotSure: boolean;
    timestamp: number;
    stem?: string;
    selectedLabel?: string;
    selectedContent?: string;
    correctContent?: string;
    rationale?: string | null;
  }>>(() => initialSessionState?.history || []);

  const currentItem = activeItems[currentIndex] || activeItems[0];

  // Map of cached shuffled distractors per question item id for session stability
  const [shuffledDistractorsMap] = useState<Map<string, DistractorItem[]>>(() => {
    const map = new Map<string, DistractorItem[]>();
    if (initialSessionState?.shuffledDistractors) {
      Object.entries(initialSessionState.shuffledDistractors).forEach(([key, val]) => {
        map.set(key, val);
      });
    }
    return map;
  });

  // Shuffled distractors for the current question
  const currentDistractors = React.useMemo(() => {
    if (!currentItem?.distractors) return [];
    if (!shuffleOptions) return currentItem.distractors;

    let cached = shuffledDistractorsMap.get(currentItem.id);
    if (!cached) {
      cached = shuffleDistractors(currentItem.distractors);
      shuffledDistractorsMap.set(currentItem.id, cached);
    }
    return cached;
  }, [currentItem, shuffleOptions, shuffledDistractorsMap]);

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

  const syncExamStorage = React.useCallback(
    (
      currentHist: typeof history,
      currentMast: typeof masteries,
      currIdx: number,
      isFinished: boolean = false
    ) => {
      const activeSubj = subjectId || "SUBJ-MATH4-FRACTIONS";
      if (isFinished) {
        clearActiveExamSession(activeSubj, activeUsername);
        return;
      }
      const distractorCache: Record<string, DistractorItem[]> = {};
      shuffledDistractorsMap.forEach((val, key) => {
        distractorCache[key] = val;
      });

      saveActiveExamSession({
        sessionId,
        subjectId: activeSubj,
        studentUsername: activeUsername,
        studentName: activeName,
        selectedTopicIds: selectedTopicIds || [],
        currentIndex: currIdx,
        items: activeItems,
        history: currentHist,
        masteries: currentMast,
        targetSessionLimit,
        shuffledDistractors: distractorCache,
        startedAt: initialSessionState?.startedAt || Date.now(),
        lastUpdatedAt: Date.now(),
      });
    },
    [
      subjectId,
      activeUsername,
      activeName,
      selectedTopicIds,
      activeItems,
      targetSessionLimit,
      sessionId,
      shuffledDistractorsMap,
      initialSessionState?.startedAt,
    ]
  );

  // Sync to local storage on mount if session is active
  React.useEffect(() => {
    if (!sessionCompleted) {
      syncExamStorage(history, masteries, currentIndex, false);
    }
  }, []);

  const persistToOfflineDB = (newHistory: typeof history, isFinished: boolean = false) => {
    saveOfflineSession({
      sessionId,
      learnerName: activeName,
      subjectTitle: activeChapterTitle,
      startedAt: Date.now(),
      completedAt: isFinished ? Date.now() : undefined,
      responses: newHistory,
      synced: false,
    });

    if (isFinished) {
      saveAssessmentSession({
        sessionId,
        learnerUsername: activeUsername,
        learnerDisplayName: activeName,
        responses: newHistory.map((h) => ({
          itemId: h.itemId,
          kcId: h.kcId,
          isCorrect: h.isCorrect,
          isNotSure: h.isNotSure,
        })),
        masteries,
        isCompleted: true,
      }).catch(() => {
        // Offline resilience: session remains safely stored in IndexedDB for subsequent background sync
      });
    }
  };

  const handleFinishEarly = () => {
    setShowEarlyFinishModal(false);
    setSessionCompleted(true);
    persistToOfflineDB(history, true);
    syncExamStorage(history, masteries, currentIndex, true);
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

    const updatedMasteries = {
      ...masteries,
      [currentItem.kc_id]: bktResult.posteriorMastery,
    };
    setMasteries(updatedMasteries);

    const correctDistractor = currentDistractors.find((d) => d.is_correct);
    const newHistory = [
      ...history,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: distractor.is_correct,
        isNotSure: false,
        timestamp: Date.now(),
        stem: currentItem.stem,
        selectedLabel: distractor.label,
        selectedContent: distractor.content,
        correctContent: correctDistractor?.content || distractor.content,
        rationale: distractor.rationale,
      },
    ];
    setHistory(newHistory);
    const isFinished = newHistory.length >= targetSessionLimit;
    persistToOfflineDB(newHistory, isFinished);
    syncExamStorage(newHistory, updatedMasteries, currentIndex, isFinished);

    // Check if misconception modal should appear
    if (!distractor.is_correct && distractor.misconception_id) {
      setActiveRemediation({
        isOpen: true,
        title: diagnosis.misconceptionTitle,
        blueprint: diagnosis.counterExampleBlueprint,
        rationale: distractor.rationale,
      });
    } else {
      setTimeout(() => advanceToNext(newHistory, updatedMasteries), 500);
    }
  };

  const handleNotSure = () => {
    if (selectedDistractorId) return;
    setSelectedDistractorId("not_sure");

    const prior = masteries[currentItem.kc_id] ?? 0.15;
    const bktResult = updateMastery(prior, false, true);

    const updatedMasteries = {
      ...masteries,
      [currentItem.kc_id]: bktResult.posteriorMastery,
    };
    setMasteries(updatedMasteries);

    const correctDistractor = currentDistractors.find((d) => d.is_correct);
    const newHistory = [
      ...history,
      {
        itemId: currentItem.id,
        kcId: currentItem.kc_id,
        isCorrect: false,
        isNotSure: true,
        timestamp: Date.now(),
        stem: currentItem.stem,
        selectedLabel: "هنوز مطمئن نیستم",
        selectedContent: "عدم اطمینان",
        correctContent: correctDistractor?.content,
        rationale: "پاسخ با علامت عدم اطمینان ثبت شد تا نقطه شروع آموزشی بدون نمره منفی تنظیم شود.",
      },
    ];
    setHistory(newHistory);
    const isFinished = newHistory.length >= targetSessionLimit;
    persistToOfflineDB(newHistory, isFinished);
    syncExamStorage(newHistory, updatedMasteries, currentIndex, isFinished);

    setTimeout(() => advanceToNext(newHistory, updatedMasteries), 400);
  };

  const advanceToNext = (
    currentHistory: typeof history = history,
    currentMasteries: typeof masteries = masteries
  ) => {
    stopPersianSpeech();
    setIsSpeaking(false);
    setSelectedDistractorId(null);
    const answeredIds = new Set(currentHistory.map((h) => h.itemId));
    if (currentItem) {
      answeredIds.add(currentItem.id);
    }

    const nextAdaptiveItem = selectNextAdaptiveItem(activeItems, {
      answeredItemIds: answeredIds,
      masteries: currentMasteries,
      knowledgeComponents,
      maxItemsPerSession: targetSessionLimit,
    });

    if (nextAdaptiveItem) {
      const nextIdx = activeItems.findIndex((i) => i.id === nextAdaptiveItem.id);
      if (nextIdx !== -1) {
        setCurrentIndex(nextIdx);
        syncExamStorage(currentHistory, currentMasteries, nextIdx, false);
        return;
      }
    }

    setSessionCompleted(true);
    persistToOfflineDB(currentHistory, true);
    syncExamStorage(currentHistory, currentMasteries, currentIndex, true);
  };

  const handleRestart = () => {
    stopPersianSpeech();
    setIsSpeaking(false);
    const activeSubj = subjectId || "SUBJ-MATH4-FRACTIONS";
    clearActiveExamSession(activeSubj, activeUsername);
    setCurrentIndex(0);
    setSelectedDistractorId(null);
    setSessionCompleted(false);
    setActiveWorkshopKC(null);
    setHistory([]);
    shuffledDistractorsMap.clear();
    const resetMasteries: Record<string, number> = {};
    for (const kc of knowledgeComponents) {
      resetMasteries[kc.id] = 0.15;
    }
    setMasteries(resetMasteries);
    syncExamStorage([], resetMasteries, 0, false);
  };

  const handleCompleteWorkshop = (kcId: string) => {
    setMasteries((prev) => ({
      ...prev,
      [kcId]: Math.max(0.78, (prev[kcId] || 0.15) + 0.40),
    }));
    setActiveWorkshopKC(null);
  };

  // Filter evaluated KCs to only those selected in the current exam
  const evaluatedKCs = React.useMemo(() => {
    if (selectedTopicIds && selectedTopicIds.length > 0) {
      return knowledgeComponents.filter((kc) => selectedTopicIds.includes(kc.id));
    }
    return knowledgeComponents;
  }, [knowledgeComponents, selectedTopicIds]);

  const masteryRadarList: KCMasteryInfo[] = evaluatedKCs.map((kc) => ({
    id: kc.id,
    title: kc.title,
    masteryProbability: masteries[kc.id] ?? 0.15,
    isMastered: (masteries[kc.id] ?? 0.15) >= 0.85,
  }));

  // Identify KC needing reinforcement from the evaluated topics
  const needsPracticeKC = evaluatedKCs.find(
    (kc) => (masteries[kc.id] ?? 0.15) < 0.70
  );

  // Render Visual Template dynamically
  const renderVisualTemplate = () => {
    if (!currentItem.visual_template) return null;
    const { type, props } = currentItem.visual_template;

    switch (type) {
      case "FractionStrip":
        return <FractionStrip {...props} hideCounter={true} />;
      case "NumberLine":
        return <NumberLine {...props} hideFractions={true} />;
      case "AreaGrid":
        return <AreaGrid {...props} hideBadge={true} />;
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
    const evaluatedMasteries = evaluatedKCs.map((kc) => masteries[kc.id] ?? 0.15);
    const averageMastery = Math.round(
      (evaluatedMasteries.reduce((a, b) => a + b, 0) /
        (evaluatedMasteries.length || 1)) *
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
            آفرین {activeName} عزیز، نتیجه میزان تسلط شما بر {activeChapterTitle}:
          </p>

          <div className="mb-5 text-right">
            <MasteryRadar masteryList={masteryRadarList} chapterTitle={activeChapterTitle} />
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 text-center">
            <div className="p-1">
              <span className="text-[11px] text-slate-500 block mb-1">پاسخ‌های صحیح</span>
              <span className="text-lg font-black text-emerald-600" dir="ltr">
                {toPersianDigits(correctCount)} / {toPersianDigits(history.length || targetSessionLimit)}
              </span>
            </div>
            <div className="p-1 border-x border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">بدون اطمینان</span>
              <span className="text-lg font-black text-amber-600" dir="ltr">
                {toPersianDigits(history.filter((h) => h.isNotSure).length)}
              </span>
            </div>
            <div className="p-1">
              <span className="text-[11px] text-slate-500 block mb-1">میانگین تسلط</span>
              <span className="text-lg font-black text-indigo-600" dir="ltr">
                {toPersianDigits(averageMastery)}٪
              </span>
            </div>
          </div>

          {/* Motivational Achievement Badge for Elementary Students */}
          {averageMastery >= 80 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-300 text-amber-950 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
              <span className="font-bold text-xs sm:text-sm">
                آفرین قهرمان ریاضی! نشان طلایی تسلط بر مباحث به شما تعلق گرفت 🌟
              </span>
            </div>
          )}

          {/* Interactive Question-by-Question Review Accordion */}
          <div className="mb-5 text-right">
            <button
              type="button"
              onClick={() => setShowQuestionReview(!showQuestionReview)}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <span>مرور سوالات و تحلیل پاسخ‌های آزمون ({toPersianDigits(history.length)} سوال)</span>
              </div>
              {showQuestionReview ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showQuestionReview && (
              <div className="space-y-3 mt-3 animate-in fade-in duration-200">
                {history.map((h, idx) => {
                  return (
                    <div
                      key={h.itemId || idx}
                      className={`p-4 rounded-2xl border text-right transition-all ${
                        h.isCorrect
                          ? "bg-emerald-50/50 border-emerald-200"
                          : h.isNotSure
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-rose-50/50 border-rose-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
                        <span className="font-bold text-xs text-slate-800">
                          سوال شماره {toPersianDigits(idx + 1)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {h.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>صحیح</span>
                            </span>
                          ) : h.isNotSure ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>بدون اطمینان</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>نادرست</span>
                            </span>
                          )}

                          {h.stem && (
                            <button
                              type="button"
                              onClick={() => speakPersian(h.stem!)}
                              title="شنیدن صوتی صورت سوال"
                              className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Stem */}
                      {h.stem && (
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-2.5 leading-relaxed">
                          <MathRenderer content={h.stem} />
                        </div>
                      )}

                      {/* Chosen Option vs Correct Option */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block mb-0.5">پاسخ شما:</span>
                          <span className="font-bold text-slate-800">
                            {h.selectedLabel && `${h.selectedLabel}: `}
                            {h.selectedContent ? <MathRenderer content={h.selectedContent} /> : "—"}
                          </span>
                        </div>

                        {!h.isCorrect && h.correctContent && (
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">پاسخ صحیح:</span>
                            <span className="font-bold text-emerald-900">
                              <MathRenderer content={h.correctContent} />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rationale Explanation */}
                      {h.rationale && (
                        <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                          <b className="text-slate-800">توضیح مفهومی: </b>
                          <span>{h.rationale}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={handleRestart}
              className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer select-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تکرار همین آزمون</span>
            </button>

            {onConfigureTopics && (
              <button
                type="button"
                onClick={onConfigureTopics}
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer select-none"
              >
                <ListChecks className="w-4 h-4" />
                <span>انتخاب سرفصل‌های جدید</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1 justify-between select-none">
      {/* Top Tablet/Mobile Progress & Header Bar */}
      <div className="flex items-center justify-between gap-2.5 mb-3 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-[140px]">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
            <span>سوال {toPersianDigits(Math.min(targetSessionLimit, history.length + 1))} از {toPersianDigits(targetSessionLimit)}</span>
            <span className="font-bold text-indigo-600" dir="ltr">
              {toPersianDigits(Math.min(100, Math.round(((history.length + 1) / Math.max(1, targetSessionLimit)) * 100)))}٪
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, ((history.length + 1) / Math.max(1, targetSessionLimit)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Early Finish Button */}
          <button
            type="button"
            onClick={() => setShowEarlyFinishModal(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 sm:px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="پایان زودهنگام آزمون"
          >
            <Flag className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">اتمام آزمون</span>
          </button>

          {onConfigureTopics && (
            <button
              type="button"
              onClick={onConfigureTopics}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="تغییر سرفصل‌های آزمون"
            >
              <ListChecks className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">سرفصل‌ها</span>
            </button>
          )}

          {/* Digital Scratchpad Button */}
          <button
            type="button"
            onClick={() => setIsScratchpadOpen((prev) => !prev)}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs ${
              isScratchpadOpen
                ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title="چرک‌نویس و یادداشت روی صفحه"
          >
            <PenTool className={`w-4 h-4 ${isScratchpadOpen ? "text-amber-300" : "text-indigo-600"}`} />
            <span className="hidden sm:inline">چرک‌نویس</span>
          </button>

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
      </div>

      {/* Main Diagnostic Question Card */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col flex-1 justify-between mb-3">
        <div>
          {/* Question Stem & Speech Reader */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed flex-1">
              <MathRenderer content={currentItem.stem} />
            </div>

            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`shrink-0 min-h-[38px] px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                isSpeaking
                  ? "bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400 animate-pulse"
                  : "bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700"
              }`}
              title={isSpeaking ? "توقف روخوانی صوتی" : "روخوانی صوتی سوال"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-700" />
                  <span className="text-[11px] hidden xs:inline">توقف صدا</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px] hidden xs:inline">بخوان</span>
                </>
              )}
            </button>
          </div>

          {/* Parametric Visual Template */}
          <div className="my-2 flex justify-center">
            {renderVisualTemplate()}
          </div>

          {/* Distractor Options Grid (Touch-First Large Buttons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
            {currentDistractors.map((dis) => {
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
              <MasteryRadar masteryList={masteryRadarList} chapterTitle={activeChapterTitle} />
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

      {/* Early Finish Confirmation Modal */}
      {showEarlyFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col text-right animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Flag className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">
              {history.length === 0 ? "خروج از آزمون" : "اتمام زودهنگام آزمون"}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {history.length === 0 ? (
                "شما هنوز به هیچ سوالی پاسخ نداده‌اید. آیا مایلید به صفحه انتخاب سرفصل‌های درسی بازگردید؟"
              ) : (
                <>
                  شما تا این لحظه به{" "}
                  <span className="font-bold text-amber-700 font-mono" dir="ltr">
                    {toPersianDigits(history.length)}
                  </span>{" "}
                  سوال از{" "}
                  <span className="font-bold text-slate-700 font-mono" dir="ltr">
                    {toPersianDigits(targetSessionLimit)}
                  </span>{" "}
                  سوال پاسخ داده‌اید. کارنامه و تحلیل میزان تسلط شما بر اساس پاسخ‌های ثبت‌شده تا این مرحله محاسبه و در پرونده آموزشی ذخیره خواهد شد.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {history.length > 0 ? (
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="flex-1 min-h-[46px] bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت و مشاهده کارنامه</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowEarlyFinishModal(false);
                    if (onConfigureTopics) onConfigureTopics();
                  }}
                  className="flex-1 min-h-[46px] bg-slate-800 hover:bg-slate-900 active:scale-98 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>بازگشت به سرفصل‌ها</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEarlyFinishModal(false)}
                className="min-h-[46px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                ادامه آزمون
              </button>
            </div>
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

      {/* Digital Scratchpad Overlay */}
      <ScratchpadOverlay
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        questionNumber={history.length + 1}
      />
    </div>
  );
};
