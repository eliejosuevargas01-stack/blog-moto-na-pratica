import React from "react";
import { TEKO, BODY } from "../data";
import ContactForm from "./ContactForm";
import Link from "next/link";
import { Mail, Newspaper, Clock, MapPin, ShieldCheck, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Contato & Redação · Moto na Prática",
  description:
    "Entre em contato com a equipe editorial do Moto na Prática. Sugestões de pauta, canal para assessorias de imprensa, parcerias comerciais e dúvidas técnicas.",
};

export default function ContatoPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Contato</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Canais Oficiais
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Fale com a Redação & Comercial
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Tem uma sugestão de pauta, identificou uma correção necessária, deseja propor uma parceria comercial ou enviar um press release institucional? Utilize nossos canais diretos abaixo ou preencha o formulário para atendimento ágil.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* COLUNA ESQUERDA: Formulário Institucional (7 colunas) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* COLUNA DIREITA: Assessorias de Imprensa e Contatos Diretos (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bloco de Assessorias de Imprensa */}
            <div className="bg-card border border-border p-6 rounded-none">
              <div className="flex items-center gap-2.5 text-primary mb-3">
                <Newspaper size={20} />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide text-foreground">
                  Para Assessorias de Imprensa
                </h3>
              </div>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-4" style={BODY}>
                Recebemos comunicações institucionais de empresas do setor e organizadores de eventos esportivos.
              </p>
              
              <ul className="space-y-2.5 text-[13px] text-foreground border-t border-border pt-4 mb-4" style={BODY}>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Press Releases & Lançamentos:</strong> Envio de kits de imprensa, notas oficiais e dados técnicos homologados.</span>
                </li>


              </ul>

              <div className="p-3 bg-muted/50 border border-border text-[12.5px] text-muted-foreground" style={BODY}>
                <strong className="text-foreground">E-mail da Assessoria:</strong>{" "}
                <a href="/contato" className="text-primary font-medium hover:underline">
                  Fale conosco via Página de Contato
                </a>
              </div>
            </div>

            {/* Bloco de Contatos Diretos */}
            <div className="bg-card border border-border p-6 rounded-none">
              <div className="flex items-center gap-2.5 text-primary mb-3">
                <Mail size={20} />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide text-foreground">
                  Contatos por Departamento
                </h3>
              </div>
              <div className="space-y-3.5 text-[13px]" style={BODY}>
                <p className="text-muted-foreground">Por favor, utilize o formulário ao lado para direcionar sua solicitação ao departamento correto.</p>
              </div>
                        </div>


            {/* Informações Institucionais de Operação */}
            <div className="bg-card border border-border p-6 rounded-none space-y-3 text-[13px]" style={BODY}>
              <div className="flex items-center gap-2.5 text-foreground font-semibold pt-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>Independência Editorial</span>
              </div>
              <p className="text-muted-foreground pl-6">
                Nossas análises são conduzidas de forma imparcial. Conheça nossa{" "}
                <Link href="/politica-editorial" className="text-primary underline">
                  metodologia de avaliação completa
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}