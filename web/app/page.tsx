import Link from "next/link";
import { BookOpen, GraduationCap, Sparkles, ArrowLeft, CheckCircle2, Shapes, ShieldCheck, Scale, SplitSquareVertical } from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const metadata = {
  title: "سامانه ارزیابی مفهومی و سنجش تشخیصی ریاضی | دوره دوم ابتدایی",
  description: "سامانه آموزش مفهومی، سنجش تشخیصی و تمرین‌های تعاملی ریاضی دوره دوم ابتدایی",
};

export default function LandingPage() {
  const courses = [
    {
      id: "SUBJ-MATH4-FRACTIONS",
      grade: 4,
      title: "ریاضی چهارم: مفهوم و محاسبات کسرها",
      chapter: "فصل دوم کتاب درسی",
      description: "شناخت مفهوم جزء از کل، تساوی کسرها، مقایسه، جمع و تفریق هم‌مخرج و محور اعداد",
      itemCount: 15,
      colorClass: "border-indigo-200 hover:border-indigo-500 bg-indigo-50/30",
      badgeClass: "bg-indigo-100 text-indigo-800",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
      icon: SplitSquareVertical,
    },
    {
      id: "SUBJ-MATH5-RATIO",
      grade: 5,
      title: "ریاضی پنجم: نسبت، تناسب و درصد",
      chapter: "فصل سوم کتاب درسی",
      description: "مفهوم نسبت، نسبت‌های مساوی، جدول تناسب، تسهیم به نسبت و محاسبه درصد و تخفیف",
      itemCount: 15,
      colorClass: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/30",
      badgeClass: "bg-emerald-100 text-emerald-800",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      icon: Scale,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-6 px-1 select-none animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-b from-indigo-50/80 via-white to-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-xs mb-6">
        <div className="inline-flex items-center gap-2 bg-indigo-100/90 text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>پلتفرم تخصصی آموزش و سنجش شناختی ریاضی دبستان</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2.5">
          یادگیری مفهومی و سنجش هوشمند ریاضی
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          شناسایی دقیق نقاط قوت، ریشه‌یابی خطاهای ذهنی با مدل‌های شناختی، و تقویت درک عمیق ریاضی با کارگاه‌های دست‌ورزی تعاملی
        </p>
      </div>

      {/* Course Selection Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>کتابخانه‌ی دروس فعال (انتخاب درس جهت شروع):</span>
          </div>
          <span className="text-xs text-slate-400 font-bold">۲ بسته درسی مصوب</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`border-2 rounded-3xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between bg-white ${c.colorClass}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${c.badgeClass}`}>
                      پایه {toPersianDigits(c.grade)} دبستان
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono" dir="ltr">
                      {toPersianDigits(c.itemCount)} سوال تشخیصی
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="font-black text-base text-slate-900 leading-tight">{c.title}</h2>
                      <span className="text-[11px] text-slate-500 font-semibold">{c.chapter}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/student?subject=${c.id}`}
                    className={`min-h-[42px] flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all ${c.btnClass}`}
                  >
                    <span>شروع آزمون</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/student/workshop?subject=${c.id}`}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>کارگاه دست‌ورزی</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Standards & Staff Access */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-medium pb-2">
        <span>بر اساس استاندارد رسمی کتاب‌های درسی ریاضی دوره دوم ابتدایی (پایگاه کتاب‌های درسی ایران)</span>
        <div className="flex items-center gap-1.5">
          <span>کادر آموزشی و مدارس:</span>
          <Link
            href="/login?role=staff"
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ورود همکاران
          </Link>
        </div>
      </div>
    </div>
  );
}
