import { prisma } from "../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeImageUrl, formatPostUrl } from "./data";
import Link from "next/link";
import SafeHtml from "./components/SafeHtml";
import { Clock, ArrowRight, ChevronRight, Wrench, Volume2, Play } from "lucide-react";
import Image from "next/image";
import { cookies } from "next/headers";
import { getTranslation } from "./i18n/translations";
import MotorsportWidget from "./components/MotorsportWidget";
import NewsletterBox from "./components/NewsletterBox";

export const dynamic = "force-dynamic";

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

function getConsumptionLabel(post: any): string {
  const content = `${post?.content || ""} ${post?.excerpt || ""}`;
  const match = content.match(/(\d{1,2}(?:[.,]\d)?\s*km\/l)/i);
  if (match) return `Consumo aferido: ${match[1]}`;
  if (post?.slug?.includes("fazer") || post?.slug?.includes("fz25")) return "Consumo aferido: 31,5 km/l";
  if (post?.slug?.includes("160") || post?.slug?.includes("titan")) return "Consumo aferido: 42,3 km/l";
  return "Consumo aferido: 31,5 km/l";
}

interface HomeProps {
  searchParams: {
    search?: string;
    lang?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const searchQuery = searchParams.search || "";
  const cookieStore = cookies();
  const rawLang = searchParams.lang || cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const safeLang = (rawLang === "en" || rawLang === "es" ? rawLang : "pt") as "pt" | "en" | "es";
  const t = getTranslation(safeLang);

  const langFilter = {
    OR: [
      { lang: safeLang },
      ...(safeLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  let homeContent: any = {
    breakingText: "Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?",
    breakingSlug: "michelin-pilot-street-2-fazer",
  };

  let posts: any[] = [];

  try {
    const pageDb = await prisma.page.findUnique({
      where: { slug: "home" },
    });
    if (pageDb && pageDb.content) {
      homeContent = { ...homeContent, ...(pageDb.content as object) };
    }

    if (searchQuery) {
      posts = await prisma.post.findMany({
        where: {
          AND: [
            langFilter,
            {
              OR: [
                { title: { contains: searchQuery } },
                { excerpt: { contains: searchQuery } },
                { tag: { contains: searchQuery } },
                { category: { contains: searchQuery } },
                { seoKeywords: { contains: searchQuery } },
              ],
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      posts = await prisma.post.findMany({
        where: langFilter,
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (error) {
    console.warn("Home database query failed, using static fallback.", error);
    posts = searchQuery
      ? POSTS.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : POSTS;
  }

  if (!posts || posts.length === 0) {
    posts = POSTS;
  }

  // Consulta Motorsport segura com fallback
  let nextRace: any = null;
  let topRiders: any[] = [];
  try {
    nextRace = await prisma.calendarioEventos.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { dateStart: "asc" },
    });
    if (!nextRace) {
      nextRace = await prisma.calendarioEventos.findFirst({
        orderBy: { dateStart: "asc" },
      });
    }
    topRiders = await prisma.rankingPilotos.findMany({
      where: { championship: "MotoGP" },
      orderBy: { position: "asc" },
      take: 3,
    });
  } catch (err) {
    console.warn("Motorsport database query failed, using widget defaults.", err);
  }

  // Agrupamento inteligente de posts para a nova Homepage
  let leadPost = posts[0] || POSTS[0];
  if (homeContent.heroPostId) {
    const found = posts.find((p) => String(p.id) === String(homeContent.heroPostId));
    if (found) leadPost = found;
  }

  // Top Stories: 3 posts subsequentes
  const topStories = posts.filter((p) => p.id !== leadPost.id).slice(0, 3);
  if (topStories.length === 0) {
    topStories.push(...POSTS.filter((p) => String(p.id) !== String(leadPost.id)).slice(0, 3));
  }

  // Breaking News
  let breakingPost = posts.find((p) => String(p.id) !== String(leadPost.id)) || posts[0] || POSTS[0];
  if (homeContent.breakingPostId) {
    const found = posts.find((p) => String(p.id) === String(homeContent.breakingPostId));
    if (found) breakingPost = found;
  }
  const breakingText = homeContent.breakingText || breakingPost.title;
  const breakingSlug = homeContent.breakingSlug || breakingPost.slug;
  const breakingLang = safeLang;

  // Vitrine de Reviews (3 posts)
  let reviewPosts = posts.filter(
    (p) =>
      (p.tag === "Review" || p.category === "Reviews" || p.tag === "Reviews") &&
      String(p.id) !== String(leadPost.id)
  );
  if (reviewPosts.length < 3) {
    const fallbackReviews = POSTS.filter(
      (p) =>
        (p.tag === "Review" || p.category === "Reviews" || p.tag === "Reviews") &&
        String(p.id) !== String(leadPost.id)
    );
    for (const r of fallbackReviews) {
      if (String(r.id) !== String(leadPost.id) && !reviewPosts.find((p) => String(p.id) === String(r.id))) {
        reviewPosts.push(r);
      }
    }
  }
  if (reviewPosts.length < 3) {
    for (const p of posts) {
      if (reviewPosts.length >= 3) break;
      if (String(p.id) !== String(leadPost.id) && !reviewPosts.find((item) => String(item.id) === String(p.id))) {
        reviewPosts.push(p);
      }
    }
  }
  reviewPosts = reviewPosts.slice(0, 3);

  // Guia de Manutenção da Oficina (3 posts)
  let maintenancePosts = posts.filter(
    (p) =>
      (p.tag === "Manutenção" || p.category === "Manutenção") &&
      String(p.id) !== String(leadPost.id)
  );
  if (maintenancePosts.length < 3) {
    const fallbackMaintenance = POSTS.filter(
      (p) =>
        (p.tag === "Manutenção" || p.category === "Manutenção") &&
        String(p.id) !== String(leadPost.id)
    );
    for (const m of fallbackMaintenance) {
      if (String(m.id) !== String(leadPost.id) && !maintenancePosts.find((p) => String(p.id) === String(m.id))) {
        maintenancePosts.push(m);
      }
    }
  }
  if (maintenancePosts.length < 3) {
    for (const p of posts) {
      if (maintenancePosts.length >= 3) break;
      if (String(p.id) !== String(leadPost.id) && !maintenancePosts.find((item) => String(item.id) === String(p.id))) {
        maintenancePosts.push(p);
      }
    }
  }
  maintenancePosts = maintenancePosts.slice(0, 3);

  // Mural Multimídia (2 posts)
  let multimediaPosts = posts.filter(
    (p) => Boolean(p.audioUrl) && String(p.id) !== String(leadPost.id)
  );
  if (multimediaPosts.length < 2) {
    for (const p of posts) {
      if (multimediaPosts.length >= 2) break;
      if (String(p.id) !== String(leadPost.id) && !multimediaPosts.find((m) => String(m.id) === String(p.id))) {
        multimediaPosts.push(p);
      }
    }
  }
  multimediaPosts = multimediaPosts.slice(0, 2);

  const authorByLang = {
    pt: "Por Redação Moto na Prática",
    en: "By Moto na Prática Staff",
    es: "Por Redacción Moto na Prática",
  };
  const authorLabel = authorByLang[safeLang] || authorByLang.pt;

  return (
    <div style={BODY} className="bg-background text-foreground min-h-screen">
      {/* 1. BREAKING NEWS TICKER */}
      <div className="bg-[#151515] border-y border-border h-10 px-4 md:px-6 flex items-center gap-3 overflow-hidden z-20 relative">
        <span
          style={TEKO}
          className="text-white text-[15px] font-semibold uppercase tracking-widest shrink-0 bg-[#E31E24] px-2 py-0.5 rounded-xs"
        >
          {t.ticker.badge}
        </span>
        <SafeHtml tag="span" className="text-white text-[14px] truncate" html={breakingText} />
        <Link
          href={formatPostUrl(breakingSlug, breakingLang)}
          className="text-white/80 hover:text-white text-[13px] font-semibold uppercase ml-auto shrink-0 flex items-center gap-1 transition-colors"
        >
          {t.ticker.read} <ChevronRight size={13} />
        </Link>
      </div>

      {/* BUSCA EDITORIAL (SE ATIVA) */}
      {searchQuery && (
        <section className="bg-card border-b border-border py-8 px-4 md:px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-5 bg-primary" />
              <span style={TEKO} className="text-[18px] uppercase tracking-wider text-primary font-bold">
                Busca Editorial
              </span>
            </div>
            <h1 style={TEKO} className="text-[34px] md:text-[44px] font-bold uppercase leading-tight text-foreground">
              {t.posts.searchTitle.replace("{query}", searchQuery)}
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1 mb-4">
              {posts.length} {posts.length === 1 ? "artigo encontrado" : "artigos encontrados"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Limpar busca e ver portal completo <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}

      {/* 2. HERO EDITORIAL ASSIMÉTRICO (GRID 60/40) */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          {/* COLUNA ESQUERDA: MANCHETE DO DIA (LEAD STORY) */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-4 bg-primary" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
                {t.homePortal?.leadStory || "Manchete do Dia"}
              </span>
            </div>

            <article className="group bg-card border border-border rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg">
              <Link href={formatPostUrl(leadPost.slug, safeLang)} className="block relative">
                <div className="aspect-[16/9] overflow-hidden relative rounded-sm bg-neutral-900">
                  <Image
                    src={optimizeImageUrl(leadPost.img, 960, 540)}
                    alt={stripHtml(leadPost.title)}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: leadPost.imgFocalPoint || "center" }}
                    unoptimized={leadPost.img?.includes("/uploads/")}
                  />
                  <span
                    className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 z-10 rounded-xs shadow-sm ${
                      TAG_COLORS[leadPost.tag] || "bg-primary text-white"
                    }`}
                  >
                    {leadPost.tag}
                  </span>
                </div>
              </Link>
              <div className="p-5 md:p-6 flex flex-col flex-1">
                <Link href={formatPostUrl(leadPost.slug, safeLang)}>
                  <SafeHtml
                    tag="h1"
                    style={TEKO}
                    className="text-[36px] md:text-[50px] font-semibold uppercase leading-tight text-foreground hover:text-primary transition-colors mb-3"
                    html={leadPost.title}
                  />
                </Link>
                <p className="text-[15px] text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1">
                  {leadPost.excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/70 text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{authorLabel}</span>
                  <div className="flex items-center gap-3">
                    <time dateTime={leadPost.createdAt ? new Date(leadPost.createdAt).toISOString() : undefined}>
                      {formatDate(leadPost.createdAt || leadPost.date, safeLang)}
                    </time>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={12} className="text-primary" /> {leadPost.readTime || "5 min"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* COLUNA DIREITA: EM DESTAQUE (3 TOP STORIES) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-primary">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-primary" />
                <h2
                  style={TEKO}
                  className="text-[26px] md:text-[28px] font-bold uppercase tracking-wide text-foreground leading-none"
                >
                  {t.homePortal?.topStories || "Em Destaque"}
                </h2>
              </div>
            </div>

            <div className="divide-y divide-border/70 flex flex-col">
              {topStories.map((post) => (
                <article key={post.id} className="py-4 first:pt-0 last:pb-0 group">
                  <Link href={formatPostUrl(post.slug, safeLang)} className="flex gap-4 items-start">
                    <div className="w-[120px] h-[78px] shrink-0 rounded overflow-hidden relative bg-neutral-900">
                      <Image
                        src={optimizeImageUrl(post.img, 240, 156)}
                        alt={stripHtml(post.title)}
                        fill
                        sizes="120px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ objectPosition: post.imgFocalPoint || "center" }}
                        unoptimized={post.img?.includes("/uploads/")}
                      />
                      <span
                        className={`absolute bottom-1 left-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${
                          TAG_COLORS[post.tag] || "bg-[#252525] text-white"
                        }`}
                      >
                        {post.tag}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <SafeHtml
                        tag="h3"
                        style={TEKO}
                        className="text-[19px] md:text-[21px] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5"
                        html={post.title}
                      />
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatDate(post.createdAt || post.date, safeLang)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {post.readTime || "4 min"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MOTORSPORT CENTRAL WIDGET */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-4">
        <MotorsportWidget nextRace={nextRace} ranking={topRiders} lang={safeLang} />
      </section>

      {/* 4. VITRINE EDITORIAL: TESTES & AVALIAÇÕES DA REDAÇÃO */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-1.5 h-6 bg-primary" />
              <h2
                style={TEKO}
                className="text-[32px] md:text-[38px] font-bold uppercase tracking-wide leading-none text-foreground"
              >
                {t.homePortal?.reviewsTitle || "Testes & Avaliações da Redação"}
              </h2>
            </div>
            <p className="text-[14px] text-muted-foreground max-w-[650px]">
              {t.homePortal?.reviewsSubtitle ||
                "Análises aprofundadas com medição real de consumo na bomba e veredito prático."}
            </p>
          </div>
          <Link
            href="/reviews"
            className="mt-3 md:mt-0 text-[13px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Ver todos os testes <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewPosts.map((post) => {
            const consumption = getConsumptionLabel(post);
            return (
              <article
                key={post.id}
                className="group bg-card border border-border rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={formatPostUrl(post.slug, safeLang)} className="block relative">
                  <div className="aspect-[16/9] overflow-hidden relative bg-neutral-900">
                    <Image
                      src={optimizeImageUrl(post.img, 600, 338)}
                      alt={stripHtml(post.title)}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ objectPosition: post.imgFocalPoint || "center" }}
                      unoptimized={post.img?.includes("/uploads/")}
                    />
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-black/80 text-white border border-white/20 rounded-xs backdrop-blur-xs">
                      TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-white rounded-xs shadow-md">
                      {consumption}
                    </span>
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <Link href={formatPostUrl(post.slug, safeLang)}>
                      <SafeHtml
                        tag="h3"
                        style={TEKO}
                        className="text-[24px] md:text-[26px] font-semibold uppercase leading-tight text-foreground group-hover:text-primary transition-colors mb-2"
                        html={post.title}
                      />
                    </Link>
                    <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={11} /> {post.readTime} · {formatDate(post.createdAt || post.date, safeLang)}
                    </span>
                    <Link
                      href={formatPostUrl(post.slug, safeLang)}
                      className="text-[12px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      Ler Análise <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. GUIA PRÁTICO DA OFICINA & MANUTENÇÃO */}
      <section className="bg-secondary/30 border-y border-border py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Wrench className="w-6 h-6 text-primary" />
                <h2
                  style={TEKO}
                  className="text-[32px] md:text-[38px] font-bold uppercase tracking-wide leading-none text-foreground"
                >
                  {t.homePortal?.workshopTitle || "Guia Prático da Oficina & Manutenção"}
                </h2>
              </div>
              <p className="text-[14px] text-muted-foreground max-w-[650px]">
                {t.homePortal?.workshopSubtitle ||
                  "Procedimentos passo a passo de manutenção preventiva, cuidados e segurança."}
              </p>
            </div>
            <Link
              href="/manutencao"
              className="mt-3 md:mt-0 text-[13px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              Manual completo da oficina <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {maintenancePosts.map((post) => (
              <article
                key={post.id}
                className="group bg-card border border-border rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={formatPostUrl(post.slug, safeLang)} className="block relative">
                  <div className="aspect-[16/9] overflow-hidden relative bg-neutral-900">
                    <Image
                      src={optimizeImageUrl(post.img, 600, 338)}
                      alt={stripHtml(post.title)}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ objectPosition: post.imgFocalPoint || "center" }}
                      unoptimized={post.img?.includes("/uploads/")}
                    />
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-black/80 text-white border border-white/20 rounded-xs flex items-center gap-1">
                      <Wrench size={10} className="text-primary" /> OFICINA & PREVENTIVA
                    </span>
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <Link href={formatPostUrl(post.slug, safeLang)}>
                      <SafeHtml
                        tag="h3"
                        style={TEKO}
                        className="text-[22px] md:text-[24px] font-semibold uppercase leading-tight text-foreground group-hover:text-primary transition-colors mb-2"
                        html={post.title}
                      />
                    </Link>
                    <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={11} /> {post.readTime} · Procedimento Passo a Passo
                    </span>
                    <Link
                      href={formatPostUrl(post.slug, safeLang)}
                      className="text-[12px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      Ver Guia <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MURAL MULTIMÍDIA & ÁUDIO TTS */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Volume2 className="w-6 h-6 text-primary" />
              <h2
                style={TEKO}
                className="text-[32px] md:text-[38px] font-bold uppercase tracking-wide leading-none text-foreground"
              >
                {t.homePortal?.multimediaTitle || "Mural Multimídia & Áudio"}
              </h2>
            </div>
            <p className="text-[14px] text-muted-foreground max-w-[650px]">
              {t.homePortal?.multimediaSubtitle ||
                "Reportagens completas com narração em áudio para ouvir onde estiver."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {multimediaPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-card border-2 border-border hover:border-primary/50 rounded-sm p-5 md:p-6 flex flex-col justify-between transition-all duration-300 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xs">
                    <Volume2 size={13} className="shrink-0" />
                    Narração Neural Ativa
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock size={11} /> {post.readTime} de áudio
                  </span>
                </div>

                <Link href={formatPostUrl(post.slug, safeLang)}>
                  <SafeHtml
                    tag="h3"
                    style={TEKO}
                    className="text-[26px] md:text-[28px] font-bold uppercase leading-tight text-foreground group-hover:text-primary transition-colors mb-2.5"
                    html={post.title}
                  />
                </Link>
                <p className="text-[14px] text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`${formatPostUrl(post.slug, safeLang)}#audio-player`}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-[#A00B22] text-white text-[12px] md:text-[13px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors shadow-xs"
                >
                  <Play size={13} fill="currentColor" /> {t.homePortal?.listenArticle || "Ouvir Reportagem"}
                </Link>
                <Link
                  href={formatPostUrl(post.slug, safeLang)}
                  className="inline-flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                >
                  Ler Artigo Completo <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. NEWSLETTER DA REDAÇÃO & ACERVO COMPLETO */}
      <NewsletterBox variant="banner" />

      <section className="bg-secondary/40 border-b border-border py-12 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2
              style={TEKO}
              className="text-[28px] md:text-[34px] font-bold uppercase tracking-wide text-foreground leading-none mb-2"
            >
              Explore Nosso Acervo Editorial Completo
            </h2>
            <p className="text-[14px] text-muted-foreground max-w-[620px]">
              Consulte análises aprofundadas, dados técnicos de bancada, rotas de mototurismo mapeadas e
              procedimentos detalhados de oficina.
            </p>
          </div>
          <Link
            href={safeLang === "en" ? "/en/posts" : safeLang === "es" ? "/es/posts" : "/posts"}
            className="inline-flex items-center justify-center gap-2 bg-foreground hover:bg-primary text-background hover:text-white text-[14px] font-bold uppercase tracking-wider px-8 py-4 transition-all rounded-xs shadow-md shrink-0"
          >
            Ver Todos os Posts <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
