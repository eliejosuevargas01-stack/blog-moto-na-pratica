import React from "react";
import { AuthorIdentity } from "@/lib/editorial-contract";
import { User, Building2 } from "lucide-react";

interface AuthorBylineProps {
  author?: AuthorIdentity;
  className?: string;
}

export default function AuthorByline({ author, className = "" }: AuthorBylineProps) {
  if (!author || !author.name) {
    return null;
  }

  const isOrg = author.type === "ORGANIZATION";

  return (
    <div className={`inline-flex items-center gap-1.5 text-[12px] font-medium text-white/90 ${className}`}>
      {isOrg ? (
        <Building2 size={13} className="text-white/70" />
      ) : (
        <User size={13} className="text-white/70" />
      )}
      <span>Por</span>
      {author.profileUrl ? (
        <a
          href={author.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white underline hover:text-white/80 transition-colors"
        >
          {author.name}
        </a>
      ) : (
        <span className="font-semibold text-white">{author.name}</span>
      )}
      {author.role && (
        <span className="text-white/70 text-[11px] font-normal">({author.role})</span>
      )}
    </div>
  );
}
