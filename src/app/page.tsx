import { prisma } from "../lib/db";
import { POSTS, CATEGORIES, TAG_COLORS, TEKO, BODY, optimizeImageUrl } from "./data";
import Link from "next/link";
import { Clock, Tag, ChevronRight, ArrowRight, Star, Calendar, MapPin, Wrench } from "lucide-react";
import Image from "next/image";
import Sidebar from "./components/Sidebar";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
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
  const currentLang = searchParams.lang || cookieStore.get("NEXT_LOCALE")?.value || "pt";

  // Filtro de idioma para as queries do Prisma
  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  // 1. Carregar configuração da Home Page e Posts
  let homeContent: any = {
    heroTitle: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    heroSubtitle: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    heroImage: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format",
    heroFocalPoint: "center",
    breakingText: "Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?",
    breakingSlug: "michelin-pilot-street-2-fazer",
    bannerTitle: "Yamaha FZ25 · Solid Grey 2026",
    bannerSubtitle: "8.400 km rodados · Motor 249cc · Minha companheira diária",
    bannerImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1400&h=500&fit=crop&auto=format",
    bannerFocalPoint: "center"
  };

  let posts: any[] = [];
  let categoryCounts: Record<string, number> = {};

  try {
    const pageDb = await prisma.page.findUnique({
      where: { slug: "home" }
    });
    if (pageDb && pageDb.content) {
      homeContent = pageDb.content;
    }

    // Carregar posts filtrados pelo IDIOMA ATUAL (currentLang)
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
                { seoKeywords: { contains: searchQuery } }
              ]
            }
          ]
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      posts = await prisma.post.findMany({
        where: langFilter,
        orderBy: { createdAt: "desc" }
      });
    }

    // Contagem de categorias filtradas pelo idioma
    const grouped = await prisma.post.groupBy({
      by: ["tag"],
      where: langFilter,
      _count: {
        id: true
      }
    });
    grouped.forEach(g => {
      categoryCounts[g.tag] = g._count.id;
    });

  } catch (error) {
    console.warn("Home database query failed, using static fallback.", error);
    posts = searchQuery 
      ? POSTS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      : POSTS;
    CATEGORIES.forEach(c => {
      categoryCounts[c.label] = c.count;
    });
  }

  // Preencher categorias padrão caso não haja posts nelas
  const finalCategories = [
    { label: "Reviews", tag: "Review", path: "/reviews" },
    { label: "Manutenção", tag: "Manutenção", path: "/manutencao" },
    { label: "Rotas", tag: "Rotas", path: "/rotas" },
    { label: "Equipamentos", tag: "Equipamentos", path: "/equipamentos" },
    { label: "Eventos", tag: "Eventos", path: "/eventos" }
  ].map(cat => ({
    ...cat,
    count: categoryCounts[cat.tag] || 0
  }));

  // Determinar o post do Hero (Destaque principal) filtrado pelo idioma
  let heroPost = posts[0] || null;
  if (homeContent.heroPostId) {
    const found = posts.find(p => String(p.id) === String(homeContent.heroPostId));
    if (found) heroPost = found;
  }

  // Determinar o post do Breaking Bar (Barra "Novo")
  let breakingPost = posts[1] || posts[0] || null;
  if (homeContent.breakingPostId) {
    const found = posts.find(p => String(p.id) === String(homeContent.breakingPostId));
    if (found) breakingPost = found;
  }

  const remainingPosts = posts;
  const featuredPost = remainingPosts[0] || null;
  const gridPosts = remainingPosts.slice(1, 5);

  const heroImage = heroPost ? heroPost.img : homeContent.heroImage;
  const heroFocalPoint = heroPost ? heroPost.imgFocalPoint : (homeContent.heroFocalPoint || "center");
  const heroTitle = heroPost ? heroPost.title : homeContent.heroTitle;
  const heroSubtitle = heroPost ? heroPost.excerpt : homeContent.heroSubtitle;
  const heroSlug = heroPost ? heroPost.slug : (homeContent.breakingSlug || "fazer-250-solid-grey-2026-6-meses");
  const heroLangPrefix = heroPost?.lang === "en" ? "/en" : heroPost?.lang === "es" ? "/es" : "";

  const breakingText = breakingPost ? breakingPost.title : homeContent.breakingText;
  const breakingSlug = breakingPost ? breakingPost.slug : (homeContent.breakingSlug || "michelin-pilot-street-2-fazer");
  const breakingLangPrefix = breakingPost?.lang === "en" ? "/en" : breakingPost?.lang === "es" ? "/es" : "";

  // Ordem de seções personalizável
  const defaultSectionOrder = ["hero", "breaking", "posts", "banner"];
  const sectionOrder: string[] = Array.isArray(homeContent.sectionOrder) && homeContent.sectionOrder.length > 0 
    ? homeContent.sectionOrder 
    : defaultSectionOrder;

  // Renderizadores dos blocos
  const renderHero = () => (
    <section key="hero" className="relative w-full overflow-hidden" style={{ height: "75vh", minHeight: "420px" }}>
      <Image 
        src={optimizeImageUrl(heroImage, 1200)} 
        alt={stripHtml(heroTitle)}
        fill
        priority
        sizes="100vw"
        className="object-cover" 
        style={{ objectPosition: heroFocalPoint }}
        unoptimized={heroImage.startsWith("/uploads")}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.10) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 50%, transparent 100%)" }} />
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-12 max-w-[820px] z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-primary text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1">Destaque</span>
        </div>
        <h1 
          style={TEKO} 
          className="text-[52px] md:text-[72px] font-semibold leading-none uppercase tracking-wide text-foreground mb-4 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: heroTitle }}
        />
        <p className="text-[15px] text-[#BBBBBB] max-w-[520px] leading-relaxed mb-7">
          {heroSubtitle}
        </p>
        <Link
          href={`${heroLangPrefix}/post/${heroSlug}`}
          className="flex items-center gap-2 bg-primary hover:bg-[#A00B22] text-white text-[14px] font-bold uppercase tracking-wider px-6 py-3 transition-colors w-fit"
        >
          Ler artigo completo <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );

  const renderBreaking = () => (
    <div key="breaking" className="bg-[#151515] border-y border-border h-10 px-6 flex items-center gap-3 overflow-hidden z-20 relative">
      <span style={TEKO} className="text-white text-[15px] font-semibold uppercase tracking-widest shrink-0 bg-[#E31E24] px-2 py-0.5">Novo</span>
      <span className="text-white text-[14px] truncate" dangerouslySetInnerHTML={{ __html: breakingText }} />
      <Link
        href={`${breakingLangPrefix}/post/${breakingSlug}`}
        className="text-white/80 hover:text-white text-[13px] font-semibold uppercase ml-auto shrink-0 flex items-center gap-1"
      >
        Ler <ChevronRight size={13} />
      </Link>
    </div>
  );

  const renderPosts = () => (
    <div key="posts" className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
      <div>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">
              {searchQuery ? `Resultados da busca: "${searchQuery}"` : "Últimos posts"}
            </h2>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center">
            <span className="text-muted-foreground text-[40px] block mb-3">🔍</span>
            <p style={TEKO} className="text-[22px] uppercase text-muted-foreground">Nenhum post encontrado neste idioma</p>
            <p className="text-[13px] text-muted-foreground mt-2">Não encontramos nenhum artigo correspondente à sua busca ou idioma selecionado.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors hover:bg-[#A00B22]"
            >
              Limpar Busca <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Post Card (Large) */}
            {featuredPost && (
              <article className="group bg-card border border-border overflow-hidden mb-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <Link href={`${featuredPost.lang === "en" ? "/en" : featuredPost.lang === "es" ? "/es" : ""}/post/${featuredPost.slug}`} className="block">
                  <div className="relative overflow-hidden w-full h-[280px]">
                    <img 
                      src={optimizeImageUrl(featuredPost.img, 750, 420)} 
                      alt={stripHtml(featuredPost.title)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      style={{ objectPosition: featuredPost.imgFocalPoint || "center" }}
                      loading="lazy"
                    />
                    <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[featuredPost.tag] || "bg-[#252525] text-white"}`}>
                      {featuredPost.tag}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 
                      style={TEKO} 
                      className="text-[32px] font-semibold uppercase leading-tight text-foreground mb-3 group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: featuredPost.title }}
                    />
                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Clock size={11} /> {featuredPost.readTime} · {featuredPost.createdAt ? new Date(featuredPost.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : (featuredPost.date instanceof Date ? featuredPost.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : String(featuredPost.date))}
                      </span>
                      <span className="text-[13px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        Ler <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Grid of Remaining Posts */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {gridPosts.map((post) => (
                  <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Link href={`${post.lang === "en" ? "/en" : post.lang === "es" ? "/es" : ""}/post/${post.slug}`} className="flex flex-col flex-1">
                      <div className="relative overflow-hidden w-full h-[185px]">
                        <img 
                          src={optimizeImageUrl(post.img, 450, 260)} 
                          alt={stripHtml(post.title)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          style={{ objectPosition: post.imgFocalPoint || "center" }}
                          loading="lazy"
                        />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag] || "bg-[#252525] text-white"}`}>
                          {post.tag}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 
                          style={TEKO} 
                          className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock size={10} /> {post.readTime} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : (post.date instanceof Date ? post.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : String(post.date))}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <div className="text-center mt-8 pt-6 border-t border-border/60">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-primary hover:text-white border border-border text-[14px] font-bold uppercase tracking-wider px-8 py-3.5 transition-all rounded-sm text-foreground shadow-sm"
              >
                Carregar mais posts <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}
      </div>

      <Sidebar />
    </div>
  );

  const renderBanner = () => (
    <section key="banner" className="relative overflow-hidden border-t border-b border-border" style={{ height: "220px" }}>
      <img 
        src={optimizeImageUrl(homeContent.bannerImage, 1200, 400)} 
        alt={homeContent.bannerTitle} 
        className="w-full h-full object-cover" 
        style={{ objectPosition: homeContent.bannerFocalPoint || "center" }}
        loading="lazy"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(0,0,0,.75), rgba(0,0,0,.35))" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">A moto do blog</span>
        <h2 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase text-white leading-none tracking-wide">
          {homeContent.bannerTitle}
        </h2>
        <p className="text-[#AAAAAA] text-[14px] mt-3">
          {homeContent.bannerSubtitle}
        </p>
      </div>
    </section>
  );

  const sectionMap: Record<string, () => JSX.Element> = {
    hero: renderHero,
    breaking: renderBreaking,
    posts: renderPosts,
    banner: renderBanner,
  };

  return (
    <>
      {sectionOrder.map((secKey) => (
        sectionMap[secKey] ? sectionMap[secKey]() : null
      ))}
    </>
  );
}
