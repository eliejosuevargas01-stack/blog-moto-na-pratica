import { prisma } from "../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeImageUrl } from "../data";
import Link from "next/link";
import { Clock, Search, ArrowRight, Tag } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

interface PostsPageProps {
  searchParams: {
    search?: string;
    tag?: string;
    lang?: string;
  };
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const searchQuery = searchParams.search || "";
  const tagFilter = searchParams.tag || "";
  const cookieStore = cookies();
  const currentLang = searchParams.lang || cookieStore.get("NEXT_LOCALE")?.value || "pt";

  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  let posts: any[] = [];

  try {
    const conditions: any[] = [langFilter];

    if (searchQuery) {
      conditions.push({
        OR: [
          { title: { contains: searchQuery } },
          { excerpt: { contains: searchQuery } },
          { tag: { contains: searchQuery } },
          { category: { contains: searchQuery } },
          { seoKeywords: { contains: searchQuery } }
        ]
      });
    }

    if (tagFilter) {
      conditions.push({
        OR: [
          { tag: { equals: tagFilter } },
          { category: { equals: tagFilter } },
          { seoKeywords: { contains: tagFilter } }
        ]
      });
    }

    posts = await prisma.post.findMany({
      where: { AND: conditions },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Falha ao buscar posts no banco, usando POSTS estáticos:", error);
    posts = POSTS;
  }

  return (
    <div style={BODY}>
      <section className="bg-[#0A0A0A] border-b border-border py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-1 h-6 bg-primary" />
            <span style={TEKO} className="text-[20px] uppercase tracking-widest text-primary font-semibold">
              Acervo Completo
            </span>
          </div>
          <h1 style={TEKO} className="text-[48px] md:text-[62px] font-semibold uppercase leading-none text-foreground tracking-wide">
            {tagFilter ? `Artigos marcados com "${tagFilter}"` : searchQuery ? `Resultados da busca: "${searchQuery}"` : "Todos os Posts"}
          </h1>
          <p className="text-[14px] text-muted-foreground mt-3 max-w-[600px]">
            Confira todos os artigos publicados no idioma selecionado.
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          {posts.length === 0 ? (
            <div className="bg-card border border-border p-12 text-center">
              <span className="text-[40px] block mb-3">🔍</span>
              <h3 style={TEKO} className="text-[24px] uppercase text-muted-foreground">Nenhum post encontrado neste idioma</h3>
              <p className="text-[13px] text-muted-foreground mt-2 mb-6">
                Não encontramos nenhum artigo correspondente aos critérios selecionados.
              </p>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 bg-primary hover:bg-[#A00B22] text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors rounded-sm"
              >
                Ver Todos os Posts <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => {
                const createdDate = post.createdAt ? new Date(post.createdAt) : (post.date ? new Date(post.date) : new Date());
                const updatedDate = post.updatedAt ? new Date(post.updatedAt) : null;
                const isUpdated = updatedDate && (updatedDate.getTime() - createdDate.getTime() > 24 * 60 * 60 * 1000);

                const formattedCreated = createdDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                const formattedUpdated = updatedDate ? updatedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";
                const postUrlPath = post.lang === "en" ? `/en/post/${post.slug}` : post.lang === "es" ? `/es/post/${post.slug}` : `/post/${post.slug}`;

                return (
                  <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Link href={postUrlPath} className="flex flex-col flex-1">
                      <div className="relative overflow-hidden w-full h-[190px]">
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
                        <h2 
                          style={TEKO} 
                          className="text-[24px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="pt-3 border-t border-border/50 flex flex-col gap-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {post.readTime}
                            </span>
                            <span>{formattedCreated}</span>
                          </div>
                          {isUpdated && (
                            <span className="text-[10px] text-primary/80 italic font-mono">
                              (Atualizado em {formattedUpdated})
                            </span>
                          )}
                        </div>
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
