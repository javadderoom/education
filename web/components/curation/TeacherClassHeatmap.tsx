"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Copy,
  Check,
  Share2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Printer,
} from "lucide-react";
import { toPersianDigits } from "../../lib/math/persian-digits";
import {
  StudentMasteryMatrixRow,
  StudentKCMasteryItem,
} from "../../actions/analytics";

export interface TeacherClassHeatmapProps {
  students: StudentMasteryMatrixRow[];
  kcs: Array<{ id: string; title: string }>;
  classrooms?: Array<{
    id: string;
    name: string;
    schoolName: string | null;
    gradeLevel: number;
    studentsCount: number;
  }>;
  selectedClassroomId?: string;
  onSelectClassroom?: (classroomId: string) => void;
}

export const TeacherClassHeatmap: React.FC<TeacherClassHeatmapProps> = ({
  students,
  kcs,
  classrooms = [],
  selectedClassroomId = "all",
  onSelectClassroom,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "struggling" | "developing" | "mastered">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Filter students by search term and status
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.username.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "struggling") {
      return st.overallAverage < 60 || st.hasMisconception;
    }
    if (statusFilter === "developing") {
      return st.overallAverage >= 60 && st.overallAverage < 85;
    }
    if (statusFilter === "mastered") {
      return st.overallAverage >= 85;
    }

    return true;
  });

  const getStatusBadge = (avg: number, hasMisconception: boolean) => {
    if (avg >= 85) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>مسلط</span>
        </span>
      );
    }
    if (avg < 60 || hasMisconception) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>نیازمند مداخله</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <Sparkles className="w-3 h-3 text-amber-600" />
        <span>در حال رشد</span>
      </span>
    );
  };

  const renderMasteryCell = (item?: StudentKCMasteryItem) => {
    if (!item || item.status === "unassessed") {
      return (
        <div className="py-2.5 px-2 text-center text-slate-300 font-medium text-xs select-none">
          —
        </div>
      );
    }

    let bgStyle = "bg-amber-500/10 border-amber-300 text-amber-900";
    if (item.status === "mastered") {
      bgStyle = "bg-emerald-500/15 border-emerald-300 text-emerald-900 font-bold";
    } else if (item.status === "struggling") {
      bgStyle = "bg-rose-500/15 border-rose-300 text-rose-900 font-bold";
    }

    return (
      <div
        className={`m-1 py-1.5 px-2 rounded-xl border text-center transition-all ${bgStyle}`}
        title={`${item.kcTitle}: ${toPersianDigits(item.percent)}٪`}
      >
        <span className="text-xs" dir="ltr">
          {toPersianDigits(item.percent)}٪
        </span>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 select-none animate-in fade-in duration-300">
      {/* Official Print-Only Header for Administrative and Parent Reporting */}
      <div className="hidden print:block p-4 mb-4 border-b-2 border-slate-800 text-center">
        <h2 className="text-xl font-black text-slate-900">سامانه پایش تشخیصی یادگیری ریاضی</h2>
        <h3 className="text-sm font-bold text-slate-700 mt-1">
          کارنامه تحلیلی تسلط کلاسی به تفکیک مهارت‌های پنج‌گانه
        </h3>
        <div className="flex justify-between items-center text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200">
          <span>کلاس: {activeClassroom?.name || "کلاس چهارم"}</span>
          <span>مدرسه: {activeClassroom?.schoolName || "دبستان هوشمند شهید بهشتی"}</span>
          <span>تعداد دانش‌آموزان: {toPersianDigits(filteredStudents.length)} نفر</span>
          <span>تاریخ گزارش: {new Date().toLocaleDateString("fa-IR")}</span>
        </div>
      </div>

      {/* Classroom Join Code Card */}
      {activeClassroom && (
        <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>کد پیوستن دانش‌آموزان به کلاس</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">{activeClassroom.name}</h3>
            <p className="text-xs text-indigo-100">
              این کد را در اختیار دانش‌آموزان قرار دهید تا هنگام ورود یا در پروفایل خود عضو کلاس شوند.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-mono text-sm sm:text-base font-black tracking-wider px-3" dir="ltr">
              {activeClassroom.id}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(activeClassroom.id)}
              className="min-h-[36px] flex items-center gap-1.5 bg-white text-indigo-800 hover:bg-indigo-50 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copiedCode === activeClassroom.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>کپی کد</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Class Selector Tabs */}
        {classrooms.length > 0 && onSelectClassroom && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => onSelectClassroom("all")}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedClassroomId === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              همه کلاس‌ها ({toPersianDigits(students.length)})
            </button>
            {classrooms.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectClassroom(c.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedClassroomId === c.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.name} ({toPersianDigits(c.studentsCount)})
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی دانش‌آموز..."
              className="w-full pr-9 pl-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("struggling")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "struggling"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              نیاز به مداخله
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("mastered")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "mastered"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              مسلط
            </button>
          </div>

          {/* Print / PDF Export Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs print:hidden shrink-0"
            title="چاپ کارنامه کلاسی یا ذخیره به صورت PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>چاپ کارنامه (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2D Heatmap Grid Table */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4 min-w-[150px] sticky right-0 bg-slate-50 z-20">
                  نام دانش‌آموز
                </th>
                <th className="py-3 px-3 min-w-[100px]">کلاس</th>
                {kcs.map((kc) => (
                  <th
                    key={kc.id}
                    className="py-3 px-2 min-w-[110px] text-center font-bold text-slate-800"
                    title={kc.title}
                  >
                    <div className="truncate max-w-[130px] mx-auto">{kc.title}</div>
                  </th>
                ))}
                <th className="py-3 px-3 min-w-[90px] text-center">میانگین</th>
                <th className="py-3 px-3 min-w-[110px] text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={kcs.length + 4}
                    className="py-12 text-center text-slate-500 font-medium"
                  >
                    دانش‌آموزی با معیارهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const kcMap = new Map(st.kcMasteries.map((m) => [m.kcId, m]));

                  return (
                    <tr
                      key={st.studentId || idx}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-900 sticky right-0 bg-white hover:bg-indigo-50/30 z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {st.displayName.charAt(0)}
                          </div>
                          <div>
                            <span className="block truncate max-w-[140px]">{st.displayName}</span>
                            <span className="text-[10px] text-slate-400 block font-normal" dir="ltr">
                              @{st.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {st.classroomName || "عمومی"}
                      </td>

                      {kcs.map((kc) => (
                        <td key={kc.id} className="py-1 px-1">
                          {renderMasteryCell(kcMap.get(kc.id))}
                        </td>
                      ))}

                      <td className="py-2.5 px-3 text-center font-black text-slate-900" dir="ltr">
                        {toPersianDigits(st.overallAverage)}٪
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {getStatusBadge(st.overallAverage, st.hasMisconception)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">راهنمای رنگ‌ها:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>تسلط مطلوب (۸۵٪ به بالا)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>نیازمند تمرین (۶۰ تا ۸۴٪)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>نیازمند مداخله و بازتدریس (زیر ۶۰٪)</span>
            </span>
          </div>

          <div>
            <span>تعداد دانش‌آموزان در جدول: </span>
            <b className="text-slate-900">{toPersianDigits(filteredStudents.length)}</b>
          </div>
        </div>
      </div>
    </div>
  );
};
