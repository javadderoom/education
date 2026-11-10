import { describe, it, expect } from "vitest";
import { cleanTextForSpeech } from "../lib/audio/speech";

describe("Persian Audio Speech Normalizer", () => {
  it("normalizes LaTeX fraction to natural spoken Persian", () => {
    const raw = "حاصل کسر $\\frac{2}{3}$ با کدام گزینه برابر است؟";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain("دو سوم");
    expect(cleaned).not.toContain("\\frac");
    expect(cleaned).not.toContain("$");
  });

  it("normalizes slash fraction format to spoken Persian", () => {
    const raw = "مقدار 3/4 کیلوگرم سیب چقدر است؟";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain("سه چهارم");
  });

  it("falls back to 'بر روی' for unmapped larger fractions", () => {
    const raw = "کسر $\\frac{17}{35}$ را در نظر بگیرید";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain("17 بر روی 35");
  });

  it("replaces mathematical symbols with Persian spoken words", () => {
    const raw = "آیا $2 \\times 3 = 6$ درست است؟";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain("ضرب در");
    expect(cleaned).toContain("برابر است با");
    expect(cleaned).not.toContain("\\times");
    expect(cleaned).not.toContain("=");
  });

  it("strips leftover LaTeX commands and Markdown formatting cleanly", () => {
    const raw = "**توجه:** \\mathbf{مساحت} مستطیل با طول $5$ و عرض $3$ چیست؟";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).not.toContain("**");
    expect(cleaned).not.toContain("\\mathbf");
    expect(cleaned).toContain("مساحت مستطیل با طول 5 و عرض 3 چیست؟");
  });
});
