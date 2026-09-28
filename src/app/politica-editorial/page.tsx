import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import EditorialMethodologyCard from "../components/EditorialMethodologyCard";
import {
  ShieldCheck,
  Fuel,
  Gauge,
  Scale,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Bike,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Política Editorial & Metodologia de Testes · Moto na Prática",
  description:
    "Conheça os pilares éticos, critérios de independência editorial e a metodologia prática de testes de motocicletas do portal Moto na Prática.",
};

export default function PoliticaEditorialPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Política Editorial</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Jornalismo Independente & E-E-A-T
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Compromisso Editorial & Metodologia
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            O <strong>Moto na Prática</strong> existe para fornecer aos motociclistas brasileiros informações precisas, verificadas em campo e livres de pressões comerciais. Aqui você descobre como trabalhamos, como avaliamos motocicletas e as regras inegociáveis que regem nossa redação.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-14">
        {/* PILARES EDITORIAIS */}
        <section id="independencia" className="scroll-mt-24">
<div id="checagem" className="scroll-mt-24"></div>


          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Prioridade para Precisão e Pesquisa
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileCheck size={22} />
              </div>
              <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground leading-none">
                  Separação entre Fato, Análise e Opinião
                </h3>
                <p>
                  Nossa base de trabalho é a pesquisa documental. Cruzamos especificações de manuais de proprietário oficiais, catálogos de peças e boletins de serviço oficiais dos fabricantes.
                  Deixamos claro para o leitor quando estamos relatando um fato documentado, quando estamos analisando uma tendência de mercado e quando estamos emitindo uma opinião.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Combate a Boatos:</strong>
                    Rumores e especulações não são tratados como fatos. Lançamentos não confirmados são reportados estritamente como rumores.
                  </div>
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Pesquisa Documental:</strong>
                    O Moto na Prática não apresenta uma experiência como própria se ela não tiver realmente ocorrido. Conteúdos baseados em pesquisa não devem ser apresentados como testes físicos. Um teste de rodagem real só é declarado se for efetivamente realizado e identificado naquele artigo.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DIVERSIDADE E REPRESENTATIVIDADE */}
        <section id="diversidade" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Diversidade e Representatividade Editorial
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users size={22} />
              </div>
              <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground leading-none">
                  Inclusão Real da Comunidade Motociclista
                </h3>
                <p>
                  O motociclismo brasileiro é construído por pessoas de diferentes origens, regiões, identidades e estilos de vida. Nosso compromisso editorial assegura representatividade e pluralidade em todas as editorias:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Ergonomia para Diferentes Estaturas:</strong>
                    Testamos cada motocicleta com pilotos de alturas e constituições físicas variadas, analisando a facilidade de colocar os pés no chão, alcance do guidão e peso do cavalete.
                  </div>
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Equidade no Tráfego e na Cobertura:</strong>
                    Tratamos motociclistas iniciantes, entregadores de aplicativo, estradeiros experientes e motociclistas mulheres com igual respeito e profundidade técnica.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VEÍCULOS E EVENTOS DE IMPRENSA */}
        <section id="metodologia" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              3. Relação Institucional (Eventos e Empréstimos)
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-4 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Caso o Moto na Prática receba unidades de imprensa no futuro ou participe de lançamentos custeados por fabricantes, nossa aceitação estará estritamente condicionada aos seguintes termos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Transparência Obrigatória:</strong>
                Caso uma unidade seja cedida por fabricante ou frota de imprensa, essa condição será informada no conteúdo.
              </div>
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Sem Veto Editorial:</strong>
                Nenhuma fabricante tem direito de ler, alterar ou vetar textos antes da publicação.
              </div>
            </div>
          </div>
        </section>
{/* POLÍTICA DE CORREÇÕES E ERRATAS */}
        <section id="correcoes" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              4. Política de Correções e Retificações (Errata)
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <div className="space-y-2 text-[14px]" style={BODY}>
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground leading-none">
                  Transparência Imediata com o Leitor
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  O <em>Moto na Prática</em> tem compromisso rigoroso com a exatidão factual. Quando um equívoco de ficha técnica, preço sugerido, número de chassi ou dado mecânico for identificado por nossa equipe ou apontado pelos leitores, agimos com prontidão:
                </p>
                <ul className="space-y-2 text-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-primary shrink-0" />
                    <span>A matéria é imediatamente corrigida no banco de dados do portal.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-primary shrink-0" />
                    <span>Uma nota explícita de <strong>[ERRATA]</strong> é incluída, informando a data, hora e qual dado foi retificado.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-primary shrink-0" />
                    <span>Erros materiais não são encobertos silenciosamente. Assumimos correções com transparência.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-[13px] text-muted-foreground flex flex-col md:flex-row md:items-center justify-between gap-3" style={BODY}>
              <span>Identificou algum dado impreciso em qualquer uma de nossas matérias?</span>
              <a
                href="/contato"
                className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
              >
                <FileCheck size={15} /> Solicitar correção à Redação (Fale conosco via Página de Contato)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
