import Link from "next/link";
import { BookOpen, GraduationCap, Sparkles, ArrowLeft, CheckCircle2, Shapes, Compass } from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const metadata = {
  title: "سامانه ارزیابی و یادگیری کسرها | پایه چهارم ابتدایی",
  description: "سامانه آموزش مفهومی، سنجش تشخیصی و تمرین‌های تعاملی ریاضی دوره دوم ابتدایی",
};

export default function LandingPage() {
  const learningTopics = [
    "شناخت مفهوم کسر به عنوان جزء از کل",
    "تولید و تشخیص کسرهای مساوی",
    "مقایسه کسرها و درک اندازه نسبی",
    "جمع و تفریق کسرهای هم‌مخرج",
    "نمایش کسرها روی محور اعداد",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-6 px-1 select-none animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-b from-indigo-50/90 to-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 text-center shadow-xs mb-6">
        <div className="inline-flex items-center gap-2 bg-indigo-100/80 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>ریاضی پایه چهارم دبستان - فصل دوم: کسرها</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2.5">
          یادگیری مفهومی و سنجش هوشمند کسرها
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          شناسایی دقیق نقاط قوت، رفع ریشه‌ای موانع یادگیری و تقویت درک ریاضی با ابزارهای تصویری و دست‌ورزی تعاملی
        </p>
      </div>

      {/* Main Role Selection Portals (Student & Teacher) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Student Portal Card */}
        <Link
          href="/student"
          className="group block bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="mb-4">
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              ویژه دانش‌آموزان
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors">
              شروع سنجش و تمرین کسرها
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              پاسخ به سوالات تشخیصی، کار با نوارهای کسر و دریافت گزارش تسلط بر مفاهیم
            </p>
          </div>

          <div className="min-h-[46px] w-full flex items-center justify-center gap-2 bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all">
            <span>ورود به بخش دانش‌آموز</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* Teacher Portal Card */}
        <Link
          href="/teacher"
          className="group block bg-white border-2 border-slate-200 hover:border-slate-400 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-200 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="mb-4">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
              ویژه آموزگاران
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-slate-900 transition-colors">
              میز کار و بازبینی آموزگار
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              بررسی سوالات، تحلیل بدفهمی‌های هدف، بازبینی مثال‌های نقض و تایید نهایی برای انتشار
            </p>
          </div>

          <div className="min-h-[46px] w-full flex items-center justify-center gap-2 bg-slate-800 group-hover:bg-slate-900 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all">
            <span>ورود به میز آموزگار</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Curriculum Coverage Overview */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
          <Shapes className="w-4 h-4 text-indigo-600" />
          <span>سرفصل‌های آموزشی تحت پوشش این فصل:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {learningTopics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                {toPersianDigits(index + 1)}
              </div>
              <span className="truncate">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Encouraging Footer Note */}
      <div className="text-center text-[11px] text-slate-400 font-medium pb-4">
        بر اساس استاندارد کتاب درسی ریاضی پایه چهارم دوره ابتدایی (پایگاه کتاب‌های درسی ایران)
      </div>
    </div>
  );
}
