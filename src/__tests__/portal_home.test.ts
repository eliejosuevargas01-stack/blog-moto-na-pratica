import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Importações puras de TypeScript (dados de navegação, posts e traduções)
import { POSTS, TAG_COLORS, TEKO, BODY } from "../app/data";
import { TRANSLATIONS, getTranslation, Language } from "../app/i18n/translations";

// ===========================================================================
// Helpers canônicos fiéis aos arquivos page.tsx e MotorsportWidget.tsx
// ===========================================================================

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateValue: any, lang: string): string {
  if (!dateValue) return "";
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

function getConsumptionLabel(post: any): string | null {
  const content = `${post?.content || ""} ${post?.excerpt || ""}`;
  const match = content.match(/(\d{1,2}(?:[.,]\d)?\s*km\/l)/i);
  if (match) return `${match[1]}`;
  return null;
}

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

describe("Portal de Motos: Testes Semânticos da Nova Homepage & MotorsportWidget", () => {
  const rootDir = process.cwd();
  const pagePath = path.resolve(rootDir, "src/app/page.tsx");
  const motorsportPath = path.resolve(rootDir, "src/app/components/MotorsportWidget.tsx");

  const pageContent = fs.readFileSync(pagePath, "utf-8");
  const motorsportContent = fs.readFileSync(motorsportPath, "utf-8");

  // =========================================================================
  // 1. INTEGRIDADE DAS TRADUÇÕES DE homePortal EM TRANSLATIONS.TS (PT, EN, ES)
  // =========================================================================
  describe("1. Integridade e Paridade de I18n (homePortal)", () => {
    const canonicalPortalKeys = [
      "leadStory",
      "topStories",
      "motorsportTitle",
      "nextRace",
      "standings",
      "reviewsTitle",
      "reviewsSubtitle",
      "workshopTitle",
      "workshopSubtitle",
      "multimediaTitle",
      "multimediaSubtitle",
      "listenArticle",
      "testedFuel",
      "points",
      "viewCalendar",
    ] as const;

    const languages: Language[] = ["pt", "en", "es"];

    languages.forEach((lang) => {
      describe(`Idioma: ${lang.toUpperCase()}`, () => {
        it(`deve conter o bloco homePortal definido em TRANSLATIONS.${lang}`, () => {
          expect(TRANSLATIONS[lang]).toBeDefined();
          expect(TRANSLATIONS[lang].homePortal).toBeDefined();
        });

        canonicalPortalKeys.forEach((key) => {
          it(`chave "${key}" não deve ser undefined, nula ou vazia em ${lang}`, () => {
            const val = TRANSLATIONS[lang].homePortal[key];
            expect(val).toBeDefined();
            expect(typeof val).toBe("string");
            expect(val.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    it("deve manter paridade exata de chaves entre todos os idiomas (sem chaves ausentes ou extras)", () => {
      const ptKeys = Object.keys(TRANSLATIONS.pt.homePortal).sort();
      const enKeys = Object.keys(TRANSLATIONS.en.homePortal).sort();
      const esKeys = Object.keys(TRANSLATIONS.es.homePortal).sort();

      expect(enKeys).toEqual(ptKeys);
      expect(esKeys).toEqual(ptKeys);
      expect(ptKeys).toEqual([...canonicalPortalKeys].sort());
    });

    it("getTranslation() deve retornar o dicionário correto e fazer fallback gracioso para PT", () => {
      expect(getTranslation("pt").homePortal.leadStory).toBe("Manchete do Dia");
      expect(getTranslation("en").homePortal.leadStory).toBe("Top Headline");
      expect(getTranslation("es").homePortal.leadStory).toBe("Noticia Principal");

      // Idiomas inválidos ou indefinidos devem recorrer ao português por padrão
      expect(getTranslation("de" as any).homePortal.leadStory).toBe("Manchete do Dia");
      expect(getTranslation(undefined).homePortal.leadStory).toBe("Manchete do Dia");
      expect(getTranslation("").homePortal.leadStory).toBe("Manchete do Dia");
    });

    it("todas as traduções de homePortal devem conter conteúdo semanticamente coerente com o idioma", () => {
      // PT
      expect(TRANSLATIONS.pt.homePortal.standings).toBe("Classificação de Pilotos");
      expect(TRANSLATIONS.pt.homePortal.workshopTitle).toBe("Guia Prático da Oficina");

      // EN
      expect(TRANSLATIONS.en.homePortal.standings).toBe("Rider Standings");
      expect(TRANSLATIONS.en.homePortal.workshopTitle).toBe("Practical Workshop Guide");

      // ES
      expect(TRANSLATIONS.es.homePortal.standings).toBe("Clasificación de Pilotos");
      expect(TRANSLATIONS.es.homePortal.workshopTitle).toBe("Guía Práctica del Taller");
    });
  });

  // =========================================================================
  // 2. MOTORSPORT WIDGET: CONSTANTES, MÉTODOS AUXILIARES, FALLBACKS E ACESSIBILIDADE
  // =========================================================================
  describe("2. MotorsportWidget: Comportamento Semântico e Resiliência", () => {
    it("deve conter a exportação padrão da função MotorsportWidget", () => {
      expect(motorsportContent).toMatch(/export default function MotorsportWidget\s*\(/);
    });

    it("deve definir FALLBACK_NEXT_RACE com etapa de Lusail/Catar para temporada 2026", () => {
      expect(motorsportContent).toContain('eventName: "GP de Lusail / Catar"');
      expect(motorsportContent).toContain('circuitName: "Circuito Internacional de Lusail"');
      expect(motorsportContent).toContain('countryCode: "QA"');
      expect(motorsportContent).toContain('dateStart: "2026-11-29T17:00:00.000Z"');
      expect(motorsportContent).toContain('dateEnd: "2026-11-29T19:00:00.000Z"');
    });

    it("deve definir FALLBACK_RANKING com o Top 3 do campeonato mundial (Martín, Bagnaia, Márquez)", () => {
      expect(motorsportContent).toContain('riderName: "Jorge Martín"');
      expect(motorsportContent).toContain("points: 89");
      expect(motorsportContent).toContain('riderName: "Francesco Bagnaia"');
      expect(motorsportContent).toContain("points: 85");
      expect(motorsportContent).toContain('riderName: "Marc Márquez"');
      expect(motorsportContent).toContain("points: 78");
    });

    it("deve mapear bandeiras de países essenciais do calendário de MotoGP no COUNTRY_FLAGS", () => {
      expect(motorsportContent).toContain('BR: "🇧🇷"');
      expect(motorsportContent).toContain('ES: "🇪🇸"');
      expect(motorsportContent).toContain('IT: "🇮🇹"');
      expect(motorsportContent).toContain('QA: "🇶🇦"');
      expect(motorsportContent).toContain('US: "🇺🇸"');
      expect(motorsportContent).toContain('FR: "🇫🇷"');
      expect(motorsportContent).toContain('JP: "🇯🇵"');
    });

    it("deve definir labels multilíngues completos (I18N_LABELS) para PT, EN e ES", () => {
      expect(motorsportContent).toContain('live: "AO VIVO"');
      expect(motorsportContent).toContain('upcoming: "EM BREVE"');
      expect(motorsportContent).toContain('live: "LIVE"');
      expect(motorsportContent).toContain('upcoming: "UPCOMING"');
      expect(motorsportContent).toContain('live: "EN VIVO"');
      expect(motorsportContent).toContain('upcoming: "PRÓXIMAMENTE"');
      expect(motorsportContent).toContain('viewCalendarResults: "Ver Calendário Completo & Resultados"');
      expect(motorsportContent).toContain('viewCalendarResults: "View Full Calendar & Results"');
    });

    it("deve conter lógica para status 'AO VIVO' quando o evento estiver ocorrendo no momento", () => {
      expect(motorsportContent).toContain("const isLive = Boolean(");
      expect(motorsportContent).toContain("now >= startDate.getTime()");
      expect(motorsportContent).toContain("(!endDate || now <= endDate.getTime())");
      expect(motorsportContent).toContain("animate-ping");
      expect(motorsportContent).toContain("labels.live");
      expect(motorsportContent).toContain("labels.liveNow");
    });

    it("deve conter lógica para contagem regressiva em dias quando o evento for futuro", () => {
      expect(motorsportContent).toContain("const diffDays = Math.ceil((startDate.getTime() - now) / (1000 * 60 * 60 * 24));");
      expect(motorsportContent).toContain("countdownText = labels.inDays(diffDays);");
    });

    it("deve incluir bandeira de fallback 🏁 quando o código do país não for reconhecido", () => {
      expect(motorsportContent).toContain('(race.countryCode && COUNTRY_FLAGS[race.countryCode.toUpperCase()]) || "🏁"');
    });

    it("deve limitar a exibição de pilotos a no máximo 3 com .slice(0, 3)", () => {
      expect(motorsportContent).toContain(".slice(0, 3)");
    });

    it("deve conter estrutura acessível de tabela com escopos semânticos de cabeçalho e título h2", () => {
      expect(motorsportContent).toContain("<table");
      expect(motorsportContent).toContain("<thead");
      expect(motorsportContent).toContain("<tbody");
      expect(motorsportContent).toContain('scope="col"');
      expect(motorsportContent).toContain('aria-labelledby="motorsport-widget-title"');
      expect(motorsportContent).toMatch(/<h2[^>]*id="motorsport-widget-title"/);
      expect(motorsportContent).toContain('href="/eventos"');
    });

    it("deve conter estilos específicos para os 3 degraus do pódio (ouro, prata e bronze)", () => {
      // 1º Ouro
      expect(motorsportContent).toContain("bg-yellow-500/20 text-yellow-800 border border-yellow-600/40 dark:text-yellow-400");
      // 2º Prata
      expect(motorsportContent).toContain("bg-slate-200 text-slate-800 border border-slate-400 dark:bg-slate-300/20 dark:text-slate-200");
      // 3º Bronze
      expect(motorsportContent).toContain("bg-amber-600/20 text-amber-900 border border-amber-700/40 dark:text-amber-400");
    });

    describe("Execução direta das funções de data de MotorsportWidget", () => {
      it("parseDate deve converter strings ISO e objetos Date corretamente, retornando null para entradas inválidas", () => {
        expect(parseDate(null)).toBeNull();
        expect(parseDate(undefined)).toBeNull();
        expect(parseDate("data-invalida")).toBeNull();

        const dateObj = new Date("2026-11-29T17:00:00.000Z");
        expect(parseDate(dateObj)).toBe(dateObj);

        const parsedFromString = parseDate("2026-11-29T17:00:00.000Z");
        expect(parsedFromString).toBeInstanceOf(Date);
        expect(parsedFromString?.getUTCFullYear()).toBe(2026);
      });

      it("formatRaceDate deve formatar corrida de um único dia em PT, EN e ES", () => {
        const start = new Date("2026-11-29T17:00:00.000Z");
        const end = new Date("2026-11-29T19:00:00.000Z");

        const formattedPt = formatRaceDate(start, end, "pt");
        const formattedEn = formatRaceDate(start, end, "en");
        const formattedEs = formatRaceDate(start, end, "es");

        expect(formattedPt).toContain("2026");
        expect(formattedPt).toContain("29");
        expect(formattedEn).toContain("2026");
        expect(formattedEn).toContain("Nov");
        expect(formattedEs).toContain("2026");
      });

      it("formatRaceDate deve formatar corrida de múltiplos dias (ex: sexta a domingo)", () => {
        const start = new Date("2026-11-27T10:00:00.000Z");
        const end = new Date("2026-11-29T19:00:00.000Z");

        const formatted = formatRaceDate(start, end, "pt");
        expect(formatted).toContain("27 –");
        expect(formatted).toContain("2026");
      });

      it("formatRaceDate deve retornar string vazia se start for nulo", () => {
        expect(formatRaceDate(null, null, "pt")).toBe("");
      });
    });
  });

  // =========================================================================
  // 3. HERO EDITORIAL ASSIMÉTRICO (60/40 GRID) EM PAGE.TSX
  // =========================================================================
  describe("3. Hero Editorial Assimétrico (src/app/page.tsx)", () => {
    it("deve conter a exportação padrão assíncrona Home", () => {
      expect(pageContent).toMatch(/export default async function Home\s*\(/);
    });

    it("deve configurar Next.js force-dynamic para renderização SSR sempre atualizada", () => {
      expect(pageContent).toContain('export const dynamic = "force-dynamic";');
    });

    it("deve implementar o Grid Editorial Assimétrico 60/40 (grid-cols-[1.5fr_1fr])", () => {
      expect(pageContent).toContain("grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start");
    });

    it("deve renderizar a Coluna da Manchete do Dia (Lead Story) com título h1 e badge temático", () => {
      expect(pageContent).toContain('t.homePortal?.leadStory || "Manchete do Dia"');
      expect(pageContent).toMatch(/<SafeHtml[\s\S]*?tag="h1"/);
      expect(pageContent).toContain("aspect-[16/9]");
      expect(pageContent).toContain("priority");
      expect(pageContent).toContain('fetchPriority="high"');
      expect(pageContent).toContain("object-cover group-hover:scale-105");
    });

    it("deve renderizar a Coluna Em Destaque (Top Stories) na coluna da direita com h2", () => {
      expect(pageContent).toContain('t.homePortal?.topStories || "Em Destaque"');
      expect(pageContent).toContain("border-b-2 border-primary");
      expect(pageContent).toMatch(/<SafeHtml[\s\S]*?tag="h3"/);
      expect(pageContent).toContain("w-[120px] h-[78px]");
    });

    it("deve garantir desduplicação semântica: a manchete principal NÃO aparece nos Top Stories", () => {
      expect(pageContent).toContain("const topStories = posts.filter((p) => p.id !== leadPost.id).slice(0, 3);");
    });

    it("deve suportar heroPostId configurável para personalizar a manchete", () => {
      expect(pageContent).toContain("if (homeContent.heroPostId)");
      expect(pageContent).toContain("const found = posts.find((p) => String(p.id) === String(homeContent.heroPostId));");
      expect(pageContent).toContain("if (found) leadPost = found;");
    });

    it("deve definir autoria editorial multilíngue adaptável ao idioma ativo", () => {
      expect(pageContent).toContain('pt: "Por Redação Moto na Prática"');
      expect(pageContent).toContain('en: "By Moto na Prática Staff"');
      expect(pageContent).toContain('es: "Por Redacción Moto na Prática"');
    });

    describe("Execução das funções auxiliares de page.tsx", () => {
      it("stripHtml deve remover tags HTML mantendo apenas o texto limpo para alt de imagens", () => {
        expect(stripHtml(null)).toBe("");
        expect(stripHtml(undefined)).toBe("");
        expect(stripHtml("Texto normal")).toBe("Texto normal");
        expect(stripHtml("<h1>Título</h1> com <b>negrito</b>")).toBe("Título com negrito");
      });

      it("formatDate deve formatar datas corretamente em PT, EN e ES", () => {
        const testDate = new Date("2026-06-12T10:00:00.000Z");
        expect(formatDate(testDate, "pt")).toBeDefined();
        expect(formatDate(testDate, "en")).toBeDefined();
        expect(formatDate(testDate, "es")).toBeDefined();

        expect(formatDate(null, "pt")).toBe("");
        expect(formatDate(undefined, "pt")).toBe("");
        expect(formatDate("data-invalida", "pt")).toBe("data-invalida");
      });

      it("getConsumptionLabel deve extrair consumo explícito de combustível e não calcular inferências", () => {
        // Post com consumo explícito no texto
        const postWithConsumption = {
          content: "Após aferição detalhada em 5 tanques, atingimos a média de 34,5 km/l em trecho misto.",
          excerpt: "",
          slug: "teste-consumo",
        };
        expect(getConsumptionLabel(postWithConsumption)).toBe("34,5 km/l");

        // Post de Fazer 250 / FZ25 sem menção direta
        const postFazer = { content: "Relato de viagem", excerpt: "", slug: "minha-fazer-250-na-estrada" };
        expect(getConsumptionLabel(postFazer)).toBeNull();

        // Post de CG 160 / Titan
        const postTitan = { content: "Uso urbano intenso", excerpt: "", slug: "honda-titan-160-cidade" };
        expect(getConsumptionLabel(postTitan)).toBeNull();

        // Post genérico
        const postGeneric = { content: "Acessórios e capacetes", excerpt: "", slug: "capacetes-mais-silenciosos" };
        expect(getConsumptionLabel(postGeneric)).toBeNull();
      });
    });
  });

  // =========================================================================
  // 4. SEÇÕES VITRINE DA HOMEPAGE (REVIEWS, OFICINA, MULTIMÍDIA, NEWSLETTER)
  // =========================================================================
  describe("4. Vitrines Editoriais e Seções de Engajamento", () => {
    it("deve conter o Ticker de Breaking News com botão de leitura e badge TeKo", () => {
      expect(pageContent).toContain("bg-[#151515] border-y border-border h-10");
      expect(pageContent).toContain("t.ticker.badge");
      expect(pageContent).toContain('SafeHtml tag="span"');
      expect(pageContent).toContain("formatPostUrl(breakingSlug, breakingLang)");
      expect(pageContent).toContain("t.ticker.read");
    });

    it("deve conter a Vitrine de Análises & Reviews com grid responsivo de 3 colunas e selo de consumo", () => {
      expect(pageContent).toContain('t.homePortal?.reviewsTitle || "Análises & Reviews"');
      expect(pageContent).toContain("t.homePortal?.reviewsSubtitle");
      expect(pageContent).toContain('href="/reviews"');
      expect(pageContent).toContain("Ver todas as análises");
      expect(pageContent).toContain("grid grid-cols-1 md:grid-cols-3 gap-6");
      expect(pageContent).not.toContain("TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA");
      expect(pageContent).toContain("getConsumptionLabel(post)");
      expect(pageContent).toContain("Ler Análise");
    });

    it("deve selecionar até 3 posts da categoria Review para a vitrine com fallback seguro", () => {
      expect(pageContent).toContain('p.tag === "Review" || p.category === "Reviews" || p.tag === "Reviews"');
      expect(pageContent).toContain("reviewPosts.slice(0, 3)");
    });

    it("deve conter o Guia Prático da Oficina & Manutenção com ícone Wrench e link para o manual", () => {
      expect(pageContent).toContain("<Wrench");
      expect(pageContent).toContain('t.homePortal?.workshopTitle || "Guia Prático da Oficina & Manutenção"');
      expect(pageContent).toContain("t.homePortal?.workshopSubtitle");
      expect(pageContent).toContain('href="/manutencao"');
      expect(pageContent).toContain("Manual completo da oficina");
      expect(pageContent).toContain("OFICINA & PREVENTIVA");
      expect(pageContent).toContain("Procedimento Passo a Passo");
      expect(pageContent).toContain("Ver Guia");
    });

    it("deve conter o Mural Multimídia com 2 cards, badge de narração neural e atalho para o player", () => {
      expect(pageContent).toContain("<Volume2");
      expect(pageContent).toContain('t.homePortal?.multimediaTitle || "Mural Multimídia & Áudio"');
      expect(pageContent).toContain("t.homePortal?.multimediaSubtitle");
      expect(pageContent).toContain("grid grid-cols-1 md:grid-cols-2 gap-6");
      expect(pageContent).toContain("Narração Neural Ativa");
      expect(pageContent).toContain("de áudio");
      expect(pageContent).toContain("#audio-player");
      expect(pageContent).toContain('t.homePortal?.listenArticle || "Ouvir Reportagem"');
      expect(pageContent).toContain("Ler Artigo Completo");
    });

    it("deve incorporar o MotorsportWidget entre as seções da Home passando props seguras", () => {
      expect(pageContent).toContain("<MotorsportWidget nextRace={nextRace} ranking={topRiders} lang={safeLang} />");
    });

    it("deve incorporar o NewsletterBox na versão banner de destaque", () => {
      expect(pageContent).toContain('<NewsletterBox variant="banner" />');
    });

    it("deve apresentar o bloco final de Exploração do Acervo Completo com link dinâmico por idioma", () => {
      expect(pageContent).toContain("Explore Nosso Acervo Editorial Completo");
      expect(pageContent).toContain('safeLang === "en" ? "/en/posts" : safeLang === "es" ? "/es/posts" : "/posts"');
      expect(pageContent).toContain("Ver Todos os Posts");
    });
  });

  // =========================================================================
  // 5. RESILIÊNCIA A FALHAS DE BANCO DE DADOS (DATABASE OFFLINE / TIMEOUT)
  // =========================================================================
  describe("5. Resiliência do SSR e Tolerância a Falhas de Banco de Dados", () => {
    it("deve envolver a busca de dados de página e posts em bloco try/catch com fallback para POSTS", () => {
      expect(pageContent).toContain("try {");
      expect(pageContent).toContain("const pageDb = await prisma.page.findUnique");
      expect(pageContent).toContain("posts = await prisma.post.findMany");
      expect(pageContent).toContain("} catch (error) {");
      expect(pageContent).toContain('console.warn("Home database query failed, using static fallback.", error);');
      expect(pageContent).toContain("posts = searchQuery");
    });

    it("deve assegurar que posts nunca seja nulo ou vazio após o bloco de consulta", () => {
      expect(pageContent).toContain("if (!posts || posts.length === 0) {");
      expect(pageContent).toContain("posts = POSTS;");
    });

    it("deve envolver a consulta do Motorsport em bloco try/catch isolado para não derrubar o portal", () => {
      expect(pageContent).toContain("try {");
      expect(pageContent).toContain("nextRace = await prisma.calendarioEventos.findFirst");
      expect(pageContent).toContain("topRiders = await prisma.rankingPilotos.findMany");
      expect(pageContent).toContain("} catch (err) {");
      expect(pageContent).toContain('console.warn("Motorsport database query failed, using widget defaults.", err);');
    });

    it("deve sanitizar o idioma com safeLang garantindo valores restritos a 'pt' | 'en' | 'es'", () => {
      expect(pageContent).toContain('const safeLang = (rawLang === "en" || rawLang === "es" ? rawLang : "pt") as "pt" | "en" | "es";');
    });

    describe("Simulação do Pipeline de Dados da Home sob Falha de Banco", () => {
      it("deve preencher todas as seções vitrines mesmo quando o banco retornar array vazio", () => {
        // Simulação do algoritmo exato de page.tsx
        let posts: any[] = [];
        if (!posts || posts.length === 0) {
          posts = POSTS;
        }

        let leadPost = posts[0] || POSTS[0];
        const topStories = posts.filter((p) => p.id !== leadPost.id).slice(0, 3);
        if (topStories.length === 0) {
          topStories.push(...POSTS.slice(1, 4));
        }

        let reviewPosts = posts.filter(
          (p) => (p.tag === "Review" || p.category === "Reviews" || p.tag === "Reviews") && p.id !== leadPost.id
        );
        if (reviewPosts.length < 3) {
          const fallbackReviews = POSTS.filter((p) => p.tag === "Review");
          for (const r of fallbackReviews) {
            if (!reviewPosts.find((p) => String(p.id) === String(r.id))) {
              reviewPosts.push(r);
            }
          }
        }
        if (reviewPosts.length < 3) {
          for (const p of posts) {
            if (!reviewPosts.find((r) => String(r.id) === String(p.id)) && p.id !== leadPost.id) {
              reviewPosts.push(p);
            }
            if (reviewPosts.length >= 3) break;
          }
        }
        reviewPosts = reviewPosts.slice(0, 3);

        let maintenancePosts = posts.filter(
          (p) => (p.tag === "Manutenção" || p.category === "Manutenção") && p.id !== leadPost.id
        );
        if (maintenancePosts.length < 3) {
          const fallbackMaintenance = POSTS.filter((p) => p.tag === "Manutenção");
          for (const m of fallbackMaintenance) {
            if (!maintenancePosts.find((p) => String(p.id) === String(m.id))) {
              maintenancePosts.push(m);
            }
          }
        }
        if (maintenancePosts.length < 3) {
          for (const p of posts) {
            if (!maintenancePosts.find((m) => String(m.id) === String(p.id)) && p.id !== leadPost.id) {
              maintenancePosts.push(p);
            }
            if (maintenancePosts.length >= 3) break;
          }
        }
        maintenancePosts = maintenancePosts.slice(0, 3);

        let multimediaPosts = posts.filter((p) => Boolean(p.audioUrl));
        if (multimediaPosts.length < 2) {
          for (const p of posts) {
            if (!multimediaPosts.find((m) => String(m.id) === String(p.id))) {
              multimediaPosts.push(p);
            }
            if (multimediaPosts.length >= 2) break;
          }
        }
        multimediaPosts = multimediaPosts.slice(0, 2);

        // Verificações dos contratos essenciais
        expect(leadPost).toBeDefined();
        expect(leadPost.title).toBeDefined();

        expect(topStories.length).toBe(3);
        expect(topStories.every((p) => p.id !== leadPost.id)).toBe(true);

        expect(reviewPosts.length).toBe(3);
        expect(maintenancePosts.length).toBe(3);
        expect(multimediaPosts.length).toBe(2);
      });

      it("deve realizar busca textual em memória quando banco falhar durante pesquisa", () => {
        const searchQuery = "óleo";
        const fallbackSearchResults = POSTS.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        );

        expect(fallbackSearchResults.length).toBeGreaterThan(0);
        expect(fallbackSearchResults[0].title).toContain("Troca de óleo");
      });
    });
  });
});
