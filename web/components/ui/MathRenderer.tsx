"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { toPersianDigits, renderPersianKaTeXHtml } from "../../lib/math/persian-digits";

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

    // Split text by single dollar signs for inline math: e.g. "حاصل $\frac{2}{3}$ را بیابید"
    const parts = content.split(/(\$[^$]+\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        const mathExpr = part.slice(1, -1);
        try {
          const rawHtml = katex.renderToString(mathExpr, {
            throwOnError: false,
            displayMode: !inline,
          });
          const persianHtml = renderPersianKaTeXHtml(rawHtml);

          return (
            <span
              key={index}
              dir="ltr"
              className="inline-block mx-1 font-mono text-indigo-700 align-middle select-none"
              dangerouslySetInnerHTML={{ __html: persianHtml }}
            />
          );
        } catch {
          return (
            <span key={index} dir="ltr" className="inline-block mx-1 font-mono">
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
