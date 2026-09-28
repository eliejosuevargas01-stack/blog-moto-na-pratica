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
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              1. Linha Editorial e Independência
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <ShieldCheck size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Independência de Montadoras
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
                Nenhum fabricante, importador ou anunciante dita as conclusões das nossas análises. Nossas opiniões são formadas pelo uso real na estrada e no trânsito, apontando pontos positivos e fragilidades sem filtros.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Scale size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Separação Editorial x Comercial
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
                Nossa equipe de jornalistas e pilotos não participa de negociações comerciais. Qualquer publicação patrocinada ou publieditorial é identificada com destaque visual imediato para o leitor.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Sparkles size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Foco na Utilidade do Leitor
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed" style={BODY}>
                Escrevemos para quem gasta seu dinheiro suado comprando e mantendo uma moto. Questões como custo de reposição de peças, consumo real e facilidade de manutenção têm peso central nas avaliações.
              </p>
            </div>
          </div>
        </section>

        {/* METODOLOGIA DE TESTES */}
        <section id="metodologia" className="scroll-mt-24 bg-card border border-border p-8 md:p-10 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
                2. Metodologia de Avaliação de Motos
              </h2>
            </div>
            <p className="text-[14px] text-muted-foreground max-w-3xl" style={BODY}>
              Não nos limitamos a "voltinhas" rápidas em estacionamentos. Todos os testes de motocicletas seguem um protocolo padronizado de testes práticos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ciclo Urbano */}
            <div className="border border-border p-5 bg-background space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <Bike size={16} /> Ciclo Urbano Intenso
              </div>
              <h4 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Trânsito Diário e Corredor
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Aferição do comportamento em trânsito pesado, raio de esterço entre veículos, resposta de torque em baixas rotações, temperatura irradiada para as pernas do piloto e ergonomia no para-e-anda dos semáforos.
              </p>
            </div>

            {/* Ciclo Rodoviário */}
            <div className="border border-border p-5 bg-background space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <Gauge size={16} /> Ciclo Rodoviário
              </div>
              <h4 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Velocidade de Cruzeiro e Retomadas
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Testes em rodovias sob velocidades permitidas (80 a 120 km/h). Avaliação de proteção aerodinâmica, estabilidade com ventos laterais, capacidade de ultrapassagem em 5ª/6ª marcha e nível de vibração em manoplas e pedaleiras.
              </p>
            </div>

            {/* Teste com Garupa */}
            <div className="border border-border p-5 bg-background space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <CheckCircle2 size={16} /> Teste com Garupa
              </div>
              <h4 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Carga e Conforto do Passageiro
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Análise com piloto e garupa adultos. Verificação do afundamento do amortecedor traseiro (sag), fim de curso em lombadas, alcance e firmeza das alças de apoio e ângulo de flexão dos joelhos do passageiro.
              </p>
            </div>

            {/* Testes de Frenagem */}
            <div className="border border-border p-5 bg-background space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <AlertTriangle size={16} /> Frenagem & Segurança
              </div>
              <h4 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Distância de Parada e Atuação ABS
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Frenagens sucessivas de emergência de 60 a 0 km/h e 80 a 0 km/h em pista seca e molhada. Medição de sensibilidade do manete, fadiga (fading) dos discos e pastilhas, e calibração de atuação do ABS (evitando destravamentos prematuros).
              </p>
            </div>

            {/* Consumo com Bomba Aferida */}
            <div className="border border-border p-5 bg-background space-y-2.5 lg:col-span-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] uppercase tracking-wider" style={BODY}>
                <Fuel size={16} /> Consumo Real Aferido
              </div>
              <h4 style={TEKO} className="text-[20px] font-semibold uppercase text-foreground">
                Medição com Bomba de Combustível Aferida
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={BODY}>
                Desconfiamos de médias meramente informadas pelo painel digital. O consumo é mensurado abastecendo o tanque até o bocal em posto padrão, rodando trajeto pré-determinado de 100 a 150 km e reabastecendo no mesmo bico de combustível aferido pelo Inmetro. Calculamos a média matemática de litros efetivamente injetados.
              </p>
            </div>
          </div>
        </section>

        {/* CHECAGEM DE FATOS E AUDITORIA */}
        <section id="checagem" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Auditoria Técnica e Checagem de Fatos
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileCheck size={22} />
              </div>
              <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground leading-none">
                  Verificação Factual e Fontes Primárias
                </h3>
                <p>
                  Todas as avaliações, testes e notícias técnicas do <strong>Moto na Prática</strong> passam por auditoria minuciosa e conferência de dados com fontes primárias. Fichas técnicas, números de potência e torque, especificações de suspensão e freios são confirmados junto a manuais de serviço dos fabricantes e registros de homologação oficiais (Denatran, Senatran, Inmetro e Promot).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Medições Próprias de Oficina:</strong>
                    Valores de consumo e desgaste não dependem de dados fornecidos por montadoras; são validados em nossa oficina e com instrumentos de medição física.
                  </div>
                  <div className="p-3 bg-background border border-border">
                    <strong className="text-foreground text-[13px] block mb-1">Combate a Boatos:</strong>
                    Não publicamos especulações como fatos concretos. Notícias sobre novos modelos ou recalls contam sempre com confirmação documental prévia.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


          {/* REGRAS DE PESQUISA E EXPERIÊNCIA (ADICIONADO V1) */}
          <div className="bg-card border border-border p-6 md:p-8 space-y-4 mt-8">
            <h3 style={TEKO} className="text-[24px] font-semibold uppercase text-foreground leading-none">
              Limites Inegociáveis de Autoria e Pesquisa
            </h3>
            <ul className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
              <li className="flex items-start gap-2">
                 <span className="text-primary font-bold mt-0.5">•</span>
                 <span><strong>Experiência Própria:</strong> O Moto na Prática não apresenta uma experiência como própria se ela não tiver realmente ocorrido.</span>
              </li>
              <li className="flex items-start gap-2">
                 <span className="text-primary font-bold mt-0.5">•</span>
                 <span><strong>Testes Físicos vs. Pesquisa:</strong> Conteúdos baseados em pesquisa não devem ser apresentados como testes físicos. Diferenciamos explicitamente análise documental de avaliação na estrada.</span>
              </li>
            </ul>
          </div>


        {/* METODOLOGIA EDITORIAL */}
        <section className="scroll-mt-24 mb-14">
            <EditorialMethodologyCard />
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

        {/* POLÍTICA DE TEST-RIDES E VEÍCULOS DE EMPRÉSTIMO */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              3. Política de Veículos de Empréstimo (Frotas de Imprensa)
            </h2>
          </div>

          <div className="bg-card border border-border p-6 md:p-8 space-y-4 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Para trazer lançamentos em primeira mão aos leitores, o <strong>Moto na Prática</strong> aceita veículos cedidos temporariamente por montadoras e importadoras (frotas de imprensa). No entanto, nossa aceitação está estritamente condicionada aos seguintes termos inegociáveis:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Sem Veto ou Aprovação Prévia:</strong>
                Nenhum fabricante tem direito a ler, alterar ou vetar textos, fotos, vídeos ou notas antes da publicação. O conteúdo vai ao ar diretamente da redação.
              </div>
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Devolução Obrigatória e Integral:</strong>
                Todas as motocicletas e equipamentos de teste são devolvidos integralmente após o período de avaliação, sem retenção de qualquer bem material.
              </div>
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Custos de Viagens e Lançamentos:</strong>
                Quando a redação atende a convites de viagens para eventos de lançamento, os leitores são formalmente informados na matéria. A cobertura de despesas de deslocamento jamais condiciona elogios.
              </div>
              <div className="border-l-2 border-primary pl-4 py-1">
                <strong className="text-foreground block mb-1">Identificação da Origem da Moto:</strong>
                Especificamos com clareza se a unidade avaliada pertence à frota de imprensa da fabricante ou se é de propriedade da redação (testes de longa duração).
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
                href="mailto:redacao@motonapratica.com.br?subject=Solicitação%20de%20Correção%20de%20Matéria"
                className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
              >
                <FileCheck size={15} /> Solicitar correção à Redação (redacao@motonapratica.com.br)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
