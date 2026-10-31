"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Phone, School, Sparkles, GraduationCap, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginStudentAction, loginStaffAction, registerStudentAction, registerTeacherAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"student_login" | "staff_login" | "register">("student_login");
  const [registerRole, setRegisterRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student Login Form State
  const [studentUsername, setStudentUsername] = useState("student_demo");
  const [studentPin, setStudentPin] = useState("1234");

  // Staff Login Form State
  const [staffUsername, setStaffUsername] = useState("teacher_maryam");
  const [staffPassword, setStaffPassword] = useState("teacher123456");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regGrade, setRegGrade] = useState(4);
  const [regSchool, setRegSchool] = useState("");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginStudentAction(studentUsername, studentPin);
    setLoading(false);

    if (res.success) {
      router.push("/student");
      router.refresh();
    } else {
      setError(res.error || "ورود ناموفق بود");
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginStaffAction(staffUsername, staffPassword);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/teacher");
      }
      router.refresh();
    } else {
      setError(res.error || "نام کاربری یا کلمه عبور نادرست است");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (registerRole === "student") {
      const res = await registerStudentAction({
        displayName: regName,
        gradeLevel: Number(regGrade),
        pinCode: regPin || undefined,
        schoolName: regSchool || undefined,
      });
      setLoading(false);
      if (res.success) {
        router.push("/student");
        router.refresh();
      } else {
        setError(res.error || "خطا در ثبت نام دانش‌آموز");
      }
    } else {
      const res = await registerTeacherAction({
        displayName: regName,
        username: regUsername,
        password: regPassword,
        phone: regPhone || undefined,
        schoolName: regSchool || undefined,
      });
      setLoading(false);
      if (res.success) {
        router.push("/teacher");
        router.refresh();
      } else {
        setError(res.error || "خطا در ثبت نام آموزگار");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 px-3 select-none animate-in fade-in duration-300">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-1">ورود به سامانه یادگیری</h1>
          <p className="text-xs text-slate-500">
            لطفاً نوع ورود خود را مشخص نمایید
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab("student_login"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "student_login"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            دانش‌آموز
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("staff_login"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "staff_login"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            آموزگار / مدیر
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl mb-4 text-right">
            {error}
          </div>
        )}

        {/* Tab 1: Student Login Form */}
        {activeTab === "student_login" && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                نام کاربری یا شناسه دانش‌آموز:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                  placeholder="مثال: student_demo"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all text-left font-mono"
                  dir="ltr"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                حساب‌های دمو فعال: student_demo (پایه ۴) یا student_grade5_demo (پایه ۵)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                رمز یا پین ۴ رقمی:
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  value={studentPin}
                  onChange={(e) => setStudentPin(e.target.value)}
                  placeholder="۱۲۳۴"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all text-center tracking-widest font-mono"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                پین پیش‌فرض دمو: ۱۲۳۴
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? "در حال ورود..." : "ورود به پیشخوان دانش‌آموز"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Staff Login Form */}
        {activeTab === "staff_login" && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                نام کاربری آموزگار یا مدیر:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="teacher_maryam یا admin"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all text-left font-mono"
                  dir="ltr"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                برای آموزگار: teacher_maryam | برای مدیریت: admin
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                کلمه عبور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all text-left font-mono"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                رمز معلم: teacher123456 | رمز مدیر: admin123456
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? "در حال اعتبارسنجی..." : "ورود به میز کار"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 3: Register Form */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setRegisterRole("student")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  registerRole === "student" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                ثبت‌نام دانش‌آموز
              </button>
              <button
                type="button"
                onClick={() => setRegisterRole("teacher")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  registerRole === "teacher" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-600"
                }`}
              >
                ثبت‌نام آموزگار
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">نام و نام خانوادگی:</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="مثال: پارسا صادقی"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden"
              />
            </div>

            {registerRole === "student" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">پایه تحصیلی:</label>
                    <select
                      value={regGrade}
                      onChange={(e) => setRegGrade(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden"
                    >
                      <option value={4}>پایه چهارم دبستان</option>
                      <option value={5}>پایه پنجم دبستان</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">پین ۴ رقمی (اختیاری):</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="۱۲۳۴"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden text-center font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نام مدرسه (اختیاری):</label>
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="مثال: دبستان شهید بهشتی"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نام کاربری انگلیسی:</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="teacher_ahmadi"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">کلمه عبور (حداقل ۶ نویسه):</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">تلفن همراه (اختیاری):</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="۰۹۱۲..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">نام مدرسه:</label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="دبستان..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-hidden"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              <span>{loading ? "در حال ثبت نام..." : "تکمیل ثبت‌نام و ورود"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
