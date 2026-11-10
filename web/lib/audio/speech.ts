// Web Speech API wrapper for Pedagogical Persian Narration in Elementary Math
// Conforms strictly to Rule 8 (100% Free and Open Source, zero paid cloud APIs)

const COMMON_FRACTIONS_SPOKEN: Record<string, string> = {
  "1/2": "یک دوم",
  "1/3": "یک سوم",
  "2/3": "دو سوم",
  "1/4": "یک چهارم",
  "2/4": "دو چهارم",
  "3/4": "سه چهارم",
  "1/5": "یک پنجم",
  "2/5": "دو پنجم",
  "3/5": "سه پنجم",
  "4/5": "چهار پنجم",
  "1/6": "یک ششم",
  "5/6": "پنج ششم",
  "1/8": "یک هشتم",
  "3/8": "سه هشتم",
  "5/8": "پنج هشتم",
  "7/8": "هفت هشتم",
  "1/10": "یک دهم",
  "2/10": "دو دهم",
  "3/10": "سه دهم",
  "4/10": "چهار دهم",
  "5/10": "پنج دهم",
  "6/10": "شش دهم",
  "7/10": "هفت دهم",
  "8/10": "هشت دهم",
  "9/10": "نه دهم",
};

/**
 * Normalizes math expressions and Persian fractions into spoken Persian prose
 * so native browser speech synthesis can pronounce them clearly for young learners.
 */
export function cleanTextForSpeech(input: string): string {
  if (!input) return "";

  let text = input;

  // 1. Convert common LaTeX fractions with canonical spoken Persian
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_match, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    const key = `${cleanNum}/${cleanDen}`;
    if (COMMON_FRACTIONS_SPOKEN[key]) {
      return COMMON_FRACTIONS_SPOKEN[key];
    }
    return `${cleanNum} بر روی ${cleanDen}`;
  });

  // 2. Convert standard slash fractions
  text = text.replace(/(\d+)\s*\/\s*(\d+)/g, (_match, num, den) => {
    const key = `${num}/${den}`;
    if (COMMON_FRACTIONS_SPOKEN[key]) {
      return COMMON_FRACTIONS_SPOKEN[key];
    }
    return `${num} بر روی ${den}`;
  });

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
    .replace(/\\leq?/g, " کوچک‌تر یا مساوی ")
    .replace(/\\geq?/g, " بزرگ‌تر یا مساوی ")
    .replace(/<=/g, " کوچک‌تر یا مساوی ")
    .replace(/>=/g, " بزرگ‌تر یا مساوی ")
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

  const selectVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const faVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("fa") || v.name.toLowerCase().includes("persian")
    );
    if (faVoice) {
      utterance.voice = faVoice;
    }
  };

  selectVoice();
  if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    window.speechSynthesis.onvoiceschanged = selectVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
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
