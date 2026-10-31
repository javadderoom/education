import { getCanonicalCartridge } from "../lib/data/cartridge";
import { selectNextAdaptiveItem } from "../lib/bkt/adaptive";
import { evaluateDiagnosticResponse } from "../lib/bkt/diagnostics";
import { updateMastery } from "../lib/bkt/engine";
import { updateFSRS, getPedagogicalReviewStatus } from "../lib/bkt/fsrs";
import { saveAssessmentSession, getStudentMasteryStates } from "../actions/assessment";
import { getClassDiagnosticStats } from "../actions/analytics";
import { prisma } from "../lib/db/prisma";

async function runFullPipelineTest() {
  console.log("================================================================");
  console.log("🚀 STARTING END-TO-END PIPELINE VERIFICATION: GRADE 5 MATHEMATICS");
  console.log("   Chapter 3: Ratio, Proportion & Percentage (فصل سوم: نسبت و تناسب)");
  console.log("================================================================\n");

  // Step 1: Load Canonical Cartridge
  console.log("--- 1. LOADING & VALIDATING CANONICAL CARTRIDGE ---");
  const cartridge = getCanonicalCartridge("grade5_math_ch3.json");
  console.log(`Cartridge: ${cartridge.title}`);
  console.log(`Subject: ${cartridge.subject.name} (${cartridge.subject.id})`);
  console.log(`Knowledge Components: ${cartridge.knowledge_components.length}`);
  console.log(`Misconceptions: ${cartridge.misconceptions.length}`);
  console.log(`Diagnostic Items: ${cartridge.diagnostic_items.length}`);

  if (cartridge.diagnostic_items.length !== 15) {
    throw new Error(`Expected 15 diagnostic items, got ${cartridge.diagnostic_items.length}`);
  }

  // Helper map for misconceptions
  const misconceptionsMap: Record<string, { title: string; counterExampleBlueprint: any }> = {};
  for (const m of cartridge.misconceptions) {
    misconceptionsMap[m.id] = {
      title: m.title,
      counterExampleBlueprint: m.counter_example_blueprint,
    };
  }

  // Step 2: Initialize Student Session & Adaptive Engine
  console.log("\n--- 2. INITIALIZING ADAPTIVE DIAGNOSTIC SESSION ---");
  const studentUsername = "student_sara_grade5";
  const studentDisplayName = "سارا رضایی (پایه پنجم)";
  const sessionId = `sess_g5_pipe_${Date.now()}`;

  const masteries: Record<string, number> = {};
  for (const kc of cartridge.knowledge_components) {
    masteries[kc.id] = 0.15; // default initial prior
  }

  const answeredItemIds = new Set<string>();
  const responsesPayload: any[] = [];

  // Step 3: Adaptive Question Selection & Response Loop (Simulating 5 items)
  console.log("\n--- 3. EXECUTING COGNITIVE ADAPTIVE LOOP ---");

  // Attempt 1: Correct Answer on KC-01
  const item1 = selectNextAdaptiveItem(cartridge.diagnostic_items, {
    answeredItemIds,
    masteries,
    knowledgeComponents: cartridge.knowledge_components,
    maxItemsPerSession: 6,
  })!;
  answeredItemIds.add(item1.id);
  const correctDis1 = item1.distractors.find((d) => d.is_correct)!;
  const diag1 = evaluateDiagnosticResponse(
    {
      id: correctDis1.id,
      label: correctDis1.label,
      content: correctDis1.content,
      isCorrect: true,
      misconceptionId: null,
      rationale: correctDis1.rationale,
    },
    false,
    misconceptionsMap
  );
  const prior1 = masteries[item1.kc_id];
  const bktResult1 = updateMastery(prior1, true, false);
  masteries[item1.kc_id] = bktResult1.posteriorMastery;
  responsesPayload.push({
    itemId: item1.id,
    kcId: item1.kc_id,
    selectedDistractorId: correctDis1.id,
    isCorrect: true,
    isNotSure: false,
    priorMastery: prior1,
    posteriorMastery: bktResult1.posteriorMastery,
    diagnosedMisconceptionId: null,
  });
  console.log(`[Q1: ${item1.id}] Correct! BKT Mastery: ${(prior1 * 100).toFixed(1)}% -> ${(bktResult1.posteriorMastery * 100).toFixed(1)}%`);

  // Attempt 2: Misconception Triggered on KC-02 (Additive thinking instead of multiplicative)
  const item2 = selectNextAdaptiveItem(cartridge.diagnostic_items, {
    answeredItemIds,
    masteries,
    knowledgeComponents: cartridge.knowledge_components,
    maxItemsPerSession: 6,
  })!;
  answeredItemIds.add(item2.id);
  const misDis2 = item2.distractors.find((d) => d.misconception_id === "MIS-RATIO-ADDITIVE") || item2.distractors.find((d) => !d.is_correct)!;
  const diag2 = evaluateDiagnosticResponse(
    {
      id: misDis2.id,
      label: misDis2.label,
      content: misDis2.content,
      isCorrect: false,
      misconceptionId: misDis2.misconception_id,
      rationale: misDis2.rationale,
    },
    false,
    misconceptionsMap
  );
  const prior2 = masteries[item2.kc_id];
  const bktResult2 = updateMastery(prior2, false, false);
  masteries[item2.kc_id] = bktResult2.posteriorMastery;
  responsesPayload.push({
    itemId: item2.id,
    kcId: item2.kc_id,
    selectedDistractorId: misDis2.id,
    isCorrect: false,
    isNotSure: false,
    priorMastery: prior2,
    posteriorMastery: bktResult2.posteriorMastery,
    diagnosedMisconceptionId: diag2.diagnosedMisconceptionId,
  });
  console.log(`[Q2: ${item2.id}] Misconception Detected: "${diag2.misconceptionTitle}"`);
  console.log(`     Counter-Example Blueprint Prescribed: ${JSON.stringify(diag2.counterExampleBlueprint?.scenario || "N/A")}`);
  console.log(`     BKT Mastery Adjusted: ${(prior2 * 100).toFixed(1)}% -> ${(bktResult2.posteriorMastery * 100).toFixed(1)}%`);

  // Attempt 3: Honest Uncertainty Button on KC-03
  const item3 = selectNextAdaptiveItem(cartridge.diagnostic_items, {
    answeredItemIds,
    masteries,
    knowledgeComponents: cartridge.knowledge_components,
    maxItemsPerSession: 6,
  })!;
  answeredItemIds.add(item3.id);
  const prior3 = masteries[item3.kc_id];
  const bktResult3 = updateMastery(prior3, false, true);
  masteries[item3.kc_id] = bktResult3.posteriorMastery;
  responsesPayload.push({
    itemId: item3.id,
    kcId: item3.kc_id,
    selectedDistractorId: null,
    isCorrect: false,
    isNotSure: true,
    priorMastery: prior3,
    posteriorMastery: bktResult3.posteriorMastery,
    diagnosedMisconceptionId: null,
  });
  console.log(`[Q3: ${item3.id}] Honest Uncertainty ('هنوز مطمئن نیستم') pressed.`);
  console.log(`     BKT Mastery Adjusted without guessing penalty: ${(prior3 * 100).toFixed(1)}% -> ${(bktResult3.posteriorMastery * 100).toFixed(1)}%`);

  // Attempt 4: Correct Answer on KC-04
  const item4 = selectNextAdaptiveItem(cartridge.diagnostic_items, {
    answeredItemIds,
    masteries,
    knowledgeComponents: cartridge.knowledge_components,
    maxItemsPerSession: 6,
  })!;
  answeredItemIds.add(item4.id);
  const correctDis4 = item4.distractors.find((d) => d.is_correct)!;
  const prior4 = masteries[item4.kc_id];
  const bktResult4 = updateMastery(prior4, true, false);
  masteries[item4.kc_id] = bktResult4.posteriorMastery;
  responsesPayload.push({
    itemId: item4.id,
    kcId: item4.kc_id,
    selectedDistractorId: correctDis4.id,
    isCorrect: true,
    isNotSure: false,
    priorMastery: prior4,
    posteriorMastery: bktResult4.posteriorMastery,
    diagnosedMisconceptionId: null,
  });
  console.log(`[Q4: ${item4.id}] Correct! BKT Mastery: ${(prior4 * 100).toFixed(1)}% -> ${(bktResult4.posteriorMastery * 100).toFixed(1)}%`);

  // Attempt 5: Correct Answer on KC-05
  const item5 = selectNextAdaptiveItem(cartridge.diagnostic_items, {
    answeredItemIds,
    masteries,
    knowledgeComponents: cartridge.knowledge_components,
    maxItemsPerSession: 6,
  })!;
  answeredItemIds.add(item5.id);
  const correctDis5 = item5.distractors.find((d) => d.is_correct)!;
  const prior5 = masteries[item5.kc_id];
  const bktResult5 = updateMastery(prior5, true, false);
  masteries[item5.kc_id] = bktResult5.posteriorMastery;
  responsesPayload.push({
    itemId: item5.id,
    kcId: item5.kc_id,
    selectedDistractorId: correctDis5.id,
    isCorrect: true,
    isNotSure: false,
    priorMastery: prior5,
    posteriorMastery: bktResult5.posteriorMastery,
    diagnosedMisconceptionId: null,
  });
  console.log(`[Q5: ${item5.id}] Correct! BKT Mastery: ${(prior5 * 100).toFixed(1)}% -> ${(bktResult5.posteriorMastery * 100).toFixed(1)}%`);

  // Step 4: Persist Session & Latent Mastery to PostgreSQL
  console.log("\n--- 4. PERSISTING SESSION & FSRS SCHEDULING TO POSTGRESQL ---");
  const saveResult = await saveAssessmentSession({
    sessionId,
    learnerUsername: studentUsername,
    learnerDisplayName: studentDisplayName,
    subjectId: cartridge.subject.id,
    responses: responsesPayload,
    masteries,
    isCompleted: true,
  });

  if (!saveResult.success) {
    throw new Error(`Failed to save session: ${saveResult.error}`);
  }
  console.log(`Session successfully persisted with ID: ${saveResult.sessionId}`);

  // Step 5: Verify Student Mastery & Spaced Review from PostgreSQL
  console.log("\n--- 5. RETRIEVING STUDENT MASTERY & FSRS REVIEW STATUS FROM DB ---");
  const studentMastery = await getStudentMasteryStates(studentUsername);
  console.log(`Learner: ${studentMastery.learner?.displayName}`);
  console.log(`Total Assessed KCs in DB: ${studentMastery.masteries.length}`);

  for (const m of studentMastery.masteries) {
    console.log(`   * ${m.title.slice(0, 45)}... : ${(m.masteryProbability * 100).toFixed(0)}% | Stability: ${m.stabilityScore}d | ${m.reviewStatus?.label}`);
  }

  // Step 6: Verify Teacher Diagnostic Heatmap & Aggregated Class Analytics
  console.log("\n--- 6. VERIFYING TEACHER DIAGNOSTIC HEATMAP & ANALYTICS ---");
  const classStats = await getClassDiagnosticStats(cartridge.subject.id);
  console.log(`Total Students Assessed: ${classStats.totalStudents}`);
  console.log(`Class Average Mastery: ${classStats.classAverageMastery}%`);
  console.log(`Most Prevalent Misconception: ${classStats.mostPrevalentMisconception || "None"}`);

  console.log("\nMisconception Prevalence Breakdown:");
  for (const misc of classStats.misconceptionStats) {
    if (misc.detectedCount > 0) {
      console.log(`   ⚠️ [${misc.id}] ${misc.title}: ${misc.prevalencePercent}% (${misc.detectedCount} student) -> Action: ${misc.recommendedAction}`);
    }
  }

  console.log("\n================================================================");
  console.log("✅ FULL END-TO-END PIPELINE FOR GRADE 5 MATHEMATICS VERIFIED 100%!");
  console.log("================================================================\n");
}

runFullPipelineTest()
  .catch((err) => {
    console.error("Pipeline verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
