import React from "react";
import { EditorialSource } from "@/lib/editorial-contract";
import { ExternalLink, Bookmark } from "lucide-react";

interface ArticleSourcesProps {
  sources?: EditorialSource[];
  className?: string;
}

export default function ArticleSources({ sources, className = "" }: ArticleSourcesProps) {
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  return (
    <div className={`my-8 p-5 bg-muted/50 border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Bookmark size={16} className="text-primary" />
        <h4 className="text-[14px] font-bold uppercase tracking-wider text-foreground">
          Fontes e Referências do Artigo
        </h4>
      </div>
      <ul className="space-y-2 text-[13px]">
        {sources.map((src, i) => (
          <li key={i} className="flex items-start gap-2 text-muted-foreground">
            <span className="text-primary font-bold">•</span>
            <div className="flex-1 min-w-0">
              {src.url ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  {src.title || src.publisher || src.url}
                  <ExternalLink size={12} className="shrink-0 text-muted-foreground" />
                </a>
              ) : (
                <span className="text-foreground font-medium">{src.title || src.publisher}</span>
              )}
              {src.publisher && src.title && (
                <span className="text-xs text-muted-foreground ml-1.5">— {src.publisher}</span>
              )}
              {src.primarySource && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded uppercase tracking-wider">
                  Fonte Primária
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
