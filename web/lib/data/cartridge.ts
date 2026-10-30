import fs from "fs";
import path from "path";

export interface CanonicalCartridge {
  cartridge_id: string;
  title: string;
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

export function getCanonicalCartridge(): CanonicalCartridge {
  const possiblePaths = [
    path.resolve(process.cwd(), "../data/canonical/grade4_math_ch2.json"),
    path.resolve(process.cwd(), "data/canonical/grade4_math_ch2.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ p, "utf-8");
      return JSON.parse(raw);
    }
  }

  throw new Error("Canonical dataset not found in data/canonical/grade4_math_ch2.json");
}
