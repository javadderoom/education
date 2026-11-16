"use client";

import React from "react";

export type CompanionMood = "idle" | "thinking" | "celebrating" | "reassuring";
export type CompanionSize = "sm" | "md" | "lg";

export interface RobotCompanionProps {
  mood?: CompanionMood;
  size?: CompanionSize;
  grade?: 4 | 5 | 6;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  onClick?: () => void;
  zIndex?: number;
}

const DEFAULT_SPEECH: Record<CompanionMood, string> = {
  idle: "سلام! من دانا هستم، هم‌شاگردی کاوشگر تو. آماده‌ای بریم سراغ مسئله‌ها؟",
  thinking: "داری روی سوال فکر می‌کنی... منم کنارت روی الگوها و شکل‌ها دقت می‌کنم!",
  celebrating: "آفرین قهرمان! این مفهوم رو دقیق و عالی متوجه شدی. یه ستاره طلایی گرفتی!",
  reassuring: "آفرین به صداقتت دوست من! شجاعت در گفتن شک، اولین قدم یادگیری عمیقه.",
};

const SIZE_CONFIGS = {
  sm: {
    container: "w-10 h-10 sm:w-12 sm:h-12",
    svg: "w-10 h-10 sm:w-12 sm:h-12",
    bubble: "text-[11px] max-w-[200px] px-2.5 py-1",
  },
  md: {
    container: "w-24 h-28 sm:w-28 sm:h-32",
    svg: "w-24 h-28 sm:w-28 sm:h-32",
    bubble: "text-xs max-w-[260px] px-3.5 py-1.5",
  },
  lg: {
    container: "w-36 h-44 sm:w-44 sm:h-52",
    svg: "w-36 h-44 sm:w-44 sm:h-52",
    bubble: "text-xs sm:text-sm max-w-xs px-4 py-2",
  },
};

