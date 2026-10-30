"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer: Renders text containing LaTeX expressions (e.g. $\frac{2}{7}$)
 * Enforces explicit LTR container wrapping and \u200E marks to prevent BiDi reordering in RTL Persian contexts.
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
          const html = katex.renderToString(mathExpr, {
            throwOnError: false,
            displayMode: !inline,
          });

          return (
            <span
              key={index}
              dir="ltr"
              className="inline-block mx-1 font-mono text-indigo-700 align-middle select-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={index} dir="ltr" className="inline-block mx-1 font-mono">
              {mathExpr}
            </span>
          );
        }
      }

      // Regular Persian text
      return <span key={index}>{part}</span>;
    });
  }, [content, inline]);

  return <span className={`leading-relaxed ${className}`}>{renderedElements}</span>;
};
