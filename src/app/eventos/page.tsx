import { prisma } from "../../lib/db";
import { TEKO, BODY, TAG_COLORS, optimizeImageUrl } from "../data";
import Link from "next/link";
import { Clock, Trophy, Flame, Compass, Radio, ArrowRight, Flag } from "lucide-react";
import Sidebar from "../components/Sidebar";
import EventCountdown from "../components/EventCountdown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventos & Corridas Mundiais · Moto na Prática",
  description: "Cobertura completa dos maiores eventos de motociclismo do mundo: MotoGP, Isle of Man TT, Rally Dakar, WorldSBK e competições locais.",
};

const INTERNATIONAL_EVENTS = [
  // Competicoes de Pista
  {
    name: "MotoGP",
    fullTitle: "Campeonato Mundial de Motovelocidade",
    category: "Pista / Protótipos",
    location: "Assen (Holanda), Mugello (Itália) & Global",
    description: "A Fórmula 1 das duas rodas. Protótipos de altíssima tecnologia construídos do zero pelas montadoras com os pilotos de elite do planeta.",
    targetDate: "2026-08-16T13:00:00Z",
    flagEmoji: "🏍️",
    badgeColor: "bg-red-600 text-white"
  },
  {
    name: "WorldSBK",
    fullTitle: "Mundial de Superbike",
    category: "Pista / Série Modificada",
    location: "Phillip Island (Austrália) & Circuitos Globais",
    description: "Motos de produção em série preparadas ao extremo para corridas ferozes com marcas populares travando batalhas diretas.",
    targetDate: "2026-09-06T12:00:00Z",
    flagEmoji: "🏁",
    badgeColor: "bg-blue-600 text-white"
  },
  {
    name: "Suzuka 8 Hours",
    fullTitle: "Mundial de Endurance FIM",
    category: "Resistência",
    location: "Circuito de Suzuka, Japão",
    description: "A joia da coroa do endurance japonês. Honda, Yamaha, Kawasaki e Suzuki colocam suas equipes de fábrica em 8 horas exaustivas.",
    targetDate: "2026-08-02T02:30:00Z",
    flagEmoji: "🇯🇵",
    badgeColor: "bg-yellow-600 text-white"
  },
  {
    name: "Daytona 200",
    fullTitle: "Histórica de Daytona Beach",
    category: "Pista Oval / EUA",
    location: "Daytona International Speedway, EUA",
    description: "A corrida mais histórica e prestigiada do motociclismo norte-americano no lendário circuito oval de Daytona.",
    targetDate: "2027-03-06T18:00:00Z",
    flagEmoji: "🇺🇸",
    badgeColor: "bg-indigo-600 text-white"
  },

  // Road Racing
  {
    name: "Isle of Man TT",
    fullTitle: "Tourist Trophy - Corridas de Rua",
    category: "Road Racing",
    location: "Ilha de Man, Reino Unido",
    description: "A corrida mais insana e perigosa do planeta. Pilotos voam a mais de 210 km/h em estradas públicas cercadas por muros e casas.",
    targetDate: "2027-05-29T10:00:00Z",
    flagEmoji: "🇮🇲",
    badgeColor: "bg-orange-600 text-white"
  },
  {
    name: "North West 200",
    fullTitle: "Road Racing da Irlanda do Norte",
    category: "Road Racing",
    location: "Triângulo de Coleraine, Irlanda do Norte",
    description: "Vários pilotos largam juntos e dividem pistas estreitas em velocidades absurdas entre os vilarejos irlandeses.",
    targetDate: "2027-05-13T09:00:00Z",
    flagEmoji: "🇬🇧",
    badgeColor: "bg-emerald-600 text-white"
  },
  {
    name: "GP de Macau",
    fullTitle: "Grande Prêmio de Macau",
    category: "Rua Urano",
    location: "Circuito da Guia, Macau",
    description: "Corrida fascinante e travada nas ruas apertadas de Macau, onde os guard-rails de ferro não perdoam o menor erro.",
    targetDate: "2026-11-19T06:00:00Z",
    flagEmoji: "🇲🇴",
    badgeColor: "bg-purple-600 text-white"
  },

  // Off-Road & Rally
  {
    name: "Rally Dakar",
    fullTitle: "Maior Rally Cross-Country do Mundo",
    category: "Off-Road / Rally",
    location: "Desertos da Arábia Saudita",
    description: "A maior e mais desgastante prova off-road. Milhares de quilômetros de dunas, rochas e navegação extrema por semanas.",
    targetDate: "2027-01-05T05:00:00Z",
    flagEmoji: "🏜️",
    badgeColor: "bg-amber-600 text-white"
  },
  {
    name: "AMA Supercross",
    fullTitle: "Campeonato Norte-Americano",
    category: "Stadium Motocross",
    location: "Estádios dos EUA",
    description: "Supercross indoor em estádios cobertos lotados com saltos gigantescos e obstáculos artificiais alucinantes.",
    targetDate: "2027-01-09T23:00:00Z",
    flagEmoji: "🇺🇸",
    badgeColor: "bg-red-700 text-white"
  },
  {
    name: "Erzbergrodeo",
    fullTitle: "Líder Mundial de Hard Enduro",
    category: "Hard Enduro",
    location: "Mina de Eisenerz, Áustria",
    description: "Centenas de pilotos tentam escalar uma gigantesca mina de ferro desativada. Apenas uma fração mínima cruza a chegada.",
    targetDate: "2027-06-03T11:00:00Z",
    flagEmoji: "🇦🇹",
    badgeColor: "bg-stone-600 text-white"
  }
];

