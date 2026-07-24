import { prisma } from "../../lib/db";
import { TEKO, BODY, TAG_COLORS, optimizeImageUrl } from "../data";
import Link from "next/link";
import { Clock, Trophy, Flame, Radio, ArrowRight, Flag, Calendar, Medal, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import EventCountdown from "../components/EventCountdown";
import { cookies } from "next/headers";
import { getTranslation } from "../i18n/translations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventos & Corridas Mundiais · Moto na Prática",
  description: "Cobertura completa dos maiores eventos de motociclismo do mundo: MotoGP, Isle of Man TT, Rally Dakar, WorldSBK e resultados em tempo real.",
};

const COUNTRY_FLAGS: Record<string, string> = {
  TH: "🇹🇭",
  BR: "🇧🇷",
  US: "🇺🇸",
  ES: "🇪🇸",
  FR: "🇫🇷",
  IT: "🇮🇹",
  HU: "🇭🇺",
  CZ: "🇨🇿",
  NL: "🇳🇱",
  DE: "🇩🇪",
  GB: "🇬🇧",
  SM: "🇸🇲",
  AT: "🇦🇹",
  JP: "🇯🇵",
  ID: "🇮🇩",
  AU: "🇦🇺",
  MY: "🇲🇾",
  QA: "🇶🇦",
  PT: "🇵🇹",
  TR: "🇹🇷",
  ZA: "🇿🇦",
};

