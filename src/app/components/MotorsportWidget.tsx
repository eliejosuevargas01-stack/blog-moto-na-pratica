import Link from "next/link";
import { Calendar, Trophy, MapPin, Clock, ArrowRight } from "lucide-react";
import { TEKO } from "../data";
import { getTranslation } from "../i18n/translations";

export interface MotorsportWidgetProps {
  nextRace?: {
    eventName: string;
    circuitName?: string | null;
    countryCode?: string | null;
    dateStart?: Date | string | null;
    dateEnd?: Date | string | null;
  } | null;
  ranking?: Array<{
    position: number;
    riderName: string;
    teamName?: string | null;
    points: number;
  }>;
  lang?: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  QA: "🇶🇦",
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
  PT: "🇵🇹",
  TR: "🇹🇷",
  ZA: "🇿🇦",
};

const FALLBACK_NEXT_RACE = {
  eventName: "GP de Lusail / Catar",
  circuitName: "Circuito Internacional de Lusail",
  countryCode: "QA",
  dateStart: "2026-11-29T17:00:00.000Z",
  dateEnd: "2026-11-29T19:00:00.000Z",
};

const FALLBACK_RANKING = [
  {
    position: 1,
    riderName: "Jorge Martín",
    teamName: "Prima Pramac / Aprilia",
    points: 89,
  },
  {
    position: 2,
    riderName: "Francesco Bagnaia",
    teamName: "Ducati Lenovo",
    points: 85,
  },
  {
    position: 3,
    riderName: "Marc Márquez",
    teamName: "Ducati Lenovo",
    points: 78,
  },
];

const I18N_LABELS = {
  pt: {
    live: "AO VIVO",
    upcoming: "EM BREVE",
    viewCalendarResults: "Ver Calendário Completo & Resultados",
    top3: "Top 3 Pilotos",
    table: { pos: "Pos", rider: "Piloto", team: "Equipe", pts: "Pts" },
    inDays: (days: number) => `Em ${days} dias`,
    liveNow: "Ao vivo agora",
  },
  en: {
    live: "LIVE",
    upcoming: "UPCOMING",
    viewCalendarResults: "View Full Calendar & Results",
    top3: "Top 3 Riders",
    table: { pos: "Pos", rider: "Rider", team: "Team", pts: "Pts" },
    inDays: (days: number) => `In ${days} days`,
    liveNow: "Live now",
  },
  es: {
    live: "EN VIVO",
    upcoming: "PRÓXIMAMENTE",
    viewCalendarResults: "Ver Calendario Completo & Resultados",
    top3: "Top 3 Pilotos",
    table: { pos: "Pos", rider: "Piloto", team: "Equipo", pts: "Pts" },
    inDays: (days: number) => `En ${days} días`,
    liveNow: "En vivo ahora",
  },
};

function parseDate(dateValue?: Date | string | null): Date | null {
  if (!dateValue) return null;
  const parsed = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatRaceDate(
  start: Date | null,
  end: Date | null,
  safeLang: "pt" | "en" | "es"
): string {
  if (!start) return "";
  const locale = safeLang === "en" ? "en-US" : safeLang === "es" ? "es-ES" : "pt-BR";

  const dayMonthFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const yearFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    timeZone: "UTC",
  });

  if (end && start.getUTCDate() !== end.getUTCDate()) {
    return `${start.getUTCDate()} – ${dayMonthFormatter.format(end)}, ${yearFormatter.format(end)}`;
  }

  return `${dayMonthFormatter.format(start)}, ${yearFormatter.format(start)}`;
}

