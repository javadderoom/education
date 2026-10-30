import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Starting Seeder: Grade 4 Math Chapter 2 (Fractions) ---");

  // Read canonical JSON cartridge
  const jsonPath = path.resolve(__dirname, "../../data/canonical/grade4_math_ch2.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Canonical data file not found at: ${jsonPath}`);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const cartridge = JSON.parse(raw);

  // 1. Upsert Domain
  console.log(`Upserting Domain: ${cartridge.domain.name}`);
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
  console.log(`Upserting Subject: ${cartridge.subject.name}`);
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
    // Determine mapped KC from items or default to first KC
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

  // 7. Seed Demo Learner
  console.log("Seeding Demo Learner...");
  await prisma.learner.upsert({
    where: { username: "student_demo" },
    update: {
      displayName: "علی رضایی (دانش‌آموز پایه چهارم)",
      gradeLevel: 4,
    },
    create: {
      username: "student_demo",
      displayName: "علی رضایی (دانش‌آموز پایه چهارم)",
      gradeLevel: 4,
    },
  });

  console.log("--- Seeding Completed Successfully! ---");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
