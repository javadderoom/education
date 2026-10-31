import Link from "next/link";
import { Award, BookOpenCheck, Sparkles, TrendingUp, CheckCircle2, Clock, Calendar, RefreshCw } from "lucide-react";
import { getStudentMasteryStates } from "@/actions/assessment";
import { getLearnersList } from "@/actions/analytics";
import { MasteryRadar, KCMasteryInfo } from "@/components/assessment/MasteryRadar";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { StudentProfileSwitcher } from "@/components/navigation/StudentProfileSwitcher";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "کارنامه و وضعیت تسلط بر مفاهیم | پایه چهارم",
  description: "مشاهده میزان تسلط، پایداری حافظه و زمان‌بندی مرور مفاهیم کسرها",
};

interface PageProps {
  searchParams: Promise<{ student?: string }>;
}

export default async function MasteryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const username = params.student || "student_ali";

  const [masteryData, learnersData] = await Promise.all([
    getStudentMasteryStates(username),
    getLearnersList(),
  ]);

  const masteries = masteryData.masteries || [];
  const currentLearner = masteryData.learner || {
    displayName: "علی رضایی",
    username: "student_ali",
  };

  const masteryRadarList: KCMasteryInfo[] = masteries.map((m) => ({
    id: m.kcId,
    title: m.title,
    masteryProbability: m.masteryProbability,
    isMastered: m.isMastered,
  }));

  const masteredCount = masteries.filter((m) => m.isMastered).length;
  const averageMastery =
    masteries.length > 0
      ? Math.round(
          (masteries.reduce((acc, m) => acc + m.masteryProbability, 0) / masteries.length) * 100
        )
      : 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-2 select-none animate-in fade-in duration-300">
      {/* Top Header Card with Profile Switcher */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                کارنامه تسلط و مرور مفاهیم کسرها
              </h1>
              <p className="text-xs text-slate-500">
                بر اساس ارزیابی‌های شناختی و زمان‌بندی تثبیت در حافظه
              </p>
            </div>
          </div>

          <StudentProfileSwitcher
            learners={learnersData.learners}
            activeUsername={username}
          />
        </div>

        {/* Quick Overall Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
            <span className="text-[11px] text-slate-400 block mb-0.5">میانگین تسلط:</span>
            <span className="text-base font-black text-indigo-700 font-mono" dir="ltr">
              {toPersianDigits(averageMastery)}٪
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
            <span className="text-[11px] text-slate-400 block mb-0.5">سرفصل‌های مسلط:</span>
            <span className="text-base font-black text-emerald-700 font-mono" dir="ltr">
              {toPersianDigits(masteredCount)} از {toPersianDigits(masteries.length || 5)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
            <span className="text-[11px] text-slate-400 block mb-0.5">وضعیت یادگیری:</span>
            <span className="text-xs font-bold text-slate-700">
              {averageMastery >= 80 ? "تسلط بسیار مطلوب" : averageMastery >= 50 ? "در حال پیشرفت" : "نیازمند تمرین"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {masteries.length === 0 ? (
        /* Pedagogical Empty State - Strict Rule 7 & 10 Compliance */
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-10 text-center mb-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <BookOpenCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
            هنوز برای «{currentLearner.displayName}» آزمونی ثبت نشده است
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            با شرکت در اولین آزمون تشخیصی، نمودار هوشمند تسلط، نقاط قوت و زمان‌بندی مرور تثبیت‌کننده در اینجا تشکیل خواهد شد.
          </p>
          <Link
            href="/student"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-2xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>شروع اولین ارزیابی تشخیصی</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Main Radar Card */}
          <div className="mb-4">
            <MasteryRadar masteryList={masteryRadarList} />
          </div>

          {/* Section: Spaced Repetition & Memory Stability Cards */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs mb-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  وضعیت تثبیت در حافظه و زمان‌بندی مرور مفاهیم
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  برای جلوگیری از فراموشی، مفاهیم مشخص‌شده را در زمان مناسب مرور کنید
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {masteries.map((m) => {
                const percent = Math.round(m.masteryProbability * 100);
                const isDue = m.reviewStatus?.isDue;

                return (
                  <div
                    key={m.kcId}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isDue
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-100 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {m.title}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.reviewStatus && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${m.reviewStatus.colorClass}`}
                          >
                            {m.reviewStatus.label}
                          </span>
                        )}
                        <span
                          className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg shrink-0"
                          dir="ltr"
                        >
                          {toPersianDigits(percent)}٪ تسلط
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 80
                            ? "bg-emerald-500"
                            : percent >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        تعداد دفعات ارزیابی: {toPersianDigits(m.opportunityCount)} بار
                      </span>
                      {m.masteryProbability < 0.85 && (
                        <Link
                          href="/student/workshop"
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تقویت در کارگاه</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons to Continue Learning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Link
          href="/student"
          className="min-h-[48px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>ادامه یا شروع آزمون تشخیصی</span>
        </Link>

        <Link
          href="/student/workshop"
          className="min-h-[48px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>تمرین در کارگاه دست‌ورزی</span>
        </Link>
      </div>
    </div>
  );
}
