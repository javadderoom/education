"use client";

import React, { useState } from "react";

export type CompanionMood = "idle" | "thinking" | "celebrating" | "reassuring";
export type CompanionSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface RobotCompanionProps {
  mood?: CompanionMood;
  size?: CompanionSize;
  grade?: 4 | 5 | 6;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  onClick?: () => void;
  zIndex?: number;
  peeking?: boolean;
  interactiveHop?: boolean;
  rotationY?: number;
}

const DEFAULT_SPEECH: Record<CompanionMood, string> = {
  idle: "سلام! من دانا هستم، هم‌شاگردی کاوشگر تو. آماده‌ای بریم سراغ مسئله‌ها؟",
  thinking: "داری روی سوال فکر می‌کنی... منم کنارت روی الگوها و شکل‌ها دقت می‌کنم!",
  celebrating: "آفرین قهرمان! این مفهوم رو دقیق و عالی متوجه شدی. یه ستاره طلایی گرفتی!",
  reassuring: "آفرین به صداقتت دوست من! شجاعت در گفتن شک، اولین قدم یادگیری عمیقه.",
};

const CELEBRATION_PARTICLES = [
  { char: "★", color: "#fbbf24", size: 16, angle: 20, distance: 52, delay: 0 },
  { char: "✨", color: "#38bdf8", size: 14, angle: 65, distance: 58, delay: 0.1 },
  { char: "✦", color: "#10b981", size: 15, angle: 115, distance: 50, delay: 0.2 },
  { char: "★", color: "#f43f5e", size: 16, angle: 160, distance: 56, delay: 0.15 },
  { char: "🎉", color: "#f59e0b", size: 14, angle: 210, distance: 54, delay: 0.05 },
  { char: "✦", color: "#6366f1", size: 15, angle: 255, distance: 48, delay: 0.25 },
  { char: "✨", color: "#fbbf24", size: 14, angle: 300, distance: 56, delay: 0.18 },
  { char: "★", color: "#10b981", size: 15, angle: 345, distance: 50, delay: 0.12 },
];

