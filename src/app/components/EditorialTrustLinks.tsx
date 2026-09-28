import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function EditorialTrustLinks() {
  return (
    <div className="bg-muted/30 border border-border p-4 rounded-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left text-[12px] text-muted-foreground w-full">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
        <ShieldCheck size={20} />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-foreground mb-1 uppercase tracking-wider text-[11px]">Compromisso Editorial</p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
          <Link href="/sobre" className="hover:text-primary transition-colors hover:underline">
            Sobre o Portal
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link href="/politica-editorial" className="hover:text-primary transition-colors hover:underline">
            Política Editorial
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link href="/como-pesquisamos" className="hover:text-primary transition-colors hover:underline">
            Como Pesquisamos
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link href="/uso-de-inteligencia-artificial" className="hover:text-primary transition-colors hover:underline">
            Uso de IA
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link href="/politica-de-correcoes" className="hover:text-primary transition-colors hover:underline">
            Correções
          </Link>
        </div>
      </div>
    </div>
  );
}
