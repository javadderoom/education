"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CanonicalCartridge } from "@/lib/data/cartridge";
import { ExamTopicSelector } from "@/components/curriculum/ExamTopicSelector";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";
import { generateDynamicItemsForKCs } from "@/lib/curriculum/parametric-engine";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import {
  ActiveExamSession,
  loadActiveExamSession,
  clearActiveExamSession,
} from "@/lib/store/exam-storage";

export interface StudentAssessmentViewProps {
  initialSubjectId: string;
  initialTopicIds?: string[];
  initialStarted?: boolean;
  studentName: string;
  studentUsername: string;
  cartridges: Record<string, CanonicalCartridge>;
}

export const StudentAssessmentView: React.FC<StudentAssessmentViewProps> = ({
  initialSubjectId,
  initialTopicIds,
  initialStarted = false,
  studentName,
  studentUsername,
  cartridges,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedSubjectId, setSubject } = useCurriculumStore();

  const [currentSubjectId, setCurrentSubjectId] = useState<string>(
    initialSubjectId || selectedSubjectId || "SUBJ-MATH4-FRACTIONS"
  );
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds || []);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(!initialStarted);
  const [activeExamSession, setActiveExamSession] = useState<ActiveExamSession | null>(null);

  // Load existing in-progress session if any
  useEffect(() => {
    const saved = loadActiveExamSession(currentSubjectId, studentUsername);
    setActiveExamSession(saved);
    if (saved && initialStarted) {
      if (saved.selectedTopicIds && saved.selectedTopicIds.length > 0) {
        setSelectedTopicIds(saved.selectedTopicIds);
      }
    }
  }, [currentSubjectId, studentUsername, initialStarted]);

  React.useEffect(() => {
    if (initialSubjectId) {
      setCurrentSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  React.useEffect(() => {
    if (selectedSubjectId && selectedSubjectId !== currentSubjectId) {
      setCurrentSubjectId(selectedSubjectId);
      setSelectedTopicIds([]);
    }
  }, [selectedSubjectId]);

  React.useEffect(() => {
    if (initialTopicIds) {
      setSelectedTopicIds(initialTopicIds);
    }
  }, [initialTopicIds]);

  React.useEffect(() => {
    setIsConfiguring(!initialStarted);
  }, [initialStarted]);

  // Active cartridge based on selected subject
  const activeCartridge = useMemo(() => {
    if (cartridges[currentSubjectId]) {
      return cartridges[currentSubjectId];
    }
    if (currentSubjectId.includes("5") || currentSubjectId.includes("RATIO")) {
      return cartridges["SUBJ-MATH5-RATIO"] || Object.values(cartridges)[0];
    }
    if (currentSubjectId.includes("CH03") || currentSubjectId.includes("CH3") || currentSubjectId.toLowerCase().includes("mult")) {
      return cartridges["SUBJ-MATH4-CH03"] || Object.values(cartridges)[0];
    }
    return cartridges["SUBJ-MATH4-FRACTIONS"] || Object.values(cartridges)[0];
  }, [cartridges, currentSubjectId]);

  // Combine static canonical questions with newly randomized dynamic items
  const activeQuestions = useMemo(() => {
    // If resuming an active session in exam mode, keep the exact items list to prevent question drift
    if (activeExamSession && activeExamSession.items && activeExamSession.items.length > 0 && !isConfiguring) {
      return activeExamSession.items;
    }

    const targetKCs =
      selectedTopicIds.length > 0
        ? selectedTopicIds
        : activeCartridge.knowledge_components.map((k) => k.id);

    const staticItems = activeCartridge.diagnostic_items.filter((item) =>
      targetKCs.includes(item.kc_id)
    );

    // Generate 2 fresh dynamic questions per selected topic on each exam session
    const dynamicItems = generateDynamicItemsForKCs(targetKCs, 2);

    return [...dynamicItems, ...staticItems];
  }, [activeCartridge, selectedTopicIds, isConfiguring, activeExamSession]);

  // Handler when student starts exam from TopicSelector
  const handleStartExam = (subjectId: string, topicIds: string[]) => {
    setCurrentSubjectId(subjectId);
    setSelectedTopicIds(topicIds);
    setIsConfiguring(false);
    setSubject(subjectId);

    const existing = loadActiveExamSession(subjectId, studentUsername);
    setActiveExamSession(existing);

    // Update query params without full navigation reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("subject", subjectId);
    if (topicIds.length > 0) {
      params.set("topics", topicIds.join(","));
    }
    params.set("start", "1");
    router.replace(`/student?${params.toString()}`);
  };

  // Handler to return to topic configuration
  const handleOpenConfigurator = () => {
    setIsConfiguring(true);
    const saved = loadActiveExamSession(currentSubjectId, studentUsername);
    setActiveExamSession(saved);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("start");
    router.replace(`/student?${params.toString()}`);
  };

  if (isConfiguring) {
    return (
      <ExamTopicSelector
        initialSubjectId={currentSubjectId}
        initialSelectedTopicIds={selectedTopicIds.length > 0 ? selectedTopicIds : undefined}
        onStartExam={handleStartExam}
        activeExamSession={activeExamSession}
        onResumeExam={() => {
          if (activeExamSession) {
            handleStartExam(activeExamSession.subjectId, activeExamSession.selectedTopicIds);
          }
        }}
        onDiscardExam={() => {
          clearActiveExamSession(currentSubjectId, studentUsername);
          setActiveExamSession(null);
        }}
      />
    );
  }

  return (
    <div className="w-full">
      <AssessmentCarousel
        key={`${currentSubjectId}_${activeExamSession?.sessionId || "fresh"}`}
        items={activeQuestions}
        knowledgeComponents={activeCartridge.knowledge_components}
        misconceptions={activeCartridge.misconceptions}
        studentName={studentName}
        studentUsername={studentUsername}
        subjectId={currentSubjectId}
        selectedTopicIds={selectedTopicIds}
        onConfigureTopics={handleOpenConfigurator}
        initialSessionState={activeExamSession}
      />
    </div>
  );
};
