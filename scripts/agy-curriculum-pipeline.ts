import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface AgyGenerationOptions {
  gradeLevel: number;
  chapterNumber: number;
  chapterTitle: string;
  curriculumTopic: string;
  sourceText?: string;
  outputFile?: string;
  model?: "gemini-3.8-flash-high" | "claude-sonnet-4-6" | "claude-opus-4-6-thinking" | string;
}

/**
 * Executes agy.exe with a structured prompt to generate an educational curriculum cartridge.
 * Leverages the user's local Antigravity Pro session without external API costs or GPU overhead.
 */
export async function runAgyCurriculumGenerator(options: AgyGenerationOptions): Promise<{
  success: boolean;
  cartridge?: any;
  error?: string;
  outputPath?: string;
}> {
  return new Promise((resolve) => {
    const userProfile = process.env.USERPROFILE || "";
    const defaultAgyExe = path.join(userProfile, "AppData", "Local", "agy", "bin", "agy.exe");
    const agyPath = fs.existsSync(defaultAgyExe) ? defaultAgyExe : "agy";

    const prompt = `
You are an expert Iranian elementary mathematics pedagogical researcher and cognitive assessment designer.
Generate a complete, production-grade JSON cartridge for the Iranian national mathematics curriculum.

Specification:
- Grade Level: ${options.gradeLevel} (پایه ${options.gradeLevel} ابتدایی)
- Chapter: فصل ${options.chapterNumber} کتاب درسی
- Title: ${options.chapterTitle}
- Subject Topic: ${options.curriculumTopic}
${options.sourceText ? `- Source Guide: ${options.sourceText}` : ""}

Strict Instructions:
1. Generate exactly 5 Knowledge Components (KCs).
2. Generate exactly 5 root Misconceptions tied to common errors in this topic.
3. Generate exactly 5 diagnostic multiple-choice items (one item per Knowledge Component), each with 4 distinct options (1 correct, 3 distractors, at least one distractor mapped to a misconception).
4. Output ONLY valid JSON matching this schema. Do NOT include markdown code fences (like \`\`\`json), markdown formatting, or introductory/explanatory text.

Cartridge Schema:
{
  "cartridge_id": "CART-IR-MATH${options.gradeLevel}-CH0${options.chapterNumber}",
  "title": "ریاضی پایه ${options.gradeLevel} ابتدایی - فصل ${options.chapterNumber}: ${options.chapterTitle}",
  "curriculum_source": "پایگاه کتاب‌های درسی ایران (chap.sch.ir) - راهنمای تدریس معلم",
  "domain": {
    "id": "DOM-K12-MATH",
    "name": "ریاضیات دوره دوم ابتدایی",
    "category": "k12"
  },
  "subject": {
    "id": "SUBJ-MATH${options.gradeLevel}-CH0${options.chapterNumber}",
    "name": "${options.chapterTitle} (پایه ${options.gradeLevel})",
    "grade_level": ${options.gradeLevel}
  },
  "knowledge_components": [
    {
      "id": "KC-MATH${options.gradeLevel}-C0${options.chapterNumber}-01",
      "title": "عنوان سرفصل شناختی اول",
      "bloom_level": "understand",
      "description": "توضیح هدف آموزشی و درک مفهومی",
      "prerequisites": []
    }
  ],
  "misconceptions": [
    {
      "id": "MIS-CODE-1",
      "title": "عنوان بدفهمی",
      "description": "توصیف خطای شناختی دانش‌آموز",
      "counter_example_blueprint": {
        "scenario": "سناریوی مثال نقض",
        "visual_counter_example": "توصیف بصری"
      }
    }
  ],
  "diagnostic_items": [
    {
      "id": "ITEM-MATH${options.gradeLevel}-CH0${options.chapterNumber}-001",
      "kc_id": "KC-MATH${options.gradeLevel}-C0${options.chapterNumber}-01",
      "stem": "صورت سوال با نشانه‌گذاری KaTeX ($...$)",
      "difficulty": 0.4,
      "guess_param": 0.25,
      "slip_param": 0.1,
      "visual_template": null,
      "distractors": [
        {
          "id": "DIS-G${options.gradeLevel}C0${options.chapterNumber}-001-A",
          "label": "الف",
          "content": "پاسخ صحیح",
          "is_correct": true,
          "misconception_id": null,
          "rationale": "دلیل درستی"
        },
        {
          "id": "DIS-G${options.gradeLevel}C0${options.chapterNumber}-001-B",
          "label": "ب",
          "content": "گزینه غلط ریشه‌دار",
          "is_correct": false,
          "misconception_id": "MIS-CODE-1",
          "rationale": "دلیل این پاسخ غلط بر اساس بدفهمی"
        },
        {
          "id": "DIS-G${options.gradeLevel}C0${options.chapterNumber}-001-C",
          "label": "ج",
          "content": "گزینه غلط دوم",
          "is_correct": false,
          "misconception_id": null,
          "rationale": "خطای محاسباتی"
        },
        {
          "id": "DIS-G${options.gradeLevel}C0${options.chapterNumber}-001-D",
          "label": "د",
          "content": "گزینه غلط سوم",
          "is_correct": false,
          "misconception_id": null,
          "rationale": "خطای دیگر"
        }
      ]
    }
  ]
}
`;

    const modelToUse = options.model || "gemini-3.8-flash-high";
    const agyArgs = [
      "--project",
      "education",
      "--model",
      modelToUse,
      "--output-format",
      "text",
      "--print",
      prompt,
    ];
    const agyProcess = spawn(agyPath, agyArgs, {
      shell: false,
      cwd: path.resolve(__dirname, ".."),
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    agyProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    agyProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    agyProcess.on("close", (code) => {
      if (code !== 0) {
        return resolve({
          success: false,
          error: `agy.exe exited with code ${code}. Error: ${stderr}`,
        });
      }

      try {
        // Strip ANSI escape codes if present
        let cleaned = stdout.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").trim();

        // Strip any markdown code fences if present
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

        // Extract JSON substring if surrounded by chatter
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(cleaned);

        // Save output to file if requested
        const targetFilename =
          options.outputFile ||
          `grade${options.gradeLevel}_math_ch${options.chapterNumber}.json`;
        const targetPath = path.resolve(process.cwd(), "data/canonical", targetFilename);

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2), "utf-8");

        return resolve({
          success: true,
          cartridge: parsed,
          outputPath: targetPath,
        });
      } catch (err: any) {
        return resolve({
          success: false,
          error: `Failed to parse JSON from agy output: ${err.message}. Raw output: ${stdout.slice(0, 500)}...`,
        });
      }
    });
  });
}

// CLI Entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  const grade = Number(args[0]) || 4;
  const chapter = Number(args[1]) || 3;
  const title = args[2] || "ضرب و تقسیم";
  const model = args[3] || "gemini-3.8-flash-high";

  console.log(`Starting Antigravity (AGY.exe) Curriculum Ingestion Pipeline using model [${model}] for Grade ${grade}, Chapter ${chapter}: ${title}...`);
  runAgyCurriculumGenerator({
    gradeLevel: grade,
    chapterNumber: chapter,
    chapterTitle: title,
    curriculumTopic: title,
    model: model,
  }).then((res) => {
    if (res.success) {
      console.log(`\nSuccessfully generated curriculum cartridge with AGY.exe!`);
      console.log(`Saved to: ${res.outputPath}`);
      console.log(`Cartridge ID: ${res.cartridge?.cartridge_id}`);
      console.log(`Knowledge Components: ${res.cartridge?.knowledge_components?.length}`);
      console.log(`Diagnostic Items: ${res.cartridge?.diagnostic_items?.length}`);
    } else {
      console.error(`\nAGY Pipeline Error:`, res.error);
    }
  });
}
