"use client";
import { memo } from "react";

interface RecipeTextRendererProps {
  text: string;
  className?: string;
}

/**
 * Renders AI-generated recipe text that may contain markdown-like formatting:
 * - **Section Header** → styled heading
 * - * bullet item  → bullet list item with orange dot
 * - 1. Step text   → numbered step with orange circle
 * - plain text     → paragraph (** stripped)
 */
const RecipeTextRenderer = memo(({ text, className = "" }: RecipeTextRendererProps) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line → small spacer
        if (!trimmed) return <div key={i} className="h-1" />;

        // Section heading: **text** or **text:**
        if (trimmed.startsWith("**") && trimmed.includes("**", 2)) {
          const heading = trimmed.replace(/\*\*/g, "").replace(/:$/, "");
          return (
            <p
              key={i}
              className="font-semibold text-gray-800 text-sm mt-3 first:mt-0 border-b border-gray-100 pb-1"
            >
              {heading}
            </p>
          );
        }

        // Bullet point: * text or - text
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "$1");
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-orange font-bold mt-0.5 flex-shrink-0 text-base leading-snug">
                •
              </span>
              <span className="text-gray-700 text-sm leading-relaxed">{content}</span>
            </div>
          );
        }

        // Numbered step: 1. text
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2].replace(/\*\*(.*?)\*\*/g, "$1");
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="bg-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <span className="text-gray-700 text-sm leading-relaxed">{content}</span>
            </div>
          );
        }

        // Regular text — strip any remaining markdown
        const cleaned = trimmed.replace(/\*\*(.*?)\*\*/g, "$1");
        return (
          <p key={i} className="text-gray-700 text-sm leading-relaxed">
            {cleaned}
          </p>
        );
      })}
    </div>
  );
});

RecipeTextRenderer.displayName = "RecipeTextRenderer";
export default RecipeTextRenderer;
