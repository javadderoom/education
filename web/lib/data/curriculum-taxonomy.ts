export interface TopicMetadata {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  bloomLevel: "understand" | "apply" | "analyze";
  pedagogicalLevel: string; // e.g. "درک مفهومی", "محاسباتی و کاربردی", "تحلیلی و تفسیری"
  itemCount: number;
  estimatedMinutes: number;
  categoryId: string;
}

export interface TopicCategory {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  topicIds: string[];
}

export interface SyllabusChapter {
  id: string;
  chapterNumber: number;
  title: string;
  categories: TopicCategory[];
}

export interface SubjectTaxonomy {
  id: string;
  gradeLevel: number;
  title: string;
  chapterTitle: string;
  description: string;
  themeColor: "indigo" | "emerald";
  cartridgeFile: string;
  chapters: SyllabusChapter[];
  topics: TopicMetadata[];
}

export const CANONICAL_TAXONOMIES: Record<string, SubjectTaxonomy> = {
  "SUBJ-MATH4-FRACTIONS": {
    id: "SUBJ-MATH4-FRACTIONS",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل دوم: مفهوم و محاسبات کسرها",
    description: "شناخت مفهوم جزء از کل، تساوی کسرها، مقایسه، جمع و تفریق هم‌مخرج و نمایش روی محور",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch2.json",
    chapters: [
      {
        id: "CH-MATH4-02",
        chapterNumber: 2,
        title: "فصل دوم: کسرها",
        categories: [
          {
            id: "CAT-G4-FOUNDATIONS",
            title: "بخش ۱: مبانی و شناخت کسر",
            subtitle: "مفاهیم پایه، درک جزء از کل و تساوی کسرها",
            description: "آشنایی با مفهوم واحد، قطعات برابر و ساده‌کردن کسرها",
            topicIds: ["KC-MATH4-C02-01", "KC-MATH4-C02-02"],
          },
          {
            id: "CAT-G4-OPERATIONS",
            title: "بخش ۲: مقایسه و محاسبات کسرها",
            subtitle: "سنجش اندازه و انجام عملیات جمع و تفریق",
            description: "مهارت مقایسه کسرها و انجام محاسبات با مخرج مشترک",
            topicIds: ["KC-MATH4-C02-03", "KC-MATH4-C02-04"],
          },
          {
            id: "CAT-G4-VISUAL",
            title: "بخش ۳: تجسم و محور اعداد",
            subtitle: "نمایش هندسی کسرها و اعداد مخلوط",
            description: "تطبیق مفهوم عددی کسر با فاصله‌های مساوی روی خط محور",
            topicIds: ["KC-MATH4-C02-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C02-01",
        title: "شناخت مفهوم کسر به عنوان رابطه جزء از کل و تفکیک واحد",
        shortTitle: "مفهوم جزء از کل و واحد کامل",
        description: "توانایی بیان کسر به عنوان بخش‌های برابر رنگ‌شده یا انتخاب‌شده از یک کل واحد",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-FOUNDATIONS",
      },
      {
        id: "KC-MATH4-C02-02",
        title: "شناخت و تولید کسرهای مساوی با ضرب یا تقسیم صورت و مخرج",
        shortTitle: "کسرهای مساوی و ساده‌کردن",
        description: "تشخیص تساوی کسرها و ریزتر یا درشت‌تر شدن تقسیم‌بندی بدون تغییر مقدار کسر",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-FOUNDATIONS",
      },
      {
        id: "KC-MATH4-C02-03",
        title: "مقایسه کسرها با مخرج‌های مساوی یا نامساوی و درک اندازه نسبی",
        shortTitle: "مقایسه و سنجش اندازه کسرها",
        description: "درک اندازه نسبی کسرها بر مبنای واحد یکسان و مقایسه بر اساس صورت و مخرج",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-OPERATIONS",
      },
      {
        id: "KC-MATH4-C02-04",
        title: "جمع و تفریق کسرهای هم‌مخرج و هم‌مخرج کردن کسرها",
        shortTitle: "جمع و تفریق کسرهای هم‌مخرج",
        description: "محاسبه دقیق حاصل جمع و تفریق صورت‌ها با حفظ مخرج مشترک و تبدیل کسرها",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-OPERATIONS",
      },
      {
        id: "KC-MATH4-C02-05",
        title: "نمایش کسرها و اعداد مخلوط روی محور اعداد",
        shortTitle: "کسر و عدد مخلوط روی محور اعداد",
        description: "تقسیم دقیق فواصل بین اعداد صحیح روی محور به بخش‌های برابر و مکان‌یابی کسرها",
        bloomLevel: "apply",
        pedagogicalLevel: "هندسی و تجسمی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-VISUAL",
      },
    ],
  },

  "SUBJ-MATH4-CH03": {
    id: "SUBJ-MATH4-CH03",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل سوم: ضرب و تقسیم",
    description: "مفهوم ضرب مساحتی، الگوریتم تکنیکی، تخمین و محاسبات تقریبی، شرط باقی‌مانده و تقسیم چندرقمی",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch3.json",
    chapters: [
      {
        id: "CH-MATH4-03",
        chapterNumber: 3,
        title: "فصل سوم: ضرب و تقسیم",
        categories: [
          {
            id: "CAT-G4-CH3-MULTIPLICATION",
            title: "بخش ۱: الگوها و الگوریتم‌های ضرب",
            subtitle: "مساحت مستطیل‌ها، گسترده‌نویسی و ضرب ستونی تکنیکی",
            description: "یادگیری ضرب مساحتی و رعایت ارزش مکانی در ضرب ستونی",
            topicIds: ["KC-MATH4-C03-01", "KC-MATH4-C03-02"],
          },
          {
            id: "CAT-G4-CH3-DIVISION",
            title: "بخش ۲: مفهوم و الگوریتم‌های تقسیم",
            subtitle: "روابط درستی تقسیم، شرط باقی‌مانده و صفر در خارج‌قسمت",
            description: "تسلط بر آزمون‌های درستی تقسیم و ثبت صحیح صفر خارج‌قسمت",
            topicIds: ["KC-MATH4-C03-04", "KC-MATH4-C03-05"],
          },
          {
            id: "CAT-G4-CH3-ESTIMATION",
            title: "بخش ۳: تخمین و محاسبات تقریبی",
            subtitle: "گرد کردن عامل‌ها و برآورد سریع پاسخ در زندگی روزمره",
            description: "برآورد سریع حاصل ضرب و تقسیم با حفظ مرتبه‌ها",
            topicIds: ["KC-MATH4-C03-03"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C03-01",
        title: "درک مفهوم ضرب دو عدد دو رقمی با الگوی مساحت و گسترده‌نویسی",
        shortTitle: "ضرب مساحتی و الگوی مستطیلی",
        description: "توانایی تقطیع دو عامل ضرب به دهگان و یکان و محاسبه مساحت مستطیل‌های فرعی",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH3-MULTIPLICATION",
      },
      {
        id: "KC-MATH4-C03-02",
        title: "اجرای الگوریتم ستونی و تکنیکی ضرب با حفظ ارزش مکانی",
        shortTitle: "ضرب تکنیکی و ستونی دو رقمی",
        description: "تسلط بر اجرای مرحله‌به‌مرحله ضرب عمودی و درج صفر ارزش مکانی دهگان",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH3-MULTIPLICATION",
      },
      {
        id: "KC-MATH4-C03-03",
        title: "تخمین و محاسبه‌ی تقریبی در ضرب و تقسیم",
        shortTitle: "تخمین و محاسبه تقریبی",
        description: "مهارت گرد کردن عامل‌ها به نزدیک‌ترین دهگان و برآورد ذهنی حاصل‌ضرب",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH3-ESTIMATION",
      },
      {
        id: "KC-MATH4-C03-04",
        title: "درک رابطه‌های درستی تقسیم و شرط باقی‌مانده",
        shortTitle: "روابط درستی تقسیم و شرط باقی‌مانده",
        description: "برابری مقسوم با حاصل‌ضرب مقسوم‌علیه در خارج‌قسمت به علاوه باقی‌مانده و شرط باقی‌مانده",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH3-DIVISION",
      },
      {
        id: "KC-MATH4-C03-05",
        title: "اجرای الگوریتم تقسیم چندرقمی و مدیریت رقم صفر در خارج‌قسمت",
        shortTitle: "الگوریتم تقسیم و صفر در خارج‌قسمت",
        description: "تقسیم مرحله‌ای و ثبت صفر در خارج‌قسمت هنگام عدم بخش‌پذیری رقم فرودآمده",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-CH3-DIVISION",
      },
    ],
  },

  "SUBJ-MATH5-RATIO": {
    id: "SUBJ-MATH5-RATIO",
    gradeLevel: 5,
    title: "ریاضی پنجم ابتدایی",
    chapterTitle: "فصل سوم: نسبت، تناسب و درصد",
    description: "مفهوم نسبت، نسبت‌های مساوی، جدول تناسب، حل مسائل تسهیم به نسبت و محاسبات درصد و تخفیف",
    themeColor: "emerald",
    cartridgeFile: "grade5_math_ch3.json",
    chapters: [
      {
        id: "CH-MATH5-03",
        chapterNumber: 3,
        title: "فصل سوم: نسبت، تناسب و درصد",
        categories: [
          {
            id: "CAT-G5-RATIO_CONCEPTS",
            title: "بخش ۱: شناخت نسبت و روابط تناسبی",
            subtitle: "مفاهیم اولیه نسبت، مقایسه کمیت‌ها و نسبت‌های مساوی",
            description: "یادگیری مقایسه ضربی بین مقادیر و تفکیک نسبت از کسر معمولی",
            topicIds: ["KC-MATH5-C03-01", "KC-MATH5-C03-02"],
          },
          {
            id: "CAT-G5-TABLES_SHARING",
            title: "بخش ۲: جدول تناسب و مسائل تسهیم",
            subtitle: "محاسبات جدول تناسب و تقسیم عادلانه به نسبت",
            description: "استفاده از ضریب تناسب، ضرب متقاطع و حل مسائل کاربردی روزمره",
            topicIds: ["KC-MATH5-C03-03", "KC-MATH5-C03-04"],
          },
          {
            id: "CAT-G5-PERCENTAGE",
            title: "بخش ۳: درصد و کاربردهای مالی",
            subtitle: "محاسبه درصد، سود و تخفیف‌های کاربردی",
            description: "درک نسبت بر مبنای ۱۰۰ و حل مسائل درصد در زندگی واقعی",
            topicIds: ["KC-MATH5-C03-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH5-C03-01",
        title: "درک مفهوم نسبت به عنوان مقایسه دو کمیت و تفکیک آن از کسر ساده",
        shortTitle: "مفهوم نسبت و مقایسه دو کمیت",
        description: "توانایی بیان و نمایش رابطه بین دو کمیت با رعایت ترتیب و بدون وابستگی به واحد",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G5-RATIO_CONCEPTS",
      },
      {
        id: "KC-MATH5-C03-02",
        title: "شناخت و تولید نسبت‌های مساوی و مفهوم تناسب",
        shortTitle: "نسبت‌های مساوی و مفهوم تناسب",
        description: "درک تساوی دو نسبت به عنوان تناسب و تغییر همزمان کمیت‌ها با ضرب یا تقسیم",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G5-RATIO_CONCEPTS",
      },
      {
        id: "KC-MATH5-C03-03",
        title: "جدول تناسب، ضریب تناسب و روش‌های حل (ضرب متقاطع)",
        shortTitle: "جدول تناسب و روش‌های حل",
        description: "تشکیل جدول تناسب، کشف رابطه بین سطرها یا ستون‌ها و محاسبه مقدار مجهول",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G5-TABLES_SHARING",
      },
      {
        id: "KC-MATH5-C03-04",
        title: "نسبت‌های چندتایی و حل مسایل تسهیم به نسبت",
        shortTitle: "تسهیم به نسبت و مسائل کاربردی",
        description: "تقسیم یک مقدار کل بین چند جزء بر اساس نسبت‌های معین و استفاده از سطر مجموع",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و حل مسئله",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G5-TABLES_SHARING",
      },
      {
        id: "KC-MATH5-C03-05",
        title: "مفهوم درصد به عنوان نسبت با مخرج ۱۰۰ و تبدیل کسر به درصد",
        shortTitle: "درصد، سود و تخفیف",
        description: "درک درصد به عنوان نسبت بر پایه ۱۰۰ و توانایی تبدیل کسرها به درصد و محاسبه سود و تخفیف",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی و مالی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G5-PERCENTAGE",
      },
    ],
  },
};

/**
 * Returns the subject taxonomy or defaults to Grade 4 Fractions.
 */
export function getSubjectTaxonomy(subjectId: string): SubjectTaxonomy {
  if (CANONICAL_TAXONOMIES[subjectId]) {
    return CANONICAL_TAXONOMIES[subjectId];
  }
  if (subjectId.includes("5") || subjectId.toLowerCase().includes("ratio")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH5-RATIO"];
  }
  if (subjectId.includes("CH03") || subjectId.includes("CH3") || subjectId.toLowerCase().includes("mult") || subjectId.toLowerCase().includes("div")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH03"];
  }
  return CANONICAL_TAXONOMIES["SUBJ-MATH4-FRACTIONS"];
}

/**
 * Helper to get list of all available subjects for the course switcher.
 */
export function getAllAvailableTaxonomies(): SubjectTaxonomy[] {
  return Object.values(CANONICAL_TAXONOMIES);
}
