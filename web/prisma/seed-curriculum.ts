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

  // --- Depth 3: Chapters (فصل‌ها) ---
  // Grade 4 Chapter 2: Fractions
  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G4-MATH-CH02" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH02",
      title: "فصل دوم: مفهوم و محاسبات کسرها",
      shortTitle: "کسرها",
      description: "شناخت مفهوم جزء از کل، تساوی کسرها، مقایسه، جمع و تفریق هم‌مخرج و نمایش روی محور",
      orderIndex: 1,
      color: "indigo",
      icon: "SplitSquareVertical",
      isActive: true,
    },
    create: {
      id: "NODE-G4-MATH-CH02",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH02",
      title: "فصل دوم: مفهوم و محاسبات کسرها",
      shortTitle: "کسرها",
      description: "شناخت مفهوم جزء از کل، تساوی کسرها، مقایسه، جمع و تفریق هم‌مخرج و نمایش روی محور",
      orderIndex: 1,
      color: "indigo",
      icon: "SplitSquareVertical",
      isActive: true,
    },
  });

  // Grade 4 Chapter 3: Multiplication & Division
  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G4-MATH-CH03" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH03",
      title: "فصل سوم: ضرب و تقسیم",
      shortTitle: "ضرب و تقسیم",
      description: "الگوهای ضرب چندرقمی، مساحت و گسترده، تقسیم با باقی‌مانده و تخمین محاسباتی",
      orderIndex: 2,
      color: "amber",
      icon: "Calculator",
      isActive: true,
    },
    create: {
      id: "NODE-G4-MATH-CH03",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G4-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH03",
      title: "فصل سوم: ضرب و تقسیم",
      shortTitle: "ضرب و تقسیم",
      description: "الگوهای ضرب چندرقمی، مساحت و گسترده، تقسیم با باقی‌مانده و تخمین محاسباتی",
      orderIndex: 2,
      color: "amber",
      icon: "Calculator",
      isActive: true,
    },
  });

  // Grade 5 Chapter 3: Ratio, Proportion & Percentage
  await prisma.curriculumNode.upsert({
    where: { id: "NODE-G5-MATH-CH03" },
    update: {
      frameworkId: frameworkK12.id,
      parentId: "NODE-G5-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH03",
      title: "فصل سوم: نسبت، تناسب و درصد",
      shortTitle: "نسبت و تناسب",
      description: "مفهوم نسبت، کسرهای مساوی در تناسب، تسهیم به نسبت و کاربردهای واقعی درصد و تخفیف",
      orderIndex: 1,
      color: "emerald",
      icon: "Scale",
      isActive: true,
    },
    create: {
      id: "NODE-G5-MATH-CH03",
      frameworkId: frameworkK12.id,
      parentId: "NODE-G5-MATH",
      depth: 3,
      nodeType: "chapter",
      code: "CH03",
      title: "فصل سوم: نسبت، تناسب و درصد",
      shortTitle: "نسبت و تناسب",
      description: "مفهوم نسبت، کسرهای مساوی در تناسب، تسهیم به نسبت و کاربردهای واقعی درصد و تخفیف",
      orderIndex: 1,
      color: "emerald",
      icon: "Scale",
      isActive: true,
    },
  });

  // --- Depth 4: Lessons (درس‌ها / سرفصل‌های آموزشی متصل به KCs) ---

  // G4 Chapter 2 Lessons:
  const g4Ch2Lessons = [
    { id: "NODE-G4-CH02-L01", kcId: "KC-MATH4-C02-01", code: "L01", title: "درس اول: شناخت مفهوم کسر و تفکیک واحد", shortTitle: "مفهوم جزء از کل", order: 1 },
    { id: "NODE-G4-CH02-L02", kcId: "KC-MATH4-C02-02", code: "L02", title: "درس دوم: کسرهای مساوی و ساده‌کردن کسرها", shortTitle: "کسرهای مساوی", order: 2 },
    { id: "NODE-G4-CH02-L03", kcId: "KC-MATH4-C02-03", code: "L03", title: "درس سوم: مقایسه کسرها و درک اندازه نسبی", shortTitle: "مقایسه کسرها", order: 3 },
    { id: "NODE-G4-CH02-L04", kcId: "KC-MATH4-C02-04", code: "L04", title: "درس چهارم: جمع و تفریق کسرهای هم‌مخرج", shortTitle: "جمع و تفریق کسر", order: 4 },
    { id: "NODE-G4-CH02-L05", kcId: "KC-MATH4-C02-05", code: "L05", title: "درس پنجم: نمایش کسرها و اعداد مخلوط روی محور اعداد", shortTitle: "محور اعداد", order: 5 },
  ];

  for (const l of g4Ch2Lessons) {
    await prisma.curriculumNode.upsert({
      where: { id: l.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH-CH02",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "indigo",
        icon: "Layers",
        isActive: true,
      },
      create: {
        id: l.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH-CH02",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "indigo",
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

  // G4 Chapter 3 Lessons:
  const g4Ch3Lessons = [
    { id: "NODE-G4-CH03-L01", kcId: "KC-MATH4-C03-01", code: "L01", title: "درس اول: الگوها و خاصیت پخشی ضرب", shortTitle: "الگوهای ضرب", order: 1 },
    { id: "NODE-G4-CH03-L02", kcId: "KC-MATH4-C03-02", code: "L02", title: "درس دوم: الگوریتم ضرب دو رقم در دو رقم", shortTitle: "ضرب دو رقمی", order: 2 },
    { id: "NODE-G4-CH03-L03", kcId: "KC-MATH4-C03-03", code: "L03", title: "درس سوم: مفهوم تقسیم و رابطه مقسوم‌علیه", shortTitle: "مفهوم تقسیم", order: 3 },
    { id: "NODE-G4-CH03-L04", kcId: "KC-MATH4-C03-04", code: "L04", title: "درس چهارم: الگوریتم تقسیم ستونی با باقی‌مانده", shortTitle: "تقسیم ستونی", order: 4 },
    { id: "NODE-G4-CH03-L05", kcId: "KC-MATH4-C03-05", code: "L05", title: "درس پنجم: تقریب و تخمین در ضرب و تقسیم", shortTitle: "محاسبات تقریبی", order: 5 },
  ];

  for (const l of g4Ch3Lessons) {
    await prisma.curriculumNode.upsert({
      where: { id: l.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH-CH03",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "amber",
        icon: "Calculator",
        isActive: true,
      },
      create: {
        id: l.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G4-MATH-CH03",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "amber",
        icon: "Calculator",
        isActive: true,
      },
    });

    await prisma.knowledgeComponent.updateMany({
      where: { id: l.kcId },
      data: { curriculumNodeId: l.id },
    });
  }

  // G5 Chapter 3 Lessons:
  const g5Ch3Lessons = [
    { id: "NODE-G5-CH03-L01", kcId: "KC-MATH5-C03-01", code: "L01", title: "درس اول: درک مفهوم نسبت و اندازه نسبی", shortTitle: "مفهوم نسبت", order: 1 },
    { id: "NODE-G5-CH03-L02", kcId: "KC-MATH5-C03-02", code: "L02", title: "درس دوم: ساخت نسبت‌های مساوی و تناسب", shortTitle: "نسبت‌های مساوی", order: 2 },
    { id: "NODE-G5-CH03-L03", kcId: "KC-MATH5-C03-03", code: "L03", title: "درس سوم: حل مسائل جدول تناسب و تسهیم به نسبت", shortTitle: "جدول تناسب", order: 3 },
    { id: "NODE-G5-CH03-L04", kcId: "KC-MATH5-C03-04", code: "L04", title: "درس چهارم: مفهوم درصد و نمایش در شبکه صدتایی", shortTitle: "مفهوم درصد", order: 4 },
    { id: "NODE-G5-CH03-L05", kcId: "KC-MATH5-C03-05", code: "L05", title: "درس پنجم: کاربرد درصد در مسائل مالی و تخفیف", shortTitle: "کاربردهای درصد", order: 5 },
  ];

  for (const l of g5Ch3Lessons) {
    await prisma.curriculumNode.upsert({
      where: { id: l.id },
      update: {
        frameworkId: frameworkK12.id,
        parentId: "NODE-G5-MATH-CH03",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "emerald",
        icon: "Scale",
        isActive: true,
      },
      create: {
        id: l.id,
        frameworkId: frameworkK12.id,
        parentId: "NODE-G5-MATH-CH03",
        depth: 4,
        nodeType: "lesson",
        code: l.code,
        title: l.title,
        shortTitle: l.shortTitle,
        orderIndex: l.order,
        color: "emerald",
        icon: "Scale",
        isActive: true,
      },
    });

    await prisma.knowledgeComponent.updateMany({
      where: { id: l.kcId },
      data: { curriculumNodeId: l.id },
    });
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