const SIZE_CONFIGS = {
  xs: {
    container: "w-9 h-10",
    svg: "w-9 h-10",
    bubble: "text-[10px] max-w-[180px] px-2 py-0.5",
  },
  sm: {
    container: "w-14 h-16",
    svg: "w-14 h-16",
    bubble: "text-[11px] max-w-[210px] px-2.5 py-1",
  },
  md: {
    // Standard floating mobile size (80px - 88px)
    container: "w-20 h-24 sm:w-22 sm:h-26",
    svg: "w-20 h-24 sm:w-22 sm:h-26",
    bubble: "text-xs max-w-[240px] px-3.5 py-1.5",
  },
  lg: {
    // Standard desktop companion size (104px - 115px)
    container: "w-26 h-30 sm:w-28 sm:h-34",
    svg: "w-26 h-30 sm:w-28 sm:h-34",
    bubble: "text-xs sm:text-sm max-w-[280px] px-4 py-2",
  },
  xl: {
    // Showcase & Completion celebration (140px - 160px)
    container: "w-36 h-44 sm:w-44 sm:h-52",
    svg: "w-36 h-44 sm:w-44 sm:h-52",
    bubble: "text-sm max-w-xs px-4 py-2.5",
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
  peeking = false,
  interactiveHop = true,
  rotationY,
}) => {
  const [isHopping, setIsHopping] = useState(false);
  const currentSpeech = speechText || DEFAULT_SPEECH[mood];
  const sizeCfg = SIZE_CONFIGS[size];

  const handleClick = (e: React.MouseEvent) => {
    if (interactiveHop) {
      setIsHopping(true);
      setTimeout(() => setIsHopping(false), 850);
    }
    if (onClick) {
      onClick();
    }
  };

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
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`هم‌شاگردی ربات دانا - حالت: ${mood}`}
    >
      {/* Speech Bubble with Smooth Pop-in Spring Animation */}
      {showSpeechBubble && (
        <div
          className={`relative mb-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl shadow-lg font-bold text-slate-800 dark:text-slate-100 text-center transition-all ${sizeCfg.bubble}`}
          style={{
            zIndex: zIndex + 10,
            animation: "speechBubbleBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <span className="leading-relaxed">{currentSpeech}</span>
          <div className="absolute -bottom-1.5 right-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-indigo-200 dark:border-indigo-900/60 rotate-45" />
        </div>
      )}

      {/* 3D Perspective Stage Container */}
      <div
        className={`${sizeCfg.container} relative flex items-center justify-center select-none`}
        style={{
          zIndex: zIndex + 5,
          perspective: "800px",
        }}
      >
        {/* Celebratory Particle Fireworks & Confetti Burst */}
        {(mood === "celebrating" || isHopping) && (
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-visible">
            {/* Glowing Aura Ring Pulse */}
            <div
              className="absolute w-28 h-28 rounded-full border-2 border-amber-300/60 bg-amber-200/20"
              style={{ animation: "danaRingPulse 1.6s ease-out infinite" }}
            />

            {/* Confetti & Golden Stars Radiating Outward */}
            {CELEBRATION_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                className="absolute font-black leading-none pointer-events-none select-none drop-shadow-xs"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${p.angle}deg) translateY(-${p.distance}px) rotate(-${p.angle}deg)`,
                  animation: "danaConfettiPop 1.4s ease-out infinite",
                  animationDelay: `${p.delay}s`,
                  color: p.color,
                  fontSize: `${p.size}px`,
                }}
              >
                {p.char}
              </span>
            ))}
          </div>
        )}

        {/* 3D Rotating & Leaping Body */}
        <div
          className="w-full h-full relative"
          style={{
            transformStyle: "preserve-3d",
            transform: rotationY !== undefined ? `rotateY(${rotationY}deg)` : undefined,
            animation:
              rotationY !== undefined
                ? undefined
                : mood === "celebrating"
                ? "danaCelebration3D 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                : isHopping
                ? "danaSpinHop3D 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "danaFloat 3.8s ease-in-out infinite",
          }}
        >
          {/* FRONT FACE (Visor, Eyes, Smiling Face, Arms, Core) */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(6px)",
            }}
          >
            <svg
              viewBox="0 0 200 230"
              className={`${sizeCfg.svg} overflow-visible`}
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

              {/* Antenna Assembly with Pulsing Glow Beacon */}
              <g id="antenna">
                <path d="M 100 52 Q 100 38 100 32" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
                <circle
                  cx="100"
                  cy="30"
                  r="8"
                  fill={antennaColor}
                  filter="url(#danaGlow)"
                  className="transition-colors duration-300"
                  style={{
                    transformOrigin: "100px 30px",
                    animation: "antennaPulse 2.4s ease-in-out infinite",
                  }}
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

                {/* Eyes - Smiling laughing arcs during celebrating, blinking ellipses otherwise */}
                {mood === "celebrating" ? (
                  <g id="celebratingEyes" filter="url(#danaGlow)">
                    <path
                      d="M 74 88 Q 82 76 90 88"
                      fill="none"
                      stroke={eyeColor}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 110 88 Q 118 76 126 88"
                      fill="none"
                      stroke={eyeColor}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  <g
                    id="eyes"
                    filter="url(#danaGlow)"
                    style={{
                      transformOrigin: "100px 85px",
                      animation: isEyeBlinking ? "danaEyeBlink 3.6s ease-in-out infinite" : undefined,
                    }}
                  >
                    <ellipse cx="82" cy="85" rx={eyeRx} ry={eyeRy} fill={eyeColor} />
                    <circle cx="80" cy="81" r="2.5" fill="#ffffff" />
                    <ellipse cx="118" cy="85" rx={eyeRx} ry={eyeRy} fill={eyeColor} />
                    <circle cx="116" cy="81" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Rosy Cheeks */}
                <circle cx="72" cy="95" r="4.5" fill="#ec4899" opacity="0.4" />
                <circle cx="128" cy="95" r="4.5" fill="#ec4899" opacity="0.4" />

                {/* Mouth */}
                <path
                  d={mouthPath}
                  fill="none"
                  stroke={mouthStroke}
                  strokeWidth="2.4"
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

          {/* BACK FACE (Cyber School Backpack, Thrusters, Metallic Spine, Straps) */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(6px)",
            }}
          >
            <svg
              viewBox="0 0 200 230"
              className={`${sizeCfg.svg} overflow-visible`}
            >
              <defs>
                <linearGradient id="danaBackpack" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              </defs>

              {/* Shadow on Floor */}
              <ellipse cx="100" cy="222" rx="42" ry="7" fill="#64748b" opacity="0.22" />

              {/* Antenna Assembly from behind */}
              <g id="antennaBack">
                <path d="M 100 52 Q 100 38 100 32" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
                <circle
                  cx="100"
                  cy="30"
                  r="8"
                  fill={antennaColor}
                  filter="url(#danaGlow)"
                  style={{
                    transformOrigin: "100px 30px",
                    animation: "antennaPulse 2.4s ease-in-out infinite",
                  }}
                />
                <circle cx="98" cy="28" r="2.5" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Head Chassis from behind */}
              <g id="headBack">
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
                {/* Cyber headphone bands connecting around the back of the head */}
                <path d="M 42 79 Q 100 88 158 79" fill="none" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" />
                <path d="M 42 79 Q 100 88 158 79" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

                {/* Cyber-Ear Pods */}
                <rect x="42" y="66" width="10" height="26" rx="5" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
                <rect x="148" y="66" width="10" height="26" rx="5" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
              </g>

              {/* Torso Back Chassis */}
              <path
                d="M 72 130 C 66 142 66 178 72 192 C 78 198 122 198 128 192 C 134 178 134 142 128 130 Z"
                fill="url(#danaBody)"
                stroke="#94a3b8"
                strokeWidth="2.5"
              />

              {/* High-Tech School Backpack */}
              <g id="schoolBackpack">
                <rect
                  x="56"
                  y="118"
                  width="88"
                  height="72"
                  rx="18"
                  fill="url(#danaBackpack)"
                  stroke="#312e81"
                  strokeWidth="2.5"
                />
                {/* Top handle loop */}
                <path d="M 88 118 Q 100 106 112 118" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
                {/* Yellow zipper accent */}
                <path d="M 66 138 Q 100 144 134 138" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

                {/* Math Ruler peeking out */}
                <rect
                  x="122"
                  y="96"
                  width="11"
                  height="40"
                  rx="2"
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth="1.2"
                  transform="rotate(16, 122, 96)"
                />
                <line x1="124" y1="102" x2="130" y2="102" stroke="#b45309" strokeWidth="1" transform="rotate(16, 122, 96)" />
                <line x1="124" y1="108" x2="130" y2="108" stroke="#b45309" strokeWidth="1" transform="rotate(16, 122, 96)" />
                <line x1="124" y1="114" x2="130" y2="114" stroke="#b45309" strokeWidth="1" transform="rotate(16, 122, 96)" />

                {/* Cyber Battery / Indicator Gauge */}
                <rect x="82" y="152" width="36" height="14" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <rect x="85" y="155" width="7" height="8" rx="1.5" fill="#10b981" />
                <rect x="96" y="155" width="7" height="8" rx="1.5" fill="#10b981" />
                <rect x="107" y="155" width="7" height="8" rx="1.5" fill="#10b981" />
              </g>

              {/* Dual Cyber Rocket Thruster Jet Flames */}
              <g id="thrusters">
                {/* Left Nozzle */}
                <rect x="70" y="186" width="14" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
                <polygon points="71,194 83,194 77,212" fill="#38bdf8" opacity="0.85" filter="url(#danaGlow)" />
                <polygon points="73,194 81,194 77,206" fill="#fef08a" opacity="0.9" />

                {/* Right Nozzle */}
                <rect x="116" y="186" width="14" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
                <polygon points="117,194 129,194 123,212" fill="#38bdf8" opacity="0.85" filter="url(#danaGlow)" />
                <polygon points="119,194 127,194 123,206" fill="#fef08a" opacity="0.9" />
              </g>

              {/* Arms seen from behind */}
              <g id="armsBack">
                <path d="M 68 142 Q 54 155 58 172" fill="none" stroke="url(#danaBody)" strokeWidth="10" strokeLinecap="round" />
                <circle cx="58" cy="172" r="7" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
                <path d="M 132 142 Q 146 155 142 172" fill="none" stroke="url(#danaBody)" strokeWidth="10" strokeLinecap="round" />
                <circle cx="142" cy="172" r="7" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes danaFloat {
          0%, 100% {
            transform: perspective(800px) translateY(0px) rotateY(0deg);
          }
          25% {
            transform: perspective(800px) translateY(-5px) rotateY(6deg);
          }
          50% {
            transform: perspective(800px) translateY(-9px) rotateY(0deg);
          }
          75% {
            transform: perspective(800px) translateY(-4px) rotateY(-6deg);
          }
        }

        @keyframes danaCelebration3D {
          0% {
            transform: perspective(800px) rotateY(0deg) translateY(0px) scale(1);
          }
          25% {
            transform: perspective(800px) rotateY(90deg) translateY(-18px) scale(1.08);
          }
          50% {
            transform: perspective(800px) rotateY(180deg) translateY(-30px) scale(1.15);
          }
          75% {
            transform: perspective(800px) rotateY(270deg) translateY(-18px) scale(1.08);
          }
          100% {
            transform: perspective(800px) rotateY(360deg) translateY(0px) scale(1);
          }
        }

        @keyframes danaSpinHop3D {
          0% {
            transform: perspective(800px) rotateY(0deg) translateY(0px) scale(1);
          }
          30% {
            transform: perspective(800px) rotateY(120deg) translateY(-26px) scale(1.12);
          }
          65% {
            transform: perspective(800px) rotateY(260deg) translateY(-12px) scale(1.06);
          }
          100% {
            transform: perspective(800px) rotateY(360deg) translateY(0px) scale(1);
          }
        }

        @keyframes danaConfettiPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          25% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3);
          }
          70% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.4) translateY(-16px);
          }
        }

        @keyframes danaRingPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes danaEyeBlink {
          0%, 86%, 100% { transform: scaleY(1); }
          90% { transform: scaleY(0.08); }
          94% { transform: scaleY(1); }
          96% { transform: scaleY(0.08); }
          98% { transform: scaleY(1); }
        }

        @keyframes antennaPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.18); opacity: 1; }
        }

        @keyframes speechBubbleBounce {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(12px);
          }
          65% {
            opacity: 1;
            transform: scale(1.04) translateY(-3px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

