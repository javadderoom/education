import * as fs from "fs";
import * as path from "path";

export interface ValidationIssue {
  file: string;
  type: "error" | "warning";
  path: string;
  message: string;
}

const TECH_JARGON_TERMS = [
  "BKT",
  "DKT",
  "Bayesian",
  "Next.js",
  "React",
  "Prisma",
  "PostgreSQL",
  "Vercel",
  "SymPy",
  "Gemini",
  "LLM",
  "KaTeX",
  "FOSS",
  "Open-Source",
];

export function validateCartridgeFile(filePath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fileName = path.basename(filePath);

  let rawContent: string;
  try {
    rawContent = fs.readFileSync(filePath, "utf-8");
  } catch (err: any) {
    issues.push({
      file: fileName,
      type: "error",
      path: "",
      message: `Failed to read file: ${err.message}`,
    });
    return issues;
  }

  let data: any;
  try {
    data = JSON.parse(rawContent);
  } catch (err: any) {
    issues.push({
      file: fileName,
      type: "error",
      path: "JSON",
      message: `Invalid JSON syntax: ${err.message}`,
    });
    return issues;
  }

  // Top-level schema check
  if (!data.cartridge_id) {
    issues.push({ file: fileName, type: "error", path: "cartridge_id", message: "Missing cartridge_id" });
  }
  if (!data.title) {
    issues.push({ file: fileName, type: "error", path: "title", message: "Missing title" });
  }
  if (!data.domain?.id || !data.domain?.name) {
    issues.push({ file: fileName, type: "error", path: "domain", message: "Missing domain id or name" });
  }
  if (!data.subject?.id || !data.subject?.name || typeof data.subject?.grade_level !== "number") {
    issues.push({ file: fileName, type: "error", path: "subject", message: "Missing or invalid subject" });
  }

  // Knowledge Components check
  const kcIds = new Set<string>();
  if (!Array.isArray(data.knowledge_components) || data.knowledge_components.length === 0) {
    issues.push({ file: fileName, type: "error", path: "knowledge_components", message: "Must have non-empty knowledge_components" });
  } else {
    data.knowledge_components.forEach((kc: any, idx: number) => {
      if (!kc.id) issues.push({ file: fileName, type: "error", path: `knowledge_components[${idx}].id`, message: "Missing KC id" });
      if (!kc.title) issues.push({ file: fileName, type: "error", path: `knowledge_components[${idx}].title`, message: "Missing KC title" });
      if (!kc.description) issues.push({ file: fileName, type: "warning", path: `knowledge_components[${idx}].description`, message: "Missing KC description" });
      if (kc.id) {
        if (kcIds.has(kc.id)) {
          issues.push({ file: fileName, type: "error", path: `knowledge_components[${idx}].id`, message: `Duplicate KC ID: ${kc.id}` });
        }
        kcIds.add(kc.id);
      }
    });
  }

  // Misconceptions check
  const misIds = new Set<string>();
  if (!Array.isArray(data.misconceptions)) {
    issues.push({ file: fileName, type: "error", path: "misconceptions", message: "Missing misconceptions array" });
  } else {
    data.misconceptions.forEach((mis: any, idx: number) => {
      if (!mis.id) issues.push({ file: fileName, type: "error", path: `misconceptions[${idx}].id`, message: "Missing misconception id" });
      if (!mis.title) issues.push({ file: fileName, type: "error", path: `misconceptions[${idx}].title`, message: "Missing misconception title" });
      if (mis.id) {
        if (misIds.has(mis.id)) {
          issues.push({ file: fileName, type: "error", path: `misconceptions[${idx}].id`, message: `Duplicate misconception ID: ${mis.id}` });
        }
        misIds.add(mis.id);
      }
    });
  }

  // Diagnostic Items check
  if (!Array.isArray(data.diagnostic_items) || data.diagnostic_items.length === 0) {
    issues.push({ file: fileName, type: "error", path: "diagnostic_items", message: "Must have non-empty diagnostic_items" });
  } else {
    const itemIds = new Set<string>();
    data.diagnostic_items.forEach((item: any, idx: number) => {
      const itemPath = `diagnostic_items[${idx}]`;
      if (!item.id) {
        issues.push({ file: fileName, type: "error", path: `${itemPath}.id`, message: "Missing item id" });
      } else {
        if (itemIds.has(item.id)) {
          issues.push({ file: fileName, type: "error", path: `${itemPath}.id`, message: `Duplicate item ID: ${item.id}` });
        }
        itemIds.add(item.id);
      }

      if (!item.kc_id || !kcIds.has(item.kc_id)) {
        issues.push({ file: fileName, type: "error", path: `${itemPath}.kc_id`, message: `Invalid or unmapped kc_id: ${item.kc_id}` });
      }

      if (!item.stem || typeof item.stem !== "string") {
        issues.push({ file: fileName, type: "error", path: `${itemPath}.stem`, message: "Missing or invalid stem" });
      }

      // Check Distractors
      if (!Array.isArray(item.distractors) || item.distractors.length !== 4) {
        issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors`, message: `Must have exactly 4 distractors (found ${item.distractors?.length || 0})` });
      } else {
        const correctChoices = item.distractors.filter((d: any) => d.is_correct === true);
        if (correctChoices.length !== 1) {
          issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors`, message: `Must have exactly 1 correct option (found ${correctChoices.length})` });
        }

        const contents = item.distractors.map((d: any) => String(d.content || "").trim());
        const uniqueContents = new Set(contents);
        if (uniqueContents.size !== contents.length) {
          issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors`, message: `Duplicate option content detected: ${contents.join(" | ")}` });
        }

        item.distractors.forEach((d: any, dIdx: number) => {
          if (!d.id) issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors[${dIdx}].id`, message: "Missing distractor id" });
          if (!d.label) issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors[${dIdx}].label`, message: "Missing distractor label" });
          if (d.misconception_id && !misIds.has(d.misconception_id)) {
            issues.push({ file: fileName, type: "error", path: `${itemPath}.distractors[${dIdx}].misconception_id`, message: `Referenced unknown misconception_id: ${d.misconception_id}` });
          }
        });
      }

      // Rule 10 check: No tech jargon leaks in student-facing stem and rationales
      const textToScan = [
        item.stem,
        ...(item.distractors || []).map((d: any) => `${d.content} ${d.rationale || ""}`),
      ].join(" ");

      for (const term of TECH_JARGON_TERMS) {
        const regex = new RegExp(`\\b${term}\\b`, "i");
        if (regex.test(textToScan)) {
          issues.push({
            file: fileName,
            type: "error",
            path: `${itemPath}`,
            message: `Rule 10 violation: Tech stack term '${term}' detected in user-facing content`,
          });
        }
      }
    });
  }

  return issues;
}

export function validateAllCanonicalCartridges(): boolean {
  const dir = path.resolve(__dirname, "../data/canonical");
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return false;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  console.log(`\nFound ${files.length} canonical cartridge(s) to validate in ${dir}:`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const issues = validateCartridgeFile(fullPath);
    const errors = issues.filter((i) => i.type === "error");
    const warnings = issues.filter((i) => i.type === "warning");

    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`  ✓ ${file}: VALID (0 errors, 0 warnings)`);
    } else {
      console.log(`  ${errors.length > 0 ? "✗" : "⚠"} ${file}: ${errors.length} error(s), ${warnings.length} warning(s)`);
      for (const issue of issues) {
        console.log(`    [${issue.type.toUpperCase()}] ${issue.path}: ${issue.message}`);
      }
    }
  }

  console.log(`\nValidation complete: ${totalErrors} error(s), ${totalWarnings} warning(s).\n`);
  return totalErrors === 0;
}

export function runCli() {
  const success = validateAllCanonicalCartridges();
  if (process.exitCode === undefined) {
    process.exitCode = success ? 0 : 1;
  }
  return success;
}

const isDirectRun =
  require.main === module ||
  (process.argv[1] && process.argv[1].replace(/\\/g, "/").includes("validate-cartridges"));

if (isDirectRun) {
  runCli();
}
