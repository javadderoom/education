"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Plus, ChevronDown, Sparkles } from "lucide-react";
import { LearnerProfileSummary, createOrSelectLearner } from "../../actions/analytics";
import { toPersianDigits } from "../../lib/math/persian-digits";

export interface StudentProfileSwitcherProps {
  learners?: LearnerProfileSummary[];
  activeUsername?: string;
  onSelectStudent?: (learner: { username: string; displayName: string }) => void;
}

export const StudentProfileSwitcher: React.FC<StudentProfileSwitcherProps> = ({
  learners = [],
  activeUsername = "student_ali",
  onSelectStudent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(activeUsername);
  const [currentDisplayName, setCurrentDisplayName] = useState("علی رضایی");
  const [newStudentName, setNewStudentName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [profiles, setProfiles] = useState<LearnerProfileSummary[]>(learners);

  useEffect(() => {
    // Check localStorage for saved active student
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("edu_active_student_user");
      const savedName = localStorage.getItem("edu_active_student_name");
      if (savedUser && savedName) {
        setCurrentUsername(savedUser);
        setCurrentDisplayName(savedName);
      }
    }
  }, []);

  useEffect(() => {
    if (learners.length > 0) {
      setProfiles(learners);
      const matched = learners.find((l) => l.username === currentUsername);
      if (matched) {
        setCurrentDisplayName(matched.displayName);
      }
    }
  }, [learners, currentUsername]);

  const handleSelect = (learner: { username: string; displayName: string }) => {
    setCurrentUsername(learner.username);
    setCurrentDisplayName(learner.displayName);
    if (typeof window !== "undefined") {
      localStorage.setItem("edu_active_student_user", learner.username);
      localStorage.setItem("edu_active_student_name", learner.displayName);
    }
    setIsOpen(false);
    if (onSelectStudent) {
      onSelectStudent(learner);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    setIsCreating(true);
    const res = await createOrSelectLearner(newStudentName);
    setIsCreating(false);

    if (res.success && res.learner) {
      const created = {
        id: res.learner.id,
        username: res.learner.username,
        displayName: res.learner.displayName,
        gradeLevel: 4,
        sessionsCount: 0,
        masteryCount: 0,
        averageMastery: 15,
        lastActive: new Date(),
      };
      setProfiles((prev) => [created, ...prev]);
      handleSelect(res.learner);
      setNewStudentName("");
    }
  };

  return (
    <div className="relative inline-block text-right">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 border-2 border-indigo-100 px-3.5 py-1.5 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block leading-none">دانش‌آموز فعال:</span>
          <span className="text-xs font-bold text-slate-800 leading-tight">{currentDisplayName}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white border-2 border-slate-200 rounded-3xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 px-1">
              <span className="text-xs font-bold text-slate-700">انتخاب یا تغییر دانش‌آموز</span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                پایه چهارم
              </span>
            </div>

            {/* Existing Profiles List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 mb-3 p-0.5">
              {profiles.map((learner) => {
                const isSelected = learner.username === currentUsername;
                return (
                  <button
                    key={learner.username}
                    type="button"
                    onClick={() => handleSelect(learner)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-200 text-indigo-950 font-bold"
                        : "bg-slate-50/60 hover:bg-slate-100 border-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-2xs">
                        {learner.displayName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{learner.displayName}</div>
                        <div className="text-[10px] text-slate-400">
                          {toPersianDigits(learner.masteryCount)} مبحث مسلط
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Add New Student Form */}
            <form onSubmit={handleCreateNew} className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1 px-1">
                ثبت نام دانش‌آموز جدید:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="مثال: سارا محمدی"
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white text-xs px-3 py-2 rounded-xl outline-hidden font-medium text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newStudentName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
