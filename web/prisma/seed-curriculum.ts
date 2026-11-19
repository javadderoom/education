import { prisma } from "../lib/db/prisma";

export async function seedCurriculumFrameworksAndNodes() {
  console.log("\n======================================================");
  console.log("Seeding Universal Curriculum Frameworks & Hierarchies...");
  console.log("======================================================");

  // 1. Framework 1: K-12 Schools (مدارس آموزش و پرورش)
  const k12Tiers = [
    { depth: 1, key: "grade", title: "پایه تحصیلی", singular: "پایه", placeholder: "مثال: پایه چهارم ابتدایی" },
    { depth: 2, key: "book", title: "کتاب / عنوان درس", singular: "کتاب", placeholder: "مثال: ریاضی چهارم" },
    { depth: 3, key: "chapter", title: "فصل / بخش", singular: "فصل", placeholder: "مثال: فصل دوم: کسرها" },
    { depth: 4, key: "lesson", title: "درس / سرفصل آموزشی", singular: "درس", placeholder: "مثال: درس اول: شناخت کسر" }
  ];

  const frameworkK12 = await prisma.curriculumFramework.upsert({
    where: { code: "k12" },
    update: {
      name: "مدارس آموزش و پرورش",
      description: "ساختار رسمی آموزش ابتدایی و متوسطه بر مبنای پایه‌ها و کتاب‌های درسی مصوب وزارت آموزش و پرورش",
      isDefault: true,
      tierDefinitions: k12Tiers,
    },
    create: {
      id: "FRAMEWORK-K12",
      code: "k12",
      name: "مدارس آموزش و پرورش",
      description: "ساختار رسمی آموزش ابتدایی و متوسطه بر مبنای پایه‌ها و کتاب‌های درسی مصوب وزارت آموزش و پرورش",
      isDefault: true,
      tierDefinitions: k12Tiers,
    },
  });

  // 2. Framework 2: Higher Education & Universities (آموزش عالی و دانشگاه‌ها)
  const universityTiers = [
    { depth: 1, key: "major_year", title: "مقطع و رشته", singular: "رشته/مقطع", placeholder: "مثال: کارشناسی مهندسی کامپیوتر" },
    { depth: 2, key: "course", title: "درس دانشگاهی", singular: "درس", placeholder: "مثال: ریاضی عمومی ۱" },
    { depth: 3, key: "syllabus_unit", title: "سرفصل مصوب", singular: "سرفصل", placeholder: "مثال: حد، پیوستگی و مشتق" },
    { depth: 4, key: "lecture", title: "جلسه / مبحث علمی", singular: "جلسه", placeholder: "مثال: جلسه ۴: مشتق توابع معکوس" }
  ];

  const frameworkUniversity = await prisma.curriculumFramework.upsert({
    where: { code: "university" },
    update: {
      name: "آموزش عالی و دانشگاه‌ها",
      description: "ساختار سرفصل‌های مصوب وزارت علوم، تحقیقات و فناوری برای رشته‌ها، دروس دانشگاهی و جلسات تدریس",
      isDefault: false,
      tierDefinitions: universityTiers,
    },
    create: {
      id: "FRAMEWORK-UNIVERSITY",
      code: "university",
      name: "آموزش عالی و دانشگاه‌ها",
      description: "ساختار سرفصل‌های مصوب وزارت علوم، تحقیقات و فناوری برای رشته‌ها، دروس دانشگاهی و جلسات تدریس",
      isDefault: false,
      tierDefinitions: universityTiers,
    },
  });

  // 3. Framework 3: Professional Institutes & Bootcamps (موسسات آزاد، بوت‌کمپ‌ها و دوره‌های تخصصی)
  const bootcampTiers = [
    { depth: 1, key: "track", title: "مسیر تخصصی / تِرَک", singular: "تِرَک", placeholder: "مثال: مهندسی فول‌استک وب" },
    { depth: 2, key: "course", title: "دوره آموزشی", singular: "دوره", placeholder: "مثال: توسعه فرانت‌اند با Next.js" },
    { depth: 3, key: "sprint", "title": "پودمان / اسپرینت", singular: "پودمان", placeholder: "مثال: پودمان ۲: رندرینگ سرور و کش" },
    { depth: 4, key: "microskill", "title": "مهارت خرد / درس", singular: "مهارت خرد", placeholder: "مثال: پیاده‌سازی Server Actions" }
  ];

  const frameworkBootcamp = await prisma.curriculumFramework.upsert({
    where: { code: "bootcamp" },
    update: {
      name: "موسسات تخصصی و بوت‌کمپ‌ها",
      description: "مسیرهای یادگیری مهارت‌محور، دوره‌های توانمندسازی شغلی و پودمان‌های آموزش مداوم",
      isDefault: false,
      tierDefinitions: bootcampTiers,
    },
    create: {
      id: "FRAMEWORK-BOOTCAMP",
      code: "bootcamp",
      name: "موسسات تخصصی و بوت‌کمپ‌ها",
      description: "مسیرهای یادگیری مهارت‌محور، دوره‌های توانمندسازی شغلی و پودمان‌های آموزش مداوم",
      isDefault: false,
      tierDefinitions: bootcampTiers,
    },
  });

  console.log("Upserted 3 Curriculum Frameworks: K-12, University, Bootcamp");

  // ==========================================
  // K-12 Hierarchical Nodes Seeding
  // ==========================================

  // --- Depth 1: Grades ---
  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G4" },
    update: {
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G4",
      title: "پایه چهارم ابتدایی",
      shortTitle: "پایه ۴",
      orderIndex: 1,
      color: "indigo",
      icon: "GraduationCap",
      isActive: true,
    },
    create: {
      id: "NODE-G4",
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G4",
      title: "پایه چهارم ابتدایی",
      shortTitle: "پایه ۴",
      orderIndex: 1,
      color: "indigo",
      icon: "GraduationCap",
      isActive: true,
    },
  });

  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G5" },
    update: {
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G5",
      title: "پایه پنجم ابتدایی",
      shortTitle: "پایه ۵",
      orderIndex: 2,
      color: "emerald",
      icon: "GraduationCap",
      isActive: true,
    },
    create: {
      id: "NODE-G5",
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G5",
      title: "پایه پنجم ابتدایی",
      shortTitle: "پایه ۵",
      orderIndex: 2,
      color: "emerald",
      icon: "GraduationCap",
      isActive: true,
    },
  });


  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G6" },
    update: {
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G6",
      title: "پایه ششم ابتدایی",
      shortTitle: "پایه ۶",
      orderIndex: 3,
      color: "indigo",
      icon: "GraduationCap",
      isActive: true,
    },
    create: {
      id: "NODE-G6",
      frameworkId: frameworkK12.id,
      depth: 1,
      nodeType: "grade",
      code: "G6",
      title: "پایه ششم ابتدایی",
      shortTitle: "پایه ۶",
      orderIndex: 3,
      color: "indigo",
      icon: "GraduationCap",
      isActive: true,
    },
  });

  // --- Depth 2: Books (کتاب‌ها) ---
  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G4-MATH" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4",
      depth: 2,
      nodeType: "book",
      code: "MATH4",
      title: "ریاضی چهارم دبستان",
      shortTitle: "ریاضی ۴",
      description: "کتاب ریاضی پایه چهارم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "indigo",
      icon: "BookOpen",
      isActive: true,
    },
    create: {
      id: "NODE-G4-MATH",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4",
      depth: 2,
      nodeType: "book",
      code: "MATH4",
      title: "ریاضی چهارم دبستان",
      shortTitle: "ریاضی ۴",
      description: "کتاب ریاضی پایه چهارم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "indigo",
      icon: "BookOpen",
      isActive: true,
    },
  });

  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G5-MATH" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G5",
      depth: 2,
      nodeType: "book",
      code: "MATH5",
      title: "ریاضی پنجم دبستان",
      shortTitle: "ریاضی ۵",
      description: "کتاب ریاضی پایه پنجم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "emerald",
      icon: "BookOpen",
      isActive: true,
    },
    create: {
      id: "NODE-G5-MATH",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G5",
      depth: 2,
      nodeType: "book",
      code: "MATH5",
      title: "ریاضی پنجم دبستان",
      shortTitle: "ریاضی ۵",
      description: "کتاب ریاضی پایه پنجم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "emerald",
      icon: "BookOpen",
      isActive: true,
    },
  });


  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G6-MATH" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G6",
      depth: 2,
      nodeType: "book",
      code: "MATH6",
      title: "ریاضی ششم دبستان",
      shortTitle: "ریاضی ۶",
      description: "کتاب ریاضی پایه ششم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "indigo",
      icon: "BookOpen",
      isActive: true,
    },
    create: {
      id: "NODE-G6-MATH",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G6",
      depth: 2,
      nodeType: "book",
      code: "MATH6",
      title: "ریاضی ششم دبستان",
      shortTitle: "ریاضی ۶",
      description: "کتاب ریاضی پایه ششم دوره دوم ابتدایی مصوب سازمان پژوهش و برنامه‌ریزی آموزشی",
      orderIndex: 1,
      color: "indigo",
      icon: "BookOpen",
      isActive: true,
    },
  });

  // --- Depth 3: Chapters (فصل‌ها) ---
  const grade4Chapters = [
    {
      id: "NODE-G4-MATH-CH01",
      code: "CH01",
      title: "فصل اول: اعداد و الگوها",
      shortTitle: "اعداد و الگوها",
      description: "الگوهای عددی و هندسی، جدول ارزش مکانی، ماشین‌های ورودی-خروجی و معرفی طبقه میلیون",
      orderIndex: 1,
      color: "indigo",
      icon: "Hash",
      lessons: [
        { id: "NODE-G4-CH01-L01", kcId: "KC-MATH4-C01-01", code: "L01", title: "درس اول: عددنویسی و جدول ارزش مکانی تا طبقه هزار", shortTitle: "عددنویسی", order: 1 },
        { id: "NODE-G4-CH01-L02", kcId: "KC-MATH4-C01-02", code: "L02", title: "درس اول و حل مسئله: گسترده‌نویسی و مقایسه اعداد چندرقمی", shortTitle: "گسترده‌نویسی و مقایسه", order: 2 },
        { id: "NODE-G4-CH01-L03", kcId: "KC-MATH4-C01-03", code: "L03", title: "درس دوم: الگوهای عددی، هندسی و کشف ضابطه", shortTitle: "الگوها", order: 3 },
        { id: "NODE-G4-CH01-L04", kcId: "KC-MATH4-C01-04", code: "L04", title: "درس سوم: ماشین‌های ورودی ــ خروجی و عملیات معکوس", shortTitle: "ماشین ورودی-خروجی", order: 4 },
        { id: "NODE-G4-CH01-L05", kcId: "KC-MATH4-C01-05", code: "L05", title: "درس چهارم: معرفی طبقه میلیون و اعداد بزرگ", shortTitle: "معرفی میلیون", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH02",
      code: "CH02",
      title: "فصل دوم: مفهوم و محاسبات کسرها",
      shortTitle: "کسرها",
      description: "شناخت مفهوم جزء از کل، تساوی کسرها، مقایسه، جمع و تفریق هم‌مخرج و نمایش روی محور",
      orderIndex: 2,
      color: "indigo",
      icon: "SplitSquareVertical",
      lessons: [
        { id: "NODE-G4-CH02-L01", kcId: "KC-MATH4-C02-01", code: "L01", title: "درس اول: شناخت مفهوم کسر و تفکیک واحد", shortTitle: "مفهوم جزء از کل", order: 1 },
        { id: "NODE-G4-CH02-L02", kcId: "KC-MATH4-C02-02", code: "L02", title: "درس دوم: کسرهای مساوی و ساده‌کردن کسرها", shortTitle: "کسرهای مساوی", order: 2 },
        { id: "NODE-G4-CH02-L03", kcId: "KC-MATH4-C02-03", code: "L03", title: "درس سوم: مقایسه کسرها و درک اندازه نسبی", shortTitle: "مقایسه کسرها", order: 3 },
        { id: "NODE-G4-CH02-L04", kcId: "KC-MATH4-C02-04", code: "L04", title: "درس چهارم: جمع و تفریق کسرهای هم‌مخرج", shortTitle: "جمع و تفریق کسر", order: 4 },
        { id: "NODE-G4-CH02-L05", kcId: "KC-MATH4-C02-05", code: "L05", title: "درس پنجم: نمایش کسرها و اعداد مخلوط روی محور اعداد", shortTitle: "محور اعداد", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH03",
      code: "CH03",
      title: "فصل سوم: ضرب و تقسیم",
      shortTitle: "ضرب و تقسیم",
      description: "ضرب دو عدد دورقمی، مساحت و گسترده، محاسبه‌های تقریبی و الگوریتم‌های تقسیم",
      orderIndex: 3,
      color: "amber",
      icon: "Calculator",
      lessons: [
        { id: "NODE-G4-CH03-L01", kcId: "KC-MATH4-C03-01", code: "L01", title: "درس اول: ضرب دو عدد دورقمی و مساحت", shortTitle: "ضرب دو رقمی", order: 1 },
        { id: "NODE-G4-CH03-L02", kcId: "KC-MATH4-C03-02", code: "L02", title: "درس دوم: محاسبه حاصل ضرب با الگوریتم و گسترده", shortTitle: "محاسبه ضرب", order: 2 },
        { id: "NODE-G4-CH03-L03", kcId: "KC-MATH4-C03-03", code: "L03", title: "درس سوم: محاسبه‌های تقریبی و روش گرد کردن", shortTitle: "محاسبه‌های تقریبی", order: 3 },
        { id: "NODE-G4-CH03-L04", kcId: "KC-MATH4-C03-04", code: "L04", title: "درس چهارم: تقسیم و بخش‌پذیری و رابطه مقسوم‌علیه", shortTitle: "تقسیم و بخش‌پذیری", order: 4 },
        { id: "NODE-G4-CH03-L05", kcId: "KC-MATH4-C03-05", code: "L05", title: "درس پنجم و ششم: تقسیم بر عددهای یک‌رقمی و دورقمی", shortTitle: "تقسیم ستونی", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH04",
      code: "CH04",
      title: "فصل چهارم: اندازه‌گیری",
      shortTitle: "اندازه‌گیری",
      description: "مفهوم و اندازه‌گیری زاویه، کار با نقاله، زمان، طول و مساحت، حجم و گنجایش",
      orderIndex: 4,
      color: "purple",
      icon: "Compass",
      lessons: [
        { id: "NODE-G4-CH04-L01", kcId: "KC-MATH4-C04-01", code: "L01", title: "درس اول: شناخت مفهوم و انواع زاویه (راست، تند، باز)", shortTitle: "مفهوم زاویه", order: 1 },
        { id: "NODE-G4-CH04-L02", kcId: "KC-MATH4-C04-02", code: "L02", title: "درس دوم: اندازه‌گیری و رسم زاویه با نقاله", shortTitle: "کار با نقاله", order: 2 },
        { id: "NODE-G4-CH04-L03", kcId: "KC-MATH4-C04-03", code: "L03", title: "درس سوم: اندازه‌گیری زمان و محاسبه زمان سپری‌شده", shortTitle: "واحدهای زمان", order: 3 },
        { id: "NODE-G4-CH04-L04", kcId: "KC-MATH4-C04-04", code: "L04", title: "درس چهارم: اندازه‌گیری طول و مساحت مستطیل و مربع", shortTitle: "طول و مساحت", order: 4 },
        { id: "NODE-G4-CH04-L05", kcId: "KC-MATH4-C04-05", code: "L05", title: "درس پنجم: مفهوم حجم، گنجایش و واحدهای لیتر و میلی‌لیتر", shortTitle: "حجم و گنجایش", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH05",
      code: "CH05",
      title: "فصل پنجم: عدد مخلوط و عدد اعشاری",
      shortTitle: "عدد مخلوط و اعشاری",
      description: "مفهوم عدد مخلوط، تبدیل به کسر، معرفی عدد اعشاری با دهم و صدم، جدول ارزش مکانی و جمع و تفریق اعشار",
      orderIndex: 5,
      color: "blue",
      icon: "Sliders",
      lessons: [
        { id: "NODE-G4-CH05-L01", kcId: "KC-MATH4-C05-01", code: "L01", title: "درس اول: مفهوم و نمایش تصویری عدد مخلوط", shortTitle: "مفهوم عدد مخلوط", order: 1 },
        { id: "NODE-G4-CH05-L02", kcId: "KC-MATH4-C05-02", code: "L02", title: "درس دوم: تبدیل کسر به عدد مخلوط و بالعکس", shortTitle: "تبدیل کسر و مخلوط", order: 2 },
        { id: "NODE-G4-CH05-L03", kcId: "KC-MATH4-C05-03", code: "L03", title: "درس سوم: شناخت مفهوم عدد اعشاری با دهم و صدم", shortTitle: "مفهوم عدد اعشاری", order: 3 },
        { id: "NODE-G4-CH05-L04", kcId: "KC-MATH4-C05-04", code: "L04", title: "درس چهارم: جدول ارزش مکانی و مقایسه عددهای اعشاری", shortTitle: "ارزش مکانی اعشار", order: 4 },
        { id: "NODE-G4-CH05-L05", kcId: "KC-MATH4-C05-05", code: "L05", title: "درس پنجم: جمع و تفریق ستونی عددهای اعشاری", shortTitle: "جمع و تفریق اعشار", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH06",
      code: "CH06",
      title: "فصل ششم: شکل‌های هندسی",
      shortTitle: "شکل‌های هندسی",
      description: "خطوط عمود و موازی، خانواده چهارضلعی‌ها، قاعده و ارتفاع نظیر، مساحت متوازی‌الاضلاع و انواع مثلث",
      orderIndex: 6,
      color: "teal",
      icon: "Shapes",
      lessons: [
        { id: "NODE-G4-CH06-L01", kcId: "KC-MATH4-C06-01", code: "L01", title: "درس اول: تشخیص و رسم خطوط عمود و موازی با گونیا", shortTitle: "خطوط عمود و موازی", order: 1 },
        { id: "NODE-G4-CH06-L02", kcId: "KC-MATH4-C06-02", code: "L02", title: "درس دوم: ویژگی‌ها و روابط خانواده چهارضلعی‌ها", shortTitle: "خانواده چهارضلعی‌ها", order: 2 },
        { id: "NODE-G4-CH06-L03", kcId: "KC-MATH4-C06-03", code: "L03", title: "درس سوم: تشخیص قاعده و رسم ارتفاع نظیر در متوازی‌الاضلاع و مثلث", shortTitle: "قاعده و ارتفاع", order: 3 },
        { id: "NODE-G4-CH06-L04", kcId: "KC-MATH4-C06-04", code: "L04", title: "درس چهارم: محاسبه مساحت متوازی‌الاضلاع", shortTitle: "مساحت متوازی‌الاضلاع", order: 4 },
        { id: "NODE-G4-CH06-L05", kcId: "KC-MATH4-C06-05", code: "L05", title: "درس پنجم: محاسبه مساحت انواع مثلث", shortTitle: "مساحت مثلث", order: 5 },
      ],
    },
    {
      id: "NODE-G4-MATH-CH07",
      code: "CH07",
      title: "فصل هفتم: آمار و احتمال",
      shortTitle: "آمار و احتمال",
      description: "جمع‌آوری داده‌ها، نمودار ستونی، نمودار خط شکسته، نمودار دایره‌ای، انتخاب نمودار مناسب و احتمال و شانس",
      orderIndex: 7,
      color: "rose",
      icon: "BarChart3",
      lessons: [
        { id: "NODE-G4-CH07-L01", kcId: "KC-MATH4-C07-01", code: "L01", title: "درس اول: جمع‌آوری داده‌ها با جدول و خط‌نشان", shortTitle: "جدول داده و خط‌نشان", order: 1 },
        { id: "NODE-G4-CH07-L02", kcId: "KC-MATH4-C07-02", code: "L02", title: "درس دوم: رسم، خواندن و تحلیل نمودار ستونی", shortTitle: "نمودار ستونی", order: 2 },
        { id: "NODE-G4-CH07-L03", kcId: "KC-MATH4-C07-03", code: "L03", title: "درس سوم: رسم و تفسیر نمودار خط شکسته در گذر زمان", shortTitle: "نمودار خط شکسته", order: 3 },
        { id: "NODE-G4-CH07-L04", kcId: "KC-MATH4-C07-04", code: "L04", title: "درس چهارم: درک و تحلیل نمودار دایره‌ای با رویکرد جزء به کل", shortTitle: "نمودار دایره‌ای", order: 4 },
        { id: "NODE-G4-CH07-L05", kcId: "KC-MATH4-C07-05", code: "L05", title: "درس پنجم: ارزیابی شانس و احتمال رخ‌داد پیشامدها", shortTitle: "مفهوم شانس و احتمال", order: 5 },
      ],
    },
  ];

  for (const ch of grade4Chapters) {
    await prisma.curriculumNode.upsert({
      where: { id: ch.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
      create: {
        id: ch.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
    });

    for (const l of ch.lessons) {
      await prisma.curriculumNode.upsert({
        where: { id: l.id },
        update: {
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
        create: {
          id: l.id,
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
      });

      // Link KnowledgeComponent to this Lesson Node
      await prisma.knowledgeComponent.updateMany({
        where: { id: l.kcId },
        data: { curriculumNodeId: l.id },
      });
    }
  }

  const grade5Chapters = [
    {
      id: "NODE-G5-MATH-CH01",
      code: "CH01",
      title: "فصل اول: عددنویسی و الگوها",
      shortTitle: "عددنویسی و الگوها",
      description: "یادآوری عددنویسی، جدول ارزش مکانی تا طبقه میلیارد، الگوهای عددی و هندسی و جمع و تفریق عددهای مرکب زمانی",
      orderIndex: 1,
      color: "emerald",
      icon: "Hash",
      lessons: [
        { id: "NODE-G5-CH01-L01", kcId: "KC-MATH5-C01-01", code: "L01", title: "درس 1: یادآوری عددنویسی، جدول ارزش مکانی تا طبقه میلیارد و خواندن و نوشتن اعداد بزرگ", shortTitle: "یادآوری عددنویسی، جدول ارزش مکانی ت", order: 1 },
        { id: "NODE-G5-CH01-L02", kcId: "KC-MATH5-C01-02", code: "L02", title: "درس 2: الگوهای عددی و هندسی و رابطه ریاضی بین شماره شکل و تعداد", shortTitle: "الگوهای عددی", order: 2 },
        { id: "NODE-G5-CH01-L03", kcId: "KC-MATH5-C01-03", code: "L03", title: "درس 3: مفهوم عددهای مرکب و تبدیل واحدهای زمان (ساعت، دقیقه، ثانیه)", shortTitle: "مفهوم عددهای مرکب", order: 3 },
        { id: "NODE-G5-CH01-L04", kcId: "KC-MATH5-C01-04", code: "L04", title: "درس 4: جمع عددهای مرکب زمانی با انتقال و تبدیل بسته‌های ۶۰تایی", shortTitle: "جمع عددهای مرکب زمانی با انتقال", order: 4 },
        { id: "NODE-G5-CH01-L05", kcId: "KC-MATH5-C01-05", code: "L05", title: "درس 5: تفریق عددهای مرکب زمانی با قرض گرفتن ۶۰تایی", shortTitle: "تفریق عددهای مرکب زمانی با قرض گرفت", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH02",
      code: "CH02",
      title: "فصل دوم: کسر",
      shortTitle: "کسر",
      description: "کسرهای بزرگتر از واحد، اعداد مخلوط، جمع و تفریق با مخرج نامساوی، ضرب و تقسیم کسرها و مسئله‌های کاربردی",
      orderIndex: 2,
      color: "emerald",
      icon: "SplitSquareVertical",
      lessons: [
        { id: "NODE-G5-CH02-L01", kcId: "KC-MATH5-C02-01", code: "L01", title: "درس 1: مفهوم کسر بزرگ‌تر از واحد و تبدیل آن به عدد مخلوط", shortTitle: "مفهوم کسر بزرگ‌تر از واحد", order: 1 },
        { id: "NODE-G5-CH02-L02", kcId: "KC-MATH5-C02-02", code: "L02", title: "درس 2: جمع و تفریق عددهای مخلوط با هم‌مخرج کردن", shortTitle: "جمع", order: 2 },
        { id: "NODE-G5-CH02-L03", kcId: "KC-MATH5-C02-03", code: "L03", title: "درس 3: ضرب کسرها و مدل مساحتی دوطرفه ضرب کسر در کسر", shortTitle: "ضرب کسرها", order: 3 },
        { id: "NODE-G5-CH02-L04", kcId: "KC-MATH5-C02-04", code: "L04", title: "درس 4: تقسیم کسر بر عدد طبیعی و تقسیم عدد بر کسر", shortTitle: "تقسیم کسر بر عدد طبیعی", order: 4 },
        { id: "NODE-G5-CH02-L05", kcId: "KC-MATH5-C02-05", code: "L05", title: "درس 5: محاسبات ترکیبی و حل مسائل کسر و عدد مخلوط", shortTitle: "محاسبات ترکیبی", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH03",
      code: "CH03",
      title: "فصل سوم: نسبت، تناسب و درصد",
      shortTitle: "نسبت و تناسب",
      description: "مفهوم نسبت، کسرهای مساوی در تناسب، تسهیم به نسبت و کاربردهای واقعی درصد و تخفیف",
      orderIndex: 3,
      color: "emerald",
      icon: "Scale",
      lessons: [
        { id: "NODE-G5-CH03-L01", kcId: "KC-MATH5-C03-01", code: "L01", title: "درس 1: درک مفهوم نسبت به عنوان مقایسه دو کمیت و تفکیک آن از کسر ساده", shortTitle: "درک مفهوم نسبت به عنوان مقایسه دو ک", order: 1 },
        { id: "NODE-G5-CH03-L02", kcId: "KC-MATH5-C03-02", code: "L02", title: "درس 2: شناخت و تولید نسبت‌های مساوی و مفهوم تناسب", shortTitle: "شناخت", order: 2 },
        { id: "NODE-G5-CH03-L03", kcId: "KC-MATH5-C03-03", code: "L03", title: "درس 3: جدول تناسب، ضریب تناسب و روش‌های حل (ضرب متقاطع)", shortTitle: "جدول تناسب، ضریب تناسب", order: 3 },
        { id: "NODE-G5-CH03-L04", kcId: "KC-MATH5-C03-04", code: "L04", title: "درس 4: نسبت‌های چندتایی و حل مسایل تسهیم به نسبت", shortTitle: "نسبت‌های چندتایی", order: 4 },
        { id: "NODE-G5-CH03-L05", kcId: "KC-MATH5-C03-05", code: "L05", title: "درس 5: مفهوم درصد به عنوان نسبت با مخرج ۱۰۰ و تبدیل کسر به درصد", shortTitle: "مفهوم درصد به عنوان نسبت با مخرج ۱۰", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH04",
      code: "CH04",
      title: "فصل چهارم: تقارن و چندضلعی‌ها",
      shortTitle: "تقارن و چندضلعی‌ها",
      description: "تقارن محوری، تقارن مرکزی، مجموع زوایای مثلث و چهارضلعی، زاویه‌های متقابل به رأس و ویژگی‌های چندضلعی‌ها",
      orderIndex: 4,
      color: "emerald",
      icon: "Shapes",
      lessons: [
        { id: "NODE-G5-CH04-L01", kcId: "KC-MATH5-C04-01", code: "L01", title: "درس 1: تقارن محوری، خطوط تقارن چندضلعی‌ها و رسم قرینه آینه‌ای", shortTitle: "تقارن محوری، خطوط تقارن چندضلعی‌ها", order: 1 },
        { id: "NODE-G5-CH04-L02", kcId: "KC-MATH5-C04-02", code: "L02", title: "درس 2: مفهوم مرکز تقارن و دوران ۱۸۰ درجه شکل‌های هندسی", shortTitle: "مفهوم مرکز تقارن", order: 2 },
        { id: "NODE-G5-CH04-L03", kcId: "KC-MATH5-C04-03", code: "L03", title: "درس 3: زاویه، نیمساز و ترسیم نیمساز با نقاله و پرگار", shortTitle: "زاویه، نیمساز", order: 3 },
        { id: "NODE-G5-CH04-L04", kcId: "KC-MATH5-C04-04", code: "L04", title: "درس 4: مجموع زاویه‌های داخلی مثلث (۱۸۰ درجه) و محاسبه زاویه مجهول", shortTitle: "مجموع زاویه‌های داخلی مثلث (۱۸۰ درج", order: 4 },
        { id: "NODE-G5-CH04-L05", kcId: "KC-MATH5-C04-05", code: "L05", title: "درس 5: مجموع زاویه‌های داخلی چهارضلعی‌ها (۳۶۰ درجه) و چندضلعی‌ها", shortTitle: "مجموع زاویه‌های داخلی چهارضلعی‌ها (", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH05",
      code: "CH05",
      title: "فصل پنجم: عددهای اعشاری",
      shortTitle: "عددهای اعشاری",
      description: "معرفی مرتبه هزارم، جدول ارزش مکانی اعشاری، مقایسه، جمع، تفریق و ضرب اعشار و ارتباط کسر و اعشار",
      orderIndex: 5,
      color: "emerald",
      icon: "Sliders",
      lessons: [
        { id: "NODE-G5-CH05-L01", kcId: "KC-MATH5-C05-01", code: "L01", title: "درس 1: مفهوم اعشار، مرتبه‌های دهم، صدم و هزارم در جدول ارزش مکانی", shortTitle: "مفهوم اعشار، مرتبه‌های دهم، صدم", order: 1 },
        { id: "NODE-G5-CH05-L02", kcId: "KC-MATH5-C05-02", code: "L02", title: "درس 2: تبدیل کسر با مخرج ۱۰، ۱۰۰ و ۱۰۰۰ به عدد اعشاری و برعکس", shortTitle: "تبدیل کسر با مخرج ۱۰، ۱۰۰", order: 2 },
        { id: "NODE-G5-CH05-L03", kcId: "KC-MATH5-C05-03", code: "L03", title: "درس 3: مقایسه و ترتیب عددهای اعشاری با هم‌مرتبه کردن ارقام", shortTitle: "مقایسه", order: 3 },
        { id: "NODE-G5-CH05-L04", kcId: "KC-MATH5-C05-04", code: "L04", title: "درس 4: جمع و تفریق عددهای اعشاری با تراز کردن خط ممیز", shortTitle: "جمع", order: 4 },
        { id: "NODE-G5-CH05-L05", kcId: "KC-MATH5-C05-05", code: "L05", title: "درس 5: ضرب عددهای اعشاری و محاسبه تعداد ارقام اعشار حاصل‌ضرب", shortTitle: "ضرب عددهای اعشاری", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH06",
      code: "CH06",
      title: "فصل ششم: اندازه‌گیری",
      shortTitle: "اندازه‌گیری",
      description: "مساحت لوزی، مساحت ذوزنقه، محیط دایره و عدد پی، حجم مکعب و مکعب‌مستطیل و واحدهای گنجایش و جرم",
      orderIndex: 6,
      color: "emerald",
      icon: "Compass",
      lessons: [
        { id: "NODE-G5-CH06-L01", kcId: "KC-MATH5-C06-01", code: "L01", title: "درس 1: محاسبه مساحت لوزی با قطرهای آن: (قطر بزرگ × قطر کوچک) تقسیم بر ۲", shortTitle: "محاسبه مساحت لوزی با قطرهای آن: (قط", order: 1 },
        { id: "NODE-G5-CH06-L02", kcId: "KC-MATH5-C06-02", code: "L02", title: "درس 2: محاسبه مساحت ذوزنقه: (مجموع دو قاعده × ارتفاع) تقسیم بر ۲", shortTitle: "محاسبه مساحت ذوزنقه: (مجموع دو قاعد", order: 2 },
        { id: "NODE-G5-CH06-L03", kcId: "KC-MATH5-C06-03", code: "L03", title: "درس 3: محیط و مساحت دایره با عدد پی (۳.۱۴)", shortTitle: "محیط", order: 3 },
        { id: "NODE-G5-CH06-L04", kcId: "KC-MATH5-C06-04", code: "L04", title: "درس 4: مفهوم حجم و شمارش مکعب‌های واحد ۱ سانتی‌متری در مکعب‌مستطیل", shortTitle: "مفهوم حجم", order: 4 },
        { id: "NODE-G5-CH06-L05", kcId: "KC-MATH5-C06-05", code: "L05", title: "درس 5: واحدهای گنجایش (لیتر و سی‌سی) و تبدیل آن به سانتی‌متر مکعب", shortTitle: "واحدهای گنجایش (لیتر", order: 5 },
      ],
    },
    {
      id: "NODE-G5-MATH-CH07",
      code: "CH07",
      title: "فصل هفتم: آمار و احتمال",
      shortTitle: "آمار و احتمال",
      description: "جمع‌آوری داده‌ها، جدول فراوانی، میانگین، نمودارهای ستونی، خط شکسته و دایره‌ای و احتمال نظری و تجربی",
      orderIndex: 7,
      color: "emerald",
      icon: "BarChart3",
      lessons: [
        { id: "NODE-G5-CH07-L01", kcId: "KC-MATH5-C07-01", code: "L01", title: "درس 1: جمع‌آوری داده‌ها، رسم و تفسیر نمودار خط شکسته", shortTitle: "جمع‌آوری داده‌ها، رسم", order: 1 },
        { id: "NODE-G5-CH07-L02", kcId: "KC-MATH5-C07-02", code: "L02", title: "درس 2: مفهوم میانگین (معدل) و محاسبه آن: مجموع داده‌ها تقسیم بر تعداد", shortTitle: "مفهوم میانگین (معدل)", order: 2 },
        { id: "NODE-G5-CH07-L03", kcId: "KC-MATH5-C07-03", code: "L03", title: "درس 3: محاسبه مجموع داده‌ها با داشتن میانگین و تعداد داده‌ها", shortTitle: "محاسبه مجموع داده‌ها با داشتن میانگ", order: 3 },
        { id: "NODE-G5-CH07-L04", kcId: "KC-MATH5-C07-04", code: "L04", title: "درس 4: مفهوم احتمال ریاضی، شانس برابر، حتمی، غیرممکن و ممکن", shortTitle: "مفهوم احتمال ریاضی، شانس برابر، حتم", order: 4 },
        { id: "NODE-G5-CH07-L05", kcId: "KC-MATH5-C07-05", code: "L05", title: "درس 5: تحلیل شانس در چرخنده‌ها و کیسه‌های مهره‌های رنگی", shortTitle: "تحلیل شانس در چرخنده‌ها", order: 5 },
      ],
    },
  ];

  const grade6Chapters = [
    {
      id: "NODE-G6-MATH-CH01",
      code: "CH01",
      title: "فصل اول: الگوهای عددی",
      shortTitle: "الگوهای عددی",
      description: "الگوهای عددی، مضارب طبیعی، بخش‌پذیری بر ۲، ۵، ۳، ۹ و ۶، معرفی اعداد صحیح منفی و مثبت و محور اعداد",
      orderIndex: 1,
      color: "indigo",
      icon: "Hash",
      lessons: [
        { id: "NODE-G6-CH01-L01", kcId: "KC-MATH6-C01-01", code: "L01", title: "درس 1: الگوهای عددی، مضرب‌های طبیعی و فرمول‌بندی اعداد زوج و فرد", shortTitle: "الگوهای عددی، مضرب‌های طبیعی", order: 1 },
        { id: "NODE-G6-CH01-L02", kcId: "KC-MATH6-C01-02", code: "L02", title: "درس 2: قوانین بخش‌پذیری بر ۲، ۵، ۳، ۹ و ۶", shortTitle: "قوانین بخش‌پذیری بر ۲، ۵، ۳، ۹", order: 2 },
        { id: "NODE-G6-CH01-L03", kcId: "KC-MATH6-C01-03", code: "L03", title: "درس 3: معرفی عددهای صحیح، علامت‌های مثبت و منفی و جهت‌ها", shortTitle: "معرفی عددهای صحیح، علامت‌های مثبت", order: 3 },
        { id: "NODE-G6-CH01-L04", kcId: "KC-MATH6-C01-04", code: "L04", title: "درس 4: مفهوم قرینه عدد صحیح نسبت به مبدا صفر و قرینه قرینه", shortTitle: "مفهوم قرینه عدد صحیح نسبت به مبدا ص", order: 4 },
        { id: "NODE-G6-CH01-L05", kcId: "KC-MATH6-C01-05", code: "L05", title: "درس 5: مقایسه و ترتیب عددهای صحیح و فاصله‌یابی روی محور", shortTitle: "مقایسه", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH02",
      code: "CH02",
      title: "فصل دوم: کسرها",
      shortTitle: "کسرها",
      description: "جمع و تفریق کسرها با ک.م.م، ضرب کسرها با ساده‌سازی، تقسیم با معکوس، کسرهای مسلسل و مسئله‌های کاربردی",
      orderIndex: 2,
      color: "indigo",
      icon: "SplitSquareVertical",
      lessons: [
        { id: "NODE-G6-CH02-L01", kcId: "KC-MATH6-C02-01", code: "L01", title: "درس 1: جمع و تفریق کسرها و عددهای مخلوط با ساده‌سازی قبل و بعد", shortTitle: "جمع", order: 1 },
        { id: "NODE-G6-CH02-L02", kcId: "KC-MATH6-C02-02", code: "L02", title: "درس 2: ضرب کسرها و ساده‌سازی صورت و مخرج قبل از ضرب", shortTitle: "ضرب کسرها", order: 2 },
        { id: "NODE-G6-CH02-L03", kcId: "KC-MATH6-C02-03", code: "L03", title: "درس 3: تقسیم کسر بر کسر با مدل پیمانه‌ای (چند بار جا می‌شود؟)", shortTitle: "تقسیم کسر بر کسر با مدل پیمانه‌ای (", order: 3 },
        { id: "NODE-G6-CH02-L04", kcId: "KC-MATH6-C02-04", code: "L04", title: "درس 4: قاعده ضرب در معکوس در تقسیم کسرها و ارتباط آن با هم‌مخرج کردن", shortTitle: "قاعده ضرب در معکوس در تقسیم کسرها", order: 4 },
        { id: "NODE-G6-CH02-L05", kcId: "KC-MATH6-C02-05", code: "L05", title: "درس 5: ترتیب و اولویت عملیات در عبارات مرکب کسری (پرانتز، ضرب، تقسیم، جمع، تفریق)", shortTitle: "ترتیب", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH03",
      code: "CH03",
      title: "فصل سوم: اعداد اعشاری",
      shortTitle: "اعداد اعشاری",
      description: "ضرب اعشاری در توان‌های ۱۰، تقسیم بر عدد طبیعی، تقسیم بر عدد اعشاری با حذف ممیز، باقی‌مانده و کسر متناوب",
      orderIndex: 3,
      color: "indigo",
      icon: "Sliders",
      lessons: [
        { id: "NODE-G6-CH03-L01", kcId: "KC-MATH6-C03-01", code: "L01", title: "درس 1: یادآوری و ضرب اعداد اعشاری و ضرب سریع در توان‌های ۱۰", shortTitle: "یادآوری", order: 1 },
        { id: "NODE-G6-CH03-L02", kcId: "KC-MATH6-C03-02", code: "L02", title: "درس 2: تقسیم عدد اعشاری بر عدد طبیعی تا چند رقم اعشار در خارج‌قسمت", shortTitle: "تقسیم عدد اعشاری بر عدد طبیعی تا چن", order: 2 },
        { id: "NODE-G6-CH03-L03", kcId: "KC-MATH6-C03-03", code: "L03", title: "درس 3: تقسیم عدد اعشاری بر عدد اعشاری با حذف ممیز مقسوم‌علیه (ضرب در ۱۰، ۱۰۰ یا ۱۰۰۰)", shortTitle: "تقسیم عدد اعشاری بر عدد اعشاری با ح", order: 3 },
        { id: "NODE-G6-CH03-L04", kcId: "KC-MATH6-C03-04", code: "L04", title: "درس 4: ارتباط تقسیم باقیمانده جدید و باقیمانده واقعی در تقسیم‌های اعشاری", shortTitle: "ارتباط تقسیم باقیمانده جدید", order: 4 },
        { id: "NODE-G6-CH03-L05", kcId: "KC-MATH6-C03-05", code: "L05", title: "درس 5: نمایش اعداد اعشاری روی محور و تقریب اعشاری", shortTitle: "نمایش اعداد اعشاری روی محور", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH04",
      code: "CH04",
      title: "فصل چهارم: تقارن و مختصات",
      shortTitle: "تقارن و مختصات",
      description: "مرکز تقارن، دوران ۱۸۰ درجه، تقارن محوری، دستگاه مختصات دو بعدی و قرینه شکل‌ها",
      orderIndex: 4,
      color: "indigo",
      icon: "Grid",
      lessons: [
        { id: "NODE-G6-CH04-L01", kcId: "KC-MATH6-C04-01", code: "L01", title: "درس 1: مرکز تقارن و دوران ۱۸۰ درجه شکل‌های هندسی", shortTitle: "مرکز تقارن", order: 1 },
        { id: "NODE-G6-CH04-L02", kcId: "KC-MATH6-C04-02", code: "L02", title: "درس 2: تقارن محوری و تصویر آینه‌ای نسبت به خطوط تقارن", shortTitle: "تقارن محوری", order: 2 },
        { id: "NODE-G6-CH04-L03", kcId: "KC-MATH6-C04-03", code: "L03", title: "درس 3: معرفی دستگاه مختصات دو بعدی و نمایش نقطه با طول و عرض", shortTitle: "معرفی دستگاه مختصات دو بعدی", order: 3 },
        { id: "NODE-G6-CH04-L04", kcId: "KC-MATH6-C04-04", code: "L04", title: "درس 4: رسم شکل‌های هندسی در صفحه مختصات و تعیین مختصات رأس‌ها", shortTitle: "رسم شکل‌های هندسی در صفحه مختصات", order: 4 },
        { id: "NODE-G6-CH04-L05", kcId: "KC-MATH6-C04-05", code: "L05", title: "درس 5: انتقال و قرینه‌یابی شکل‌ها در دستگاه مختصات", shortTitle: "انتقال", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH05",
      code: "CH05",
      title: "فصل پنجم: اندازه‌گیری",
      shortTitle: "اندازه‌گیری",
      description: "مساحت دایره، زوایای مکمل، متمم و متقابل به رأس، مجموع زوایای چندضلعی‌ها، حجم و مساحت جانبی منشور و استوانه",
      orderIndex: 5,
      color: "indigo",
      icon: "Compass",
      lessons: [
        { id: "NODE-G6-CH05-L01", kcId: "KC-MATH6-C05-01", code: "L01", title: "درس 1: واحدهای اندازه‌گیری سطح، هکتار و تبدیل آن به مترمربع", shortTitle: "واحدهای اندازه‌گیری سطح، هکتار", order: 1 },
        { id: "NODE-G6-CH05-L02", kcId: "KC-MATH6-C05-02", code: "L02", title: "درس 2: زاویه‌های متقابل به رأس و ویژگی برابری زاویه‌های روبه‌رو", shortTitle: "زاویه‌های متقابل به رأس", order: 2 },
        { id: "NODE-G6-CH05-L03", kcId: "KC-MATH6-C05-03", code: "L03", title: "درس 3: زاویه‌های متمم (مجموع ۹۰ درجه) و زاویه‌های مکمل (مجموع ۱۸۰ درجه)", shortTitle: "زاویه‌های متمم (مجموع ۹۰ درجه)", order: 3 },
        { id: "NODE-G6-CH05-L04", kcId: "KC-MATH6-C05-04", code: "L04", title: "درس 4: محاسبه حجم استوانه: مساحت قاعده دایره‌ای × ارتفاع", shortTitle: "محاسبه حجم استوانه: مساحت قاعده دای", order: 4 },
        { id: "NODE-G6-CH05-L05", kcId: "KC-MATH6-C05-05", code: "L05", title: "درس 5: مساحت جانبی و مساحت کل استوانه در نمای گسترده", shortTitle: "مساحت جانبی", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH06",
      code: "CH06",
      title: "فصل ششم: تناسب و درصد",
      shortTitle: "تناسب و درصد",
      description: "نسبت و تناسب مستقیم و معکوس، درصد مالی (سود، تخفیف، مالیات)، مقیاس نقشه و مدل‌های کوچک‌نمایی و مسائل کاربردی",
      orderIndex: 6,
      color: "indigo",
      icon: "Scale",
      lessons: [
        { id: "NODE-G6-CH06-L01", kcId: "KC-MATH6-C06-01", code: "L01", title: "درس 1: مفهوم تناسب مستقیم و حل مسائل چندمرحله‌ای تناسب", shortTitle: "مفهوم تناسب مستقیم", order: 1 },
        { id: "NODE-G6-CH06-L02", kcId: "KC-MATH6-C06-02", code: "L02", title: "درس 2: کاربرد درصد در محاسبات مالی، تخفیف و قیمت پس از تخفیف", shortTitle: "کاربرد درصد در محاسبات مالی، تخفیف", order: 2 },
        { id: "NODE-G6-CH06-L03", kcId: "KC-MATH6-C06-03", code: "L03", title: "درس 3: محاسبات سود و زیان تجاری با استفاده از درصد", shortTitle: "محاسبات سود", order: 3 },
        { id: "NODE-G6-CH06-L04", kcId: "KC-MATH6-C06-04", code: "L04", title: "درس 4: محاسبه مالیات بر ارزش افزوده و درصد افزایش قیمت", shortTitle: "محاسبه مالیات بر ارزش افزوده", order: 4 },
        { id: "NODE-G6-CH06-L05", kcId: "KC-MATH6-C06-05", code: "L05", title: "درس 5: حل مسائل ترکیبی درصد و نسبت‌های چندتایی پیشرفته", shortTitle: "حل مسائل ترکیبی درصد", order: 5 },
      ],
    },
    {
      id: "NODE-G6-MATH-CH07",
      code: "CH07",
      title: "فصل هفتم: تقریب، آمار و احتمال",
      shortTitle: "تقریب و آمار",
      description: "تقریب به روش قطع کردن، تقریب به روش گرد کردن، محاسبه خطای تقریب، شاخص‌های آماری (میانگین، مد، دامنه) و احتمال",
      orderIndex: 7,
      color: "indigo",
      icon: "BarChart3",
      lessons: [
        { id: "NODE-G6-CH07-L01", kcId: "KC-MATH6-C07-01", code: "L01", title: "درس 1: تقریب به روش قطع کردن (Truncation) با مرتبه‌های مختلف (کمتر از ۱۰، ۱۰۰، ۱۰۰۰)", shortTitle: "تقریب به روش قطع کردن (Truncation) ", order: 1 },
        { id: "NODE-G6-CH07-L02", kcId: "KC-MATH6-C07-02", code: "L02", title: "درس 2: تقریب به روش گرد کردن (Rounding) و بررسی مرز رقم ۵", shortTitle: "تقریب به روش گرد کردن (Rounding)", order: 2 },
        { id: "NODE-G6-CH07-L03", kcId: "KC-MATH6-C07-03", code: "L03", title: "درس 3: مقایسه روش قطع کردن و گرد کردن و محاسبه خطای تقریب", shortTitle: "مقایسه روش قطع کردن", order: 3 },
        { id: "NODE-G6-CH07-L04", kcId: "KC-MATH6-C07-04", code: "L04", title: "درس 4: رسم و تحلیل نمودار دایره‌ای با محاسبه زاویه مرکزی هر بخش", shortTitle: "رسم", order: 4 },
        { id: "NODE-G6-CH07-L05", kcId: "KC-MATH6-C07-05", code: "L05", title: "درس 5: حل مسائل ترکیبی تقریب در محاسبات روزمره و آمار", shortTitle: "حل مسائل ترکیبی تقریب در محاسبات رو", order: 5 },
      ],
    },
  ];


  // Grade 5 Chapters Seeding
  for (const ch of grade5Chapters) {
    await prisma.curriculumNode.upsert({
      where: { id: ch.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G5-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
      create: {
        id: ch.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G5-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
    });

    for (const l of ch.lessons) {
      await prisma.curriculumNode.upsert({
        where: { id: l.id },
        update: {
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
        create: {
          id: l.id,
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
      });

      await prisma.knowledgeComponent.updateMany({
        where: { id: l.kcId },
        data: { curriculumNodeId: l.id },
      });
    }
  }

  // Grade 6 Chapters Seeding
  for (const ch of grade6Chapters) {
    await prisma.curriculumNode.upsert({
      where: { id: ch.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G6-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
      create: {
        id: ch.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G6-MATH",
        depth: 3,
        nodeType: "chapter",
        code: ch.code,
        title: ch.title,
        shortTitle: ch.shortTitle,
        description: ch.description,
        orderIndex: ch.orderIndex,
        color: ch.color,
        icon: ch.icon,
        isActive: true,
      },
    });

    for (const l of ch.lessons) {
      await prisma.curriculumNode.upsert({
        where: { id: l.id },
        update: {
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
        create: {
          id: l.id,
          frameworkId: frameworkK12.id,
          parentId: ch.id,
          depth: 4,
          nodeType: "lesson",
          code: l.code,
          title: l.title,
          shortTitle: l.shortTitle,
          orderIndex: l.order,
          color: ch.color,
          icon: "Layers",
          isActive: true,
        },
      });

      await prisma.knowledgeComponent.updateMany({
        where: { id: l.kcId },
        data: { curriculumNodeId: l.id },
      });
    }
  }

  // ==========================================
  // Sample University Hierarchy Seeding
  // ==========================================
  const uniMajor = await prisma.curriculumNode.upsert({
    where: { id: "NODE-UNI-CS-BS" },
    update: {},
    create: {
      id: "NODE-UNI-CS-BS",
      frameworkId: frameworkUniversity.id,
      depth: 1,
      nodeType: "major_year",
      code: "BS-CS",
      title: "کارشناسی مهندسی کامپیوتر",
      shortTitle: "مهندسی کامپیوتر",
      orderIndex: 1,
      color: "sky",
      icon: "GraduationCap",
      isActive: true,
    },
  });

  const uniCourse = await prisma.curriculumNode.upsert({
    where: { id: "NODE-UNI-MATH1" },
    update: {},
    create: {
      id: "NODE-UNI-MATH1",
      frameworkId: frameworkUniversity.id,
      parentId: uniMajor.id,
      depth: 2,
      nodeType: "course",
      code: "MATH101",
      title: "ریاضی عمومی ۱",
      shortTitle: "ریاضی ۱",
      description: "درس پایه مصوب دانشگاهی - ۳ واحد تئوری شامل مفاهیم حساب دیفرانسیل و انتگرال",
      metadata: { credits: 3 },
      orderIndex: 1,
      color: "sky",
      icon: "BookOpen",
      isActive: true,
    },
  });

  const uniChapter = await prisma.curriculumNode.upsert({
    where: { id: "NODE-UNI-MATH1-CH01" },
    update: {},
    create: {
      id: "NODE-UNI-MATH1-CH01",
      frameworkId: frameworkUniversity.id,
      parentId: uniCourse.id,
      depth: 3,
      nodeType: "syllabus_unit",
      code: "UNIT01",
      title: "سرفصل اول: حد، پیوستگی و قضایای بنیادین",
      shortTitle: "حد و پیوستگی",
      orderIndex: 1,
      color: "sky",
      icon: "Layers",
      isActive: true,
    },
  });

  await prisma.curriculumNode.upsert({
    where: { id: "NODE-UNI-MATH1-CH01-L01" },
    update: {},
    create: {
      id: "NODE-UNI-MATH1-CH01-L01",
      frameworkId: frameworkUniversity.id,
      parentId: uniChapter.id,
      depth: 4,
      nodeType: "lecture",
      code: "LEC01",
      title: "جلسه اول: تعریف صوری حد به زبان اپسیلون-دلتا و قضایای مقایسه",
      shortTitle: "تعریف اپسیلون-دلتا",
      orderIndex: 1,
      color: "sky",
      icon: "Sparkles",
      isActive: true,
    },
  });

  // ==========================================
  // Sample Professional Bootcamp Hierarchy Seeding
  // ==========================================
  const bootcampTrack = await prisma.curriculumNode.upsert({
    where: { id: "NODE-BC-FULLSTACK" },
    update: {},
    create: {
      id: "NODE-BC-FULLSTACK",
      frameworkId: frameworkBootcamp.id,
      depth: 1,
      nodeType: "track",
      code: "TRK-FS",
      title: "مسیر شغلی مهندسی فول‌استک وب مدرن",
      shortTitle: "فول‌استک وب",
      orderIndex: 1,
      color: "rose",
      icon: "Code",
      isActive: true,
    },
  });

  const bootcampCourse = await prisma.curriculumNode.upsert({
    where: { id: "NODE-BC-NEXTJS" },
    update: {},
    create: {
      id: "NODE-BC-NEXTJS",
      frameworkId: frameworkBootcamp.id,
      parentId: bootcampTrack.id,
      depth: 2,
      nodeType: "course",
      code: "NEXT16",
      title: "دوره تخصصی Next.js App Router و معماری سرورلس",
      shortTitle: "تخصص Next.js",
      description: "دوره پروژه محور ساخت برنامه‌های مقیاس‌پذیر مدرن",
      metadata: { estimatedHours: 40 },
      orderIndex: 1,
      color: "rose",
      icon: "Layers",
      isActive: true,
    },
  });

  const bootcampSprint = await prisma.curriculumNode.upsert({
    where: { id: "NODE-BC-NEXTJS-SP01" },
    update: {},
    create: {
      id: "NODE-BC-NEXTJS-SP01",
      frameworkId: frameworkBootcamp.id,
      parentId: bootcampCourse.id,
      depth: 3,
      nodeType: "sprint",
      code: "SPRINT01",
      title: "پودمان اول: رندرینگ سرور، کامپایلر React و استراتژی کش",
      shortTitle: "رندرینگ و کش",
      orderIndex: 1,
      color: "rose",
      icon: "Sparkles",
      isActive: true,
    },
  });

  await prisma.curriculumNode.upsert({
    where: { id: "NODE-BC-NEXTJS-SP01-SK01" },
    update: {},
    create: {
      id: "NODE-BC-NEXTJS-SP01-SK01",
      frameworkId: frameworkBootcamp.id,
      parentId: bootcampSprint.id,
      depth: 4,
      nodeType: "microskill",
      code: "SKILL01",
      title: "مهارت خرد: پیاده‌سازی Server Actions همراه با اعتبارسنجی Zod و مدیریت خطا",
      shortTitle: "سرور اکشن‌ها",
      orderIndex: 1,
      color: "rose",
      icon: "CheckCircle",
      isActive: true,
    },
  });

  console.log("Successfully seeded Hierarchical Curriculum Trees for K-12, University, and Bootcamp!");
}
