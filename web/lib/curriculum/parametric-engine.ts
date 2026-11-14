/**
 * Dynamic Parametric Question Generator Engine
 * Generates mathematically valid, non-repeating diagnostic math questions
 * with pedagogical distractors, misconception bindings, and parametric visual templates.
 */

import { DiagnosticItemData, DistractorItem } from "@/components/assessment/AssessmentCarousel";
import { toPersianDigits } from "@/lib/math/persian-digits";

const PERSIAN_NAMES = ["علی", "سارا", "رضا", "مریم", "امیر", "زهرا", "محمد", "نیلوفر", "مهدی", "فاطمه"];
const LABELS = ["الف", "ب", "ج", "د"];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface RawDistractorChoice {
  content: string;
  isCorrect: boolean;
  misconceptionId: string | null;
  rationale: string;
}

/**
 * Ensures exactly 4 distractors with 100% unique contents, proper shuffling, and sequential labels (الف، ب، ج، د).
 * If any collision occurs, it defensively perturbs or adjusts the duplicate incorrect choices
 * so that no two options ever have identical content.
 */
function finalizeDistractors(
  rawList: RawDistractorChoice[],
  prefix: string
): DistractorItem[] {
  const seenContents = new Set<string>();
  const cleaned: RawDistractorChoice[] = [];

  // Always keep correct answer first
  const correctChoice = rawList.find((d) => d.isCorrect);
  if (correctChoice) {
    seenContents.add(correctChoice.content.trim());
    cleaned.push(correctChoice);
  }

  // Then add incorrect choices, ensuring each content is unique
  for (const d of rawList) {
    if (d.isCorrect) continue;
    let candidate = d.content.trim();
    if (seenContents.has(candidate)) {
      // Perturb candidate to ensure mathematical uniqueness if an unexpected collision occurred
      const numMatch = candidate.match(/\d+/);
      if (numMatch) {
        let offset = 1;
        let perturbed = candidate;
        while (seenContents.has(perturbed)) {
          const originalNum = parseInt(numMatch[0], 10);
          perturbed = candidate.replace(numMatch[0], String(originalNum + offset));
          offset++;
        }
        candidate = perturbed;
      } else {
        let suffix = " (دیگر)";
        let count = 1;
        while (seenContents.has(candidate + (count > 1 ? ` ${count}` : suffix))) {
          count++;
        }
        candidate = candidate + (count > 1 ? ` ${count}` : suffix);
      }
    }
    seenContents.add(candidate);
    cleaned.push({
      ...d,
      content: candidate,
    });
  }

  const shuffled = shuffle(cleaned);
  return shuffled.map((d, i) => ({
    id: `DIS-DYN-${prefix}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    label: LABELS[i] || `${i + 1}`,
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));
}

// -------------------------------------------------------------
// Grade 4 Generators
// -------------------------------------------------------------

// =============================================================
// Grade 4 Chapter 1: Numbers & Patterns (اعداد و الگوها)
// =============================================================

/**
 * KC-MATH4-C01-01: عددنویسی، خواندن و بازنمایی اعداد چندرقمی تا طبقه میلیون
 */
export function generateMillionsNumberItem(index: number = 0): DiagnosticItemData {
  const configs = [
    {
      words: "چهارصد و پنج هزار و سی و هفت",
      val: "405037",
      mis: "45037",
      alt1: "405370",
      alt2: "450037",
      desc: "طبقه هزار دارای ۴۰۵ و طبقه یکی‌ها دارای ۰۳۷ است.",
    },
    {
      words: "سیصد و هشت میلیون و چهل هزار و پنج",
      val: "308040005",
      mis: "38405",
      alt1: "308400005",
      alt2: "38040050",
      desc: "۳۰۸ در طبقه میلیون، ۰۴۰ در طبقه هزار و ۰۰۵ در طبقه یکی‌ها قرار دارد.",
    },
    {
      words: "ششصد و بیست هزار و هفتصد و چهار",
      val: "620704",
      mis: "62704",
      alt1: "620740",
      alt2: "627400",
      desc: "۶۲۰ در طبقه هزار و ۷۰۴ در طبقه یکی‌ها است.",
    },
    {
      words: "پنج میلیون و نه هزار و هشتاد",
      val: "5009080",
      mis: "5980",
      alt1: "5090080",
      alt2: "590080",
      desc: "۵ در طبقه میلیون، ۰۰۹ در طبقه هزار و ۰۸۰ در طبقه یکی‌ها قرار دارد.",
    },
    {
      words: "هفتصد و چهار هزار و شصت و سه",
      val: "704063",
      mis: "74063",
      alt1: "704630",
      alt2: "746300",
      desc: "۷۰۴ در طبقه هزار و ۰۶۳ در طبقه یکی‌ها است.",
    },
  ];

  const cfg = randomChoice(configs);
  const stem = `نماد عددی «${cfg.words}» با کدام گزینه برابر است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${cfg.val}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: ${cfg.desc}`,
    },
    {
      content: `$${cfg.mis}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C01-01",
      rationale: `حذف صفرهای میانی ارزش مکانی و فشرده کردن ارقام بدون رعایت مرتبه‌ها.`,
    },
    {
      content: `$${cfg.alt1}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `جابجایی ارزش مکانی ارقام در طبقه یکی‌ها یا هزارها.`,
    },
    {
      content: `$${cfg.alt2}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `اشتباه در تفکیک دسته‌های سه‌تایی و قرارگیری اشتباه ارقام در طبقات.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01-01");

  return {
    id: `ITEM-DYN-G4-C01-01-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C01-01",
    stem,
    difficulty: 0.35,
    guess_param: 0.25,
    slip_param: 0.08,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C01-02: گسترده‌نویسی اعداد و تجزیه بر اساس ارزش مکانی ارقام
 */
export function generateExpandedFormItem(index: number = 0): DiagnosticItemData {
  const hTh = randomChoice([3, 4, 5, 6, 7, 8]);
  const tTh = randomChoice([2, 3, 5, 7]);
  const h = randomChoice([4, 6, 8, 9]);
  const u = randomChoice([2, 3, 5, 7]);
  const num = hTh * 100000 + tTh * 10000 + h * 100 + u;

  const stem = `شکل گسترده‌ی عدد $${num}$ در کدام گزینه به درستی نوشته شده است؟`;

  const correctContent = `$${hTh * 100000} + ${tTh * 10000} + ${h * 100} + ${u}$`;
  const misAbsoluteSum = `$${hTh} + ${tTh} + 0 + ${h} + 0 + ${u}$`;
  const misShifted = `$${hTh * 10000} + ${tTh * 1000} + ${h * 100} + ${u}$`;
  const misOmitZero = `$${hTh * 100000} + ${tTh * 1000} + ${h * 10} + ${u}$`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: correctContent,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: رقم ${hTh} در صدگان‌هزار ($${hTh * 100000}$)، رقم ${tTh} در ده‌گان‌هزار ($${tTh * 10000}$)، رقم ${h} در صدگان ($${h * 100}$) و رقم ${u} در یکان ($${u}$) قرار دارد.`,
    },
    {
      content: misAbsoluteSum,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C01-02",
      rationale: `جمع ارقام مطلق به جای ارزش مکانی در گسترده‌نویسی.`,
    },
    {
      content: misShifted,
      isCorrect: false,
      misconceptionId: null,
      rationale: `تنزل یک مرتبه‌ای ارزش مکانی صدگان‌هزار و ده‌گان‌هزار.`,
    },
    {
      content: misOmitZero,
      isCorrect: false,
      misconceptionId: null,
      rationale: `اشتباه در تعیین تعداد صفرهای مرتبه‌های مختلف.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01-02");

  return {
    id: `ITEM-DYN-G4-C01-02-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C01-02",
    stem,
    difficulty: 0.4,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C01-03: کشف رابطه در الگوهای عددی، هندسی و ماشین‌های ورودی-خروجی
 */
export function generatePatternMachineItem(index: number = 0): DiagnosticItemData {
  const mult = randomChoice([3, 4, 5]);
  const add = randomChoice([1, 2, 3]);
  const isAddition = randomChoice([true, false]);
  const inputVal = randomChoice([4, 6, 8, 9]);

  const opText = isAddition
    ? `«ضرب در ${toPersianDigits(mult)}» و سپس «به علاوه ${toPersianDigits(add)}»`
    : `«ضرب در ${toPersianDigits(mult)}» و سپس «منهای ${toPersianDigits(add)}»`;
  const stem = `در یک ماشین دو مرحله‌ای ورودی-خروجی، هر عددی وارد شود ابتدا ${opText} می‌شود. اگر عدد $${inputVal}$ وارد این ماشین شود، چه عددی خارج خواهد شد؟`;

  const correctVal = isAddition ? inputVal * mult + add : inputVal * mult - add;
  const misVal = isAddition ? inputVal + mult + add : inputVal + mult - add;
  const invVal = isAddition ? (inputVal + add) * mult : (inputVal - add) * mult;
  const wrongSignVal = isAddition ? inputVal * mult - add : inputVal * mult + add;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${correctVal}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: ابتدا عمل ضرب ($${inputVal} \\times ${mult} = ${inputVal * mult}$) و سپس ${isAddition ? "جمع" : "تفریق"} انجام می‌شود: $${correctVal}$.`,
    },
    {
      content: `$${misVal}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C01-03",
      rationale: `فرض الگوی صرفاً جمعی و تبدیل عمل ضرب به جمع ($${inputVal} + ${mult} ${isAddition ? "+" : "-"} ${add}$).`,
    },
    {
      content: `$${invVal}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `جابجایی ترتیب عملیات و انجام مرحله دوم قبل از مرحله اول.`,
    },
    {
      content: `$${wrongSignVal}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطای معکوس کردن علامت مرحله دوم عملیات.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01-03");

  return {
    id: `ITEM-DYN-G4-C01-03-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C01-03",
    stem,
    difficulty: 0.42,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C01-04: مقایسه و ترتیب‌بندی اعداد بزرگ و نمایش آن‌ها روی محور اعداد
 */
export function generateComparisonNumberLineItem(index: number = 0): DiagnosticItemData {
  const n6 = randomInt(102000, 115000);
  const n5 = randomInt(94000, 99500);

  const stem = `کدام مقایسه در بین گزینه‌های زیر «صحیح» است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${n6} > ${n5}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: عدد شش‌رقمی ($${n6}$) همواره از عدد پنج‌رقمی ($${n5}$) بزرگتر است.`,
    },
    {
      content: `$${n5} > ${n6}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C01-04",
      rationale: `مقایسه بر اساس رقم آغازین: تصور اینکه چون رقم اول ۹ از ۱ بزرگتر است، پس عدد پنج‌رقمی بزرگتر است.`,
    },
    {
      content: `$${n6} = ${n5}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `فرض نادرست برابری علی‌رغم تفاوت آشکار در مرتبه‌ها و ارقام.`,
    },
    {
      content: `$${n5} = ${n6 - 1000}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطای مقایسه و تخمین نادرست تفاوت دو عدد.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01-04");

  return {
    id: `ITEM-DYN-G4-C01-04-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C01-04",
    stem,
    difficulty: 0.35,
    guess_param: 0.25,
    slip_param: 0.08,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C01-05: محاسبات تقریبی و گرد کردن به نزدیک‌ترین مرتبه ده‌گان، صدگان و هزارگان
 */
export function generateRoundingEstimationItem(index: number = 0): DiagnosticItemData {
  const baseThousands = randomChoice([3, 4, 5, 6, 7, 8]);
  const hundreds = randomChoice([2, 4, 6, 7]);
  const units = randomInt(1, 9);
  const num = baseThousands * 1000 + hundreds * 100 + 50 + units;

  const stem = `اگر عدد $${num}$ را با روش «گرد کردن» به نزدیک‌ترین صدگان تقریب بزنیم، حاصل کدام است؟`;

  const roundedCorrect = baseThousands * 1000 + (hundreds + 1) * 100;
  const truncatedMis = baseThousands * 1000 + hundreds * 100;
  const roundedThousands = (baseThousands + (hundreds >= 5 ? 1 : 0)) * 1000;
  const roundedTens = baseThousands * 1000 + hundreds * 100 + (units >= 5 ? 60 : 50);

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${roundedCorrect}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: رقم مرتبه ده‌گان عدد ۵ است؛ طبق قانون گرد کردن کتاب درسی، هرگاه رقم بعدی ۵ یا بیشتر باشد، یک واحد به صدگان افزوده و ارقام بعدی صفر می‌شوند ($${num} \\rightarrow ${roundedCorrect}$).`,
    },
    {
      content: `$${truncatedMis}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C01-05",
      rationale: `قطع کردن به جای گرد کردن: صفر کردن ارقام بعد از صدگان بدون توجه به اینکه رقم ده‌گان ۵ است و باید رو به بالا گرد شود.`,
    },
    {
      content: `$${roundedThousands}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `گرد کردن به مرتبه هزارگان به جای صدگان خواسته شده در صورت سؤال.`,
    },
    {
      content: `$${roundedTens}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `گرد کردن به نزدیک‌ترین ده‌گان به جای نزدیک‌ترین صدگان.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01-05");

  return {
    id: `ITEM-DYN-G4-C01-05-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C01-05",
    stem,
    difficulty: 0.45,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C02-01: مفهوم جزء از کل و تفکیک واحد
 */
export function generateFractionConceptItem(index: number = 0): DiagnosticItemData {
  const name = randomChoice(PERSIAN_NAMES);
  const total = randomChoice([4, 5, 6, 7, 8, 9, 10]);
  const colored = randomInt(1, total - 1);
  const uncolored = total - colored;

  const stem = `${name} یک نوار مستطیلی را به $${total}$ قسمت مساوی تقسیم کرده و $${colored}$ قسمت از آن را رنگ‌آمیزی نموده است. چه کسری از نوار رنگ شده است؟`;

  const correctContent = `$\\frac{${colored}}{${total}}$`;
  const rawDistractors: RawDistractorChoice[] = [
    {
      content: correctContent,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: نسبت تعداد قسمت‌های رنگ‌شده (${toPersianDigits(colored)}) به کل قسمت‌ها (${toPersianDigits(total)}).`,
    },
    {
      content: `$\\frac{${uncolored}}{${total}}$`,
      isCorrect: false,
      misconceptionId: "MIS-UNIT-CONFUSION",
      rationale: `خطای جزء متمم: محاسبه بخش‌های رنگ‌نشده (${toPersianDigits(uncolored)}) به جای بخش‌های رنگ‌شده.`,
    },
    {
      content: `$\\frac{${colored}}{${uncolored}}$`,
      isCorrect: false,
      misconceptionId: "MIS-PART-TO-PART",
      rationale: `خطای جزء به جزء: نوشتن نسبت بخش رنگ‌شده به بخش رنگ‌نشده به جای کل واحد.`,
    },
    {
      content: `$\\frac{${total}}{${colored}}$`,
      isCorrect: false,
      misconceptionId: "MIS-INVERTED-FRACTION",
      rationale: `معکوس نوشتن کسر: قرار دادن کل در صورت و جزء در مخرج.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C01");

  return {
    id: `ITEM-DYN-G4-C01-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C02-01",
    stem,
    difficulty: 0.35,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "FractionStrip",
      props: {
        totalSegments: total,
        initialColored: colored,
        interactive: false,
      },
    },
    distractors,
  };
}

/**
 * KC-MATH4-C02-02: کسرهای مساوی و ساده‌کردن
 */
export function generateEquivalentFractionItem(index: number = 0): DiagnosticItemData {
  const num = randomChoice([1, 2, 3, 4]);
  const den = randomChoice([3, 4, 5]);
  const multiplier = randomChoice([2, 3, 4]);

  const eqNum = num * multiplier;
  const eqDen = den * multiplier;

  const stem = `کدام کسر با کسر $\\frac{${num}}{${den}}$ مساوی است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$\\frac{${eqNum}}{${eqDen}}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: صورت و مخرج هر دو در عدد ${toPersianDigits(multiplier)} ضرب شده‌اند.`,
    },
    {
      content: `$\\frac{${num + multiplier}}{${den + multiplier}}$`,
      isCorrect: false,
      misconceptionId: "MIS-EQUAL-DIFF",
      rationale: `بدفهمی تفکر جمعی: افزودن عدد ثابت (${toPersianDigits(multiplier)}) به صورت و مخرج به جای ضرب.`,
    },
    {
      content: `$\\frac{${eqNum}}{${den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-NUM-ONLY-MULT",
      rationale: `ضرب کردن صورت به تنهایی و ثابت نگه داشتن مخرج.`,
    },
    {
      content: `$\\frac{${num}}{${eqDen}}$`,
      isCorrect: false,
      misconceptionId: "MIS-DEN-ONLY-MULT",
      rationale: `ضرب کردن مخرج به تنهایی و ثابت نگه داشتن صورت.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C02");

  return {
    id: `ITEM-DYN-G4-C02-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C02-02",
    stem,
    difficulty: 0.45,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "AreaGrid",
      props: {
        rows: den,
        cols: multiplier,
        coloredCount: eqNum,
      },
    },
    distractors,
  };
}

/**
 * KC-MATH4-C02-03: مقایسه کسرها
 */
export function generateFractionComparisonItem(index: number = 0): DiagnosticItemData {
  // Compare unit fractions: 1/a vs 1/b where a < b
  const smallerDen = randomChoice([3, 4, 5, 6]);
  const largerDen = smallerDen + randomChoice([2, 3, 4]);

  const stem = `کدام رابطه درباره مقایسه دو کسر $\\frac{1}{${smallerDen}}$ و $\\frac{1}{${largerDen}}$ درست است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$\\frac{1}{${smallerDen}} > \\frac{1}{${largerDen}}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: صورت‌ها برابرند؛ هر چه مخرج کوچکتر باشد، قطعات بزرگترند (${toPersianDigits(smallerDen)} قطعه بزرگتر از ${toPersianDigits(largerDen)} قطعه است).`,
    },
    {
      content: `$\\frac{1}{${smallerDen}} < \\frac{1}{${largerDen}}$`,
      isCorrect: false,
      misconceptionId: "MIS-COMP-INV",
      rationale: `بدفهمی تعمیم اعداد صحیح: تصور اینکه مخرج بزرگتر (${toPersianDigits(largerDen)}) به معنای کسر بزرگتر است.`,
    },
    {
      content: `$\\frac{1}{${smallerDen}} = \\frac{1}{${largerDen}}$`,
      isCorrect: false,
      misconceptionId: "MIS-NUM-EQUAL-FRACTION",
      rationale: `تصور برابری کسرها تنها به دلیل برابر بودن صورت‌ها.`,
    },
    {
      content: `$\\frac{1}{${smallerDen}} + \\frac{1}{${largerDen}} = 1$`,
      isCorrect: false,
      misconceptionId: "MIS-SUM-ONE",
      rationale: `تصور نادرست از متمم بودن دو کسر به یک واحد کامل.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03");

  return {
    id: `ITEM-DYN-G4-C03-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C02-03",
    stem,
    difficulty: 0.5,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "BalanceScale",
      props: {
        leftLabel: `1/${smallerDen}`,
        leftValue: 1 / smallerDen,
        rightLabel: `1/${largerDen}`,
        rightValue: 1 / largerDen,
        hideBadge: true,
      },
    },
    distractors,
  };
}

/**
 * KC-MATH4-C02-04: جمع و تفریق کسرهای هم‌مخرج
 */
export function generateFractionAdditionItem(index: number = 0): DiagnosticItemData {
  const den = randomChoice([6, 7, 8, 9, 10, 12]);
  const a = randomInt(1, Math.floor((den - 2) / 2));
  let b = randomInt(1, den - a - 1);
  // Guarantee a !== b and a * b !== a + b to avoid distractor collision
  while (b === a || a * b === a + b) {
    b = randomInt(1, den - a - 1);
  }
  const correctSum = a + b;
  const subDiff = Math.abs(a - b);
  let diffVal = subDiff === 0 || subDiff === correctSum || subDiff === a * b
    ? (correctSum + 1 < den ? correctSum + 1 : Math.max(1, correctSum - 2))
    : subDiff;
  let mulVal = a * b;
  if (mulVal === correctSum || mulVal === diffVal) {
    mulVal = correctSum + 2 < den ? correctSum + 2 : Math.max(1, correctSum - 1);
  }

  const stem = `حاصل جمع دو کسر $\\frac{${a}}{${den}} + \\frac{${b}}{${den}}$ کدام است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$\\frac{${correctSum}}{${den}}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: مخرج‌ها برابرند پس مخرج حفظ شده و صورت‌ها جمع می‌شوند (${toPersianDigits(a)} + ${toPersianDigits(b)} = ${toPersianDigits(correctSum)}).`,
    },
    {
      content: `$\\frac{${correctSum}}{${den + den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-ADD-NUM-DEN",
      rationale: `بدفهمی جمع مخرج‌ها: دانش‌آموز علاوه بر صورت‌ها، مخرج‌ها را هم جمع کرده است (${toPersianDigits(den)} + ${toPersianDigits(den)} = ${toPersianDigits(den * 2)}).`,
    },
    {
      content: `$\\frac{${mulVal}}{${den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-MUL-INSTEAD-ADD",
      rationale: `ضرب کردن صورت‌ها به جای عمل جمع (${toPersianDigits(a)} × ${toPersianDigits(b)}).`,
    },
    {
      content: `$\\frac{${diffVal}}{${den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-SUB-INSTEAD-ADD",
      rationale: `تفریق صورت‌ها به جای جمع کردن آن‌ها.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C04");

  return {
    id: `ITEM-DYN-G4-C04-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C02-04",
    stem,
    difficulty: 0.45,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "FractionStrip",
      props: {
        totalSegments: den,
        initialColored: 0,
        showSumMode: true,
        operandA: a,
        operandB: b,
      },
    },
    distractors,
  };
}

/**
 * KC-MATH4-C02-05: کسرها روی محور اعداد
 */
export function generateFractionNumberLineItem(index: number = 0): DiagnosticItemData {
  const den = randomChoice([3, 4, 5, 6]);
  const num = randomInt(1, den - 1);

  const stem = `اگر فاصله بین دو عدد ۰ و ۱ روی محور اعداد به $${den}$ قسمت مساوی تقسیم شده باشد، نقطه نمایش کسر $\\frac{${num}}{${den}}$ کجاست؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `قسمت $${num}$ام بعد از نقطه ۰`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: هر فاصله $\\frac{1}{${toPersianDigits(den)}}$ است، پس ${toPersianDigits(num)} قسمت جلو می‌رویم.`,
    },
    {
      content: `قسمت $${num}$ام قبل از نقطه ۱`,
      isCorrect: false,
      misconceptionId: "MIS-NUM-LINE-REVERSE",
      rationale: `شمارش معکوس از مبدا ۱ به جای شمارش رو به جلو از مبدا ۰.`,
    },
    {
      content: `وسط فاصله بین ۰ و ۱`,
      isCorrect: false,
      misconceptionId: "MIS-HALF-BIAS",
      rationale: `سوگیری به سمت نقطه نصف بدون توجه به مخرج کسر.`,
    },
    {
      content: `روی خود عدد ۱`,
      isCorrect: false,
      misconceptionId: "MIS-UNIT-CONFUSION",
      rationale: `اشتباه گرفتن کسر با واحد کامل.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C05");

  return {
    id: `ITEM-DYN-G4-C05-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C02-05",
    stem,
    difficulty: 0.5,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "NumberLine",
      props: {
        partitions: den,
        targetFraction: num / den,
        hideFractions: true,
      },
    },
    distractors,
  };
}

// -------------------------------------------------------------
// Grade 5 Generators
// -------------------------------------------------------------

/**
 * KC-MATH5-C03-01: مفهوم نسبت و مقایسه دو کمیت
 */
export function generateRatioConceptItem(index: number = 0): DiagnosticItemData {
  const objA = randomChoice(["سیب", "مداد", "توپ قرمز", "دفتر"]);
  const objB = randomChoice(["پرتقال", "پاک‌کن", "توپ آبی", "کتاب"]);
  const countA = randomInt(2, 6);
  let countB = randomInt(3, 8);
  // Guarantee countB is never equal to countA to prevent identical distractors
  while (countB === countA) {
    countB = countA <= 4 ? countA + randomInt(1, 3) : countA - randomInt(1, 2);
  }

  const stem = `در یک سبد $${countA}$ عدد ${objA} و $${countB}$ عدد ${objB} قرار دارد. نسبت تعداد ${objA}ها به تعداد ${objB}ها کدام است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${countA}$ به $${countB}$ (یا $\\frac{${countA}}{${countB}}$)`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: رعایت ترتیب بیان در صورت و مخرج نسبت (${toPersianDigits(countA)} به ${toPersianDigits(countB)}).`,
    },
    {
      content: `$${countB}$ به $${countA}$ (یا $\\frac{${countB}}{${countA}}$)`,
      isCorrect: false,
      misconceptionId: "MIS-ORDER-REVERSAL",
      rationale: `وارونه نوشتن نسبت: جابجا کردن کمیت اول و دوم برخلاف ترتیب صورت سوال.`,
    },
    {
      content: `$${countA}$ به $${countA + countB}$ (یا $\\frac{${countA}}{${countA + countB}}$)`,
      isCorrect: false,
      misconceptionId: "MIS-PART-TO-WHOLE-BIAS",
      rationale: `اشتباه گرفتن نسبت جزء به جزء با نسبت جزء به کل.`,
    },
    {
      content: `$${countB}$ به $${countA + countB}$ (یا $\\frac{${countB}}{${countA + countB}}$)`,
      isCorrect: false,
      misconceptionId: "MIS-PART-TO-WHOLE-REVERSE",
      rationale: `محاسبه جزء دوم به کل مجموع.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G5-C01");

  return {
    id: `ITEM-DYN-G5-C01-${Date.now()}-${index}`,
    kc_id: "KC-MATH5-C03-01",
    stem,
    difficulty: 0.35,
    guess_param: 0.25,
    slip_param: 0.1,
    distractors,
  };
}

/**
 * KC-MATH5-C03-02: نسبت‌های مساوی و مفهوم تناسب
 */
export function generateRatioEquivalenceItem(index: number = 0): DiagnosticItemData {
  const a = randomChoice([2, 3, 4]);
  const b = randomChoice([3, 5, 7]);
  const mult = randomChoice([2, 3, 4, 5]);

  const stem = `نسبت $\\frac{${a}}{${b}}$ با کدام یک از نسبت‌های زیر مساوی است تا با قرار گرفتن در کفه دیگر، تعادل ترازو (تناسب) برقرار بماند؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$\\frac{${a * mult}}{${b * mult}}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: ضرب همزمان هر دو جزء در عدد ${toPersianDigits(mult)}.`,
    },
    {
      content: `$\\frac{${a + mult}}{${b + mult}}$`,
      isCorrect: false,
      misconceptionId: "MIS-RATIO-ADDITIVE",
      rationale: `بدفهمی تفکر جمعی: افزودن عدد ثابت (${toPersianDigits(mult)}) به هر دو طرف به جای ضرب.`,
    },
    {
      content: `$\\frac{${a * mult}}{${b}}$`,
      isCorrect: false,
      misconceptionId: "MIS-RATIO-NUM-ONLY",
      rationale: `ضرب کردن تنها یک جزء نسبت.`,
    },
    {
      content: `$\\frac{${a}}{${b * mult}}$`,
      isCorrect: false,
      misconceptionId: "MIS-RATIO-DEN-ONLY",
      rationale: `ضرب کردن مخرج به تنهایی.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G5-C02");

  return {
    id: `ITEM-DYN-G5-C02-${Date.now()}-${index}`,
    kc_id: "KC-MATH5-C03-02",
    stem,
    difficulty: 0.45,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "BalanceScale",
      props: {
        leftLabel: `${a}:${b}`,
        leftValue: 1,
        rightLabel: "؟",
        rightValue: 1,
      },
    },
    distractors,
  };
}

/**
 * KC-MATH5-C03-03: جدول تناسب و روش‌های حل
 */
export function generateProportionTableItem(index: number = 0): DiagnosticItemData {
  const rate = randomChoice([3, 4, 5, 6]);
  const knownA = randomChoice([2, 3, 5]);
  const knownB = knownA * rate;
  let targetA = knownA + randomChoice([2, 3, 4]);
  // Prevent knownB * 2 colliding with (targetA - 1) * rate
  if (knownB * 2 === (targetA - 1) * rate) {
    targetA += 1;
  }
  const correctTargetB = targetA * rate;

  const additiveWrong = knownB + (targetA - knownA);
  const diffHours = targetA - knownA;
  const doubleWrong = knownB * 2;
  let slipVal = correctTargetB - rate;
  if (slipVal === doubleWrong || slipVal === additiveWrong) {
    slipVal = correctTargetB + rate;
  }

  const stem = `یک اتومبیل در هر $${knownA}$ ساعت، مسافت $${knownB}$ کیلومتر را طی می‌کند. با همین سرعت، این اتومبیل در $${targetA}$ ساعت چند کیلومتر را طی خواهد کرد؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${correctTargetB}$ کیلومتر`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: سرعت خودرو ${toPersianDigits(rate)} کیلومتر در ساعت است (${toPersianDigits(targetA)} × ${toPersianDigits(rate)} = ${toPersianDigits(correctTargetB)}).`,
    },
    {
      content: `$${additiveWrong}$ کیلومتر`,
      isCorrect: false,
      misconceptionId: "MIS-RATIO-ADDITIVE",
      rationale: `بدفهمی جمعی: دانش‌آموز به جای ضرب، اختلاف ساعت‌ها (${toPersianDigits(diffHours)}) را به مسافت اضافه کرده است.`,
    },
    {
      content: `$${doubleWrong}$ کیلومتر`,
      isCorrect: false,
      misconceptionId: "MIS-DOUBLE-BIAS",
      rationale: `دو برابر کردن مسافت بدون توجه به نسبت ساعت‌های واقعی.`,
    },
    {
      content: `$${slipVal}$ کیلومتر`,
      isCorrect: false,
      misconceptionId: "MIS-CALCULATION",
      rationale: `خطای محاسباتی در ضرب ضریب تناسب.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G5-C03");

  return {
    id: `ITEM-DYN-G5-C03-${Date.now()}-${index}`,
    kc_id: "KC-MATH5-C03-03",
    stem,
    difficulty: 0.5,
    guess_param: 0.25,
    slip_param: 0.1,
    distractors,
  };
}

/**
 * KC-MATH5-C03-04: تسهیم به نسبت
 */
export function generateRatioSharingItem(index: number = 0): DiagnosticItemData {
  const nameA = randomChoice(["علی", "امیر", "سینا"]);
  const nameB = randomChoice(["رضا", "محمد", "نیما"]);
  const ratioA = randomChoice([2, 3]);
  // Prevent equal ratio split collision which equates share with 50% split
  const ratioB = ratioA === 2 ? randomChoice([3, 5]) : randomChoice([4, 5]);
  const totalRatio = ratioA + ratioB;
  const unitValue = randomChoice([10000, 20000, 50000]);
  const totalMoney = totalRatio * unitValue;
  const correctShareA = ratioA * unitValue;
  const halfMoney = totalMoney / 2;
  const partnerShare = ratioB * unitValue;

  // When ratioA === 2, totalMoney / ratioA is identical to totalMoney / 2 (halfMoney)!
  // In that case, use single unit value (totalMoney / totalRatio) as the misconception distractor
  const singleUnitShare = unitValue;
  const divideRatioDistractor = (totalMoney / ratioA === halfMoney)
    ? singleUnitShare
    : Math.round(totalMoney / ratioA);

  const stem = `${nameA} و ${nameB} مبلغ ${totalMoney.toLocaleString("fa-IR")} تومان را به نسبت $${ratioA}$ به $${ratioB}$ بین خود تقسیم می‌کنند. سهم ${nameA} چقدر است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `${correctShareA.toLocaleString("fa-IR")} تومان`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: مجموع نسبت‌ها ${toPersianDigits(totalRatio)} است و ارزش هر سهم ${toPersianDigits(unitValue)} تومان است (${toPersianDigits(ratioA)} × ${toPersianDigits(unitValue)}).`,
    },
    {
      content: `${halfMoney.toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: "MIS-EQUAL-SPLIT",
      rationale: `تقسیم مساوی بر ۲ بدون توجه به نسبت‌های تسهیم (${toPersianDigits(ratioA)} به ${toPersianDigits(ratioB)}).`,
    },
    {
      content: `${partnerShare.toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: "MIS-PARTNER-SHARE",
      rationale: `محاسبه سهم نفر دوم به جای نفر اول.`,
    },
    {
      content: `${divideRatioDistractor.toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: divideRatioDistractor === singleUnitShare ? "MIS-SINGLE-UNIT-SHARE" : "MIS-DIVIDE-BY-RATIO",
      rationale: divideRatioDistractor === singleUnitShare
        ? `محاسبه ارزش تنها یک سهم به جای ${toPersianDigits(ratioA)} سهم.`
        : `تقسیم کل پول بر نسبت فرد اول بدون محاسبه سطر مجموع نسبت‌ها.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G5-C04");

  return {
    id: `ITEM-DYN-G5-C04-${Date.now()}-${index}`,
    kc_id: "KC-MATH5-C03-04",
    stem,
    difficulty: 0.6,
    guess_param: 0.25,
    slip_param: 0.1,
    distractors,
  };
}

/**
 * KC-MATH5-C03-05: درصد و کاربردهای مالی
 */
export function generatePercentageItem(index: number = 0): DiagnosticItemData {
  const percent = randomChoice([10, 20, 25, 30, 40]);
  const originalPrice = randomChoice([50000, 100000, 200000, 400000]);
  const discountAmount = (originalPrice * percent) / 100;
  const finalPrice = originalPrice - discountAmount;

  const stem = `یک کالای ${originalPrice.toLocaleString("fa-IR")} تومانی دارای $${percent}$٪ تخفیف است. قیمت نهایی پرداختی چقدر است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `${finalPrice.toLocaleString("fa-IR")} تومان`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: تخفیف ${toPersianDigits(discountAmount)} تومان است و قیمت نهایی ${toPersianDigits(originalPrice)} - ${toPersianDigits(discountAmount)} = ${toPersianDigits(finalPrice)} تومان می‌شود.`,
    },
    {
      content: `${discountAmount.toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: "MIS-DISCOUNT-AS-PRICE",
      rationale: `اشتباه گرفتن مقدار تخفیف به جای قیمت نهایی کالا.`,
    },
    {
      content: `${(originalPrice - percent).toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: "MIS-PERCENT-AS-ABSOLUTE",
      rationale: `کسر کردن مستقیم عدد درصد (${toPersianDigits(percent)}) از قیمت کل به جای محاسبه نسبت درصدی.`,
    },
    {
      content: `${(originalPrice + discountAmount).toLocaleString("fa-IR")} تومان`,
      isCorrect: false,
      misconceptionId: "MIS-ADD-DISCOUNT",
      rationale: `اضافه کردن مبلغ تخفیف به جای کسر آن.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G5-C05");

  return {
    id: `ITEM-DYN-G5-C05-${Date.now()}-${index}`,
    kc_id: "KC-MATH5-C03-05",
    stem,
    difficulty: 0.55,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: {
      type: "AreaGrid",
      props: {
        rows: 10,
        cols: 10,
        coloredCount: percent,
      },
    },
    distractors,
  };
}

// -------------------------------------------------------------
// Grade 4 Chapter 3 (Multiplication & Division) Generators
// -------------------------------------------------------------

/**
 * KC-MATH4-C03-01: ضرب مساحتی و الگوی مستطیلی
 */
export function generateAreaMultiplicationItem(index: number = 0): DiagnosticItemData {
  const name = randomChoice(PERSIAN_NAMES);
  const L = randomChoice([24, 25, 32, 34, 35, 42, 45]);
  const W = randomChoice([14, 15, 23, 24, 25]);

  const L10 = Math.floor(L / 10) * 10;
  const L1 = L % 10;
  const W10 = Math.floor(W / 10) * 10;
  const W1 = W % 10;

  const totalArea = L * W;
  const componentArea = L10 * W10 + L1 * W1; // Misconception: omitting cross terms
  const missingOneCross = totalArea - L1 * W10;
  let slipOffset = 20;
  if (totalArea - slipOffset === missingOneCross || totalArea - slipOffset === componentArea) {
    slipOffset = 30;
  }
  const calculationSlip = totalArea - slipOffset;

  const stem = `یک فرش مستطیل‌شکل به طول $${L}$ و عرض $${W}$ سانتی‌متر داریم. اگر برای محاسبه‌ی مساحت آن، از روش ضرب مساحتی و تفکیک به ۴ مستطیل فرعیِ ($${L10} \\times ${W10}$)، ($${L10} \\times ${W1}$)، ($${L1} \\times ${W10}$) و ($${L1} \\times ${W1}$) استفاده کنیم، مساحت کل این فرش چند سانتی‌متر مربع می‌شود؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${totalArea}$ سانتی‌متر مربع`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `مجموع هر ۴ بخش مساحت برابر با $${L10 * W10} + ${L10 * W1} + ${L1 * W10} + ${L1 * W1} = ${totalArea}$ است.`,
    },
    {
      content: `$${componentArea}$ سانتی‌متر مربع`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C03-02",
      rationale: `خطای ضرب مؤلفه به مؤلفه: محاسبه تنها دهگان در دهگان و یکان در یکان و حذف مستطیل‌های میانی مساحت.`,
    },
    {
      content: `$${missingOneCross}$ سانتی‌متر مربع`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `فراموش کردن یکی از بخش‌های مساحت در جمع نهایی.`,
    },
    {
      content: `$${calculationSlip}$ سانتی‌متر مربع`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطا در جمع ستونی بخش‌های مساحت مستطیل.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03-01");

  return {
    id: `ITEM-DYN-G4-C03-01-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C03-01",
    stem,
    difficulty: 0.35,
    guess_param: 0.25,
    slip_param: 0.08,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C03-02: ضرب تکنیکی و ستونی دو رقمی با حفظ ارزش مکانی
 */
export function generateVerticalMultiplicationItem(index: number = 0): DiagnosticItemData {
  const A = randomChoice([26, 34, 43, 46, 52]);
  const B = randomChoice([16, 24, 27, 32, 35]);

  const B10 = Math.floor(B / 10);
  const B1 = B % 10;

  const total = A * B;
  const row1 = A * B1;
  const row2Correct = A * (B10 * 10);
  const row2NoZero = A * B10;
  const totalNoZero = row1 + row2NoZero; // Misconception: omitting place-value zero

  const stem = `حاصل ضرب ستونی زیر کدام است؟\n$$\\begin{array}{r} ${A} \\\\ \\times \\ ${B} \\\\ \\hline \\end{array}$$`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${total}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `حاصل سطر اول $${A} \\times ${B1} = ${row1}$ و سطر دوم $${A} \\times ${B10 * 10} = ${row2Correct}$ بوده و جمع آن‌ها $${total}$ است.`,
    },
    {
      content: `$${totalNoZero}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C03-01",
      rationale: `فراموش کردن درج صفر ارزش مکانی دهگان در سطر دوم و جمع بستن $${row1} + ${row2NoZero} = ${totalNoZero}$.`,
    },
    {
      content: `$${total - 100}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطا در رقم انتقالی (نقلی) دهگان یا صدگان.`,
    },
    {
      content: `$${total + 20}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطای محاسباتی در جمع ستونی دو سطر.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03-02");

  return {
    id: `ITEM-DYN-G4-C03-02-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C03-02",
    stem,
    difficulty: 0.45,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C03-03: تخمین و محاسبه‌ی تقریبی در ضرب و تقسیم
 */
export function generateEstimationMultiplicationItem(index: number = 0): DiagnosticItemData {
  const name = randomChoice(PERSIAN_NAMES);
  const baseA = randomChoice([38, 49, 58, 69, 78]);
  const baseB = randomChoice([19, 28, 29, 39]);

  const roundA = Math.round(baseA / 10) * 10;
  const roundB = Math.round(baseB / 10) * 10;
  const correctEst = roundA * roundB;
  const missingZeroEst = correctEst / 10;
  const truncationEst = Math.floor(baseA / 10) * 10 * Math.floor(baseB / 10) * 10;
  const roundingErrorEst = (roundA - 10) * roundB;

  const stem = `قیمت هر بسته دفتر $${baseB}$ هزار تومان است. ${name} می‌خواهد $${baseA}$ بسته از این دفترها را بخرد. اگر او برای تخمین هزینه‌ی کل، هر دو عدد را به «نزدیک‌ترین ده‌گان» گرد کند، قیمت تقریبی کل دفترها چند هزار تومان می‌شود؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${correctEst}$ هزار تومان`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `گرد شده $${baseA}$ برابر با $${roundA}$ و گرد شده $${baseB}$ برابر با $${roundB}$ است و $${roundA} \\times ${roundB} = ${correctEst}$.`,
    },
    {
      content: `$${missingZeroEst}$ هزار تومان`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C03-04",
      rationale: `حذف یکی از صفرهای ارزش مکانی در ضرب دو عدد ده‌گانی.`,
    },
    {
      content: `$${truncationEst}$ هزار تومان`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `استفاده از روش قطع کردن به جای گرد کردن به نزدیک‌ترین دهگان.`,
    },
    {
      content: `$${roundingErrorEst}$ هزار تومان`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `اشتباه در تشخیص نزدیک‌ترین دهگان برای عامل اول.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03-03");

  return {
    id: `ITEM-DYN-G4-C03-03-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C03-03",
    stem,
    difficulty: 0.4,
    guess_param: 0.25,
    slip_param: 0.08,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C03-04: درک رابطه‌های درستی تقسیم و شرط باقی‌مانده
 */
export function generateDivisionVerificationItem(index: number = 0): DiagnosticItemData {
  const d = randomChoice([6, 7, 8, 9]);
  const q = randomInt(6, 11);
  const r = randomInt(1, d - 1);
  const D = d * q + r;

  // Misconception case: r' >= d while d * q' + r' = D algebraically
  const qMis = q - 1;
  const rMis = r + d; // strictly >= d

  const stem = `در تقسیم عدد $${D}$ بر مقسوم‌علیه $${d}$، کدام تساوی نشان‌دهنده‌ی یک تقسیم «درست و کامل» است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${D} = (${d} \\times ${q}) + ${r}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `تساوی حسابی برقرار است و باقی‌مانده ($${r}$) از مقسوم‌علیه ($${d}$) کوچک‌تر است ($${r} < ${d}$).`,
    },
    {
      content: `$${D} = (${d} \\times ${qMis}) + ${rMis}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C03-03",
      rationale: `تساوی برقرار است اما شرط اساسی تقسیم نقض شده؛ باقی‌مانده ($${rMis}$) از مقسوم‌علیه ($${d}$) بزرگ‌تر است و تقسیم ادامه دارد.`,
    },
    {
      content: `$${D} = (${d} \\times ${q}) + ${d}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `باقی‌مانده برابر با مقسوم‌علیه شده و حاصل نیز با مقسوم برابر نیست.`,
    },
    {
      content: `$${D} = (${d} \\times ${q + 1}) + ${r}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `تساوی جبری نادرست است و حاصل سمت راست از مقسوم بزرگ‌تر می‌شود.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03-04");

  return {
    id: `ITEM-DYN-G4-C03-04-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C03-04",
    stem,
    difficulty: 0.5,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

/**
 * KC-MATH4-C03-05: اجرای الگوریتم تقسیم چندرقمی و مدیریت رقم صفر در خارج‌قسمت
 */
export function generateMultiDigitDivisionItem(index: number = 0): DiagnosticItemData {
  const d = randomChoice([3, 4, 5, 6]);
  const c = randomChoice([2, 3, 4]); // hundreds
  const u = randomChoice([4, 6, 8]); // units
  const q = c * 100 + u; // e.g. 206
  const D = d * q;

  const qNoZero = c * 10 + u; // e.g. 26 (omitted zero in tens)
  const qZeroEnd = c * 100 + u * 10; // e.g. 260
  const qSlip = q + 10; // e.g. 216

  const stem = `حاصل تقسیم $${D} \\div ${d}$ کدام است؟`;

  const rawDistractors: RawDistractorChoice[] = [
    {
      content: `$${q}$`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: چون رقم ده‌گان بر مقسوم‌علیه بخش‌پذیر نیست، رقم صفر در خارج‌قسمت قرار می‌گیرد و خارج‌قسمت $${q}$ می‌شود.`,
    },
    {
      content: `$${qNoZero}$`,
      isCorrect: false,
      misconceptionId: "MIS-MATH4-C03-05",
      rationale: `فراموش کردن ثبت رقم صفر در مرتبه ده‌گان خارج‌قسمت هنگام عدم امکان تقسیم رقم ده‌گان فرودآمده.`,
    },
    {
      content: `$${qZeroEnd}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطای ارزش مکانی و قرار دادن صفر در انتهای خارج‌قسمت به جای مرتبه میانی.`,
    },
    {
      content: `$${qSlip}$`,
      isCorrect: false,
      misconceptionId: null,
      rationale: `خطای محاسباتی در روند گام‌به‌گام تقسیم.`,
    },
  ];

  const distractors = finalizeDistractors(rawDistractors, "G4-C03-05");

  return {
    id: `ITEM-DYN-G4-C03-05-${Date.now()}-${index}`,
    kc_id: "KC-MATH4-C03-05",
    stem,
    difficulty: 0.48,
    guess_param: 0.25,
    slip_param: 0.1,
    visual_template: null,
    distractors,
  };
}

// -------------------------------------------------------------
// Master Dynamic Generator Registry
// -------------------------------------------------------------

export const DYNAMIC_GENERATORS: Record<string, (index?: number) => DiagnosticItemData> = {
  // Grade 4 Chapter 1: Numbers & Patterns
  "KC-MATH4-C01-01": generateMillionsNumberItem,
  "KC-MATH4-C01-02": generateExpandedFormItem,
  "KC-MATH4-C01-03": generatePatternMachineItem,
  "KC-MATH4-C01-04": generateComparisonNumberLineItem,
  "KC-MATH4-C01-05": generateRoundingEstimationItem,

  // Grade 4 Chapter 2: Fractions
  "KC-MATH4-C02-01": generateFractionConceptItem,
  "KC-MATH4-C02-02": generateEquivalentFractionItem,
  "KC-MATH4-C02-03": generateFractionComparisonItem,
  "KC-MATH4-C02-04": generateFractionAdditionItem,
  "KC-MATH4-C02-05": generateFractionNumberLineItem,

  // Grade 4 Chapter 3: Multiplication & Division
  "KC-MATH4-C03-01": generateAreaMultiplicationItem,
  "KC-MATH4-C03-02": generateVerticalMultiplicationItem,
  "KC-MATH4-C03-03": generateEstimationMultiplicationItem,
  "KC-MATH4-C03-04": generateDivisionVerificationItem,
  "KC-MATH4-C03-05": generateMultiDigitDivisionItem,

  // Grade 5 Chapter 3: Ratio, Proportion & Percentage
  "KC-MATH5-C03-01": generateRatioConceptItem,
  "KC-MATH5-C03-02": generateRatioEquivalenceItem,
  "KC-MATH5-C03-03": generateProportionTableItem,
  "KC-MATH5-C03-04": generateRatioSharingItem,
  "KC-MATH5-C03-05": generatePercentageItem,
};

/**
 * Generates N dynamic diagnostic items for a list of Knowledge Components.
 */
export function generateDynamicItemsForKCs(
  kcIds: string[],
  itemsPerKc: number = 3
): DiagnosticItemData[] {
  const items: DiagnosticItemData[] = [];
  for (const kcId of kcIds) {
    const generator = DYNAMIC_GENERATORS[kcId];
    if (generator) {
      for (let i = 0; i < itemsPerKc; i++) {
        items.push(generator(i));
      }
    }
  }
  return shuffle(items);
}
