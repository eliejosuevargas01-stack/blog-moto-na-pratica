import React from "react";
import { Info } from "lucide-react";

interface ArticleDisclosureProps {
  disclosure?: string;
  className?: string;
}

export default function ArticleDisclosure({ disclosure, className = "" }: ArticleDisclosureProps) {
  if (!disclosure || typeof disclosure !== "string" || disclosure.trim().length === 0) {
    return null;
  }

  return (
    <div className={`my-6 p-4 bg-muted/60 border-l-4 border-amber-500 rounded-r-md text-[13px] text-foreground/90 ${className}`}>
      <div className="flex items-start gap-2.5">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-0.5">
            Nota de Transparência
          </span>
          <p className="leading-relaxed text-muted-foreground">{disclosure.trim()}</p>
        </div>
      </div>
    </div>
  );
}