export default async function EventosPage() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  let upcomingEvents: any[] = [];
  let riderStandings: any[] = [];
  let recentStageResults: any[] = [];
  let eventPosts: any[] = [];

  try {
    upcomingEvents = await prisma.calendarioEventos.findMany({
      where: { status: "UPCOMING" },
      orderBy: { dateEnd: "asc" },
      take: 4,
    });

    if (upcomingEvents.length === 0) {
      upcomingEvents = await prisma.calendarioEventos.findMany({
        orderBy: { dateStart: "asc" },
        take: 4,
      });
    }

    riderStandings = await prisma.rankingPilotos.findMany({
      where: { seasonYear: 2026 },
      orderBy: { position: "asc" },
    });

    recentStageResults = await prisma.resultadosEtapas.findMany({
      include: { event: true },
      orderBy: [
        { position: "asc" }
      ],
      take: 30,
    });

    eventPosts = await prisma.post.findMany({
      where: {
        AND: [
          langFilter,
          {
            OR: [
              { tag: { contains: "Evento" } },
              { tag: { contains: "MotoGP" } },
              { tag: { contains: "Corrida" } },
              { category: { contains: "Eventos" } },
              { category: { contains: "Notícias" } }
            ],
          }
        ]
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Erro ao carregar dados de eventos:", error);
  }

  const newsHeader = currentLang === "en" ? "Event News & Coverage" : currentLang === "es" ? "Noticias y Coberturas de Eventos" : "Notícias & Coberturas de Eventos";
  const upcomingHeader = currentLang === "en" ? "Upcoming Races & Countdowns" : currentLang === "es" ? "Próximas Carreras y Cuentas Regresivas" : "Próximas Corridas & Contagens Regressivas";

  return (
    <div style={BODY} className="bg-background text-foreground min-h-screen">
      {/* HERO BANNER */}
      <section className="relative w-full bg-[#0A0A0A] border-b border-border py-16 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto z-10 relative">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Trophy size={20} />
            <span style={TEKO} className="text-[20px] uppercase tracking-widest font-semibold text-primary">
              Central do Motociclismo Esportivo 2026
            </span>
          </div>
          <h1 style={TEKO} className="text-[48px] md:text-[68px] font-semibold uppercase leading-none tracking-wide max-w-[850px]">
            {t.categories.eventsTitle}
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-[680px] mt-3 leading-relaxed">
            {t.categories.eventsDesc}
          </p>
        </div>
      </section>

      {/* CRONÔMETROS DE CORRIDAS (COUNTDOWNS) */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1 h-6 bg-primary" />
          <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
            {upcomingHeader}
          </h2>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-card border border-border p-6 text-center text-muted-foreground">
            Nenhuma etapa próxima cadastrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcomingEvents.map((evt) => (
              <EventCountdown
                key={evt.id}
                eventName={evt.eventName}
                circuitOrLocation={evt.circuitName || "Circuito Mundial"}
                category={evt.championship}
                targetDate={evt.dateStart ? new Date(evt.dateStart).toISOString() : new Date().toISOString()}
                flagEmoji={COUNTRY_FLAGS[evt.countryCode || ""] || "🏁"}
              />
            ))}
          </div>
        )}
      </section>

      {/* GRID DUPLO: CLASSIFICAÇÃO DE PILOTOS & ÚLTIMA CORRIDA */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* TABELA 1: RANKING DE PILOTOS 2026 */}
        <div className="bg-card border border-border p-6 rounded-sm flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={22} />
                <h3 style={TEKO} className="text-[26px] font-bold uppercase tracking-wide">
                  Ranking do Campeonato MotoGP 2026
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-secondary text-primary border border-primary/20">
                Temp. 2026
              </span>
            </div>

            {riderStandings.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-4">Nenhum ranking cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 w-10">Pos</th>
                      <th className="pb-2">Piloto</th>
                      <th className="pb-2">Equipe / Moto</th>
                      <th className="pb-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {riderStandings.map((rider) => {
                      const isTop1 = rider.position === 1;
                      const isTop2 = rider.position === 2;
                      const isTop3 = rider.position === 3;

                      return (
                        <tr key={rider.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="py-3 font-bold">
                            {isTop1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 font-extrabold text-[12px]">1º</span>}
                            {isTop2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 font-extrabold text-[12px]">2º</span>}
                            {isTop3 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 font-extrabold text-[12px]">3º</span>}
                            {!isTop1 && !isTop2 && !isTop3 && <span className="pl-1 text-muted-foreground">{rider.position}º</span>}
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-foreground block">{rider.riderName}</span>
                          </td>
                          <td className="py-3 text-muted-foreground text-[12px]">
                            {rider.teamName} <span className="text-primary/80 font-medium">({rider.constructor || "MotoGP"})</span>
                          </td>
                          <td className="py-3 text-right font-bold text-primary text-[14px]">
                            {rider.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* TABELA 2: ÚLTIMA ETAPA / RESULTADOS DE CORRIDA */}
        <div className="bg-card border border-border p-6 rounded-sm flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Flag className="text-red-500" size={22} />
                <h3 style={TEKO} className="text-[26px] font-bold uppercase tracking-wide">
                  Resultado Oficial: {recentStageResults[0]?.event?.eventName || "GP da Tailândia"} ({recentStageResults[0]?.sessionType || "RAC"})
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 bg-red-600/20 text-red-500 border border-red-500/30">
                Última Etapa
              </span>
            </div>

            {recentStageResults.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-4">Nenhum resultado cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 w-10">Pos</th>
                      <th className="pb-2">Nº / Piloto</th>
                      <th className="pb-2">Equipe</th>
                      <th className="pb-2">Tempo / Gap</th>
                      <th className="pb-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentStageResults.slice(0, 15).map((res) => (
                      <tr key={res.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-2.5 font-bold">
                          {res.position ? (
                            <span className={res.position <= 3 ? "text-primary font-extrabold" : "text-foreground"}>
                              {res.position}º
                            </span>
                          ) : (
                            <span className="text-[10px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded">
                              {res.status || "OUT"}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            {res.riderNumber && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-secondary text-primary rounded">
                                #{res.riderNumber}
                              </span>
                            )}
                            {res.riderName}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-[12px]">
                          {res.teamName}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-[12px] font-mono">
                          {res.position === 1 ? res.timeResult : `+${res.timeGap}`}
                        </td>
                        <td className="py-2.5 text-right font-bold text-primary">
                          +{res.pointsEarned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NOTÍCIAS DE EVENTOS */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1 h-6 bg-primary" />
            <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
              {newsHeader}
            </h2>
          </div>

          {eventPosts.length === 0 ? (
            <div className="bg-card border border-border p-10 text-center">
              <p style={TEKO} className="text-[22px] uppercase text-muted-foreground">{t.posts.noPosts}</p>
              <p className="text-[13px] text-muted-foreground mt-2">{t.posts.noPostsDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {eventPosts.map((post) => {
                const postUrlPath = post.lang === "en" ? `/en/post/${post.slug}` : post.lang === "es" ? `/es/post/${post.slug}` : `/post/${post.slug}`;
                return (
                  <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all hover:-translate-y-1">
                    <Link href={postUrlPath} className="flex flex-col flex-1">
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
                );
              })}
            </div>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
