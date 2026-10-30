/**
 * Unit Test Script for Pure TypeScript BKT Engine
 */

import { updateMastery } from "../lib/bkt/engine";
import { DEFAULT_BKT_PARAMS } from "../lib/bkt/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log("--- Running BKT Engine Verification Tests ---");

// Test 1: Novice student gets correct answer
const step1 = updateMastery(0.15, true, false, DEFAULT_BKT_PARAMS);
console.log("Step 1 (Correct):", step1);
assert(step1.posteriorMastery > 0.15, "Posterior must increase on correct answer");
assert(step1.predictedNextMastery > step1.posteriorMastery, "Predicted next must account for learning transition");

// Test 2: Second correct answer in a row
const step2 = updateMastery(step1.predictedNextMastery, true, false, DEFAULT_BKT_PARAMS);
console.log("Step 2 (Correct):", step2);
assert(step2.posteriorMastery > step1.posteriorMastery, "Second correct answer must further increase mastery");

// Test 3: Third correct answer leads to mastery
const step3 = updateMastery(step2.predictedNextMastery, true, false, DEFAULT_BKT_PARAMS);
console.log("Step 3 (Correct):", step3);
assert(step3.posteriorMastery > step2.posteriorMastery, "Third correct answer should advance mastery further");

// Test 4: Student with high mastery makes an incorrect answer (Slip vs Unlearning)
const stepSlip = updateMastery(0.85, false, false, DEFAULT_BKT_PARAMS);
console.log("Step Slip (Mastered student incorrect):", stepSlip);
assert(stepSlip.posteriorMastery < 0.85, "Mastery must decrease on incorrect answer");
assert(stepSlip.posteriorMastery > 0.10, "A single error should not completely reset high mastery to zero due to slip param");

// Test 5: "I'm Not Sure" option
const stepNotSure = updateMastery(0.50, false, true, DEFAULT_BKT_PARAMS);
console.log("Step Not Sure (Honesty button):", stepNotSure);
assert(stepNotSure.posteriorMastery < 0.50, "Not sure should decrease estimate");
assert(stepNotSure.posteriorMastery > 0.30, "Not sure should not punish student as severely as an uneducated guess error");

console.log("✅ ALL BKT MATHEMATICAL ENGINE TESTS PASSED SUCCESSFULLY!");
