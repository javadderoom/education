/**
 * Utility functions for Persian digits conversion and math typography.
 * Enforces Eastern Arabic / Persian digits (۰, ۱, ۲, ۳, ۴, ۵, ۶, ۷, ۸, ۹)
 * in accordance with Iranian elementary textbooks (chap.sch.ir).
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts any ASCII digits in a string or number to Persian digits.
 * e.g. "2/5" -> "۲/۵", 85 -> "۸۵"
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] || digit);
}

/**
 * Safely converts numbers inside visible text nodes of KaTeX-rendered HTML
 * to Persian digits while preserving all HTML tags, CSS dimensions, and class names.
 */
export function renderPersianKaTeXHtml(html: string): string {
  if (!html) return "";
  return html.replace(/>([^<]+)</g, (_match, textNode) => {
    return `>${toPersianDigits(textNode)}<`;
  });
}
