"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { GraduationCap, ShieldCheck, User, LogOut, ChevronDown } from "lucide-react";
import { logoutAction, getCurrentUserAction } from "@/actions/auth";
import { SessionUser } from "@/lib/auth/session";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { GradeCourseModal } from "./GradeCourseModal";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedGrade, selectedSubjectId, activeTaxonomy, openSelector } = useCurriculumStore();

  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getCurrentUserAction().then((u) => setUser(u));
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isGrade5 = selectedGrade === 5;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-3.5 py-2.5 shrink-0 select-none">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Two-Tier Grade & Course Selector Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={openSelector}
              className="flex items-center gap-2 text-right p-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
              aria-label="تغییر پایه یا کتاب درسی"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-xs transition-transform group-hover:scale-105 ${
                  isGrade5 ? "bg-emerald-600" : "bg-indigo-600"
                }`}
              >
                {toPersianDigits(selectedGrade)}
              </div>
              <div>
                <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-slate-900 leading-tight">
                  <span>{activeTaxonomy.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-[220px]">
                  {activeTaxonomy.chapterTitle}
                </p>
              </div>
            </button>
          </div>

          {/* Right: User Status & Navigation Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Role-based Link */}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="min-h-[36px] px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">مدیریت</span>
                  </Link>
                )}

                {(user.role === "teacher" || user.role === "admin") && (
                  <Link
                    href={`/teacher?subject=${selectedSubjectId}`}
                    className="min-h-[36px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">میز معلم</span>
                  </Link>
                )}

                {/* User Identity Chip (Without Technical Role Labels) */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="max-w-[120px] sm:max-w-none truncate">{user.displayName}</span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="خروج از حساب"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="min-h-[38px] px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Two-step Grade & Course Selection Modal */}
      <GradeCourseModal />
    </>
  );
};
