"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  getSubjectTaxonomy,
  getSubjectsByGrade 
} from "@/lib/data/curriculum-taxonomy";

export interface CurriculumContextType {
  selectedGrade: number;
  selectedSubjectId: string;
  activeTaxonomy: SubjectTaxonomy;
  setGrade: (grade: number) => void;
  setSubject: (subjectId: string) => void;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  toggleSelector: () => void;
}

const STORAGE_KEY = "edtech_active_curriculum";
const DEFAULT_SUBJECT = "SUBJ-MATH4-FRACTIONS";
const DEFAULT_GRADE = 4;

const defaultContextValue: CurriculumContextType = {
  selectedGrade: DEFAULT_GRADE,
  selectedSubjectId: DEFAULT_SUBJECT,
  activeTaxonomy: CANONICAL_TAXONOMIES[DEFAULT_SUBJECT],
  setGrade: () => {},
  setSubject: () => {},
  isSelectorOpen: false,
  openSelector: () => {},
  closeSelector: () => {},
  toggleSelector: () => {},
};

const CurriculumContext = createContext<CurriculumContextType>(defaultContextValue);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(DEFAULT_SUBJECT);
  const [selectedGrade, setSelectedGrade] = useState<number>(DEFAULT_GRADE);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initialize from URL search param or localStorage
  useEffect(() => {
    try {
      // 1. Check URL first
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlSubject = params.get("subject");

        if (urlSubject && CANONICAL_TAXONOMIES[urlSubject]) {
          const tax = CANONICAL_TAXONOMIES[urlSubject];
          setSelectedSubjectId(urlSubject);
          setSelectedGrade(tax.gradeLevel);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ grade: tax.gradeLevel, subjectId: urlSubject })
          );
          setIsHydrated(true);
          return;
        }

        // 2. Check localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.subjectId && CANONICAL_TAXONOMIES[parsed.subjectId]) {
            const tax = CANONICAL_TAXONOMIES[parsed.subjectId];
            setSelectedSubjectId(parsed.subjectId);
            setSelectedGrade(tax.gradeLevel);
            setIsHydrated(true);
            return;
          }
        }
      }
    } catch {
      // Ignore storage read errors (e.g. incognito or disabled cookies)
    }
    setIsHydrated(true);
  }, []);

  // Update subject and sync grade and persistence
  const setSubject = useCallback((subjectId: string) => {
    const taxonomy = getSubjectTaxonomy(subjectId);
    setSelectedSubjectId(taxonomy.id);
    setSelectedGrade(taxonomy.gradeLevel);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ grade: taxonomy.gradeLevel, subjectId: taxonomy.id })
        );
      }
    } catch {}
  }, []);

  // Update grade and auto-select matching chapter
  const setGrade = useCallback((grade: number) => {
    setSelectedGrade(grade);
    const gradeSubjects = getSubjectsByGrade(grade);
    if (gradeSubjects.length > 0) {
      // If current subject already belongs to this grade, keep it; otherwise switch to first chapter
      const currentTaxonomy = getSubjectTaxonomy(selectedSubjectId);
      const nextSubject =
        currentTaxonomy.gradeLevel === grade ? currentTaxonomy.id : gradeSubjects[0].id;

      setSelectedSubjectId(nextSubject);

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ grade, subjectId: nextSubject })
          );
        }
      } catch {}
    }
  }, [selectedSubjectId]);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeSelector = useCallback(() => setIsSelectorOpen(false), []);
  const toggleSelector = useCallback(() => setIsSelectorOpen((p) => !p), []);

  const activeTaxonomy = useMemo(
    () => getSubjectTaxonomy(selectedSubjectId),
    [selectedSubjectId]
  );

  const contextValue = useMemo<CurriculumContextType>(
    () => ({
      selectedGrade,
      selectedSubjectId,
      activeTaxonomy,
      setGrade,
      setSubject,
      isSelectorOpen,
      openSelector,
      closeSelector,
      toggleSelector,
    }),
    [
      selectedGrade,
      selectedSubjectId,
      activeTaxonomy,
      setGrade,
      setSubject,
      isSelectorOpen,
      openSelector,
      closeSelector,
      toggleSelector,
    ]
  );

  return (
    <CurriculumContext.Provider value={contextValue}>
      {children}
    </CurriculumContext.Provider>
  );
};

/**
 * Hook to access the curriculum store.
 * Safe to use anywhere; falls back to default values if rendered outside provider.
 */
export function useCurriculumStore(): CurriculumContextType {
  const context = useContext(CurriculumContext);
  return context || defaultContextValue;
}
