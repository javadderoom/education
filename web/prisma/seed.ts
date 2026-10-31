import { prisma } from "../lib/db/prisma";
import { hashPassword } from "../lib/auth/password";
import * as fs from "fs";
import * as path from "path";

async function seedCartridge(cartridgePath: string) {
  const raw = fs.readFileSync(cartridgePath, "utf-8");
  const cartridge = JSON.parse(raw);

  console.log(`\n======================================================`);
  console.log(`Processing Cartridge: ${cartridge.title}`);
  console.log(`Cartridge ID: ${cartridge.cartridge_id} | Grade Level: ${cartridge.subject.grade_level}`);
  console.log(`======================================================`);

  // 1. Upsert Domain
  console.log(`Upserting Domain: ${cartridge.domain.name} (${cartridge.domain.id})`);
  await prisma.domain.upsert({
    where: { id: cartridge.domain.id },
    update: {
      name: cartridge.domain.name,
      category: cartridge.domain.category,
    },
    create: {
      id: cartridge.domain.id,
      name: cartridge.domain.name,
      category: cartridge.domain.category,
    },
  });

  // 2. Upsert Subject
  console.log(`Upserting Subject: ${cartridge.subject.name} (${cartridge.subject.id})`);
  await prisma.subject.upsert({
    where: { id: cartridge.subject.id },
    update: {
      name: cartridge.subject.name,
      domainId: cartridge.domain.id,
      gradeLevel: cartridge.subject.grade_level,
    },
    create: {
      id: cartridge.subject.id,
      domainId: cartridge.domain.id,
      name: cartridge.subject.name,
      gradeLevel: cartridge.subject.grade_level,
    },
  });

  // 3. Upsert Knowledge Components
  console.log(`Upserting ${cartridge.knowledge_components.length} Knowledge Components...`);
  for (const kc of cartridge.knowledge_components) {
    await prisma.knowledgeComponent.upsert({
      where: { id: kc.id },
      update: {
        title: kc.title,
        bloomLevel: kc.bloom_level,
        description: kc.description,
        subjectId: cartridge.subject.id,
      },
      create: {
        id: kc.id,
        subjectId: cartridge.subject.id,
        title: kc.title,
        bloomLevel: kc.bloom_level,
        description: kc.description,
      },
    });
  }

  // 4. Upsert Prerequisites
  for (const kc of cartridge.knowledge_components) {
    for (const prereqId of kc.prerequisites || []) {
      await prisma.knowledgePrerequisite.upsert({
        where: {
          kcId_prerequisiteId: {
            kcId: kc.id,
            prerequisiteId: prereqId,
          },
        },
        update: {},
        create: {
          kcId: kc.id,
          prerequisiteId: prereqId,
        },
      });
    }
  }

  // 5. Upsert Misconceptions
  console.log(`Upserting ${cartridge.misconceptions.length} Misconceptions...`);
  for (const mis of cartridge.misconceptions) {
    const mappedKc = cartridge.knowledge_components[0].id;
    await prisma.misconception.upsert({
      where: { id: mis.id },
      update: {
        title: mis.title,
        description: mis.description,
        counterExampleBlueprint: JSON.stringify(mis.counter_example_blueprint),
      },
      create: {
        id: mis.id,
        kcId: mappedKc,
        title: mis.title,
        description: mis.description,
        counterExampleBlueprint: JSON.stringify(mis.counter_example_blueprint),
      },
    });
  }

  // 6. Upsert Diagnostic Items and Distractors
  console.log(`Upserting ${cartridge.diagnostic_items.length} Diagnostic Items...`);
  for (const item of cartridge.diagnostic_items) {
    await prisma.diagnosticItem.upsert({
      where: { id: item.id },
      update: {
        kcId: item.kc_id,
        stem: item.stem,
        difficulty: item.difficulty,
        guessParam: item.guess_param,
        slipParam: item.slip_param,
        visualTemplateType: item.visual_template?.type || null,
        visualTemplateProps: item.visual_template ? JSON.stringify(item.visual_template.props) : null,
      },
      create: {
        id: item.id,
        kcId: item.kc_id,
        stem: item.stem,
        difficulty: item.difficulty,
        guessParam: item.guess_param,
        slipParam: item.slip_param,
        visualTemplateType: item.visual_template?.type || null,
        visualTemplateProps: item.visual_template ? JSON.stringify(item.visual_template.props) : null,
      },
    });

    for (const dis of item.distractors) {
      await prisma.distractor.upsert({
        where: { id: dis.id },
        update: {
          itemId: item.id,
          label: dis.label,
          content: dis.content,
          isCorrect: dis.is_correct,
          misconceptionId: dis.misconception_id || null,
          rationale: dis.rationale,
        },
        create: {
          id: dis.id,
          itemId: item.id,
          label: dis.label,
          content: dis.content,
          isCorrect: dis.is_correct,
          misconceptionId: dis.misconception_id || null,
          rationale: dis.rationale,
        },
      });
    }
  }

  console.log(`Cartridge [${cartridge.cartridge_id}] seeded successfully!`);
}

