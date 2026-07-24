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

const CIRCUIT_IMAGES: Record<string, string> = {
  GB: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=300&fit=crop&auto=format",
  ES: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop&auto=format",
  SM: "https://images.unsplash.com/photo-1614165933026-0750fcd503e8?w=600&h=300&fit=crop&auto=format",
  AT: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&h=300&fit=crop&auto=format",
  TH: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=300&fit=crop&auto=format",
  BR: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=600&h=300&fit=crop&auto=format",
  US: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&h=300&fit=crop&auto=format",
  FR: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=600&h=300&fit=crop&auto=format",
  IT: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=600&h=300&fit=crop&auto=format",
  NL: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=600&h=300&fit=crop&auto=format",
  DE: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=600&h=300&fit=crop&auto=format",
  JP: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=600&h=300&fit=crop&auto=format",
  QA: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop&auto=format",
  PT: "https://images.unsplash.com/photo-1614165933026-0750fcd503e8?w=600&h=300&fit=crop&auto=format",
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
      {/* HERO BANNER COM IMAGEM DE ALTO IMPACTO */}
      <section className="relative w-full overflow-hidden border-b border-border" style={{ height: "380px" }}>
        <img 
          src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&h=700&fit=crop&auto=format" 
          alt="Central do Motociclismo Esportivo" 
          className="absolute inset-0 w-full h-full object-cover" 
          fetchPriority="high"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 60%, rgba(0,0,0,0.35) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />

        <div className="max-w-[1200px] mx-auto px-6 z-10 relative flex flex-col justify-center h-full">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Trophy size={22} className="text-primary animate-pulse" />
            <span style={TEKO} className="text-[22px] uppercase tracking-widest font-bold text-primary">
              Central do Motociclismo Esportivo 2026
            </span>
          </div>
          <h1 style={TEKO} className="text-[52px] md:text-[76px] font-semibold uppercase leading-none tracking-wide text-white max-w-[880px] drop-shadow-md">
            {t.categories.eventsTitle}
          </h1>
          <p className="text-[16px] text-[#CCCCCC] max-w-[700px] mt-4 leading-relaxed font-medium drop-shadow-sm">
            {t.categories.eventsDesc}
          </p>
        </div>
      </section>

      {/* CRONÔMETROS DE CORRIDAS (COUNTDOWNS COM IMAGENS DE PISTAS REAIS) */}
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
                imageUrl={CIRCUIT_IMAGES[evt.countryCode || ""] || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=300&fit=crop&auto=format"}
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
