import React from "react";
import Link from "next/link";
import { Users, GraduationCap, School, BookOpen, Layers, ShieldCheck, Plus, CheckCircle, BarChart3, Trash2 } from "lucide-react";
import { getAdminOverviewStats, getAdminUsersList } from "@/actions/admin";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "میز مدیریت کلان سامانه | پلتفرم ارزیابی شناختی",
  description: "داشبورد مدیریت مدارس، کلاس‌ها، کاربران و برنامه‌های درسی",
};

export default async function AdminPage() {
  const [overviewRes, usersRes] = await Promise.all([
    getAdminOverviewStats(),
    getAdminUsersList(),
  ]);

  const stats = overviewRes.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    totalSessions: 0,
    totalItems: 0,
    classrooms: [],
    curricula: [],
  };

  const users = usersRes.users || [];

  return (
    <div className="w-full max-w-5xl mx-auto py-3 px-2 select-none animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>پنل مدیریت ارشد سامانه</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">پیشخوان نظارت و مدیریت آموزشی</h1>
          <p className="text-xs text-slate-500 mt-1">
            مدیریت کلاس‌ها، انتساب آموزگاران، نظارت بر کاربران و وضعیت بسته‌های درسی فعال
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/teacher"
            className="min-h-[42px] px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>مشاهده میز معلم</span>
          </Link>
          <Link
            href="/"
            className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center"
          >
            <span>صفحه اصلی</span>
          </Link>
        </div>
      </div>

      {/* High-Level Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 text-center shadow-xs">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 block">دانش‌آموزان:</span>
          <span className="text-xl font-black text-slate-900 font-mono" dir="ltr">
            {toPersianDigits(stats.totalStudents)}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 text-center shadow-xs">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 block">آموزگاران:</span>
          <span className="text-xl font-black text-slate-900 font-mono" dir="ltr">
            {toPersianDigits(stats.totalTeachers)}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 text-center shadow-xs">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <School className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 block">کلاس‌های درسی:</span>
          <span className="text-xl font-black text-slate-900 font-mono" dir="ltr">
            {toPersianDigits(stats.totalClassrooms)}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 text-center shadow-xs">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 block">جلسات آزمون:</span>
          <span className="text-xl font-black text-slate-900 font-mono" dir="ltr">
            {toPersianDigits(stats.totalSessions)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border-2 border-slate-200 rounded-3xl p-4 text-center shadow-xs">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 block">سوالات فعال:</span>
          <span className="text-xl font-black text-slate-900 font-mono" dir="ltr">
            {toPersianDigits(stats.totalItems)}
          </span>
        </div>
      </div>

      {/* Interactive Tabs Management Client */}
      <AdminDashboardClient
        initialClassrooms={stats.classrooms}
        initialUsers={users}
        curricula={stats.curricula}
      />
    </div>
  );
}
