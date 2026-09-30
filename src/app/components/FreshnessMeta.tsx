import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { shouldShowUpdatedDate } from "@/lib/editorial-contract";

interface FreshnessMetaProps {
  publishedAt?: Date | null;
  modifiedAt?: Date | null;
  lang?: string;
  className?: string;
}

export default function FreshnessMeta({
  publishedAt = null,
  modifiedAt = null,
  lang = "pt",
  className = "",
}: FreshnessMetaProps) {
  if (!publishedAt && !modifiedAt) {
    return null;
  }

  const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
  const updatedPrefix = lang === "en" ? "Updated on" : lang === "es" ? "Actualizado el" : "Atualizado em";
  const publishedPrefix = lang === "en" ? "Published on" : lang === "es" ? "Publicado el" : "Publicado em";

  const showUpdated = shouldShowUpdatedDate(publishedAt, modifiedAt);

  const formattedPublished = publishedAt
    ? publishedAt.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const formattedModified = modifiedAt
    ? modifiedAt.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`flex flex-wrap items-center gap-3 text-[12px] text-white/80 ${className}`}>
      {formattedPublished && (
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-white/70" />
          <span>{formattedPublished}</span>
        </span>
      )}
      {showUpdated && formattedModified && (
        <span className="flex items-center gap-1 text-white/90 italic">
          <RefreshCw size={11} className="text-white/70" />
          <span>
            ({updatedPrefix} {formattedModified})
          </span>
        </span>
      )}
    </div>
  );
}
