"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Layers, Scale, Grid, Box, RotateCw, Shapes, Circle, Clock, ArrowLeftRight, Compass, Divide, Cylinder, Scissors } from "lucide-react";
import { FractionStrip } from "@/components/parametric/FractionStrip";
import { BalanceScale } from "@/components/parametric/BalanceScale";
import { AreaGrid } from "@/components/parametric/AreaGrid";
import { VolumePrismVisualizer } from "@/components/parametric/VolumePrismVisualizer";
import { SymmetryPlayground } from "@/components/parametric/SymmetryPlayground";
import { FractionAreaMultiplier } from "@/components/parametric/FractionAreaMultiplier";
import { PolygonAreaDecomposer } from "@/components/parametric/PolygonAreaDecomposer";
import { CircleMeasurementVisualizer } from "@/components/parametric/CircleMeasurementVisualizer";
import { CompoundUnitCalculator } from "@/components/parametric/CompoundUnitCalculator";
import { CoordinateGridVisualizer } from "@/components/parametric/CoordinateGridVisualizer";
import { IntegerNumberLine } from "@/components/parametric/IntegerNumberLine";
import { AngleRelationshipVisualizer } from "@/components/parametric/AngleRelationshipVisualizer";
import { FractionDivisionVisualizer } from "@/components/parametric/FractionDivisionVisualizer";
import { CylinderVolumeVisualizer } from "@/components/parametric/CylinderVolumeVisualizer";
import { ApproximationRuler } from "@/components/parametric/ApproximationRuler";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export default function WorkshopPage() {
  const searchParams = useSearchParams();
  const { selectedSubjectId } = useCurriculumStore();
  const subjectId = searchParams.get("subject") || selectedSubjectId || "SUBJ-MATH4-FRACTIONS";
  const isGrade6 = subjectId === "SUBJ-MATH6-COORD" || subjectId.includes("6") || subjectId.includes("MATH6");
  const isGrade5 = !isGrade6 && (subjectId === "SUBJ-MATH5-RATIO" || subjectId.includes("5") || subjectId.includes("MATH5"));

  type TabType =
    | "strip"
    | "scale"
    | "grid"
    | "volume"
    | "symmetry"
    | "fraction_mult"
    | "polygon_area"
    | "circle"
    | "compound_time"
    | "coordinate_grid"
    | "integer_line"
    | "angle_relations"
    | "fraction_div"
    | "cylinder"
    | "approx_ruler";

  const [activeTab, setActiveTab] = useState<TabType>(
    isGrade6 ? "coordinate_grid" : isGrade5 ? "volume" : "strip"
  );

  // State for Fraction Strip workshop
  const [stripSegments, setStripSegments] = useState(6);
  const [stripColored, setStripColored] = useState(2);

  // State for Balance Scale workshop
  const [scaleLeft, setScaleLeft] = useState<{ label: string; value: number }>({ label: isGrade5 ? "2:3" : "1/2", value: isGrade5 ? 2 / 3 : 0.5 });
  const [scaleRight, setScaleRight] = useState<{ label: string; value: number }>({ label: isGrade5 ? "4:6" : "1/4", value: isGrade5 ? 4 / 6 : 0.25 });

  // State for Area Grid workshop
  const [gridColored, setGridColored] = useState(isGrade5 ? 35 : 3);

  return (
    <div className="w-full max-w-2xl mx-auto py-2 select-none animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-xs mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {isGrade6
              ? "آزمایشگاه و کارگاه دست‌ورزی مختصات، تقارن و مفاهیم ریاضی ششم"
              : isGrade5
              ? "آزمایشگاه و کارگاه دست‌ورزی نسبت، تناسب و درصد"
              : "آزمایشگاه و کارگاه دست‌ورزی کسرها"}
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          {isGrade6
            ? "با دست‌ورزی، مختصات، اعداد صحیح و حجم را کشف کنید"
            : isGrade5
            ? "با دست‌ورزی، نسبت‌ها و درصد را لمس کنید"
            : "با دست‌ورزی کسرها را لمس و کشف کنید"}
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isGrade6
            ? "نقطه روی صفحه مختصات جابجا کنید، اعداد منفی را بسنجید، زاویه‌های متقابل به رأس را مقایسه کنید یا استوانه را باز کنید."
            : isGrade5
            ? "با ترازوی تعادل، تساوی نسبت‌ها و تناسب را بسنجید یا در شبکه ۱۰۰ تایی مفهوم درصد را مشاهده کنید."
            : "ابزار مورد نظر خود را انتخاب کرده و با تغییر قطعات، اندازه و روابط کسرها را به صورت دیداری تجربه کنید."}
        </p>

        {/* Tool Switcher Tabs */}
        {isGrade6 ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 max-w-xl mx-auto p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("coordinate_grid")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "coordinate_grid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>دستگاه مختصات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("integer_line")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "integer_line" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>اعداد صحیح و منفی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("angle_relations")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "angle_relations" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>زاویه‌ها و متمم/مکمل</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fraction_div")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fraction_div" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Divide className="w-3.5 h-3.5 text-indigo-600" />
              <span>تقسیم کسرها</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cylinder")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "cylinder" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Cylinder className="w-3.5 h-3.5 text-indigo-600" />
              <span>استوانه و گسترده</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approx_ruler")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "approx_ruler" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-indigo-600" />
              <span>تقریب و گرد کردن</span>
            </button>
          </div>
        ) : isGrade5 ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 max-w-xl mx-auto p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("volume")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "volume" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Box className="w-3.5 h-3.5 text-indigo-600" />
              <span>حجم سه‌بعدی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("symmetry")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "symmetry" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>تقارن مرکزی و محوری</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fraction_mult")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fraction_mult" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>مساحت ضرب کسر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("polygon_area")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "polygon_area" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shapes className="w-3.5 h-3.5 text-indigo-600" />
              <span>لوزی و ذوزنقه</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("circle")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "circle" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Circle className="w-3.5 h-3.5 text-indigo-600" />
              <span>دایره و عدد پی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("scale")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scale" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>ترازوی تناسب</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "grid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>شبکه درصد</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("compound_time")}
              className={`min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "compound_time" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>زمان‌های مرکب</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("scale")}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scale" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>ترازوی مقایسه</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "grid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>شبکه مساحت</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("strip")}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "strip" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نوار کسرها</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Manipulative Visual Container */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs mb-4">
        {activeTab === "strip" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>ابزار نوار رنگ‌آمیزی:</span>
              <span className="font-bold text-indigo-700 text-sm" dir="ltr">
                {toPersianDigits(stripColored)} / {toPersianDigits(stripSegments)}
              </span>
            </div>

            <div className="flex justify-center py-4">
              <FractionStrip
                totalSegments={stripSegments}
                initialColored={stripColored}
                interactive={true}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>تعداد کل قطعات واحد:</span>
                  <span className="font-bold" dir="ltr">{toPersianDigits(stripSegments)}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={stripSegments}
                  onChange={(e) => {
                    const seg = Number(e.target.value);
                    setStripSegments(seg);
                    if (stripColored > seg) setStripColored(seg);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>تعداد بخش‌های رنگ‌شده:</span>
                  <span className="font-bold" dir="ltr">{toPersianDigits(stripColored)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stripSegments}
                  value={stripColored}
                  onChange={(e) => setStripColored(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "scale" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>{isGrade5 ? "ترازوی سنجش تناسب:" : "ترازوی مقایسه کسرها:"}</span>
              <span className="text-slate-500 font-normal text-[11px]">
                {scaleLeft.value === scaleRight.value ? "✅ تعادل برقرار است (متناسب)" : "⚖️ نامتعادل"}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <BalanceScale
                leftValue={scaleLeft.value}
                rightValue={scaleRight.value}
                leftLabel={scaleLeft.label}
                rightLabel={scaleRight.label}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">وزن کفه چپ:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScaleLeft({ label: isGrade5 ? "2:3" : "1/2", value: isGrade5 ? 2 / 3 : 0.5 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۲ به ۳" : "۱/۲"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleLeft({ label: isGrade5 ? "4:6" : "3/4", value: isGrade5 ? 4 / 6 : 0.75 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۴ به ۶" : "۳/۴"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">وزن کفه راست:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScaleRight({ label: isGrade5 ? "4:6" : "2/4", value: isGrade5 ? 4 / 6 : 0.5 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۴ به ۶" : "۲/۴"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleRight({ label: isGrade5 ? "5:7" : "1/4", value: isGrade5 ? 5 / 7 : 0.25 })}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isGrade5 ? "۵ به ۷" : "۱/۴"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "grid" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
              <span>{isGrade5 ? "شبکه ۱۰۰ تایی درصد:" : "شبکه مستطیلی کسر:"}</span>
              <span className="font-bold text-indigo-700 text-sm" dir="ltr">
                {isGrade5 ? `${toPersianDigits(gridColored)}٪` : `${toPersianDigits(gridColored)} / ۶`}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <AreaGrid
                rows={isGrade5 ? 10 : 2}
                cols={isGrade5 ? 10 : 3}
                initialColored={gridColored}
                interactive={true}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>{isGrade5 ? "درصد پرشده:" : "تعداد خانه‌های رنگی:"}</span>
                <span className="font-bold" dir="ltr">
                  {isGrade5 ? `${toPersianDigits(gridColored)}٪` : toPersianDigits(gridColored)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={isGrade5 ? 100 : 6}
                value={gridColored}
                onChange={(e) => setGridColored(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Grade 5 Advanced Manipulative Views */}
        {activeTab === "volume" && (
          <div className="py-2">
            <VolumePrismVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "symmetry" && (
          <div className="py-2">
            <SymmetryPlayground interactive={true} />
          </div>
        )}

        {activeTab === "fraction_mult" && (
          <div className="py-2">
            <FractionAreaMultiplier interactive={true} />
          </div>
        )}

        {activeTab === "polygon_area" && (
          <div className="py-2">
            <PolygonAreaDecomposer interactive={true} />
          </div>
        )}

        {activeTab === "circle" && (
          <div className="py-2">
            <CircleMeasurementVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "compound_time" && (
          <div className="py-2">
            <CompoundUnitCalculator interactive={true} />
          </div>
        )}

        {/* Grade 6 Advanced Manipulative Views */}
        {activeTab === "coordinate_grid" && (
          <div className="py-2">
            <CoordinateGridVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "integer_line" && (
          <div className="py-2">
            <IntegerNumberLine interactive={true} />
          </div>
        )}

        {activeTab === "angle_relations" && (
          <div className="py-2">
            <AngleRelationshipVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "fraction_div" && (
          <div className="py-2">
            <FractionDivisionVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "cylinder" && (
          <div className="py-2">
            <CylinderVolumeVisualizer interactive={true} />
          </div>
        )}

        {activeTab === "approx_ruler" && (
          <div className="py-2">
            <ApproximationRuler interactive={true} />
          </div>
        )}
      </div>
    </div>
  );
}
