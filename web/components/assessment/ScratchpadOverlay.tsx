"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  X,
  RotateCcw,
  Eraser,
  PenTool,
  Minimize2,
  Maximize2,
  Trash2,
  Eye,
  EyeOff,
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
  { id: "medium", label: "متوسط", value: 4.5 },
  { id: "thick", label: "پهن", value: 8 },
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
  const [activeWidth, setActiveWidth] = useState<number>(3.5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(false);

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
        className={`p-2 sm:px-4 py-2 border-b rounded-t-3xl flex items-center justify-between gap-1.5 sm:gap-2 select-none transition-colors ${
          isTransparent
            ? "bg-white/95 backdrop-blur-xs border-indigo-200/90 shadow-xs"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        {/* Title & Info */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isTransparent
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              چرک‌نویس
              <span className="hidden sm:inline">
                {questionNumber ? ` (سوال ${toPersianDigits(questionNumber)})` : ""}
              </span>
            </h4>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              {isTransparent
                ? "حالت شیشه‌ای: سوال زیر چرک‌نویس کاملاً قابل مشاهده است"
                : "محاسبات خود را آزادانه با قلم یا انگشت یادداشت کنید"}
            </span>
          </div>
        </div>

        {/* Action Controls & Pens */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* Colors */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
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
                  }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    isSelected ? "ring-2 ring-indigo-500 scale-110 shadow-xs" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: col.value }}
                />
              );
            })}
          </div>

          {/* Stroke Widths */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            {STROKE_WIDTHS.map((sw) => {
              const isSelected = activeWidth === sw.value;
              return (
                <button
                  key={sw.id}
                  type="button"
                  title={sw.label}
                  onClick={() => setActiveWidth(sw.value)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {sw.label}
                </button>
              );
            })}
          </div>

          {/* Eraser */}
          <button
            type="button"
            title="پاک‌کن"
            onClick={() => setIsEraser(!isEraser)}
            className={`min-h-[28px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              isEraser
                ? "bg-rose-600 text-white shadow-xs"
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
            className={`min-h-[28px] sm:min-h-[32px] px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
              canUndo
                ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                : "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Clear All */}
          <button
            type="button"
            title="پاک کردن کامل صفحه"
            onClick={handleClear}
            className="min-h-[28px] sm:min-h-[32px] px-2 py-1 rounded-xl text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 cursor-pointer transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Transparent Glass Toggle */}
          <button
            type="button"
            title={isTransparent ? "بازگشت به کاغذ سفید" : "حالت شیشه‌ای شفاف (مشاهده سوال زیر چرک‌نویس)"}
            onClick={() => setIsTransparent(!isTransparent)}
            className={`min-h-[28px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              isTransparent
                ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {isTransparent ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>
              <span className="hidden sm:inline">{isTransparent ? "حالت شیشه‌ای" : "کاغذ سفید"}</span>
              <span className="sm:hidden">{isTransparent ? "شیشه‌ای" : "کاغذ"}</span>
            </span>
          </button>

          {/* Minimize */}
          <button
            type="button"
            title="کوچک‌نمایی چرک‌نویس"
            onClick={() => setIsMinimized(true)}
            className="min-h-[28px] sm:min-h-[32px] p-1.5 rounded-xl text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 cursor-pointer transition-all shrink-0"
          >
            <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            title="بستن چرک‌نویس (Escape)"
            onClick={onClose}
            className="min-h-[28px] sm:min-h-[32px] p-1.5 rounded-xl text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-200 cursor-pointer transition-all shrink-0"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
