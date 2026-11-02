"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { 
  CANONICAL_TAXONOMIES, 
  SubjectTaxonomy, 
  getSubjectTaxonomy,
  getSubjectsByGrade 
} from "@/lib/data/curriculum-taxonomy";
import { 
  CurriculumFrameworkDTO, 
  CurriculumNodeDTO, 
  TierDefinition,
  getCurriculumFrameworksAction,
  getCurriculumTreeAction 
} from "@/actions/curriculum";

export const DEFAULT_TIER_DEFINITIONS: TierDefinition[] = [
  { depth: 1, key: "grade", title: "پایه تحصیلی", singular: "پایه", placeholder: "مثال: پایه چهارم ابتدایی" },
  { depth: 2, key: "book", title: "کتاب درسی", singular: "کتاب", placeholder: "مثال: ریاضی چهارم" },
  { depth: 3, key: "chapter", title: "فصل / بخش", singular: "فصل", placeholder: "مثال: فصل دوم: مفهوم و محاسبات کسرها" },
  { depth: 4, key: "lesson", title: "درس / سرفصل آموزشی", singular: "درس", placeholder: "مثال: درس اول: شناخت کسر و واحد کامل" }
];

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
  // Dynamic Universal Framework and Tier Nomenclature
  frameworks: CurriculumFrameworkDTO[];
  activeFramework: CurriculumFrameworkDTO | null;
  tierDefinitions: TierDefinition[];
  treeNodes: CurriculumNodeDTO[];
  refreshCurriculumFromDb: () => Promise<void>;
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
  frameworks: [],
  activeFramework: null,
  tierDefinitions: DEFAULT_TIER_DEFINITIONS,
  treeNodes: [],
  refreshCurriculumFromDb: async () => {},
};

const CurriculumContext = createContext<CurriculumContextType>(defaultContextValue);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(DEFAULT_SUBJECT);
  const [selectedGrade, setSelectedGrade] = useState<number>(DEFAULT_GRADE);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Dynamic Framework State from DB
  const [frameworks, setFrameworks] = useState<CurriculumFrameworkDTO[]>([]);
  const [activeFramework, setActiveFramework] = useState<CurriculumFrameworkDTO | null>(null);
  const [treeNodes, setTreeNodes] = useState<CurriculumNodeDTO[]>([]);

  const refreshCurriculumFromDb = useCallback(async () => {
    try {
      const fwRes = await getCurriculumFrameworksAction();
      if (fwRes.success && fwRes.frameworks.length > 0) {
        setFrameworks(fwRes.frameworks);
        const defaultFw = fwRes.frameworks.find((f) => f.isDefault) || fwRes.frameworks[0];
        setActiveFramework(defaultFw);

        const treeRes = await getCurriculumTreeAction(defaultFw.id);
        if (treeRes.success) {
          setTreeNodes(treeRes.nodes);
        }
      }
    } catch {
      // In offline / test environments, fallback smoothly
    }
  }, []);

  useEffect(() => {
    refreshCurriculumFromDb();
  }, [refreshCurriculumFromDb]);

  // Initialize from URL search param or localStorage
  useEffect(() => {
    try {
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

  const tierDefinitions = useMemo(
    () => activeFramework?.tierDefinitions || DEFAULT_TIER_DEFINITIONS,
    [activeFramework]
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
      frameworks,
      activeFramework,
      tierDefinitions,
      treeNodes,
      refreshCurriculumFromDb,
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
      frameworks,
      activeFramework,
      tierDefinitions,
      treeNodes,
      refreshCurriculumFromDb,
    ]
  );

  return (
    <CurriculumContext.Provider value={contextValue}>
      {children}
    </CurriculumContext.Provider>
  );
};

export function useCurriculumStore(): CurriculumContextType {
  const context = useContext(CurriculumContext);
  return context || defaultContextValue;
}
