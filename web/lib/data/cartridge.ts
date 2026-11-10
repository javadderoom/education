import fs from "fs";
import path from "path";

export interface CanonicalCartridge {
  cartridge_id: string;
  title: string;
  curriculum_source?: string;
  domain: { id: string; name: string; category: string };
  subject: { id: string; name: string; grade_level: number };
  knowledge_components: Array<{
    id: string;
    title: string;
    bloom_level: string;
    description: string;
    prerequisites: string[];
  }>;
  misconceptions: Array<{
    id: string;
    title: string;
    description: string;
    counter_example_blueprint: any;
  }>;
  diagnostic_items: Array<{
    id: string;
    kc_id: string;
    stem: string;
    difficulty: number;
    guess_param: number;
    slip_param: number;
    visual_template?: {
      type: string;
      props: any;
    } | null;
    distractors: Array<{
      id: string;
      label: string;
      content: string;
      is_correct: boolean;
      misconception_id?: string | null;
      rationale?: string | null;
    }>;
  }>;
}

export function resolveCanonicalDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "data/canonical"),
    path.resolve(process.cwd(), "../data/canonical"),
    path.resolve(__dirname, "../../../data/canonical"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      return dir;
    }
  }

  return candidates[0];
}

/**
 * Loads a canonical curriculum cartridge by filename or ID.
 * Defaults to Grade 4 Fractions if none specified.
 */
export function getCanonicalCartridge(filenameOrId: string = "grade4_math_ch2.json"): CanonicalCartridge {
  const dir = resolveCanonicalDir();
  
  // Direct file check
  const filename = filenameOrId.endsWith(".json") ? filenameOrId : `${filenameOrId}.json`;
  const directPath = path.join(/*turbopackIgnore: true*/ dir, filename);
  if (fs.existsSync(/*turbopackIgnore: true*/ directPath)) {
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ directPath, "utf-8");
    return JSON.parse(raw);
  }

  // Search by cartridge_id or subject.id
  if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
    const files = fs.readdirSync(/*turbopackIgnore: true*/ dir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      const fullPath = path.join(/*turbopackIgnore: true*/ dir, f);
      const parsed: CanonicalCartridge = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ fullPath, "utf-8"));
      if (
        parsed.cartridge_id === filenameOrId ||
        parsed.subject.id === filenameOrId ||
        f.replace(".json", "") === filenameOrId
      ) {
        return parsed;
      }
    }
  }

  throw new Error(`Canonical dataset not found for: ${filenameOrId}`);
}

/**
 * Lists all available curriculum cartridges in the repository.
 */
export function listAvailableCartridges(): Array<{
  cartridgeId: string;
  filename: string;
  title: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: number;
  itemCount: number;
}> {
  const dir = resolveCanonicalDir();
  if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) return [];

  const files = fs.readdirSync(/*turbopackIgnore: true*/ dir).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const fullPath = path.join(/*turbopackIgnore: true*/ dir, file);
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ fullPath, "utf-8");
    const parsed: CanonicalCartridge = JSON.parse(raw);
    return {
      cartridgeId: parsed.cartridge_id,
      filename: file,
      title: parsed.title,
      subjectId: parsed.subject.id,
      subjectName: parsed.subject.name,
      gradeLevel: parsed.subject.grade_level,
      itemCount: parsed.diagnostic_items.length,
    };
  });
}
