import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import { ChevronRight, Megaphone, Link as LinkIcon, DollarSign, Target } from "lucide-react";

export const metadata = {
  title: "Publicidade e Afiliados · Moto na Prática",
  description:
    "Conheça as diretrizes comerciais do Moto na Prática. Transparência sobre anúncios, links de afiliados e a separação entre conteúdo editorial e patrocinado.",
};

export default function PublicidadeAfiliadosPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Publicidade e Afiliados</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Nossa Transparência Comercial
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Publicidade e Afiliados
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Para manter nossa operação jornalística e a produção de conteúdo independente, o Moto na Prática pode adotar diferentes modelos de monetização. Esta página explica, de forma antecipada, como lidamos com a publicidade e as parcerias comerciais.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-14">

        {/* REGRAS PRINCIPAIS */}
        <section className="space-y-6">
          <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground mb-6">
            Nossas Diretrizes Comerciais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Target size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Independência Editorial Inegociável
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                As relações comerciais, sejam anúncios diretos, programáticos ou links de afiliados, <strong>não definem nossas conclusões editoriais</strong>. Uma marca que anuncia no portal pode, e será, criticada caso um produto apresente falhas. Nossa lealdade primária é com você, leitor.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Megaphone size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Publicidade Identificável
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                Toda publicidade, conteúdo patrocinado (publieditorial) ou anúncio programático será <strong>claramente identificado</strong> como tal. Não publicamos matérias pagas disfarçadas de jornalismo independente.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <LinkIcon size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Links de Afiliados
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                Em alguns de nossos guias de compras e avaliações de equipamentos, podemos incluir links de afiliados para plataformas de e-commerce (como Amazon, Mercado Livre, etc.). Caso você realize uma compra através desses links, o Moto na Prática pode receber uma pequena comissão.
              </p>
            </div>

             <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <DollarSign size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Preço Inalterado
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                O uso de um link de afiliado <strong>nunca altera o preço final</strong> que você paga pelo produto. A comissão é deduzida da margem de lucro da loja, não do seu bolso. Escolhemos recomendar produtos que acreditamos ter qualidade, independentemente da comissão.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
