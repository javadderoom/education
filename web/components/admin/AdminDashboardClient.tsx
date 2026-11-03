"use client";

import React, { useState } from "react";
import { School, Users, BookOpen, Plus, Trash2, CheckCircle2, Search, Filter, Layers } from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { createClassroomAction, deleteUserAction } from "@/actions/admin";
import { CurriculumManager } from "./CurriculumManager";

interface AdminDashboardClientProps {
  initialClassrooms: Array<{
    id: string;
    name: string;
    gradeLevel: number;
    schoolName: string | null;
    teacherName: string | null;
    studentsCount: number;
  }>;
  initialUsers: Array<{
    id: string;
    username: string;
    displayName: string;
    role: string;
    gradeLevel: number;
    phone: string | null;
    schoolName: string | null;
    classroomName: string | null;
    sessionsCount: number;
    createdAt: Date;
  }>;
  curricula: Array<{
    cartridgeId: string;
    title: string;
    subjectId: string;
    subjectName: string;
    gradeLevel: number;
    itemCount: number;
  }>;
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  initialClassrooms,
  initialUsers,
  curricula,
}) => {
  const [activeTab, setActiveTab] = useState<"classrooms" | "users" | "curricula" | "tree">("tree");
  const [classrooms, setClassrooms] = useState(initialClassrooms);
  const [users, setUsers] = useState(initialUsers);

  // New Classroom Form State
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [classNameInput, setClassNameInput] = useState("");
  const [classGradeInput, setClassGradeInput] = useState(4);
  const [classSchoolInput, setClassSchoolInput] = useState("دبستان هوشمند شهید بهشتی");
  const [createLoading, setCreateLoading] = useState(false);

  // Users Filter State
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "student" | "teacher">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    setCreateLoading(true);
    const res = await createClassroomAction({
      name: classNameInput.trim(),
      gradeLevel: Number(classGradeInput),
      schoolName: classSchoolInput.trim(),
    });
    setCreateLoading(false);

    if (res.success && res.classroomId) {
      setClassrooms((prev) => [
        {
          id: res.classroomId!,
          name: classNameInput.trim(),
          gradeLevel: Number(classGradeInput),
          schoolName: classSchoolInput.trim(),
          teacherName: "تعیین نشده",
          studentsCount: 0,
        },
        ...prev,
      ]);
      setClassNameInput("");
      setShowCreateClass(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف کاربر «${name}» اطمینان دارید؟`)) return;

    const res = await deleteUserAction(id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tree"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>درخت سلسله‌مراتب آموزشی (پویا)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("classrooms")}
          className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "classrooms"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <School className="w-4 h-4" />
          <span>مدیریت کلاس‌ها ({toPersianDigits(classrooms.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>کاربران و دسترسی‌ها ({toPersianDigits(users.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("curricula")}
          className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "curricula"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>بسته‌های درسی ({toPersianDigits(curricula.length)})</span>
        </button>
      </div>

      {/* Tab 1: Classrooms */}
      {activeTab === "classrooms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">لیست کلاس‌های ثبت‌شده</h3>
            <button
              type="button"
              onClick={() => setShowCreateClass((p) => !p)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن کلاس جدید</span>
            </button>
          </div>

          {/* Create Classroom Form */}
          {showCreateClass && (
            <form onSubmit={handleCreateClass} className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-indigo-900 block">مشخصات کلاس جدید:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="نام کلاس (مثال: چهارم ب)"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-indigo-500"
                />
                <select
                  value={classGradeInput}
                  onChange={(e) => setClassGradeInput(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-indigo-500"
                >
                  <option value={4}>پایه چهارم</option>
                  <option value={5}>پایه پنجم</option>
                  <option value={6}>پایه ششم</option>
                </select>
                <input
                  type="text"
                  placeholder="نام مدرسه"
                  value={classSchoolInput}
                  onChange={(e) => setClassSchoolInput(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  {createLoading ? "در حال ثبت..." : "ثبت کلاس"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}

          {/* Classrooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classrooms.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-white hover:border-indigo-100 transition-all shadow-2xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-sm text-slate-900">{c.name}</span>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                    پایه {toPersianDigits(c.gradeLevel)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1 mb-2">
                  <div>مدرسه: {c.schoolName || "ثبت نشده"}</div>
                  <div>آموزگار: {c.teacherName}</div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>تعداد دانش‌آموزان:</span>
                  <span className="font-bold text-indigo-700" dir="ltr">{toPersianDigits(c.studentsCount)} نفر</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="جستجوی نام یا نام‌کاربری..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl py-2 px-3 pl-8 text-xs outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setUserRoleFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRoleFilter === "all" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                همه ({toPersianDigits(users.length)})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter("student")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRoleFilter === "student" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                دانش‌آموزان
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter("teacher")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRoleFilter === "teacher" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                آموزگاران
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border-2 border-slate-100 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام و نام خانوادگی</th>
                  <th className="p-3">نام کاربری</th>
                  <th className="p-3">نقش</th>
                  <th className="p-3">پایه / کلاس</th>
                  <th className="p-3">جلسات آزمون</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{u.displayName}</td>
                    <td className="p-3 font-mono text-slate-500" dir="ltr">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.role === "admin"
                          ? "bg-amber-100 text-amber-800"
                          : u.role === "teacher"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {u.role === "admin" ? "مدیر" : u.role === "teacher" ? "آموزگار" : "دانش‌آموز"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.classroomName || (u.gradeLevel ? `پایه ${toPersianDigits(u.gradeLevel)}` : "-")}
                    </td>
                    <td className="p-3 font-mono text-slate-600" dir="ltr">
                      {toPersianDigits(u.sessionsCount)}
                    </td>
                    <td className="p-3 text-center">
                      {u.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.displayName)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف کاربر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Curricula */}
      {activeTab === "curricula" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">بسته‌های درسی و استانداردهای فعال</h3>
            <span className="text-xs text-slate-500">پوشش مصوب آموزش و پرورش</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {curricula.map((curr) => (
              <div key={curr.cartridgeId} className="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg">
                    پایه {toPersianDigits(curr.gradeLevel)} ابتدایی
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>فعال در بانک سوالات</span>
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-900 mb-1">{curr.title}</h4>
                <div className="text-xs text-slate-500 font-mono mb-3" dir="ltr">
                  شناسه درس: {curr.subjectId}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                  <span>تعداد سوالات تشخیصی مصوب:</span>
                  <span className="font-bold text-indigo-700" dir="ltr">
                    {toPersianDigits(curr.itemCount)} سوال
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Universal Curriculum Hierarchy Tree */}
      {activeTab === "tree" && <CurriculumManager />}
    </div>
  );
};
