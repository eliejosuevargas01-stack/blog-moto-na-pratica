import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import { ChevronRight, Search, FileText, CheckCircle2, GitMerge, FileSearch, Edit3, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Como Pesquisamos · Moto na Prática",
  description:
    "Saiba como a redação do Moto na Prática pesquisa, verifica e produz os conteúdos. Conheça nossa metodologia de coleta de dados e fontes primárias.",
};

export default function ComoPesquisamosPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Como Pesquisamos</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Nossa Metodologia
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Como Pesquisamos e Verificamos
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Transparência no acesso à informação é a base da nossa relação com você. Detalhamos abaixo as etapas do nosso processo editorial, desde a definição de pauta até a publicação, combinando fontes confiáveis, cruzamento de dados e o uso de ferramentas tecnológicas.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-14">

        {/* ETAPAS DO PROCESSO */}
        <section className="space-y-6">
          <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground mb-6">
            O Ciclo de Vida da Informação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold">1</span>
                 </div>
                 <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground">
                   Definição da Pauta
                 </h3>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed ml-11" style={BODY}>
                Nossas pautas nascem das dúvidas reais dos motociclistas, tendências do mercado, lançamentos oficiais e necessidades de manutenção prática. Focamos no que é útil e relevante.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold">2</span>
                 </div>
                 <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground">
                   Coleta e Fontes Primárias
                 </h3>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed ml-11" style={BODY}>
                Priorizamos fontes originais: manuais de proprietário, fichas técnicas oficiais de montadoras, comunicados de imprensa homologados e documentos governamentais (como órgãos oficiais brasileiros).
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold">3</span>
                 </div>
                 <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground">
                   Cruzamento e Verificação
                 </h3>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed ml-11" style={BODY}>
                Informações de mercado e especificações técnicas são cruzadas para identificar inconsistências. Quando aplicável, buscamos confirmar especificações com documentação oficial do fabricante e outras fontes primárias.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="font-bold">4</span>
                 </div>
                 <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground">
                   Atualidade do Dado
                 </h3>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed ml-11" style={BODY}>
                Verificamos rigorosamente a data da informação. Modelos de anos diferentes podem ter alterações sutis na mecânica ou componentes que mudam totalmente o resultado de uma análise.
              </p>
            </div>
          </div>
        </section>

        {/* REDAÇÃO E REVISÃO */}
        <section className="bg-card border border-border p-6 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Consolidação, Redação e Revisão
            </h2>
          </div>

          <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Após a consolidação dos dados brutos e documentos das fontes originais, a estruturação do texto é iniciada.
              Nesta etapa, o objetivo é traduzir termos técnicos complexos e manuais difíceis em linguagem clara, direta e acessível para o motociclista comum.
            </p>
            <p>
              Antes da publicação, o conteúdo passa por um processo automatizado e/ou editorial para revisão de formato, checagem da clareza das informações e garantia de que o texto final não deturpa o contexto original das fontes consultadas.
            </p>
          </div>
        </section>

        {/* FERRAMENTAS E TECNOLOGIA */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
             <span className="block w-1 h-7 bg-primary" />
             <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
                Uso de Ferramentas e Tecnologia
             </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
             <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                <Search size={24} />
             </div>
             <div className="space-y-3" style={BODY}>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  Para analisar grandes volumes de dados, pesquisar especificações ao longo das décadas e consolidar informações espalhadas por vários manuais oficiais, o Moto na Prática utiliza rotinas e ferramentas automatizadas, além de recursos de Inteligência Artificial.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  Essas tecnologias atuam exclusivamente como mecanismos de apoio à pesquisa e organização da pauta. A responsabilidade pelas regras editoriais e o compromisso ético são inegociáveis. Para entender mais, leia nossa página específica sobre o <Link href="/uso-de-inteligencia-artificial" className="text-primary hover:underline">uso de inteligência artificial</Link>.
                </p>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
