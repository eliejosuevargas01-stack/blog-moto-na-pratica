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

interface TeamMember {
  name: string;
  role: string;
  badge: string;
  bio: string;
  credentials: string[];
  currentBike: string;
  image: string;
  email: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Eliezer Josué Vargas",
    role: "Fundador & Editor-Chefe",
    badge: "Direção Editorial",
    bio: "Motociclista diário radicado em Gaspar (SC), fundou o Moto na Prática motivado pela necessidade de um jornalismo que mostrasse a realidade sem maquiagem. Responsável pela linha editorial, coordena os testes de consumo com bomba aferida e avaliações de longa duração.",
    credentials: [
      "Piloto e proprietário de Yamaha FZ25 Solid Grey 2026",
      "Mais de 45.000 km rodados em testes rodoviários e urbanos",
      "Defensor da independência jornalística e transparência com o leitor",
    ],
    currentBike: "Yamaha Fazer 250 (FZ25) 2026",
    image: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=700&h=800&fit=crop&auto=format",
    email: "Fale conosco via Página de Contato",
  },
  {
    name: "Marcos Vinicius Ramos",
    role: "Consultor Chefe de Mecânica",
    badge: "Engenharia & Garagem",
    bio: "Mecânico profissional com 18 anos de experiência prática em bancada e preparação de motores monocilíndricos e bicilíndricos. É a autoridade técnica responsável por auditar todos os tutoriais, manuais e dicas mecânicas publicados no portal.",
    credentials: [
      "Certificação técnica em Injeção Eletrônica e Eletroeletrônica de Motocicletas",
      "Mais de 1.200 motores revisados e retificados em oficina especializada",
      "Instrutor de manutenção preventiva básica para novos motociclistas",
    ],
    currentBike: "Honda CB 500X & Ténéré 250",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&h=800&fit=crop&auto=format",
    email: "Fale conosco via Página de Contato",
  },
  {
    name: "Juliana Siqueira",
    role: "Piloto de Testes & Instrutora",
    badge: "Dinâmica & Segurança",
    bio: "Piloto com vasta vivência em pista e estradas, Juliana é instrutora certificada de pilotagem preventiva. No portal, lidera os protocolos de frenagem controlada de emergência (60-0 km/h), avaliação de ciclística sob chuva e testes de conforto com passageiro.",
    credentials: [
      "Instrutora credenciada de Pilotagem Defensiva e Frenagem Avançada",
      "Mais de 160.000 km acumulados em viagens pelo Brasil e América do Sul",
      "Especialista em ergonomia e testes comparativos de vestuário de proteção",
    ],
    currentBike: "BMW F 850 GS & Kawasaki Ninja 400",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=800&fit=crop&auto=format",
    email: "Fale conosco via Página de Contato",
  },
  {
    name: "Roberto Fagundes",
    role: "Editor de Notícias & Mercado",
    badge: "Jornalismo Automotivo",
    bio: "Jornalista automotivo com mais de uma década de cobertura do mercado de duas rodas no Brasil. Acompanha lançamentos, feiras como EICMA e Salão Duas Rodas, tendências de eletrificação e mudanças regulatórias do CONTRAN e Promot.",
    credentials: [
      "Graduado em Comunicação Social com especialização em Jornalismo Setorial",
      "12 anos de cobertura contínua de lançamentos das principais montadoras",
      "Analista de mercado, emplacamentos Fenabrave e custo de seguros",
    ],
    currentBike: "Royal Enfield Hunter 350",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=800&fit=crop&auto=format",
    email: "Fale conosco via Página de Contato",
  },
];

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