export default async function EventosPage() {
  let eventPosts: any[] = [];

  try {
    eventPosts = await prisma.post.findMany({
      where: {
        OR: [
          { tag: { contains: "Evento" } },
          { tag: { contains: "MotoGP" } },
          { tag: { contains: "Corrida" } },
          { category: { contains: "Eventos" } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    eventPosts = [];
  }

  return (
    <div style={BODY}>
      {/* HERO BANNER DA PÁGINA DE EVENTOS */}
      <section className="relative w-full bg-[#0A0A0A] border-b border-border py-16 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto z-10 relative">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Trophy size={20} />
            <span style={TEKO} className="text-[20px] uppercase tracking-widest font-semibold">
              Calendário & Notícias Esportivas
            </span>
          </div>
          <h1 style={TEKO} className="text-[52px] md:text-[68px] font-semibold uppercase leading-none text-foreground tracking-wide max-w-[850px]">
            Eventos Mundiais e Locais de Motociclismo
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-[680px] mt-3 leading-relaxed">
            Do asfalto do MotoGP à insanidade da Ilha de Man e às dunas do Dakar. Cronômetros de próximas etapas, matérias sobre lendas do esporte e cobertura de campeonatos.
          </p>
        </div>
      </section>

      {/* CRONÔMETROS DE CORRIDAS (COUNTDOWNS) */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1 h-6 bg-primary" />
          <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
            Próximas Corridas & Contagens Regressivas
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INTERNATIONAL_EVENTS.slice(0, 4).map((evt) => (
            <EventCountdown
              key={evt.name}
              eventName={evt.name}
              circuitOrLocation={evt.location}
              category={evt.category}
              targetDate={evt.targetDate}
              flagEmoji={evt.flagEmoji}
            />
          ))}
        </div>
      </section>

      {/* GUIA DE COMPETIÇÕES INTERNACIONAIS */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-1 h-6 bg-primary" />
          <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
            As Maiores Competições do Planeta
          </h2>
        </div>

        {/* 3 Colunas de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pista */}
          <div className="bg-card border border-border p-6 rounded-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <Flame size={18} className="text-red-500" />
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">
                Competições de Pista
              </h3>
            </div>
            <div className="space-y-6">
              {INTERNATIONAL_EVENTS.filter(e => e.category.includes("Pista") || e.category.includes("Resistência")).map(item => (
                <div key={item.name} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span style={TEKO} className="text-[20px] font-bold uppercase text-foreground">{item.name}</span>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 uppercase">{item.flagEmoji}</span>
                  </div>
                  <p className="text-[12px] text-primary font-medium mb-1.5">{item.fullTitle}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Road Racing */}
          <div className="bg-card border border-border p-6 rounded-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <Flag size={18} className="text-orange-500" />
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">
                Road Racing (Rua)
              </h3>
            </div>
            <div className="space-y-6">
              {INTERNATIONAL_EVENTS.filter(e => e.category.includes("Road Racing") || e.category.includes("Rua")).map(item => (
                <div key={item.name} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span style={TEKO} className="text-[20px] font-bold uppercase text-foreground">{item.name}</span>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 uppercase">{item.flagEmoji}</span>
                  </div>
                  <p className="text-[12px] text-primary font-medium mb-1.5">{item.fullTitle}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Off-Road & Rally */}
          <div className="bg-card border border-border p-6 rounded-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <Compass size={18} className="text-amber-500" />
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">
                Off-Road & Rally
              </h3>
            </div>
            <div className="space-y-6">
              {INTERNATIONAL_EVENTS.filter(e => e.category.includes("Off-Road") || e.category.includes("Enduro")).map(item => (
                <div key={item.name} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span style={TEKO} className="text-[20px] font-bold uppercase text-foreground">{item.name}</span>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 uppercase">{item.flagEmoji}</span>
                  </div>
                  <p className="text-[12px] text-primary font-medium mb-1.5">{item.fullTitle}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ÁREA PREPARADA PARA TRANSMISSÃO / YOUTUBE EMBED */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        <div className="bg-[#111111] border border-border p-8 rounded-sm text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
            <Radio size={22} className="animate-pulse" />
            <span style={TEKO} className="text-[22px] uppercase font-bold tracking-wider">
              Central de Transmissões ao Vivo
            </span>
          </div>
          <h3 style={TEKO} className="text-[28px] uppercase text-foreground mb-2">
            Transmissões e Coberturas do Canal Moto na Prática
          </h3>
          <p className="text-[14px] text-muted-foreground max-w-[600px] mx-auto mb-6">
            Em breve estaremos integrando transmissões e análises em tempo real diretamente do nosso canal no YouTube durante as etapas dos campeonatos.
          </p>
          <a
            href="https://www.youtube.com/@motonapratica"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
          >
            Inscrever-se no Canal do YouTube <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* NOTÍCIAS DE EVENTOS */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1 h-6 bg-primary" />
            <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
              Notícias & Coberturas de Eventos
            </h2>
          </div>

          {eventPosts.length === 0 ? (
            <div className="bg-card border border-border p-10 text-center">
              <p style={TEKO} className="text-[22px] uppercase text-muted-foreground">Nenhum post sobre eventos cadastrado ainda</p>
              <p className="text-[13px] text-muted-foreground mt-2">
                Use o painel CMS ou a API automatizada para criar posts com a tag "Eventos" ou "MotoGP".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {eventPosts.map((post) => (
                <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all hover:-translate-y-1">
                  <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                    <div className="relative overflow-hidden w-full h-[180px]">
                      <img 
                        src={optimizeImageUrl(post.img, 450, 260)} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                      />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag] || "bg-primary text-white"}`}>
                        {post.tag}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 style={TEKO} className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} /> {post.readTime}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <Sidebar />
      </div>
    </div>
  );
}
