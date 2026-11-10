"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  RefreshCw,
  Layers,
  BookOpen,
} from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";
import { importCartridgePackageAction } from "@/actions/admin";

export interface CartridgeUploaderProps {
  onSuccess?: () => void;
}

export const CartridgeUploader: React.FC<CartridgeUploaderProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    cartridgeId: string;
    title: string;
    subjectName: string;
    gradeLevel: number;
    kcCount: number;
    itemCount: number;
    misconceptionCount: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateJson = (content: string, name?: string) => {
    setValidationError(null);
    setSuccessMessage(null);
    if (!content.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      const data = JSON.parse(content);
      if (!data.cartridge_id || !data.title) {
        setValidationError("فایل کارتریج باید حاوی فیلدهای cartridge_id و title باشد.");
        setParsedPreview(null);
        return;
      }
      if (!data.subject?.name) {
        setValidationError("مشخصات درس (subject.name) در کارتریج نامعتبر است.");
        setParsedPreview(null);
        return;
      }
      if (!Array.isArray(data.knowledge_components) || data.knowledge_components.length === 0) {
        setValidationError("کارتریج باید حداقل یک مفهوم کلیدی (knowledge_components) داشته باشد.");
        setParsedPreview(null);
        return;
      }
      if (!Array.isArray(data.diagnostic_items) || data.diagnostic_items.length === 0) {
        setValidationError("کارتریج باید حداقل یک سوال تشخیصی (diagnostic_items) داشته باشد.");
        setParsedPreview(null);
        return;
      }

      setParsedPreview({
        cartridgeId: data.cartridge_id,
        title: data.title,
        subjectName: data.subject.name,
        gradeLevel: data.subject.grade_level || 4,
        kcCount: data.knowledge_components.length,
        itemCount: data.diagnostic_items.length,
        misconceptionCount: data.misconceptions?.length || 0,
      });
      if (name) setFileName(name);
    } catch {
      setValidationError("فایل انتخاب شده حاوی قالب استاندارد و معتبر JSON نیست.");
      setParsedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
      validateJson(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonContent.trim() || !parsedPreview) return;

    setIsLoading(true);
    setValidationError(null);
    const res = await importCartridgePackageAction(jsonContent);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || "بسته درسی با موفقیت در پایگاه داده ثبت شد.");
      setJsonContent("");
      setParsedPreview(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onSuccess) onSuccess();
    } else {
      setValidationError(res.error || "خطا در بارگذاری کارتریج");
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs select-none">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            بارگذاری بسته درسی جدید (Cartridge Importer)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            بدون نیاز به تغییر سورس‌کد یا دستورات سرور، بسته استاندارد سوالات و مفاهیم را بارگذاری کنید.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-emerald-950 mb-0.5">بارگذاری با موفقیت انجام شد</span>
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Validation Error Notification */}
      {validationError && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-rose-950 mb-0.5">خطای اعتبارسنجی کارتریج</span>
            <p className="leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      {/* Drop Zone / File Selector */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
          <FileJson className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block">
            {fileName ? `فایل انتخاب شده: ${fileName}` : "برای انتخاب فایل کارتریج (.json) اینجا کلیک کنید"}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            پشتیبانی از ساختار استاندارد بسته‌های درسی مصوب آموزش و پرورش
          </span>
        </div>
      </div>

      {/* Preview Card */}
      {parsedPreview && (
        <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>پیش‌نمایش محتوای بسته درسی آماده بارگذاری</span>
            </span>
            <span className="text-[11px] font-mono text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-lg" dir="ltr">
              {parsedPreview.cartridgeId}
            </span>
          </div>

          <h4 className="font-black text-sm text-slate-900 mb-2">{parsedPreview.title}</h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">پایه تحصیلی:</span>
              <span className="font-bold text-slate-800">پایه {toPersianDigits(parsedPreview.gradeLevel)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">مفاهیم کلیدی (KCs):</span>
              <span className="font-bold text-indigo-700">{toPersianDigits(parsedPreview.kcCount)} مفهوم</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">تعداد سوالات تشخیصی:</span>
              <span className="font-bold text-emerald-700">{toPersianDigits(parsedPreview.itemCount)} سوال</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">بدفهمی‌های تعریف شده:</span>
              <span className="font-bold text-amber-700">{toPersianDigits(parsedPreview.misconceptionCount)} مورد</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleImport}
              className="min-h-[44px] flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره‌سازی در پایگاه داده...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ذخیره در پایگاه داده</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
