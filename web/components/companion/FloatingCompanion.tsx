"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RobotCompanion, CompanionMood } from "./RobotCompanion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface FloatingCompanionProps {
  mood?: CompanionMood;
  speechText?: string;
  autoOpenSpeech?: boolean;
  onCompanionClick?: () => void;
  className?: string;
  questionId?: string;
}

export const FloatingCompanion: React.FC<FloatingCompanionProps> = ({
  mood = "idle",
  speechText,
  autoOpenSpeech = true,
  onCompanionClick,
  className = "",
  questionId,
}) => {
  // Edge docking state: 'left' or 'right'
  const [dockSide, setDockSide] = useState<"left" | "right">("left");
  const [positionY, setPositionY] = useState<number>(360);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [isSpeechOpen, setIsSpeechOpen] = useState<boolean>(false);
  const [activeSpeech, setActiveSpeech] = useState<string>(speechText || "");
  const [internalMood, setInternalMood] = useState<CompanionMood>(mood);

  const dragStartRef = useRef<{ x: number; y: number; startY: number }>({ x: 0, y: 0, startY: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external mood to internal mood
  useEffect(() => {
    setInternalMood(mood);
  }, [mood]);

  // Handle automatic speech opening with animation when speechText changes
  useEffect(() => {
    if (speechText) {
      setActiveSpeech(speechText);
      if (autoOpenSpeech) {
        setIsSpeechOpen(true);

        // Auto-dismiss after 6.5 seconds of display
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => {
          setIsSpeechOpen(false);
        }, 6500);
      }
    }
  }, [speechText, autoOpenSpeech]);

  // Contemplation / Thinking timer on question load
  useEffect(() => {
    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);

    // If on a question for > 14 seconds without answering, Dana enters thinking posture
    thinkingTimerRef.current = setTimeout(() => {
      if (mood === "idle") {
        setInternalMood("thinking");
        setActiveSpeech("داری با دقت روی مسئله و الگوها فکر می‌کنی... منم کنارت هستم!");
        if (autoOpenSpeech) {
          setIsSpeechOpen(true);
          if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = setTimeout(() => setIsSpeechOpen(false), 5500);
        }
      }
    }, 14000);

    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
    };
  }, [questionId, mood, autoOpenSpeech]);

  // Set initial comfortable mobile/desktop position on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialY = Math.min(window.innerHeight - 200, Math.max(120, window.innerHeight * 0.45));
      setPositionY(initialY);
    }
  }, []);

  // Pointer event handlers for dragging & magnetic edge-snapping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer (left mouse button or touch)
    if (e.button !== 0) return;

    const target = e.currentTarget;
    if (typeof target.setPointerCapture === "function") {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Ignore environments where pointer capture is unsupported
      }
    }

    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startY: positionY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 8) {
      hasMovedRef.current = true;
    }

    if (typeof window !== "undefined") {
      const maxY = window.innerHeight - 150;
      const minY = 80;
      const nextY = Math.min(maxY, Math.max(minY, dragStartRef.current.startY + deltaY));
      setPositionY(nextY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const target = e.currentTarget;
    if (typeof target.releasePointerCapture === "function") {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture release issues
      }
    }

    setIsDragging(false);

    // Magnetic edge snapping based on release horizontal coordinate
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      const isCloserToRight = e.clientX > screenWidth / 2;
      setDockSide(isCloserToRight ? "right" : "left");

      // Check if dragged far offscreen towards the edge to trigger peeking mode
      if (e.clientX < 40 && dockSide === "left") {
        setIsPeeking(true);
      } else if (e.clientX > screenWidth - 40 && dockSide === "right") {
        setIsPeeking(true);
      }
    }

    // If it was just a tap (no significant move), trigger speech toggle and callback
    if (!hasMovedRef.current) {
      if (isPeeking) {
        setIsPeeking(false);
      } else {
        setIsSpeechOpen((prev) => !prev);
      }
      if (onCompanionClick) {
        onCompanionClick();
      }
    }
  };

  const handleCloseSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeechOpen(false);
  };

  const handleTogglePeeking = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPeeking((prev) => !prev);
  };

  return (
    <div
      className={`fixed z-[60] select-none transition-[left,right] duration-300 ease-out ${className}`}
      style={{
        top: `${positionY}px`,
        left: dockSide === "left" ? (isPeeking ? "0px" : "12px") : undefined,
        right: dockSide === "right" ? (isPeeking ? "0px" : "12px") : undefined,
        touchAction: "none",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Speech Bubble Popup */}
        {isSpeechOpen && !isPeeking && activeSpeech && (
          <div
            className={`absolute bottom-full mb-3 w-[250px] sm:w-[280px] max-w-[calc(100vw-36px)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-3 shadow-xl text-slate-800 dark:text-slate-100 font-bold text-xs leading-relaxed z-[70] ${
              dockSide === "left" ? "left-0" : "right-0"
            }`}
            style={{
              animation: "speechBubbleBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0">
                <span className="text-sm shrink-0">💡</span>
                <span className="leading-relaxed break-words">{activeSpeech}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseSpeech}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                aria-label="بستن گفت‌وگوی دانا"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bubble Anchor Pointer Tip pointing down to Dana */}
            <div
              className={`absolute -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-indigo-200 dark:border-indigo-900/60 rotate-45 ${
                dockSide === "left" ? "left-8" : "right-8"
              }`}
            />
          </div>
        )}

        {/* Draggable Dana Avatar Container or Docked Edge Tab */}
        <div
          onPointerDown={isPeeking ? undefined : handlePointerDown}
          onPointerMove={isPeeking ? undefined : handlePointerMove}
          onPointerUp={isPeeking ? undefined : handlePointerUp}
          className={`relative group ${
            isPeeking ? "cursor-pointer" : "cursor-grab active:cursor-grabbing transition-transform"
          } ${!isPeeking && isDragging ? "scale-105" : !isPeeking ? "hover:scale-105" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={
            isPeeking
              ? "همیار دانا در حال سرک کشیدن - لمس کنید تا کامل بیرون بیاید"
              : `همیار دانا در حالت ${internalMood} - قابل جابه‌جایی و لمس`
          }
        >
          {/* Peeking Docked Edge Tab (Clear, Unmistakable & Sleek) */}
          {isPeeking ? (
            <div
              onClick={() => {
                setIsPeeking(false);
                setIsSpeechOpen(true);
              }}
              className={`flex items-center gap-2 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-indigo-300 dark:border-indigo-600 shadow-xl cursor-pointer hover:bg-indigo-50/90 dark:hover:bg-slate-700/90 active:scale-95 transition-all group ${
                dockSide === "left"
                  ? "rounded-r-2xl border-l-0 pl-1.5 pr-3.5"
                  : "rounded-l-2xl border-r-0 pr-1.5 pl-3.5"
              }`}
              title="بازگشت دانا (هم‌شاگردی کاوشگر)"
            >
              {dockSide === "left" ? (
                <>
                  {/* Dana Mini Avatar */}
                  <div className="w-10 h-11 shrink-0 relative flex items-center justify-center">
                    <RobotCompanion
                      mood={internalMood}
                      size="xs"
                      showSpeechBubble={false}
                      interactiveHop={false}
                      className="pointer-events-none filter drop-shadow-xs"
                    />
                  </div>

                  {/* Clear Label & Direction Indicator */}
                  <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                    <span>دانا</span>
                    <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  {/* Direction Indicator & Clear Label */}
                  <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                    <ChevronLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-0.5 transition-transform animate-pulse" />
                    <span>دانا</span>
                  </div>

                  {/* Dana Mini Avatar */}
                  <div className="w-10 h-11 shrink-0 relative flex items-center justify-center">
                    <RobotCompanion
                      mood={internalMood}
                      size="xs"
                      showSpeechBubble={false}
                      interactiveHop={false}
                      className="pointer-events-none filter drop-shadow-xs"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Main Dana Companion Robot (Prominent 80px Mobile / 104px Desktop Size) */}
              <div className="block sm:hidden">
                <RobotCompanion
                  mood={internalMood}
                  size="md"
                  showSpeechBubble={false}
                  interactiveHop={true}
                  className="pointer-events-none filter drop-shadow-md"
                />
              </div>
              <div className="hidden sm:block">
                <RobotCompanion
                  mood={internalMood}
                  size="lg"
                  showSpeechBubble={false}
                  interactiveHop={true}
                  className="pointer-events-none filter drop-shadow-lg"
                />
              </div>

              {/* Mini Quick-Action Button below Dana to Dock */}
              <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={handleTogglePeeking}
                  className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-800/95 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="پنهان کردن دانا در کنار صفحه"
                >
                  {dockSide === "left" ? (
                    <ChevronLeft className="w-3 h-3 text-indigo-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-indigo-500" />
                  )}
                  <span>کنار بایست</span>
                </button>
              </div>

              {/* Status Beacon Glow on Antenna */}
              {!isSpeechOpen && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSpeechOpen(true);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-xs cursor-pointer animate-bounce"
                  title="مشاهده پیام دانا"
                >
                  💬
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