async function main() {
  console.log("--- Starting Universal Diagnostic Seeder ---");

  const candidates = [
    path.resolve(__dirname, "../../data/canonical"),
    path.resolve(process.cwd(), "data/canonical"),
    path.resolve(process.cwd(), "../data/canonical"),
  ];

  let canonicalDir = "";
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      canonicalDir = dir;
      break;
    }
  }

  if (!canonicalDir) {
    throw new Error("Canonical directory data/canonical not found!");
  }

  const files = fs.readdirSync(canonicalDir).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} canonical cartridge(s): ${files.join(", ")}`);

  for (const file of files) {
    await seedCartridge(path.join(canonicalDir, file));
  }

  // Seed Admin Account
  console.log("\nSeeding Administrator Account...");
  await prisma.learner.upsert({
    where: { username: "admin" },
    update: {
      displayName: "مدیر ارشد سامانه",
      role: "admin",
      passwordHash: hashPassword("admin123456"),
    },
    create: {
      username: "admin",
      displayName: "مدیر ارشد سامانه",
      role: "admin",
      passwordHash: hashPassword("admin123456"),
    },
  });

  // Seed Teacher Account
  console.log("Seeding Demo Teacher Account...");
  const teacher = await prisma.learner.upsert({
    where: { username: "teacher_maryam" },
    update: {
      displayName: "خانم مریم محمدی (آموزگار ریاضی)",
      role: "teacher",
      passwordHash: hashPassword("teacher123456"),
      phone: "09123456789",
      schoolName: "دبستان هوشمند شهید بهشتی",
    },
    create: {
      username: "teacher_maryam",
      displayName: "خانم مریم محمدی (آموزگار ریاضی)",
      role: "teacher",
      passwordHash: hashPassword("teacher123456"),
      phone: "09123456789",
      schoolName: "دبستان هوشمند شهید بهشتی",
    },
  });

  // Seed Classrooms
  console.log("Seeding Classrooms...");
  const class4 = await prisma.classroom.upsert({
    where: { id: "CLASS-GRADE4-A" },
    update: {
      name: "کلاس چهارم الف",
      gradeLevel: 4,
      schoolName: "دبستان هوشمند شهید بهشتی",
      teacherId: teacher.id,
    },
    create: {
      id: "CLASS-GRADE4-A",
      name: "کلاس چهارم الف",
      gradeLevel: 4,
      schoolName: "دبستان هوشمند شهید بهشتی",
      teacherId: teacher.id,
    },
  });

  const class5 = await prisma.classroom.upsert({
    where: { id: "CLASS-GRADE5-B" },
    update: {
      name: "کلاس پنجم ب",
      gradeLevel: 5,
      schoolName: "دبستان هوشمند شهید بهشتی",
      teacherId: teacher.id,
    },
    create: {
      id: "CLASS-GRADE5-B",
      name: "کلاس پنجم ب",
      gradeLevel: 5,
      schoolName: "دبستان هوشمند شهید بهشتی",
      teacherId: teacher.id,
    },
  });

  // Seed Demo Students
  console.log("Seeding Demo Students...");
  await prisma.learner.upsert({
    where: { username: "student_demo" },
    update: {
      displayName: "علی رضایی",
      gradeLevel: 4,
      role: "student",
      classroomId: class4.id,
      pinCode: "1234",
    },
    create: {
      username: "student_demo",
      displayName: "علی رضایی",
      gradeLevel: 4,
      role: "student",
      classroomId: class4.id,
      pinCode: "1234",
    },
  });

  await prisma.learner.upsert({
    where: { username: "student_ali" },
    update: {
      displayName: "علی رضایی",
      gradeLevel: 4,
      role: "student",
      classroomId: class4.id,
      pinCode: "1234",
    },
    create: {
      username: "student_ali",
      displayName: "علی رضایی",
      gradeLevel: 4,
      role: "student",
      classroomId: class4.id,
      pinCode: "1234",
    },
  });

  await prisma.learner.upsert({
    where: { username: "student_grade5_demo" },
    update: {
      displayName: "محمدحسین مرادی",
      gradeLevel: 5,
      role: "student",
      classroomId: class5.id,
      pinCode: "1234",
    },
    create: {
      username: "student_grade5_demo",
      displayName: "محمدحسین مرادی",
      gradeLevel: 5,
      role: "student",
      classroomId: class5.id,
      pinCode: "1234",
    },
  });

  await prisma.learner.upsert({
    where: { username: "student_sara_grade5" },
    update: {
      displayName: "سارا محمدی",
      gradeLevel: 5,
      role: "student",
      classroomId: class5.id,
      pinCode: "1234",
    },
    create: {
      username: "student_sara_grade5",
      displayName: "سارا محمدی",
      gradeLevel: 5,
      role: "student",
      classroomId: class5.id,
      pinCode: "1234",
    },
  });

  console.log("\n--- All Cartridges, Users & Classrooms Seeded Successfully! ---");
}

main()
  .catch((e) => {
    console.error("Universal Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
