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

// -------------------------------------------------------------
// Grade 4 Generators
// -------------------------------------------------------------

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
  const rawDistractors: Array<{ content: string; isCorrect: boolean; misconceptionId: string | null; rationale: string }> = [
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

  // Remove potential duplicates and shuffle
  const uniqueDistractors: typeof rawDistractors = [];
  const seen = new Set<string>();
  for (const d of rawDistractors) {
    if (!seen.has(d.content)) {
      seen.add(d.content);
      uniqueDistractors.push(d);
    }
  }

  const shuffled = shuffle(uniqueDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-C01-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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

  const rawDistractors = [
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

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-C02-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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

  const rawDistractors = [
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

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-C03-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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
  const a = randomInt(1, Math.floor(den / 2));
  const b = randomInt(1, den - a - 1);
  const correctSum = a + b;

  const stem = `حاصل جمع دو کسر $\\frac{${a}}{${den}} + \\frac{${b}}{${den}}$ کدام است؟`;

  const rawDistractors = [
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
      content: `$\\frac{${a * b}}{${den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-MUL-INSTEAD-ADD",
      rationale: `ضرب کردن صورت‌ها به جای عمل جمع (${toPersianDigits(a)} × ${toPersianDigits(b)}).`,
    },
    {
      content: `$\\frac{${Math.abs(a - b) || 1}}{${den}}$`,
      isCorrect: false,
      misconceptionId: "MIS-SUB-INSTEAD-ADD",
      rationale: `تفریق صورت‌ها به جای جمع کردن آن‌ها.`,
    },
  ];

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-C04-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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

  const rawDistractors = [
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

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-C05-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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
  const countB = randomInt(3, 8);

  const stem = `در یک سبد $${countA}$ عدد ${objA} و $${countB}$ عدد ${objB} قرار دارد. نسبت تعداد ${objA}ها به تعداد ${objB}ها کدام است؟`;

  const rawDistractors = [
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

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-G5-C01-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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

  const stem = `نسبت $\\frac{${a}}{${b}}$ با کدام یک از نسبت‌های زیر مساوی است و تشکیل یک تناسب می‌دهد؟`;

  const rawDistractors = [
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

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-G5-C02-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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
        rightLabel: `${a * mult}:${b * mult}`,
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
  const targetA = knownA + randomChoice([2, 3, 4]);
  const correctTargetB = targetA * rate;

  const stem = `یک اتومبیل در هر $${knownA}$ ساعت، مسافت $${knownB}$ کیلومتر را طی می‌کند. با همین سرعت، این اتومبیل در $${targetA}$ ساعت چند کیلومتر را طی خواهد کرد؟`;

  const additiveWrong = knownB + (targetA - knownA);
  const diffHours = targetA - knownA;

  const rawDistractors = [
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
      content: `$${knownB * 2}$ کیلومتر`,
      isCorrect: false,
      misconceptionId: "MIS-DOUBLE-BIAS",
      rationale: `دو برابر کردن مسافت بدون توجه به نسبت ساعت‌های واقعی.`,
    },
    {
      content: `$${correctTargetB - rate}$ کیلومتر`,
      isCorrect: false,
      misconceptionId: "MIS-CALCULATION",
      rationale: `خطای محاسباتی در ضرب ضریب تناسب.`,
    },
  ];

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-G5-C03-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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
  const ratioB = randomChoice([3, 4, 5]);
  const totalRatio = ratioA + ratioB;
  const unitValue = randomChoice([10000, 20000, 50000]);
  const totalMoney = totalRatio * unitValue;
  const correctShareA = ratioA * unitValue;

  const stem = `${nameA} و ${nameB} مبلغ $${totalMoney.toLocaleString("fa-IR")}$ تومان را به نسبت $${ratioA}$ به $${ratioB}$ بین خود تقسیم می‌کنند. سهم ${nameA} چقدر است؟`;

  const rawDistractors = [
    {
      content: `$${correctShareA.toLocaleString("fa-IR")}$ تومان`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: مجموع نسبت‌ها ${toPersianDigits(totalRatio)} است و ارزش هر سهم ${toPersianDigits(unitValue)} تومان است (${toPersianDigits(ratioA)} × ${toPersianDigits(unitValue)}).`,
    },
    {
      content: `$${(totalMoney / 2).toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-EQUAL-SPLIT",
      rationale: `تقسیم مساوی بر ۲ بدون توجه به نسبت‌های تسهیم (${toPersianDigits(ratioA)} به ${toPersianDigits(ratioB)}).`,
    },
    {
      content: `$${(ratioB * unitValue).toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-PARTNER-SHARE",
      rationale: `محاسبه سهم نفر دوم به جای نفر اول.`,
    },
    {
      content: `$${(totalMoney / ratioA).toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-DIVIDE-BY-RATIO",
      rationale: `تقسیم کل پول بر نسبت فرد اول بدون محاسبه سطر مجموع نسبت‌ها.`,
    },
  ];

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-G5-C04-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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

  const stem = `یک کالای $${originalPrice.toLocaleString("fa-IR")}$ تومانی دارای $${percent}$٪ تخفیف است. قیمت نهایی پرداختی چقدر است؟`;

  const rawDistractors = [
    {
      content: `$${finalPrice.toLocaleString("fa-IR")}$ تومان`,
      isCorrect: true,
      misconceptionId: null,
      rationale: `پاسخ صحیح: تخفیف ${toPersianDigits(discountAmount)} تومان است و قیمت نهایی ${toPersianDigits(originalPrice)} - ${toPersianDigits(discountAmount)} = ${toPersianDigits(finalPrice)} تومان می‌شود.`,
    },
    {
      content: `$${discountAmount.toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-DISCOUNT-AS-PRICE",
      rationale: `اشتباه گرفتن مقدار تخفیف به جای قیمت نهایی کالا.`,
    },
    {
      content: `$${(originalPrice - percent).toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-PERCENT-AS-ABSOLUTE",
      rationale: `کسر کردن مستقیم عدد درصد (${toPersianDigits(percent)}) از قیمت کل به جای محاسبه نسبت درصدی.`,
    },
    {
      content: `$${(originalPrice + discountAmount).toLocaleString("fa-IR")}$ تومان`,
      isCorrect: false,
      misconceptionId: "MIS-ADD-DISCOUNT",
      rationale: `اضافه کردن مبلغ تخفیف به جای کسر آن.`,
    },
  ];

  const shuffled = shuffle(rawDistractors);
  const distractors: DistractorItem[] = shuffled.map((d, i) => ({
    id: `DIS-DYN-G5-C05-${Date.now()}-${i}`,
    label: LABELS[i],
    content: d.content,
    is_correct: d.isCorrect,
    misconception_id: d.misconceptionId,
    rationale: d.rationale,
  }));

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
// Master Dynamic Generator Registry
// -------------------------------------------------------------

export const DYNAMIC_GENERATORS: Record<string, (index?: number) => DiagnosticItemData> = {
  "KC-MATH4-C02-01": generateFractionConceptItem,
  "KC-MATH4-C02-02": generateEquivalentFractionItem,
  "KC-MATH4-C02-03": generateFractionComparisonItem,
  "KC-MATH4-C02-04": generateFractionAdditionItem,
  "KC-MATH4-C02-05": generateFractionNumberLineItem,
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
