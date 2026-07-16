import { prisma } from "../lib/db";
import { POSTS, CATEGORIES, TAG_COLORS, TEKO, BODY } from "./data";
import Link from "next/link";
import { Clock, Tag, ChevronRight, ArrowRight, Star, Calendar, MapPin, Wrench } from "lucide-react";
import Image from "next/image";
import Sidebar from "./components/Sidebar";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: {
    search?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const searchQuery = searchParams.search || "";

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

    // Carregar posts filtrados se houver busca
    if (searchQuery) {
      posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery } },
            { excerpt: { contains: searchQuery } },
            { tag: { contains: searchQuery } }
          ]
        },
        orderBy: { date: "desc" }
      });
    } else {
      posts = await prisma.post.findMany({
        orderBy: { date: "desc" }
      });
    }

    // Contagem de categorias dinâmicas
    const grouped = await prisma.post.groupBy({
      by: ["tag"],
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
    { label: "Equipamentos", tag: "Equipamentos", path: "/equipamentos" }
  ].map(cat => ({
    ...cat,
    count: categoryCounts[cat.tag] || 0
  }));

  // Determinar o post do Hero (Destaque principal)
  let heroPost = posts[0] || null;
  if (homeContent.heroPostId) {
    const found = posts.find(p => p.id === homeContent.heroPostId);
    if (found) heroPost = found;
  }

  // Determinar o post do Breaking Bar (Barra "Novo")
  let breakingPost = posts[1] || posts[0] || null;
  if (homeContent.breakingPostId) {
    const found = posts.find(p => p.id === homeContent.breakingPostId);
    if (found) breakingPost = found;
  }

  // Filtrar os posts da listagem para evitar duplicados (se for uma listagem normal sem busca ativa)
  const remainingPosts = searchQuery
    ? posts
    : posts.filter(p => p.id !== heroPost?.id);

  const featuredPost = remainingPosts[0] || null;
  const gridPosts = remainingPosts.slice(1, 5);

  const heroImage = heroPost ? heroPost.img : homeContent.heroImage;
  const heroFocalPoint = heroPost ? heroPost.imgFocalPoint : (homeContent.heroFocalPoint || "center");
  const heroTitle = heroPost ? heroPost.title : homeContent.heroTitle;
  const heroSubtitle = heroPost ? heroPost.excerpt : homeContent.heroSubtitle;
  const heroSlug = heroPost ? heroPost.slug : (homeContent.breakingSlug || "fazer-250-solid-grey-2026-6-meses");

  const breakingText = breakingPost ? breakingPost.title : homeContent.breakingText;
  const breakingSlug = breakingPost ? breakingPost.slug : (homeContent.breakingSlug || "michelin-pilot-street-2-fazer");

  return (
    <>
      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ height: "75vh", minHeight: "420px" }}>
        <img 
          src={heroImage} 
          alt={heroTitle} 
          className="w-full h-full object-cover" 
          style={{ objectPosition: heroFocalPoint }}
          fetchPriority="high"
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
            href={`/post/${heroSlug}`}
            className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[14px] font-bold uppercase tracking-wider px-6 py-3 transition-colors w-fit"
          >
            Ler artigo completo <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* BREAKING BAR */}
      <div className="bg-[#151515] border-y border-border py-2 px-6 flex items-center gap-3 overflow-hidden z-20 relative">
        <span style={TEKO} className="text-white text-[15px] font-semibold uppercase tracking-widest shrink-0 bg-[#E31E24] px-2 py-0.5">Novo</span>
        <span className="text-white text-[14px] truncate">{breakingText}</span>
        <Link
          href={`/post/${breakingSlug}`}
          className="text-white/80 hover:text-white text-[13px] font-semibold uppercase ml-auto shrink-0 flex items-center gap-1"
        >
          Ler <ChevronRight size={13} />
        </Link>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">

        {/* Posts */}
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
              <p style={TEKO} className="text-[22px] uppercase text-muted-foreground">Nenhum post encontrado</p>
              <p className="text-[13px] text-muted-foreground mt-2">Não encontramos nenhum artigo correspondente à sua busca.</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors hover:bg-[#E05300]"
              >
                Limpar Busca <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              {/* Featured Post Card (Large) */}
              {featuredPost && (
                <article className="group bg-card border border-border overflow-hidden mb-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <Link href={`/post/${featuredPost.slug}`} className="block">
                    <div className="relative overflow-hidden w-full h-[280px]">
                      <img 
                        src={featuredPost.img} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        style={{ objectPosition: featuredPost.imgFocalPoint || "center" }}
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
                          <Clock size={11} /> {featuredPost.readTime} · {featuredPost.date instanceof Date ? featuredPost.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : featuredPost.date}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {gridPosts.map((post) => (
                    <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                        <div className="relative overflow-hidden w-full h-[185px]">
                          <img 
                            src={post.img} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            style={{ objectPosition: post.imgFocalPoint || "center" }}
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
                            <Clock size={10} /> {post.readTime} · {post.date instanceof Date ? post.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : post.date}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR */}
        <Sidebar />
      </div>

      {/* BANNER MOTO */}
      <section className="relative overflow-hidden border-t border-b border-border" style={{ height: "220px" }}>
        <img 
          src={homeContent.bannerImage} 
          alt={homeContent.bannerTitle} 
          className="w-full h-full object-cover" 
          style={{ objectPosition: homeContent.bannerFocalPoint || "center" }}
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
    </>
  );
}
