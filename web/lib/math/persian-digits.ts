/**
 * Utility functions for Persian digits conversion and math typography.
 * Enforces Eastern Arabic / Persian digits (۰, ۱, ۲, ۳, ۴, ۵, ۶, ۷, ۸, ۹)
 * in accordance with Iranian elementary textbooks (chap.sch.ir).
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const PERSIAN_ARABIC_TO_ASCII: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "٬": ",", "٫": "."
};

/**
 * Converts any ASCII digits in a string or number to Persian digits.
 * e.g. "2/5" -> "۲/۵", 85 -> "۸۵"
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] || digit);
}

/**
 * Converts Persian and Arabic numerals and typographic separators (٬, ٫) to standard ASCII equivalents.
 * Critical before feeding mathematical expressions to KaTeX to prevent unrecognized Unicode warnings
 * and missing glyph metric errors.
 */
export function toAsciiDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[۰-۹٠-٩٬٫]/g, (char) => PERSIAN_ARABIC_TO_ASCII[char] || char);
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