export const RobotCompanion: React.FC<RobotCompanionProps> = ({
  mood = "idle",
  size = "md",
  grade = 4,
  showSpeechBubble = false,
  speechText,
  className = "",
  onClick,
  zIndex = 60,
}) => {
  const currentSpeech = speechText || DEFAULT_SPEECH[mood];
  const sizeCfg = SIZE_CONFIGS[size];

  // Visual state variables depending on mood
  let antennaColor = "#38bdf8";
  let eyeColor = "#38bdf8";
  let eyeRx = 6.5;
  let eyeRy = 9;
  let mouthPath = "M 94 96 Q 100 102 106 96";
  let mouthStroke = "#38bdf8";
  let leftArmPath = "M 68 142 Q 52 155 56 172";
  let leftHandCx = 56;
  let leftHandCy = 172;
  let rightArmPath = "M 132 142 Q 148 155 144 172";
  let rightHandCx = 144;
  let rightHandCy = 172;
  let isEyeBlinking = true;

  if (mood === "thinking") {
    antennaColor = "#fbbf24";
    eyeColor = "#fbbf24";
    eyeRx = 5.5;
    eyeRy = 6;
    mouthPath = "M 95 98 Q 100 97 105 98";
    mouthStroke = "#fbbf24";
    leftArmPath = "M 68 142 Q 60 120 74 108";
    leftHandCx = 74;
    leftHandCy = 108;
    isEyeBlinking = false;
  } else if (mood === "celebrating") {
    antennaColor = "#10b981";
    eyeColor = "#10b981";
    eyeRx = 7;
    eyeRy = 3;
    mouthPath = "M 92 95 Q 100 108 108 95";
    mouthStroke = "#10b981";
    leftArmPath = "M 68 142 Q 44 125 48 102";
    leftHandCx = 48;
    leftHandCy = 102;
    rightArmPath = "M 132 142 Q 156 125 152 102";
    rightHandCx = 152;
    rightHandCy = 102;
    isEyeBlinking = false;
  } else if (mood === "reassuring") {
    antennaColor = "#f43f5e";
    eyeColor = "#38bdf8";
    eyeRx = 6;
    eyeRy = 7.5;
    mouthPath = "M 95 97 Q 100 103 105 97";
    mouthStroke = "#38bdf8";
    leftArmPath = "M 68 142 Q 52 140 54 120";
    leftHandCx = 54;
    leftHandCy = 120;
  }

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ zIndex }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`هم‌شاگردی ربات دانا - حالت: ${mood}`}
    >
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div
          className={`relative mb-2 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl shadow-md font-bold text-slate-700 dark:text-slate-200 text-center transition-all duration-300 animate-in fade-in zoom-in-95 ${sizeCfg.bubble}`}
          style={{ zIndex: zIndex + 10 }}
        >
          <span>{currentSpeech}</span>
          <div className="absolute -bottom-1.5 right-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-indigo-200 dark:border-indigo-900/60 rotate-45" />
        </div>
      )}

      {/* Robot SVG Avatar */}
      <div
        className={`${sizeCfg.container} relative flex items-center justify-center`}
        style={{ zIndex: zIndex + 5 }}
      >
        <svg
          viewBox="0 0 200 230"
          className={`${sizeCfg.svg} overflow-visible transition-transform duration-300`}
          style={{
            animation: "robotBreathe 3.6s ease-in-out infinite",
          }}
        >
          <defs>
            <linearGradient id="danaBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="danaVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="danaAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="danaGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <filter id="danaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shadow on Floor */}
          <ellipse cx="100" cy="222" rx="42" ry="7" fill="#64748b" opacity="0.22" />

          {/* School Backpack */}
          <g id="backpack">
            <rect
              x="58"
              y="122"
              width="84"
              height="64"
              rx="18"
              fill="#4f46e5"
              stroke="#3730a3"
              strokeWidth="2"
            />
            <path
              d="M 66 122 Q 100 110 134 122"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Ruler peeking out */}
            <rect
              x="124"
              y="100"
              width="10"
              height="34"
              rx="2"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.2"
              transform="rotate(18, 124, 100)"
            />
            <line
              x1="126"
              y1="106"
              x2="131"
              y2="106"
              stroke="#b45309"
              strokeWidth="1"
              transform="rotate(18, 124, 100)"
            />
            <line
              x1="126"
              y1="112"
              x2="131"
              y2="112"
              stroke="#b45309"
              strokeWidth="1"
              transform="rotate(18, 124, 100)"
            />
            <line
              x1="126"
              y1="118"
              x2="131"
              y2="118"
              stroke="#b45309"
              strokeWidth="1"
              transform="rotate(18, 124, 100)"
            />
          </g>

          {/* Antenna Assembly */}
          <g id="antenna">
            <path d="M 100 52 Q 100 38 100 32" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
            <circle
              cx="100"
              cy="30"
              r="8"
              fill={antennaColor}
              filter="url(#danaGlow)"
              className="transition-colors duration-300"
            />
            <circle cx="98" cy="28" r="2.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Head Chassis */}
          <g id="head">
            <rect
              x="50"
              y="46"
              width="100"
              height="82"
              rx="36"
              fill="url(#danaBody)"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            {/* Top Gloss Highlight */}
            <path d="M 68 50 Q 100 47 132 50" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

            {/* Cyber-Ear Pods */}
            <rect x="42" y="66" width="10" height="26" rx="5" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
            <circle cx="47" cy="79" r="2.5" fill={antennaColor} />
            <rect x="148" y="66" width="10" height="26" rx="5" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
            <circle cx="153" cy="79" r="2.5" fill={antennaColor} />

            {/* Dark Visor Screen */}
            <rect x="58" y="58" width="84" height="58" rx="24" fill="url(#danaVisor)" stroke="#0f172a" strokeWidth="2" />
            <path d="M 64 64 Q 100 60 136 68 Q 120 74 64 72 Z" fill="#ffffff" opacity="0.14" />

            {/* Eyes */}
            <g id="eyes" filter="url(#danaGlow)">
              <ellipse
                cx="82"
                cy="85"
                rx={eyeRx}
                ry={eyeRy}
                fill={eyeColor}
                className={isEyeBlinking ? "animate-pulse" : ""}
              />
              <circle cx="80" cy="81" r="2.5" fill="#ffffff" />

              <ellipse
                cx="118"
                cy="85"
                rx={eyeRx}
                ry={eyeRy}
                fill={eyeColor}
                className={isEyeBlinking ? "animate-pulse" : ""}
              />
              <circle cx="116" cy="81" r="2.5" fill="#ffffff" />
            </g>

            {/* Rosy Cheeks */}
            <circle cx="72" cy="95" r="4.5" fill="#ec4899" opacity="0.35" />
            <circle cx="128" cy="95" r="4.5" fill="#ec4899" opacity="0.35" />

            {/* Mouth */}
            <path
              d={mouthPath}
              fill="none"
              stroke={mouthStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </g>

          {/* Torso */}
          <g id="torso">
            <path
              d="M 72 130 C 66 142 66 178 72 192 C 78 198 122 198 128 192 C 134 178 134 142 128 130 Z"
              fill="url(#danaBody)"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            {/* Chest Core Badge */}
            <rect x="82" y="142" width="36" height="34" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <g filter="url(#danaGlow)">
              <path d="M 100 148 L 100 168 M 90 158 L 110 158" stroke={antennaColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="100" cy="158" r="3" fill="#fbbf24" />
            </g>
            {/* Student Scarf */}
            <path d="M 72 130 Q 100 142 128 130" fill="none" stroke="url(#danaAccent)" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Left Arm / Hand */}
          <g id="leftArm">
            <path
              d={leftArmPath}
              fill="none"
              stroke="url(#danaBody)"
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <circle
              cx={leftHandCx}
              cy={leftHandCy}
              r="7"
              fill="#4f46e5"
              stroke="#312e81"
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
          </g>

          {/* Right Arm / Hand (holding pencil) */}
          <g id="rightArm">
            <path
              d={rightArmPath}
              fill="none"
              stroke="url(#danaBody)"
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <circle
              cx={rightHandCx}
              cy={rightHandCy}
              r="7"
              fill="#4f46e5"
              stroke="#312e81"
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
            {/* Golden Pencil */}
            <polygon points="143,158 147,158 149,174 141,174" fill="url(#danaGold)" stroke="#b45309" strokeWidth="1" />
            <polygon points="141,174 149,174 145,182" fill="#fed7aa" stroke="#b45309" strokeWidth="1" />
            <polygon points="144,180 146,180 145,182" fill="#0f172a" />
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes robotBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
