"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  X,
  Undo2,
  Eraser,
  PenTool,
  Minimize2,
  Maximize2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
} from "lucide-react";
import { toPersianDigits } from "@/lib/math/persian-digits";

export interface ScratchpadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  questionNumber?: number;
}

interface Point {
  x: number;
  y: number;
}

const PEN_COLORS = [
  { id: "graphite", label: "مداد", value: "#334155" },
  { id: "blue", label: "خودکار آبی", value: "#2563eb" },
  { id: "green", label: "سبز", value: "#059669" },
  { id: "amber", label: "نارنجی", value: "#d97706" },
];

const STROKE_WIDTHS = [
  { id: "thin", label: "نازک", value: 2.5 },
  { id: "medium", label: "متوسط", value: 5 },
  { id: "thick", label: "پهن", value: 10 },
];

export const ScratchpadOverlay: React.FC<ScratchpadOverlayProps> = ({
  isOpen,
  onClose,
  questionNumber,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const savedDataUrlRef = useRef<string | null>(null);

  const [activeColor, setActiveColor] = useState<string>("#334155");
  const [activeWidth, setActiveWidth] = useState<number>(5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [showPenSettings, setShowPenSettings] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close pen settings popover on outside click/touch
  useEffect(() => {
    if (!showPenSettings) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPenSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showPenSettings]);

  const isDrawing = useRef<boolean>(false);
  const lastPoint = useRef<Point | null>(null);
  const historyStack = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  // Resize canvas according to device pixel ratio and restore contents
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cache current drawing if available
    let existingData: ImageData | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      try {
        existingData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        // ignore
      }
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (existingData) {
      try {
        ctx.putImageData(existingData, 0, 0);
      } catch {
        // ignore
      }
    } else if (savedDataUrlRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = savedDataUrlRef.current;
    }
  }, []);

  // Sync size when opened or un-minimized
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        syncCanvasSize();
      }, 50);
      window.addEventListener("resize", syncCanvasSize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", syncCanvasSize);
      };
    }
  }, [isOpen, isMinimized, syncCanvasSize]);

  // Keyboard shortcuts (Escape to minimize/close, Ctrl+Z to undo)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, canUndo]);

  // Capture canvas state for Undo
  const pushState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyStack.current.push(img);
      if (historyStack.current.length > 20) {
        historyStack.current.shift();
      }
      setCanUndo(true);
    } catch {
      // ignore
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (historyStack.current.length > 0) {
      const prev = historyStack.current.pop();
      if (prev) {
        ctx.putImageData(prev, 0, 0);
        try {
          savedDataUrlRef.current = canvas.toDataURL();
        } catch {
          // ignore
        }
      }
      setCanUndo(historyStack.current.length > 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    pushState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedDataUrlRef.current = null;
  };

  // Drawing Pointer Event Handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    pushState();

    const pt = getCoordinates(e);
    lastPoint.current = pt;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, (isEraser ? 14 : activeWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : activeColor;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPt = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPt.x, currentPt.y);
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : activeColor;
    ctx.lineWidth = isEraser ? 20 : activeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.stroke();

    lastPoint.current = currentPt;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      try {
        savedDataUrlRef.current = canvas.toDataURL();
      } catch {
        // ignore
      }
    }
  };

  if (!isOpen && !isMinimized) {
    return null;
  }

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl border-2 border-white cursor-pointer transition-all"
        >
          <PenTool className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>چرک‌نویس (باز کردن)</span>
          <Maximize2 className="w-3.5 h-3.5 text-indigo-200" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-x-2 sm:inset-x-6 bottom-4 top-16 sm:top-24 z-50 flex flex-col rounded-3xl border-2 shadow-2xl transition-all duration-200 ${
        isTransparent
          ? "bg-white/20 backdrop-blur-none border-indigo-500/90 shadow-indigo-950/20 ring-2 ring-indigo-500/30"
          : "bg-white border-slate-300 shadow-slate-900/15"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Scratchpad Header Toolbar */}
      <div
        className={`p-2 sm:px-4 py-2 border-b rounded-t-3xl flex items-center justify-between gap-1.5 sm:gap-2 select-none transition-colors relative ${
          isTransparent
            ? "bg-white/95 backdrop-blur-xs border-indigo-200/90 shadow-xs"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        {/* Right Group: Title & Drawing Tools (No Horizontal Scroll) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Title & Badge */}
          <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isTransparent
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              چرک‌نویس
              <span className="hidden md:inline font-mono text-[11px] text-slate-500 mr-1" dir="ltr">
                {questionNumber ? `(#${toPersianDigits(questionNumber)})` : ""}
              </span>
            </h4>
          </div>

          {/* Pen Button (with Color Dot & Popover Trigger) */}
          <div className="relative">
            <button
              type="button"
              title="تنظیمات قلم (رنگ و ضخامت)"
              onClick={() => {
                setShowPenSettings((prev) => !prev);
                setIsEraser(false);
              }}
              className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isEraser
                  ? "bg-white border-2 border-indigo-500 text-slate-800 shadow-xs ring-2 ring-indigo-200/50"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/15 shadow-2xs"
                style={{ backgroundColor: activeColor }}
              />
              <span className="hidden sm:inline text-[11px] font-bold">قلم</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showPenSettings ? "rotate-180 text-indigo-600" : ""}`} />
            </button>

            {/* Compact Pen Settings Popover (Colors + Sizes) */}
            {showPenSettings && (
              <div
                ref={popoverRef}
                className="absolute top-full mt-2 right-0 z-50 bg-white border-2 border-indigo-200 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 w-56 text-right select-none"
              >
                {/* Row 1: Pen Colors */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5">انتخاب رنگ قلم:</span>
                  <div className="flex items-center justify-between gap-1.5">
                    {PEN_COLORS.map((col) => {
                      const isSelected = !isEraser && activeColor === col.value;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          title={col.label}
                          onClick={() => {
                            setActiveColor(col.value);
                            setIsEraser(false);
                            setShowPenSettings(false);
                          }}
                          className={`w-8 h-8 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                            isSelected ? "ring-2 ring-indigo-600 scale-110 shadow-xs" : "opacity-80 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: col.value }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white stroke-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 2: Stroke Sizes with 1:1 True Pixel Preview */}
                <div className="border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500">ضخامت واقعی قلم:</span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold" dir="ltr">
                      {toPersianDigits(activeWidth)} پیکسل
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {STROKE_WIDTHS.map((sw) => {
                      const isSelected = activeWidth === sw.value;
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() => {
                            setActiveWidth(sw.value);
                            setIsEraser(false);
                            setShowPenSettings(false);
                          }}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <span className="text-[10px]">{sw.label}</span>
                          <div className="h-4 flex items-center justify-center w-full px-1">
                            <span
                              className="w-full rounded-full transition-all"
                              style={{
                                height: `${sw.value}px`,
                                backgroundColor: isSelected ? "#ffffff" : activeColor,
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Eraser */}
          <button
            type="button"
            title="پاک‌کن"
            onClick={() => {
              setIsEraser(!isEraser);
              setShowPenSettings(false);
            }}
            className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isEraser
                ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-200"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">پاک‌کن</span>
          </button>

          {/* Undo */}
          <button
            type="button"
            title="بازگشت حرکت قبلی (Ctrl+Z)"
            disabled={!canUndo}
            onClick={handleUndo}
            className={`min-h-[32px] p-1.5 sm:px-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              canUndo
                ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                : "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent"
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear All */}
          <button
            type="button"
            title="پاک کردن کامل صفحه"
            onClick={handleClear}
            className="min-h-[32px] p-1.5 sm:px-2 rounded-xl text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Left Group: Window & View Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Transparent Glass Toggle */}
          <button
            type="button"
            title={isTransparent ? "بازگشت به کاغذ سفید" : "حالت شیشه‌ای شفاف (مشاهده سوال زیر چرک‌نویس)"}
            onClick={() => setIsTransparent(!isTransparent)}
            className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isTransparent
                ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {isTransparent ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden xs:inline">{isTransparent ? "شیشه‌ای" : "کاغذ"}</span>
          </button>

          {/* Minimize */}
          <button
            type="button"
            title="کوچک‌نمایی چرک‌نویس"
            onClick={() => setIsMinimized(true)}
            className="min-h-[32px] p-1.5 rounded-xl text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 cursor-pointer transition-all"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            title="بستن چرک‌نویس (Escape)"
            onClick={onClose}
            className="min-h-[32px] p-1.5 rounded-xl text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-200 cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden touch-none cursor-crosshair">
        {/* Subtle grid pattern for mathematical writing */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
            isTransparent ? "opacity-5" : "opacity-20"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block relative z-10"
        />
      </div>
    </div>
  );
};
