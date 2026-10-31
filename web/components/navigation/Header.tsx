"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BookOpen, GraduationCap, ShieldCheck, User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { logoutAction, getCurrentUserAction } from "@/actions/auth";
import { SessionUser } from "@/lib/auth/session";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSubject = searchParams.get("subject") || "SUBJ-MATH4-FRACTIONS";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);

  useEffect(() => {
    getCurrentUserAction().then((u) => setUser(u));
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSelectCourse = (subjectId: string) => {
    setCourseOpen(false);
    // Preserve current route but update subject
    if (pathname.startsWith("/student") || pathname.startsWith("/teacher")) {
      router.push(`${pathname}?subject=${subjectId}`);
    } else {
      router.push(`/student?subject=${subjectId}`);
    }
  };

  const isGrade5 = currentSubject === "SUBJ-MATH5-RATIO";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-3.5 py-2.5 shrink-0 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Platform Logo & Course Title with Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCourseOpen((p) => !p)}
            className="flex items-center gap-2 text-right p-1 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs ${
              isGrade5 ? "bg-emerald-600" : "bg-indigo-600"
            }`}>
              {isGrade5 ? "۵" : "۴"}
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                <span>{isGrade5 ? "ریاضی پنجم (نسبت و تناسب)" : "ریاضی چهارم (کسرها)"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${courseOpen ? "rotate-180" : ""}`} />
              </div>
              <p className="text-[10px] text-slate-400">برای تغییر درس کلیک کنید</p>
            </div>
          </button>

          {/* Course Dropdown */}
          {courseOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCourseOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-slate-200 rounded-3xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] font-bold text-slate-400 block px-3 py-1">
                  انتخاب کتاب و فصل درسی:
                </span>

                <button
                  type="button"
                  onClick={() => handleSelectCourse("SUBJ-MATH4-FRACTIONS")}
                  className={`w-full text-right p-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                    !isGrade5 ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">پایه چهارم ابتدایی</div>
                    <div className="text-[10px] text-slate-400">فصل دوم: مفهوم و محاسبات کسرها</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold">
                    ۱۵ سوال
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCourse("SUBJ-MATH5-RATIO")}
                  className={`w-full text-right p-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer mt-1 ${
                    isGrade5 ? "bg-emerald-50 text-emerald-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">پایه پنجم ابتدایی</div>
                    <div className="text-[10px] text-slate-400">فصل سوم: نسبت، تناسب و درصد</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold">
                    ۱۵ سوال
                  </span>
                </button>
              </div>
            </>
          )}
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
                  href={`/teacher?subject=${currentSubject}`}
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
  );
};
