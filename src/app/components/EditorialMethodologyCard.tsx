import React from "react";
import { TEKO, BODY } from "../data";
import { Search, FileSearch, PenTool, CheckCircle2, Send, FileText } from "lucide-react";

export default function EditorialMethodologyCard() {
  const steps = [
    { name: "Pauta", icon: <FileText size={16} /> },
    { name: "Pesquisa", icon: <Search size={16} /> },
    { name: "Verificação", icon: <FileSearch size={16} /> },
    { name: "Redação", icon: <PenTool size={16} /> },
    { name: "Revisão", icon: <CheckCircle2 size={16} /> },
    { name: "Publicação", icon: <Send size={16} /> },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-sm w-full">
      <div className="mb-6">
        <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide text-foreground mb-1">
          Nossa Metodologia Editorial
        </h3>
        <p className="text-[12.5px] text-muted-foreground" style={BODY}>
          Conheça o processo pelo qual cada conteúdo passa antes de chegar até você.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center text-center group w-full md:w-auto">
              <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300 mb-2">
                {step.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors" style={BODY}>
                {step.name}
              </span>
            </div>

            {/* Arrow separator, hidden on mobile for vertical stack, visible on desktop */}
            {index < steps.length - 1 && (
              <div className="hidden md:block w-4 h-px bg-border flex-shrink-0" />
            )}

            {/* Vertical connector for mobile */}
            {index < steps.length - 1 && (
               <div className="block md:hidden h-4 w-px bg-border" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
