import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  Copyright,
  Wrench,
  Compass,
  MessageSquare,
  Scale,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Termos de Uso & Isenção de Responsabilidade · Moto na Prática",
  description:
    "Termos de uso, diretrizes de propriedade intelectual, regras de conduta para comentários e cláusula de isenção de responsabilidade mecânica e de rotas.",
};

export default function TermosDeUsoPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Termos de Uso</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Jurídico & Conformidade
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Termos de Uso do Portal
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Estes termos regulam a navegação, acesso e utilização do portal <strong>Moto na Prática</strong>. Ao navegar em nosso site ou interagir em nossos conteúdos, você concorda expressamente com as condições aqui estabelecidas.
          </p>
          <p className="text-[12px] text-muted-foreground mt-2" style={BODY}>
            Última atualização: 26 de setembro de 2026.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-10">
        
        {/* 1. OBJETO E ACEITAÇÃO */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <FileText size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              1. Aceitação e Objeto
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            O portal <strong>Moto na Prática</strong> é uma publicação digital de caráter jornalístico, informativo e de opinião especializada, dedicada ao universo de motocicletas, manutenção preventiva, pilotagem defensiva e mototurismo. O acesso a qualquer parte do portal implica na aceitação integral destes Termos de Uso e da nossa{" "}
            <Link href="/politica-de-privacidade" className="text-primary underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        {/* 2. PROPRIEDADE INTELECTUAL */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Copyright size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              2. Direitos Autorais e Propriedade Intelectual
            </h2>
          </div>
          <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Todo o conteúdo disponibilizado no portal — incluindo, mas não se limitando a: textos autorais, relatórios de testes de consumo, dados de telemetria, tabelas comparativas, fotografias originais, vídeos, logotipos e layout — é protegido pela legislação brasileira de direitos autorais (Lei nº 9.610/1998) e convenções internacionais aplicáveis.
            </p>
            <div className="p-4 bg-muted/40 border border-border rounded-none space-y-2">
              <strong className="text-foreground block font-semibold">Regras para Citação e Compartilhamento:</strong>
              <ul className="list-disc pl-5 space-y-1 text-[13.5px]">
                <li>
                  É permitida a citação de trechos curtos de matérias para fins de estudo ou crítica, desde que haja citação explícita do autor e link direto funcional (<code>rel="dofollow"</code>) para a matéria original do <strong>Moto na Prática</strong>.
                </li>
                <li>
                  É expressamente vedada a reprodução integral, scraping automatizado, comercialização de dados de testes ou espelhamento do portal em outros domínios sem prévia e expressa autorização por escrito da redação.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. CLÁUSULA CRÍTICA DE ISENÇÃO DE RESPONSABILIDADE */}
        <div className="bg-card border-2 border-primary/30 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3 text-primary">
            <ShieldAlert size={24} />
            <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground">
              3. Isenção de Responsabilidade (Disclaimers Obrigatórios)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Disclaimer de Mecânica */}
            <div className="bg-background border border-border p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <Wrench size={16} /> Intervenções Mecânicas e Manutenção
              </div>
              <h3 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Finalidade Exclusivamente Educativa
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Os artigos, tutoriais de manutenção, dicas de regulagem e procedimentos de oficina publicados têm finalidade estritamente pedagógica e informativa. A manutenção de motocicletas envolve sistemas críticos de segurança (como freios, suspensão e pneus) e exige conhecimento ferramental adequado.
              </p>
              <div className="p-3 bg-amber-500/10 border-l-2 border-amber-600 text-[12px] text-foreground font-medium" style={BODY}>
                O leitor realiza qualquer procedimento sob sua própria responsabilidade e risco. O portal e seus autores não respondem por danos mecânicos, quebra de garantia de fábrica, acidentes ou prejuízos patrimoniais. Recomendamos sempre a realização de serviços por oficinas especializadas e autorizadas.
              </div>
            </div>

            {/* Disclaimer de Rotas */}
            <div className="bg-background border border-border p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <Compass size={16} /> Rotas e Guias de Viagem
              </div>
              <h3 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Condições de Pista e Fatores Climáticos
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Nossos relatos de viagem e recomendações de rotas refletem a experiência dos pilotos no momento exato em que a viagem foi realizada. Condições de estradas, asfaltamento, postos de abastecimento, segurança pública e fatores meteorológicos podem se alterar rapidamente.
              </p>
              <div className="p-3 bg-amber-500/10 border-l-2 border-amber-600 text-[12px] text-foreground font-medium" style={BODY}>
                Cabe exclusivamente ao motociclista verificar com antecedência as condições atualizadas das rodovias, previsão meteorológica e pontos de suporte antes de iniciar seu trajeto. Não nos responsabilizamos por imprevistos ocorridos durante as rotas sugeridas.
              </div>
            </div>
          </div>
        </div>

        {/* 4. REGRAS DE CONDUTA PARA COMENTÁRIOS */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <MessageSquare size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              4. Regras de Conduta e Moderação de Comentários
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            Incentivamos debates técnicos saudáveis, troca de experiências entre proprietários e perguntas pertinentes. No entanto, para manter a comunidade respeitosa, aplicamos moderação ativa:
          </p>
          <ul className="space-y-2.5 text-[13.5px] text-foreground" style={BODY}>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">✕</span>
              <span>São proibidos comentários ofensivos, discurso de ódio, difamação, injúria ou ataques de ordem pessoal a outros leitores, autores ou terceiros.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">✕</span>
              <span>É vetada a publicação de links com intuito de spam comercial, divulgação de pirataria, esquemas fraudulentos ou links maliciosos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">✕</span>
              <span>O portal reserva-se o direito soberano de remover, sem aviso prévio, qualquer comentário que viole estas diretrizes, bem como suspender o autor.</span>
            </li>
          </ul>
        </div>

        {/* 5. FORO E LEGISLAÇÃO APLICÁVEL */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <Scale size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              5. Foro de Eleição e Legislação Aplicável
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            Estes Termos de Uso são regidos e interpretados em conformidade com as leis da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014) e o Código de Defesa do Consumidor, naquilo que couber. Para a resolução de eventuais controvérsias decorrentes deste termo, fica eleito o Foro da Comarca de <strong>Gaspar, Estado de Santa Catarina</strong>, com exclusão de qualquer outro, por mais privilegiado que seja.
          </p>
        </div>

        {/* DÚVIDAS */}
        <div className="p-4 bg-muted/40 border border-border text-[13px] text-muted-foreground flex items-center justify-between" style={BODY}>
          <span>Dúvidas jurídicas sobre nossos Termos de Uso?</span>
          <a href="mailto:redacao@motonapratica.com.br?subject=Dúvida%20sobre%20Termos%20de%20Uso" className="text-primary font-semibold hover:underline">
            redacao@motonapratica.com.br
          </a>
        </div>
      </div>
    </div>
  );
}
