import React from "react";
import { TEKO, BODY, optimizeImageUrl } from "../data";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Newspaper,
  Mail,
  ChevronRight,
  CheckCircle2,
  Bike,
} from "lucide-react";

export const metadata = {
  title: "Equipe Editorial & Ficha Técnica · Moto na Prática",
  description:
    "Conheça os jornalistas, pilotos de teste, consultores mecânicos e fundadores do Moto na Prática. Credenciais técnicas, transparência e autoridade sobre duas rodas.",
};

export default function EquipePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Equipe Editorial</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Ficha Técnica & Redação E-E-A-T
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Quem Faz o Moto na Prática
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Nossa publicação é mantida por pesquisa documental profunda e rigor técnico, liderada por Eliezer Josué Vargas, combinando ferramentas modernas e inteligência artificial para entregar informação clara e útil ao motociclista brasileiro.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">
        
        {/* PERFIS DOS MEMBROS */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              A Identidade Editorial
            </h2>
          </div>

          <div className="bg-card border border-border overflow-hidden flex flex-col justify-between">
                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary">
                        Responsabilidade Editorial
                      </span>
                      <h3 style={TEKO} className="text-[26px] font-semibold uppercase text-foreground leading-tight mt-1">
                        Redação Moto na Prática
                      </h3>
                      <p className="text-[13px] text-muted-foreground font-medium" style={BODY}>
                        Publicação Independente
                      </p>
                    </div>
                  </div>

                  <p className="text-[13.5px] text-muted-foreground leading-relaxed border-t border-border pt-4" style={BODY}>
                    Todos os conteúdos publicados sob a chancela da Redação Moto na Prática seguem nossas rígidas diretrizes editoriais. Não inventamos nomes, credenciais ou experiências físicas. Quando o conteúdo for fruto exclusivo de consolidação de dados e pesquisa documental, ele será assinado institucionalmente pelo portal.
                  </p>
                </div>

                <div className="bg-background border-t border-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-[12px]" style={BODY}>
                  <Link href="/contato" className="flex items-center gap-1 text-primary hover:underline font-semibold">
                    Falar com o Portal
                  </Link>
                </div>
              </div>
        </section>

        {/* COMPROMISSO COM O JORNALISMO E ÉTICA */}
        <section className="bg-card border border-border p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[30px] font-semibold uppercase tracking-wide text-foreground">
              Nossos Compromissos Éticos e Técnicos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <ShieldCheck size={18} className="text-primary" />
                <span>Checagem Dupla (Double-Check)</span>
              </div>
              <p>
                Especificações técnicas são consolidadas a partir de fontes oficiais e cruzadas com manuais para evitar a propagação de boatos e informações erradas.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Award size={18} className="text-primary" />
                <span>Experiência Real Comprovada</span>
              </div>
              <p>
                Nossa abordagem é pautada na utilidade para o motociclista, separando claramente o que é fato documentado de especulação de mercado.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Newspaper size={18} className="text-primary" />
                <span>Código de Ética do Jornalista</span>
              </div>
              <p>
                Nossa redação segue o Código de Ética dos Jornalistas Brasileiros, assegurando o direito de resposta, retificação imediata de equívocos e o respeito irrestrito ao leitor.
              </p>
            </div>
          </div>
        </section>


        {/* EXPEDIENTE FORMAL */}
        <section className="bg-muted/30 border border-border p-6 md:p-8 space-y-4">
          <h3 style={TEKO} className="text-[24px] font-semibold uppercase tracking-wider text-foreground">
            Expediente do Portal Moto na Prática
          </h3>
          <div className="flex flex-col gap-4 text-[13px]" style={BODY}>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">Responsável pelo Projeto</span>
              <span className="text-foreground font-medium">Eliezer Josué Vargas</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">Contato Institucional</span>
              <Link href="/contato" className="text-primary font-semibold hover:underline">
                Página de Contato
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}