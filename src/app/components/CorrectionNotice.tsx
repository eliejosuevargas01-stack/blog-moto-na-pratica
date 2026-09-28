import React from "react";
import { CorrectionInfo } from "@/lib/editorial-contract";
import { AlertCircle } from "lucide-react";

interface CorrectionNoticeProps {
  correction?: CorrectionInfo;
  className?: string;
}

export default function CorrectionNotice({ correction, className = "" }: CorrectionNoticeProps) {
  if (!correction || !correction.description) {
    return null;
  }

  return (
    <div className={`my-6 p-4 bg-muted/70 border-l-4 border-blue-500 rounded-r-md text-[13px] ${className}`}>
      <div className="flex items-start gap-2.5">
        <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Nota de Correção
            </span>
            {correction.correctedAt && (
              <span className="text-[11px] text-muted-foreground">
                ({new Date(correction.correctedAt).toLocaleDateString("pt-BR")})
              </span>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">{correction.description}</p>
          {correction.previousText && (
            <p className="text-xs text-muted-foreground/80 line-through italic">
              Original: {correction.previousText}
            </p>
          )}
          {correction.correctedText && (
            <p className="text-xs text-foreground font-medium">
              Corrigido: {correction.correctedText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
