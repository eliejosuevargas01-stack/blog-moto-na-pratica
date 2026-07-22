import { prisma } from "../../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeImageUrl } from "../../data";
import Link from "next/link";
import { Clock, Tag, ArrowRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";

export const dynamic = "force-dynamic";

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagPageProps) {
  const decodedTag = decodeURIComponent(params.tag);
  return {
    title: `Posts sobre ${decodedTag} · Moto na Prática`,
    description: `Confira todos os artigos e postagens marcados com a tag ${decodedTag} no blog Moto na Prática.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const decodedTag = decodeURIComponent(params.tag);
  let posts: any[] = [];

  try {
    posts = await prisma.post.findMany({
      where: {
        OR: [
          { tag: { equals: decodedTag } },
          { category: { equals: decodedTag } },
          { tag: { contains: decodedTag } },
          { seoKeywords: { contains: decodedTag } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    posts = POSTS.filter(p => p.tag.toLowerCase() === decodedTag.toLowerCase());
  }

  return (
    <div style={BODY}>
      {/* HEADER DA PÁGINA DE TAG */}
      <section className="bg-[#0A0A0A] border-b border-border py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Tag size={18} />
            <span style={TEKO} className="text-[20px] uppercase tracking-widest font-semibold">
              Filtro por Tag
            </span>
          </div>
          <h1 style={TEKO} className="text-[48px] md:text-[62px] font-semibold uppercase leading-none text-foreground tracking-wide">
            Tag: {decodedTag}
          </h1>
          <p className="text-[14px] text-muted-foreground mt-2 max-w-[600px]">
            {posts.length} {posts.length === 1 ? "artigo encontrado" : "artigos encontrados"} com esta tag.
          </p>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          {posts.length === 0 ? (
            <div className="bg-card border border-border p-12 text-center">
              <span className="text-[40px] block mb-3">🏷️</span>
              <h3 style={TEKO} className="text-[24px] uppercase text-muted-foreground">
                Nenhum post encontrado para a tag "{decodedTag}"
              </h3>
              <p className="text-[13px] text-muted-foreground mt-2 mb-6">
                Explore outros tópicos ou veja a lista completa de publicações.
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
                const formattedDate = createdDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

                return (
                  <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                      <div className="relative overflow-hidden w-full h-[190px]">
                        <img 
                          src={optimizeImageUrl(post.img, 450, 260)} 
                          alt={post.title} 
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
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {post.readTime}
                          </span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <Sidebar />
      </div>
    </div>
  );
}
