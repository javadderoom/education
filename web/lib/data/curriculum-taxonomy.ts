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
  "SUBJ-MATH4-CH01": {
    id: "SUBJ-MATH4-CH01",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل اول: اعداد و الگوها",
    description: "شناخت و تعمیم الگوها، جدول ارزش مکانی، اعداد چندرقمی تا مرتبه میلیون و تقریب",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch1.json",
    chapters: [
      {
        id: "CH-MATH4-01",
        chapterNumber: 1,
        title: "فصل اول: اعداد و الگوها",
        categories: [
          {
            id: "CAT-G4-CH1-NUMBERS",
            title: "بخش ۱: عددنویسی و جدول ارزش مکانی",
            subtitle: "خواندن و نوشتن اعداد بزرگ تا طبقه میلیون و گسترده‌نویسی",
            description: "یادگیری ارزش مکانی ارقام و تفکیک طبقات یکی‌ها، هزارها و میلیون‌ها",
            topicIds: ["KC-MATH4-C01-01", "KC-MATH4-C01-02"],
          },
          {
            id: "CAT-G4-CH1-PATTERNS",
            title: "بخش ۲: الگوهای عددی و ماشین‌های ورودی-خروجی",
            subtitle: "کشف روابط الگوها و پیش‌بینی جملات بعدی",
            description: "تشخیص نظم‌های افزایشی و کاهشی و روابط بین ورودی و خروجی",
            topicIds: ["KC-MATH4-C01-03"],
          },
          {
            id: "CAT-G4-CH1-ORDER_ESTIMATION",
            title: "بخش ۳: مقایسه اعداد و محاسبات تقریبی",
            subtitle: "ترتیب‌بندی اعداد روی محور و روش گرد کردن",
            description: "مهارت مقایسه ارزش ارقام و برآورد تقریبی اعداد",
            topicIds: ["KC-MATH4-C01-04", "KC-MATH4-C01-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C01-01",
        title: "عددنویسی، خواندن و بازنمایی اعداد چندرقمی تا طبقه میلیون",
        shortTitle: "عددنویسی تا طبقه میلیون",
        description: "توانایی خواندن و نوشتن اعداد تا طبقه میلیون با رعایت دسته‌های سه‌تایی و استفاده صحیح از جدول ارزش مکانی",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH1-NUMBERS",
      },
      {
        id: "KC-MATH4-C01-02",
        title: "گسترده‌نویسی اعداد و تجزیه بر اساس ارزش مکانی ارقام",
        shortTitle: "گسترده‌نویسی و ارزش مکانی",
        description: "مهارت نمایش اعداد به صورت مجموع ارزش مکانی هر رقم و بازسازی عدد از روی شکل گسترده آن",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH1-NUMBERS",
      },
      {
        id: "KC-MATH4-C01-03",
        title: "کشف رابطه در الگوهای عددی، هندسی و ماشین‌های ورودی-خروجی",
        shortTitle: "الگوهای عددی و هندسی",
        description: "توانایی کشف قانون الگوهای متوالی، پیش‌بینی جمله‌های بعدی و تعیین عملکرد ماشین‌های محاسباتی ورودی-خروجی",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-CH1-PATTERNS",
      },
      {
        id: "KC-MATH4-C01-04",
        title: "مقایسه و ترتیب‌بندی اعداد بزرگ و نمایش آن‌ها روی محور اعداد",
        shortTitle: "مقایسه اعداد و محور",
        description: "مهارت مقایسه اعداد چندرقمی بر اساس تعداد ارقام و بالاترین مرتبه مکانی و مکان‌یابی تقریبی روی محور اعداد",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH1-ORDER_ESTIMATION",
      },
      {
        id: "KC-MATH4-C01-05",
        title: "محاسبات تقریبی و گرد کردن به نزدیک‌ترین مرتبه ده‌گان، صدگان و هزارگان",
        shortTitle: "محاسبات تقریبی و گرد کردن",
        description: "مهارت تقریب زدن اعداد با روش گرد کردن (بررسی رقم مرتبه کمتر) و تفکیک آن از روش قطع کردن در حل مسائل روزمره",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH1-ORDER_ESTIMATION",
      },
    ],
  },

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

  "SUBJ-MATH4-CH04": {
    id: "SUBJ-MATH4-CH04",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل چهارم: اندازه‌گیری",
    description: "شناخت و اندازه‌گیری زاویه‌ها با نقاله، تبدیل واحدهای زمان، طول، مساحت و حجم و گنجایش",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch4.json",
    chapters: [
      {
        id: "CH-MATH4-04",
        chapterNumber: 4,
        title: "فصل چهارم: اندازه‌گیری",
        categories: [
          {
            id: "CAT-G4-CH4-ANGLES",
            title: "بخش ۱: زاویه و کار با نقاله",
            subtitle: "شناخت انواع زاویه و خواندن درجه با نقاله",
            description: "تسلط بر تعیین زاویه راست، تند، باز و نیم‌صفحه با نقاله",
            topicIds: ["KC-MATH4-C04-01", "KC-MATH4-C04-02"],
          },
          {
            id: "CAT-G4-CH4-TIME_LENGTH",
            title: "بخش ۲: زمان، طول و سطح",
            subtitle: "تبدیل واحدهای زمان و مساحت مستطیل و مربع",
            description: "محاسبه زمان سپری‌شده و تفکیک مساحت از محیط",
            topicIds: ["KC-MATH4-C04-03", "KC-MATH4-C04-04"],
          },
          {
            id: "CAT-G4-CH4-VOLUME",
            title: "بخش ۳: حجم و گنجایش",
            subtitle: "فضای سه‌بعدی و واحدهای لیتر و میلی‌لیتر",
            description: "درک گنجایش مایعات و تبدیل لیتر به میلی‌لیتر",
            topicIds: ["KC-MATH4-C04-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C04-01",
        title: "شناخت مفهوم زاویه، نام‌گذاری رأس و اضلاع و طبقه‌بندی انواع زاویه",
        shortTitle: "مفهوم و انواع زاویه",
        description: "توانایی تشخیص دهانه‌ی بین دو نیم‌خط با رأس مشترک و دسته‌بندی زاویه‌ها به راست، تند، باز و نیم‌صفحه",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH4-ANGLES",
      },
      {
        id: "KC-MATH4-C04-02",
        title: "اندازه‌گیری و رسم دقیق زاویه با استفاده از نقاله و خواندن دو جهت مدرج",
        shortTitle: "اندازه‌گیری زاویه با نقاله",
        description: "مهارت قرار دادن مرکز نقاله روی رأس، انطباق خط صفر بر ضلع و خواندن زاویه از مقیاس مناسب داخلی یا خارجی",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH4-ANGLES",
      },
      {
        id: "KC-MATH4-C04-03",
        title: "اندازه‌گیری زمان، تبدیل واحدهای ثانیه، دقیقه، ساعت و محاسبه زمان سپری‌شده",
        shortTitle: "محاسبات زمان و تبدیل واحدها",
        description: "تسلط بر محاسبات زمانی در مبنای ۶۰، تبدیل ساعت به دقیقه و ثانیه و تعیین زمان آغاز، پایان یا مدت زمان یک فعالیت",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-CH4-TIME_LENGTH",
      },
      {
        id: "KC-MATH4-C04-04",
        title: "اندازه‌گیری طول و سطح، تبدیل واحدهای متداول و محاسبه مساحت مستطیل و مربع",
        shortTitle: "طول، سطح و مساحت",
        description: "مهارت تبدیل میلی‌متر، سانتی‌متر و متر و محاسبه مساحت مستطیل و مربع با فرمول‌های هندسی و تفکیک آن از محیط",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH4-TIME_LENGTH",
      },
      {
        id: "KC-MATH4-C04-05",
        title: "مفهوم حجم و گنجایش و تبدیل واحدهای لیتر و میلی‌لیتر (سی‌سی)",
        shortTitle: "حجم و گنجایش (لیتر)",
        description: "درک مفهوم فضای اشغال‌شده توسط اجسام سه‌بعدی و ظرفیت مایعات و استفاده از رابطه ۱ لیتر = ۱۰۰۰ میلی‌لیتر",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH4-VOLUME",
      },
    ],
  },

  "SUBJ-MATH4-CH05": {
    id: "SUBJ-MATH4-CH05",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل پنجم: عدد مخلوط و عدد اعشاری",
    description: "مفهوم عدد مخلوط، تبدیل کسر به عدد مخلوط و بالعکس، مفهوم اعشار، ارزش مکانی دهم و صدم و جمع و تفریق اعشاری",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch5.json",
    chapters: [
      {
        id: "CH-MATH4-05",
        chapterNumber: 5,
        title: "فصل پنجم: عدد مخلوط و اعشار",
        categories: [
          {
            id: "CAT-G4-CH5-MIXED",
            title: "بخش ۱: عدد مخلوط و تبدیل‌ها",
            subtitle: "مفهوم عدد مخلوط و تبدیل کسر بزرگتر از واحد",
            description: "تسلط بر نمایش بصری و تبدیل عددی کسر بزرگتر از واحد به عدد مخلوط و بالعکس",
            topicIds: ["KC-MATH4-C05-01", "KC-MATH4-C05-02"],
          },
          {
            id: "CAT-G4-CH5-DECIMAL_CONCEPTS",
            title: "بخش ۲: مفهوم و ارزش مکانی اعداد اعشاری",
            subtitle: "مرتبه‌های دهم و صدم و مقایسه اعشار",
            description: "ارتباط کسر با مخرج ۱۰ و ۱۰۰ با نماد ممیز و ترتیب‌بندی اعداد اعشاری",
            topicIds: ["KC-MATH4-C05-03", "KC-MATH4-C05-04"],
          },
          {
            id: "CAT-G4-CH5-DECIMAL_OPS",
            title: "بخش ۳: جمع و تفریق عددهای اعشاری",
            subtitle: "تراز کردن ستونی ممیز و اجرای محاسبات",
            description: "مهارت انجام عملیات جمع و تفریق اعشاری با حفظ مرتبه‌ها",
            topicIds: ["KC-MATH4-C05-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C05-01",
        title: "درک مفهوم عدد مخلوط به عنوان ترکیب واحد کامل و کسر کوچکتر از واحد",
        shortTitle: "مفهوم عدد مخلوط",
        description: "توانایی بازنمایی مقادیر بزرگتر از واحد کامل به صورت عدد مخلوط و نمایش بصری آن با اشکال هندسی یا محور اعداد",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH5-MIXED",
      },
      {
        id: "KC-MATH4-C05-02",
        title: "تبدیل کسرهای بزرگتر از واحد به عدد مخلوط و تبدیل معکوس عدد مخلوط به کسر",
        shortTitle: "تبدیل کسر و عدد مخلوط",
        description: "مهارت استفاده از تقسیم برای تعیین تعداد واحدهای کامل و کسر باقی‌مانده و تبدیل فرمولی عدد مخلوط به کسر نامتعارف",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH5-MIXED",
      },
      {
        id: "KC-MATH4-C05-03",
        title: "شناخت مفهوم عدد اعشاری با مخرج‌های ۱۰ و ۱۰۰ و نماد ممیز",
        shortTitle: "مفهوم عدد اعشاری و ممیز",
        description: "درک ارتباط کسر با مخرج ۱۰ و ۱۰۰ با مرتبه‌های دهم و صدم و نمایش آن با خط ممیز فارسی",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH5-DECIMAL_CONCEPTS",
      },
      {
        id: "KC-MATH4-C05-04",
        title: "جدول ارزش مکانی اعشاری و مقایسه عددهای اعشاری",
        shortTitle: "ارزش مکانی و مقایسه اعشار",
        description: "مهارت قرار دادن ارقام در جدول ارزش مکانی اعشاری و مقایسه اندازه دو عدد اعشاری با بررسی رقم به رقم از بزرگترین مرتبه",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH5-DECIMAL_CONCEPTS",
      },
      {
        id: "KC-MATH4-C05-05",
        title: "جمع و تفریق عددهای اعشاری با تراز کردن خط ممیز",
        shortTitle: "جمع و تفریق اعشاری",
        description: "تسلط بر چینش ستونی اعداد اعشاری بر اساس ممیز، موازنه‌سازی مرتبه‌ها با صفر و اجرای جمع و تفریق با حفظ موقعیت ممیز",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-CH5-DECIMAL_OPS",
      },
    ],
  },

  "SUBJ-MATH4-CH06": {
    id: "SUBJ-MATH4-CH06",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل ششم: شکل‌های هندسی",
    description: "شناخت خطوط موازی و متقاطع، ویژگی‌های چهارضلعی‌ها، رسم ارتفاع و قاعده و مساحت متوازی‌الاضلاع و مثلث",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch6.json",
    chapters: [
      {
        id: "CH-MATH4-06",
        chapterNumber: 6,
        title: "فصل ششم: شکل‌های هندسی",
        categories: [
          {
            id: "CAT-G4-CH6-LINES_QUADS",
            title: "بخش ۱: خطوط و چهارضلعی‌ها",
            subtitle: "خطوط موازی و عمود و ویژگی‌های خانواده چهارضلعی‌ها",
            description: "تشخیص خطوط موازی و متقاطع و خواص اضلاع، زاویه‌ها و قطرهای متوازی‌الاضلاع، لوزی و ذوزنقه",
            topicIds: ["KC-MATH4-C06-01", "KC-MATH4-C06-02"],
          },
          {
            id: "CAT-G4-CH6-ALTITUDE_BASE",
            title: "بخش ۲: ارتفاع و قاعده متناظر",
            subtitle: "رسم خطوط عمود در متوازی‌الاضلاع و انواع مثلث",
            description: "مهارت رسم خط عمود از رأس بر امتداد ضلع با گونیا و تشخیص قاعده و ارتفاع مربوطه",
            topicIds: ["KC-MATH4-C06-03"],
          },
          {
            id: "CAT-G4-CH6-AREAS",
            title: "بخش ۳: مساحت متوازی‌الاضلاع و مثلث",
            subtitle: "فرمول مساحت و حل مسائل کاربردی هندسی",
            description: "محاسبه مساحت با تبدیل اشکال به مستطیل معادل و تفکیک مساحت مثلث از متوازی‌الاضلاع",
            topicIds: ["KC-MATH4-C06-04", "KC-MATH4-C06-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C06-01",
        title: "تشخیص و رسم خطوط موازی، متقاطع و عمود بر هم با گونیا و خط‌کش",
        shortTitle: "خطوط موازی و متقاطع",
        description: "توانایی تشخیص فاصله ثابت خطوط موازی و استفاده از گونیا برای رسم یا احراز زاویه قائمه بین خطوط عمود بر هم",
        bloomLevel: "understand",
        pedagogicalLevel: "درک مفهومی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH6-LINES_QUADS",
      },
      {
        id: "KC-MATH4-C06-02",
        title: "شناخت ویژگی‌ها و روابط خانواده چهارضلعی‌ها (متوازی‌الاضلاع، لوزی، مستطیل، مربع و ذوزنقه)",
        shortTitle: "ویژگی‌های چهارضلعی‌ها",
        description: "تسلط بر ویژگی‌های اضلاع، زاویه‌ها و قطرهای چهارضلعی‌ها و روابط شمول (مانند مربع به عنوان حالت خاص لوزی و مستطیل)",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 5,
        categoryId: "CAT-G4-CH6-LINES_QUADS",
      },
      {
        id: "KC-MATH4-C06-03",
        title: "تشخیص و رسم ارتفاع و قاعده متناظر در متوازی‌الاضلاع و انواع مثلث",
        shortTitle: "ارتفاع و قاعده متناظر",
        description: "مهارت رسم خط عمود از یک رأس یا ضلع مقابل بر امتداد قاعده و تعیین جفت صحیح قاعده و ارتفاع متناظر",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH6-ALTITUDE_BASE",
      },
      {
        id: "KC-MATH4-C06-04",
        title: "محاسبه مساحت متوازی‌الاضلاع با تبدیل به مستطیل معادل (قاعده × ارتفاع)",
        shortTitle: "مساحت متوازی‌الاضلاع",
        description: "درک برابری مساحت متوازی‌الاضلاع با مستطیل هم‌قاعده و هم‌ارتفاع و محاسبه عددی مساحت آن",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH6-AREAS",
      },
      {
        id: "KC-MATH4-C06-05",
        title: "محاسبه مساحت مثلث به عنوان نصف متوازی‌الاضلاع هم‌قاعده و هم‌ارتفاع",
        shortTitle: "مساحت انواع مثلث",
        description: "مهارت محاسبه مساحت انواع مثلث با فرمول (قاعده × ارتفاع) تقسیم بر ۲ و تفکیک آن از مساحت متوازی‌الاضلاع",
        bloomLevel: "apply",
        pedagogicalLevel: "محاسباتی و کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH6-AREAS",
      },
    ],
  },

  "SUBJ-MATH4-CH07": {
    id: "SUBJ-MATH4-CH07",
    gradeLevel: 4,
    title: "ریاضی چهارم ابتدایی",
    chapterTitle: "فصل هفتم: آمار و احتمال",
    description: "جمع‌آوری داده‌ها و خط‌نشان، رسم و تفسیر نمودار ستونی، خط شکسته، نمودار دایره‌ای و ارزیابی شانس و احتمال وقوع پیشامدها",
    themeColor: "indigo",
    cartridgeFile: "grade4_math_ch7.json",
    chapters: [
      {
        id: "CH-MATH4-07",
        chapterNumber: 7,
        title: "فصل هفتم: آمار و احتمال",
        categories: [
          {
            id: "CAT-G4-CH7-TABLES_BAR",
            title: "بخش ۱: جدول داده‌ها و نمودار ستونی",
            subtitle: "سازماندهی داده‌ها با خط‌نشان و مقایسه مقادیر با نمودار ستونی",
            description: "مهارت جمع‌آوری نظام‌مند داده‌ها، رسم جدول و قرائت صحیح مقیاس‌های نمودار ستونی",
            topicIds: ["KC-MATH4-C07-01", "KC-MATH4-C07-02"],
          },
          {
            id: "CAT-G4-CH7-LINE_PIE",
            title: "بخش ۲: نمودار خط شکسته و دایره‌ای",
            subtitle: "بررسی تغییرات در طول زمان و تحلیل سهم‌های کسری در دایره",
            description: "تسلط بر ثبت داده‌های پیوسته زمانی با خط شکسته و تطبیق بخش‌های دایره با کسر از کل",
            topicIds: ["KC-MATH4-C07-03", "KC-MATH4-C07-04"],
          },
          {
            id: "CAT-G4-CH7-PROBABILITY",
            title: "بخش ۳: مفهوم احتمال و شانس",
            subtitle: "پیشامدهای حتمی، ممکن و غیرممکن و شانس برابر",
            description: "ارزیابی شانس رخداد در آزمایش‌های تصادفی مانند چرخنده، تاس و کیسه مهره‌ها",
            topicIds: ["KC-MATH4-C07-05"],
          },
        ],
      },
    ],
    topics: [
      {
        id: "KC-MATH4-C07-01",
        title: "جمع‌آوری و سازماندهی داده‌ها با جدول داده و خط‌نشان",
        shortTitle: "جدول داده‌ها و خط‌نشان",
        description: "مهارت گردآوری نظام‌مند اطلاعات خام، استفاده از خط‌نشان‌های پنج‌تایی و انتقال دقیق آن به جدول فراوانی داده‌ها",
        bloomLevel: "apply",
        pedagogicalLevel: "کاربردی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH7-TABLES_BAR",
      },
      {
        id: "KC-MATH4-C07-02",
        title: "رسم، خواندن و تحلیل نمودار ستونی برای مقایسه داده‌ها",
        shortTitle: "نمودار ستونی و مقیاس‌ها",
        description: "توانایی نام‌گذاری محورها، تعیین مقیاس مناسب، خواندن ارتفاع ستون‌ها و مقایسه بیشترین و کمترین مقادیر در نمودار ستونی",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH7-TABLES_BAR",
      },
      {
        id: "KC-MATH4-C07-03",
        title: "رسم و تفسیر نمودار خط شکسته برای بررسی تغییرات در طول زمان",
        shortTitle: "نمودار خط شکسته و روند زمانی",
        description: "درک کاربرد نمودار خط شکسته در نمایش روند صعودی، نزولی یا ثبات پدیده‌ها (دما، رشد، بارش) در بازه‌های زمانی متوالی",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH7-LINE_PIE",
      },
      {
        id: "KC-MATH4-C07-04",
        title: "درک و تحلیل نمودار دایره‌ای با رویکرد جزء به کل (کسری)",
        shortTitle: "نمودار دایره‌ای و سهم کسری",
        description: "مهارت تطبیق بخش‌های زاویه‌ای دایره با کسر داده‌ها از کل و مقایسه سهم هر دسته‌بندی در یک نگاه کلی",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و تفسیری",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH7-LINE_PIE",
      },
      {
        id: "KC-MATH4-C07-05",
        title: "ارزیابی احتمال وقوع پیشامدها و مفهوم شانس برابر",
        shortTitle: "احتمال و شانس وقوع پیشامد",
        description: "تشخیص پیشامدهای حتمی، غیرممکن، یا ممکن با شانس برابر یا نابرابر در پدیده‌های تصادفی (چرخنده‌ها، کیسه مهره‌ها و تاس)",
        bloomLevel: "analyze",
        pedagogicalLevel: "تحلیلی و ارزیابی",
        itemCount: 3,
        estimatedMinutes: 4,
        categoryId: "CAT-G4-CH7-PROBABILITY",
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
  const s = (subjectId || "").toUpperCase();
  if (s.includes("CH01") || s.includes("CH1") || s.includes("PATTERN") || s.includes("NUMBER")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH01"];
  }
  if (s.includes("CH03") || s.includes("CH3") || s.includes("MULT") || s.includes("DIV")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH03"];
  }
  if (s.includes("CH04") || s.includes("CH4") || s.includes("MEASUR") || s.includes("ANGLE")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH04"];
  }
  if (s.includes("CH05") || s.includes("CH5") || s.includes("DECIMAL") || s.includes("MIXED")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH05"];
  }
  if (s.includes("CH06") || s.includes("CH6") || s.includes("GEOM") || s.includes("SHAPE")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH06"];
  }
  if (s.includes("CH07") || s.includes("CH7") || s.includes("STAT") || s.includes("PROB")) {
    return CANONICAL_TAXONOMIES["SUBJ-MATH4-CH07"];
  }
  if (s.includes("MATH5") || s.includes("RATIO") || s.includes("PERCENT") || s.includes("GRADE5") || s === "5") {
    return CANONICAL_TAXONOMIES["SUBJ-MATH5-RATIO"];
  }
  return CANONICAL_TAXONOMIES["SUBJ-MATH4-FRACTIONS"];
}

/**
 * Helper to get list of all available subjects for the course switcher.
 */
export function getAllAvailableTaxonomies(): SubjectTaxonomy[] {
  return Object.values(CANONICAL_TAXONOMIES);
}

/**
 * Returns all subjects belonging to a specific grade level.
 */
export function getSubjectsByGrade(grade: number): SubjectTaxonomy[] {
  return Object.values(CANONICAL_TAXONOMIES).filter((s) => s.gradeLevel === grade);
}

/**
 * Returns distinct available grade levels in the curriculum.
 */
export function getAvailableGrades(): number[] {
  return Array.from(new Set(Object.values(CANONICAL_TAXONOMIES).map((s) => s.gradeLevel))).sort();
}
