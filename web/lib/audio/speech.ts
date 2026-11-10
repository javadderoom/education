// Web Speech API wrapper for Pedagogical Persian Narration in Elementary Math
// Conforms strictly to Rule 8 (100% Free and Open Source, zero paid cloud APIs)

/**
 * Normalizes math expressions and Persian fractions into spoken Persian prose
 * so native browser speech synthesis can pronounce them clearly for young learners.
 */
export function cleanTextForSpeech(input: string): string {
  if (!input) return "";

  let text = input;

  // 1. Convert LaTeX fractions: \frac{a}{b} -> "a b-om"
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_match, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    return `${cleanNum} بر روی ${cleanDen}`;
  });

  // 2. Convert standard slash fractions: 3/4 -> "3 بر روی 4"
  text = text.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 بر روی $2");

  // 3. Convert mathematical operational signs to Persian words
  text = text
    .replace(/\\times/g, " ضرب در ")
    .replace(/×/g, " ضرب در ")
    .replace(/\*/g, " ضرب در ")
    .replace(/\\div/g, " تقسیم بر ")
    .replace(/÷/g, " تقسیم بر ")
    .replace(/\+/g, " به علاوه ")
    .replace(/−/g, " منهای ")
    .replace(/-/g, " منهای ")
    .replace(/\\leq?/g, " کوچک‌تر مساوی ")
    .replace(/\\geq?/g, " بزرگ‌تر مساوی ")
    .replace(/<=/g, " کوچک‌تر مساوی ")
    .replace(/>=/g, " بزرگ‌تر مساوی ")
    .replace(/=/g, " برابر است با ")
    .replace(/</g, " کوچک‌تر از ")
    .replace(/>/g, " بزرگ‌تر از ")
    .replace(/%/g, " درصد ");

  // 4. Strip leftover LaTeX commands, dollars, braces
  text = text.replace(/\\[a-zA-Z]+/g, " ");
  text = text.replace(/[$_{}\\]/g, " ");

  // 5. Clean Markdown bold/italics
  text = text.replace(/[*_#`~]/g, " ");

  // 6. Collapse redundant whitespaces
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Checks if the user's browser supports native SpeechSynthesis.
 */
export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Reads aloud text in Persian using browser-native SpeechSynthesis.
 * Returns a cancel function.
 */
export function speakPersian(
  rawText: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }
): () => void {
  if (!isSpeechSynthesisAvailable()) {
    callbacks?.onError?.(new Error("مرورگر شما از قابلیت روخوانی صوتی پشتیبانی نمی‌کند."));
    return () => {};
  }

  // Cancel any running speech
  window.speechSynthesis.cancel();

  const spokenText = cleanTextForSpeech(rawText);
  if (!spokenText) {
    callbacks?.onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = "fa-IR";
  utterance.rate = 0.88; // Slightly gentle pacing for elementary students
  utterance.pitch = 1.05; // Slightly warmer/friendly pitch

  // Attempt to select an authentic Persian voice if installed on OS/Browser
  const voices = window.speechSynthesis.getVoices();
  const faVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith("fa") || v.name.toLowerCase().includes("persian")
  );
  if (faVoice) {
    utterance.voice = faVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Interrupted errors happen normally when user stops speech manually
    if (e.error !== "interrupted" && e.error !== "canceled") {
      callbacks?.onError?.(e);
    } else {
      callbacks?.onEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };
}

export function stopPersianSpeech(): void {
  if (isSpeechSynthesisAvailable()) {
    window.speechSynthesis.cancel();
  }
}
