import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import { ChevronRight, Cpu, FileSearch, Edit3, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Uso de Inteligência Artificial · Moto na Prática",
  description:
    "Saiba como utilizamos Inteligência Artificial como ferramenta de apoio à pesquisa e organização de conteúdo, mantendo critérios editoriais, rastreabilidade de fontes e responsabilidade pelo conteúdo.",
};

export default function UsoIAPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Uso de IA</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Transparência Tecnológica
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Uso de Inteligência Artificial
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            No Moto na Prática, acreditamos que a tecnologia deve ser usada para melhorar a qualidade e a profundidade da informação, não para substituí-la. Esta página detalha como a Inteligência Artificial é empregada em nossos processos e, mais importante, quais são os limites do seu uso.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-14">

        {/* IA COMO FERRAMENTA */}
        <section className="space-y-6">
          <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground mb-6">
            A IA como Ferramenta de Apoio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <FileSearch size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Auxílio na Pesquisa e Organização
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                Utilizamos IA para compilar e organizar grandes volumes de dados públicos, como especificações técnicas históricas, catálogos de peças e manuais de serviço, agilizando nosso processo investigativo.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Edit3 size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Auxílio na Redação
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                A IA atua como assistente na estruturação de textos e tradução de jargões técnicos para uma linguagem mais clara. No entanto, ela <strong>nunca é apresentada como autora humana</strong> de nossos conteúdos.
              </p>
            </div>
          </div>
        </section>

        {/* LIMITES E RESPONSABILIDADES */}
        <section className="bg-card border border-border p-6 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Nossos Limites Inegociáveis
            </h2>
          </div>

          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-1">
                <ShieldAlert size={22} />
             </div>
             <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed w-full" style={BODY}>
                <p>
                  Embora a IA seja uma ferramenta poderosa, estabelecemos regras estritas para o seu uso em nosso portal:
                </p>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                     <span className="text-primary font-bold mt-0.5">•</span>
                     <span><strong>Não substitui fontes reais:</strong> Priorizamos fontes primárias quando disponíveis e usamos fontes verificáveis adequadas ao tipo de informação.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="text-primary font-bold mt-0.5">•</span>
                     <span><strong>Não inventa experiências:</strong> A IA não tem permissão para simular vivências pessoais, relatar testes práticos que não ocorreram ou inventar opiniões sobre o comportamento de uma motocicleta.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="text-primary font-bold mt-0.5">•</span>
                     <span><strong>Responsabilidade pela correção:</strong> Se a IA cometer um erro ao processar dados, a responsabilidade é do Moto na Prática. Erros factuais serão prontamente retificados conforme nossa <Link href="/politica-de-correcoes" className="text-primary hover:underline">Política de Correções</Link>.</span>
                  </li>
                </ul>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
