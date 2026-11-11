"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { toPersianDigits, toAsciiDigits, renderPersianKaTeXHtml } from "../../lib/math/persian-digits";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer: Renders text containing LaTeX expressions (e.g. $\frac{2}{7}$)
 * Enforces:
 * 1. Eastern Arabic / Persian digits (۰-۹) for all numbers in text and equations.
 * 2. Explicit LTR container wrapping and BiDi isolation to prevent reversal bugs in RTL contexts.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = "",
  inline = true,
}) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split text by block math ($$...$$) or inline math ($...$)
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

    return parts.map((part, index) => {
      const isBlock = part.startsWith("$$") && part.endsWith("$$") && part.length >= 4;
      const isInline = !isBlock && part.startsWith("$") && part.endsWith("$") && part.length >= 2;

      if (isBlock || isInline) {
        const mathExpr = isBlock ? part.slice(2, -2) : part.slice(1, -1);
        try {
          // Normalize any Persian/Arabic digits or typographic separators (٬, ٫) to standard ASCII
          // before KaTeX parsing to guarantee perfect glyph metrics and eliminate console warnings.
          const normalizedExpr = toAsciiDigits(mathExpr);
          const rawHtml = katex.renderToString(normalizedExpr, {
            throwOnError: false,
            displayMode: isBlock ? true : !inline,
            strict: "ignore",
          });
          const persianHtml = renderPersianKaTeXHtml(rawHtml);

          return (
            <span
              key={index}
              dir="ltr"
              className={
                isBlock
                  ? "block my-2 text-center font-bold text-indigo-700 select-none"
                  : "inline-block mx-1 font-bold text-indigo-700 align-middle select-none"
              }
              dangerouslySetInnerHTML={{ __html: persianHtml }}
            />
          );
        } catch {
          return (
            <span
              key={index}
              dir="ltr"
              className={
                isBlock
                  ? "block my-2 text-center font-bold text-indigo-700 select-none"
                  : "inline-block mx-1 font-bold"
              }
            >
              {toPersianDigits(mathExpr)}
            </span>
          );
        }
      }

      // Regular Persian text with Persian digits
      return <span key={index}>{toPersianDigits(part)}</span>;
    });
  }, [content, inline]);

  return <span className={`leading-relaxed ${className}`}>{renderedElements}</span>;
};