export default function MotorsportWidget({
  nextRace,
  ranking,
  lang = "pt",
}: MotorsportWidgetProps) {
  const safeLang = (lang === "en" || lang === "es" ? lang : "pt") as "pt" | "en" | "es";
  const t = getTranslation(safeLang);
  const labels = I18N_LABELS[safeLang];

  const race = nextRace || FALLBACK_NEXT_RACE;
  const displayRanking = (ranking && ranking.length > 0 ? ranking : FALLBACK_RANKING).slice(0, 3);

  const startDate = parseDate(race.dateStart);
  const endDate = parseDate(race.dateEnd);

  const now = Date.now();
  const isLive = Boolean(
    startDate &&
      now >= startDate.getTime() &&
      (!endDate || now <= endDate.getTime())
  );

  const flag = (race.countryCode && COUNTRY_FLAGS[race.countryCode.toUpperCase()]) || "🏁";
  const formattedDate = formatRaceDate(startDate, endDate, safeLang);

  let countdownText = "";
  if (isLive) {
    countdownText = labels.liveNow;
  } else if (startDate) {
    const diffDays = Math.ceil((startDate.getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      countdownText = labels.inDays(diffDays);
    }
  }

  return (
    <section
      className="bg-card border border-border rounded-sm p-5 md:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
      aria-labelledby="motorsport-widget-title"
    >
      <div>
        {/* HEADER DO WIDGET */}
        <header className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Trophy className="text-primary w-5 h-5 shrink-0" aria-hidden="true" />
            <h2
              id="motorsport-widget-title"
              style={TEKO}
              className="text-[24px] md:text-[26px] font-bold uppercase tracking-wide text-foreground leading-none"
            >
              {t.homePortal?.motorsportTitle || "Motorsport & MotoGP"}
            </h2>
          </div>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary text-primary border border-primary/20 rounded-xs">
            Temp. 2026
          </span>
        </header>

        {/* BLOCO 1: PRÓXIMA CORRIDA */}
        <div className="bg-secondary/40 border border-border/80 rounded-sm p-4 mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>{t.homePortal?.nextRace || "Próxima Corrida"}</span>
            </div>

            {/* BADGE AO VIVO / EM BREVE */}
            <span
              className={
                isLive
                  ? "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600/10 text-red-700 border border-red-500/30 dark:bg-red-600/20 dark:text-red-400"
                  : "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 rounded-xs"
              }
            >
              {isLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" aria-hidden="true" />
                  {labels.live}
                </>
              ) : (
                labels.upcoming
              )}
            </span>
          </div>

          {/* Nome do Evento e Bandeira */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              style={TEKO}
              className="text-[22px] md:text-[24px] font-semibold uppercase leading-tight text-foreground"
            >
              {race.eventName}
            </h3>
            <span role="img" className="text-xl shrink-0" aria-label={race.countryCode || "País da etapa"}>
              {flag}
            </span>
          </div>

          {/* Circuito e Data Formatada */}
          <div className="text-[12px] text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            {race.circuitName && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
                <span>{race.circuitName}</span>
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" />
                <time dateTime={startDate ? startDate.toISOString() : undefined}>
                  {countdownText ? `${countdownText} · ${formattedDate}` : formattedDate}
                </time>
              </span>
            )}
          </div>
        </div>

        {/* BLOCO 2: CLASSIFICAÇÃO TOP 3 PILOTOS */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3
              style={TEKO}
              className="text-[20px] font-bold uppercase tracking-wide text-foreground leading-none"
            >
              {t.homePortal?.standings || "Classificação de Pilotos"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">{labels.top3}</span>
          </div>

          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-[13px] border-collapse"
              aria-label={t.homePortal?.standings || "Classificação de Pilotos"}
            >
              <thead>
                <tr className="border-b border-border/70 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="pb-2 w-10 text-center">
                    {labels.table.pos}
                  </th>
                  <th scope="col" className="pb-2">
                    {labels.table.rider}
                  </th>
                  <th scope="col" className="pb-2 hidden sm:table-cell">
                    {labels.table.team}
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    {labels.table.pts}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {displayRanking.map((rider) => {
                  const isTop1 = rider.position === 1;
                  const isTop2 = rider.position === 2;
                  const isTop3 = rider.position === 3;

                  return (
                    <tr key={rider.position} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-2.5 text-center font-bold">
                        {isTop1 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-800 border border-yellow-600/40 dark:text-yellow-400 font-extrabold text-[11px]">
                            1º
                          </span>
                        )}
                        {isTop2 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-800 border border-slate-400 dark:bg-slate-300/20 dark:text-slate-200 font-extrabold text-[11px]">
                            2º
                          </span>
                        )}
                        {isTop3 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-600/20 text-amber-900 border border-amber-700/40 dark:text-amber-400 font-extrabold text-[11px]">
                            3º
                          </span>
                        )}
                        {!isTop1 && !isTop2 && !isTop3 && (
                          <span className="text-muted-foreground font-semibold text-[12px]">
                            {rider.position}º
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-foreground block text-[13px] leading-snug">
                          {rider.riderName}
                        </span>
                        {rider.teamName && (
                          <span className="text-[11px] text-muted-foreground sm:hidden block truncate max-w-[140px]">
                            {rider.teamName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-[12px] hidden sm:table-cell">
                        {rider.teamName || "—"}
                      </td>
                      <td className="py-2.5 text-right font-bold text-primary text-[14px]">
                        {rider.points}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal lowercase">
                          {t.homePortal?.points || "pts"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <footer className="pt-2 border-t border-border/50">
        <Link
          href="/eventos"
          className="group w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary hover:bg-primary text-foreground hover:text-white font-semibold text-[13px] tracking-wide rounded-sm transition-all duration-200 border border-border/80 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
        >
          <span>{labels.viewCalendarResults}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0"
            aria-hidden="true"
          />
        </Link>
      </footer>
    </section>
  );
}
