import React from "react";
import { TEKO, BODY } from "../data";
import AdvertiseContactForm from "./AdvertiseContactForm";
import Link from "next/link";
import {
  Users,
  Eye,
  Clock,
  Mail,
  Layers,
  FileText,
  ShieldAlert,
  Wrench,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Anuncie no Portal · Mídia Kit & Publicidade · Moto na Prática",
  description:
    "Conecte sua marca a milhares de motociclistas qualificados, entusiastas e viajantes. Conheça nossos formatos IAB, publieditoriais transparentes e mídia kit.",
};

const STATS = [
  { value: "+280.000", label: "Visualizações de Página / Mês", icon: Eye },
  { value: "+110.000", label: "Leitores Únicos Mensais", icon: Users },
  { value: "4m 15s", label: "Tempo Médio de Leitura", icon: Clock },
  { value: "+19.000", label: "Inscritos na Newsletter", icon: Mail },
];

const TARGET_AUDIENCES = [
  {
    title: "Motociclistas do Dia a Dia",
    tag: "Commuters Urbanos",
    desc: "Pilotos que utilizam a moto diariamente para trabalho e deslocamento urbano. Focados em economia de combustível, pneus duráveis, segurança no trânsito e manutenção preventiva.",
    percentage: "42% da audiência",
  },
  {
    title: "Viajantes & Mototuristas",
    tag: "Estrada & Longa Distância",
    desc: "Apaixonados por viagens de moto nos fins de semana e férias. Consumidores exigentes de baús, vestuário impermeável, intercomunicadores, GPS e revisões completas pré-estrada.",
    percentage: "28% da audiência",
  },
  {
    title: "Compradores de Primeira Moto",
    tag: "Novos Habilitados",
    desc: "Público em fase de decisão de compra, pesquisando comparativos entre modelos de entrada (125cc a 300cc), custos de seguro, financiamento e capacetes com melhor custo-benefício.",
    percentage: "18% da audiência",
  },
  {
    title: "Entusiastas & Mecânica DIY",
    tag: "Performance & Garagem",
    desc: "Leitores com interesse técnico profundo que realizam suas próprias manutenções na garagem, acompanham competições como MotoGP e valorizam peças de reposição de primeira linha.",
    percentage: "12% da audiência",
  },
];

const MEDIA_FORMATS = [
  {
    title: "Banners Responsivos IAB",
    badge: "Display de Alta Visibilidade",
    icon: Layers,
    desc: "Posições estratégicas sem poluição visual. Inclui Super Banner Topo (728x90 / 970x90), Retângulos Médios (MPU 300x250) integrados no fluxo do artigo e Sticky Footer Mobile (320x50 / 320x100) com alta taxa de CTR.",
  },
  {
    title: "Branded Content & Reviews Técnicos",
    badge: "Conteúdo Editorial Aprofundado",
    icon: FileText,
    desc: "Artigos profundos produzidos por nossa equipe técnica sobre o seu produto, moto ou acessório. Respeitamos as diretrizes do CONAR: todo conteúdo comercial recebe identificação explícita de 'Conteúdo Patrocinado'.",
  },
  {
    title: "Patrocínio da Newsletter Semanal",
    badge: "Acesso Direto à Caixa de Entrada",
    icon: Mail,
    desc: "Inserção de marca em destaque na edição semanal enviada para mais de 19 mil motociclistas ativos e altamente engajados, com link rastreado e relatório detalhado de aberturas e cliques.",
  },
  {
    title: "Testes de Longa Duração & Motopeças",
    badge: "Validação em Condições Reais",
    icon: Wrench,
    desc: "Avaliação técnica prolongada (1.000 a 10.000 km) de pneus, kits de relação, óleos lubrificantes, pastilhas e acessórios, documentada com medições periódicas de desgaste.",
  },
];

export default function AnunciePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Anuncie Conosco</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Mídia Kit & Publicidade 2026
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Conecte sua Marca ao Motociclista Real
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            O <strong>Moto na Prática</strong> é uma das plataformas informativas mais confiáveis sobre o universo de duas rodas no Brasil. Nossa comunidade é formada por pessoas que compram, pilotam, equipam e mantêm suas motos todos os dias.
          </p>
        </div>
      </div>

      {/* MÉTRICAS DE ENGAJAMENTO (STATS) */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border shadow-sm border border-border">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-card p-6 text-center flex flex-col items-center justify-center gap-1.5">
                <span className="text-primary mb-1">
                  <Icon size={22} />
                </span>
                <span style={TEKO} className="text-[34px] font-semibold uppercase leading-none text-foreground">
                  {stat.value}
                </span>
                <span className="text-[11.5px] text-muted-foreground uppercase tracking-wider font-medium" style={BODY}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 space-y-16">
        {/* PÚBLICO-ALVO */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Quem Lê o Moto na Prática?
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground max-w-2xl mb-8" style={BODY}>
            Nossa audiência é altamente qualificada e possui poder de decisão imediato sobre produtos e serviços do setor motociclístico:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TARGET_AUDIENCES.map((item, idx) => (
              <div key={idx} className="bg-card border border-border p-6 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary">
                      {item.tag}
                    </span>
                    <span className="text-[12px] font-semibold text-muted-foreground" style={BODY}>
                      {item.percentage}
                    </span>
                  </div>
                  <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FORMATOS DE MÍDIA */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Formatos de Mídia & Parcerias
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground max-w-2xl mb-8" style={BODY}>
            Soluções personalizadas para posicionar seu produto com credibilidade e contexto de uso real:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MEDIA_FORMATS.map((fmt, idx) => {
              const Icon = fmt.icon;
              return (
                <div key={idx} className="bg-card border border-border p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5">
                      {fmt.badge}
                    </span>
                  </div>
                  <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground leading-tight">
                    {fmt.title}
                  </h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
                    {fmt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMPROMISSO ÉTICO COM ANUNCIANTES */}
        <div className="bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-start gap-5">
          <div className="w-12 h-12 rounded-sm bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-2 text-[13.5px]" style={BODY}>
            <h4 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
              Transparência Comercial & Diretrizes CONAR
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Valorizamos parcerias sólidas e respeitosas com marcas do setor. Exigimos e praticamos transparência irrestrita: nenhuma matéria patrocinada é apresentada de forma camuflada aos leitores. Esse compromisso é exatamente o que confere credibilidade única às marcas que anunciam conosco.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO DE CONTATO COMERCIAL */}
        <section id="contato-comercial" className="pt-4">
          <AdvertiseContactForm />
        </section>
      </div>
    </div>
  );
}
