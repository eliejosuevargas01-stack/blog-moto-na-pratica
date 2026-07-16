import { prisma } from "../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeUnsplashUrl } from "../data";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { Clock, ArrowRight, ChevronRight, Star, Wrench, Navigation, ShieldCheck } from "lucide-react";

interface CategoryViewProps {
  tag: string;
  title: string;
  description: string;
  heroImg: string;
  iconName: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Star: <Star size={20} fill="currentColor" className="text-primary" />,
  Wrench: <Wrench size={20} className="text-primary" />,
  Navigation: <Navigation size={20} className="text-primary" />,
  ShieldCheck: <ShieldCheck size={20} className="text-primary" />
};

export default async function CategoryView({ tag, title, description, heroImg, iconName }: CategoryViewProps) {
  let posts: any[] = [];
  let allOthers: any[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { tag },
      orderBy: { date: "desc" }
    });

    allOthers = await prisma.post.findMany({
      where: { tag: { not: tag } },
      take: 3,
      orderBy: { date: "desc" }
    });
  } catch (error) {
    console.warn("Category database query failed, using static fallback.", error);
    posts = POSTS.filter(p => p.tag === tag);
    allOthers = POSTS.filter(p => p.tag !== tag).slice(0, 3);
  }

  const firstPost = posts[0] || null;
  const restPosts = posts.slice(1);

  return (
    <div>
      {/* CATEGORY HERO */}
      <div className="relative overflow-hidden border-b border-border" style={{ height: "280px" }}>
        <img src={heroImg} alt={title} className="w-full h-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-[800px] z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-primary">{iconMap[iconName] || <Star size={20} />}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Categoria</span>
          </div>
          <h1 style={TEKO} className="text-[56px] md:text-[72px] font-semibold uppercase leading-none tracking-wide text-white mb-3">
            {title}
          </h1>
          <p className="text-[14px] text-[#AAAAAA] max-w-[480px] leading-relaxed">{description}</p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="border-b border-border bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors uppercase tracking-wide">Home</Link>
          <span>/</span>
          <span className="text-foreground uppercase tracking-wide">{title}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          {/* Header Count */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide">
                {posts.length > 0 ? `${posts.length} post${posts.length > 1 ? "s" : ""}` : "Posts"} em {title}
              </h2>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-5">
              {/* First post: horizontal featured */}
              {firstPost && (
                <article className="group bg-card border border-border overflow-hidden flex flex-col sm:flex-row transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <Link href={`/post/${firstPost.slug}`} className="flex flex-col sm:flex-row flex-1">
                    <div className="relative overflow-hidden shrink-0 sm:w-[280px]" style={{ height: "200px" }}>
                       <img 
                         src={optimizeUnsplashUrl(firstPost.img, 800, 450)} 
                         alt={firstPost.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         style={{ objectPosition: firstPost.imgFocalPoint || "center" }}
                       />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[firstPost.tag] || "bg-[#252525]"}`}>{firstPost.tag}</span>
                    </div>
                    <div className="p-6 flex flex-col justify-center flex-1">
                      <h3 
                        style={TEKO} 
                        className="text-[28px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors"
                        dangerouslySetInnerHTML={{ __html: firstPost.title }}
                      />
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{firstPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <Clock size={11} /> {firstPost.readTime} · {firstPost.date instanceof Date ? firstPost.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : firstPost.date}
                        </span>
                        <span className="text-[12px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">Ler <ArrowRight size={12} /></span>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* Remaining in 2-col grid */}
              {restPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {restPosts.map((post) => (
                    <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                        <div className="relative overflow-hidden" style={{ height: "180px" }}>
                           <img 
                             src={optimizeUnsplashUrl(post.img, 600, 340)} 
                             alt={post.title} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                             style={{ objectPosition: post.imgFocalPoint || "center" }}
                           />
                          <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag] || "bg-[#252525]"}`}>{post.tag}</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 
                            style={TEKO} 
                            className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors"
                            dangerouslySetInnerHTML={{ __html: post.title }}
                          />
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock size={10} /> {post.readTime} · {post.date instanceof Date ? post.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' }) : post.date}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-card border border-border p-12 text-center">
              <span className="text-muted-foreground text-[40px] block mb-3">🏍️</span>
              <p style={TEKO} className="text-[22px] uppercase text-muted-foreground">Em breve por aqui</p>
              <p className="text-[13px] text-muted-foreground mt-2">Ainda estou escrevendo sobre {title.toLowerCase()}. Volte em breve!</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors mx-auto hover:bg-[#E05300]"
              >
                Ver todos os posts <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* See also */}
          {allOthers.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1 h-6 bg-primary" />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">Veja também</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {allOthers.map((post) => (
                  <article key={post.id} className="group bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <Link href={`/post/${post.slug}`}>
                      <div className="relative overflow-hidden" style={{ height: "130px" }}>
                        <img 
                          src={optimizeUnsplashUrl(post.img, 450, 260)} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          style={{ objectPosition: post.imgFocalPoint || "center" }}
                        />
                        <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${TAG_COLORS[post.tag] || "bg-[#252525]"}`}>{post.tag}</span>
                      </div>
                      <div className="p-3">
                        <h4 
                          style={TEKO} 
                          className="text-[17px] font-semibold uppercase leading-tight text-foreground group-hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
