import Link from "next/link";
import { Award, BookOpenCheck, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { MasteryRadar, KCMasteryInfo } from "@/components/assessment/MasteryRadar";
import { toPersianDigits } from "@/lib/math/persian-digits";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "کارنامه و وضعیت تسلط بر مفاهیم | پایه چهارم",
  description: "مشاهده میزان تسلط و پیشرفت در مفاهیم کسرها",
};

export default async function MasteryPage() {
  const cartridge = getCanonicalCartridge();

  // Baseline mastery indicators for the 5 knowledge components
  const baselineMasteries: KCMasteryInfo[] = cartridge.knowledge_components.map((kc, index) => {
    // Demo baseline mastery levels for initial display
    const masteryValues = [0.85, 0.65, 0.90, 0.45, 0.75];
    const prob = masteryValues[index % masteryValues.length];
    return {
      id: kc.id,
      title: kc.title,
      masteryProbability: prob,
      isMastered: prob >= 0.85,
    };
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-2 select-none animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs mb-4 text-center">
        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          کارنامه تسلط بر مفاهیم کسرها
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          این نمودار بر اساس عملکرد و پاسخ‌های شما در آزمون تشخیصی محاسبه می‌شود و نشان می‌دهد در هر مبحث چقدر تسلط دارید.
        </p>
      </div>

      {/* Main Radar Card */}
      <div className="mb-4">
        <MasteryRadar masteryList={baselineMasteries} />
      </div>

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
