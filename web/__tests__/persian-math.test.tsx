/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { toPersianDigits, toAsciiDigits, renderPersianKaTeXHtml } from "../lib/math/persian-digits";
import { MathRenderer } from "../components/ui/MathRenderer";

describe("Persian Digits & Math Formatting Engine", () => {
  it("converts ASCII numbers to Eastern Arabic/Persian digits correctly", () => {
    expect(toPersianDigits("0123456789")).toBe("۰۱۲۳۴۵۶۷۸۹");
    expect(toPersianDigits("2/7")).toBe("۲/۷");
    expect(toPersianDigits(85)).toBe("۸۵");
    expect(toPersianDigits(null)).toBe("");
    expect(toPersianDigits(undefined)).toBe("");
  });

  it("converts Persian and Arabic digits and separators back to ASCII correctly", () => {
    expect(toAsciiDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(toAsciiDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(toAsciiDigits("۱۹۲٬۵۰۰")).toBe("192,500");
    expect(toAsciiDigits("۳٫۱۴")).toBe("3.14");
    expect(toAsciiDigits(null)).toBe("");
  });

  it("safely converts visible text nodes in KaTeX HTML without breaking CSS styles", () => {
    const rawHtml = '<span class="mord" style="height:0.84em; color:rgb(0,0,0);">2</span>';
    const persianHtml = renderPersianKaTeXHtml(rawHtml);

    // Text node replaced
    expect(persianHtml).toContain(">۲<");
    // Attribute and CSS untouched
    expect(persianHtml).toContain('style="height:0.84em; color:rgb(0,0,0);"');
  });

  it("renders MathRenderer with Persian numbers and wraps in dir=ltr", () => {
    const { container } = render(
      <MathRenderer content="حاصل عبارت $\frac{2}{7} + \frac{3}{7}$ را پیدا کنید." />
    );

    expect(container.textContent).toContain("حاصل عبارت");
    // Visible text has Persian digits
    expect(container.textContent).toContain("۲");
    expect(container.textContent).toContain("۷");
    expect(container.textContent).toContain("۳");
    expect(container.textContent).not.toContain("2/7");

    // LTR wrapper for math exists
    const ltrContainer = container.querySelector('[dir="ltr"]');
    expect(ltrContainer).toBeInTheDocument();
  });

  it("safely renders MathRenderer when input contains Persian numerals or commas inside math delimiters without console warnings", () => {
    const { container } = render(
      <MathRenderer content="مبلغ $۱۹۲٬۵۰۰$ ریال و $\frac{۲}{۵}$ کسر" />
    );

    expect(container.textContent).toContain("مبلغ");
    expect(container.textContent).toContain("۱۹۲,۵۰۰");
    expect(container.textContent).toContain("۲");
    expect(container.textContent).toContain("۵");
  });
});
