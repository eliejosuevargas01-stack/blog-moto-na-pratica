import { prisma } from "../../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeUnsplashUrl } from "../../data";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronLeft, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

interface PostPageProps {
  params: {
    slug: string;
  };
}

// SEO Dinâmico: Metadados dinâmicos lidos do banco
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = params;
  try {
    const post = await prisma.post.findUnique({
      where: { slug }
    });
    if (!post) return { title: "Post Não Encontrado" };
    return {
      title: `${stripHtml(post.seoTitle || post.title)} · Moto na Prática`,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords || `${post.tag}, Fazer 250, Moto`,
      openGraph: {
        title: stripHtml(post.title),
        description: post.excerpt,
        images: [{ url: post.img }],
        type: "article",
      }
    };
  } catch (error) {
    return {
      title: "Moto na Prática",
      description: "Blog de motos"
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  let post: any = null;
  let related: any[] = [];

  try {
    post = await prisma.post.findUnique({
      where: { slug }
    });
  } catch (error) {
    console.warn("Post query failed, falling back to static POSTS.", error);
    post = POSTS.find(p => p.slug === slug);
  }

  if (!post) {
    return notFound();
  }

  // Buscar posts relacionados com a mesma tag (exceto o próprio post)
  try {
    related = await prisma.post.findMany({
      where: {
        tag: post.tag,
        id: { not: post.id }
      },
      take: 2,
      orderBy: { date: "desc" }
    });
  } catch (error) {
    // Fallback estático
    related = POSTS.filter(p => p.slug !== post.slug && p.tag === post.tag).slice(0, 2);
  }

  // Se não encontrar relacionados da mesma categoria, pegar posts mais novos
  if (related.length === 0) {
    try {
      related = await prisma.post.findMany({
        where: { id: { not: post.id } },
        take: 2,
        orderBy: { date: "desc" }
      });
    } catch (error) {
      related = POSTS.filter(p => p.slug !== post.slug).slice(0, 2);
    }
  }

  // Parsear blocos dinâmicos (caso venha do DB, é um array de objetos)
  let blocks: any[] = [];
  if (Array.isArray(post.blocks)) {
    blocks = post.blocks;
  } else if (typeof post.blocks === "string") {
    try {
      blocks = JSON.parse(post.blocks);
    } catch (e) {
      blocks = [];
    }
  } else {
    // Se for fallback estático (que tem um campo content), simular os blocos
    const paragraphs = (post.content ?? "").split("\n\n").filter(Boolean);
    const htmlParagraphs = paragraphs.map((p: string) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return `<h2>${p.replace(/\*\*/g, "")}</h2>`;
      }
      return `<p>${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    });

    const size = Math.ceil(htmlParagraphs.length / 3);
    for (let i = 0; i < 3; i++) {
      blocks.push({
        text: htmlParagraphs.slice(i * size, (i + 1) * size).join("\n"),
        image: "",
        focalPoint: "center"
      });
    }
  }

  const formattedDate = post.date instanceof Date 
    ? post.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })
    : String(post.date);

  return (
    <div>
      {/* POST HERO */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "360px" }}>
        <img 
          src={optimizeUnsplashUrl(post.img, 1200, 680)} 
          alt={stripHtml(post.title)} 
          className="w-full h-full object-cover object-center" 
          style={{ objectPosition: post.imgFocalPoint || "center" }}
          fetchPriority="high"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.90) 0%, rgba(0,0,0,.40) 55%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:px-12 max-w-[900px] z-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-white uppercase tracking-wider mb-5 transition-colors w-fit"
          >
            <ChevronLeft size={14} /> Voltar para Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[post.tag] ?? "bg-secondary text-muted-foreground"}`}>
              {post.tag}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Clock size={11} /> {post.readTime} de leitura</span>
            <span className="text-[12px] text-muted-foreground">{formattedDate}</span>
          </div>
          <h1 
            style={TEKO} 
            className="text-[48px] md:text-[64px] font-semibold leading-none uppercase tracking-wide text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div>
          {/* Excerpt */}
          <p className="text-[17px] text-[#BBBBBB] leading-relaxed border-l-2 border-primary pl-5 mb-10" style={BODY}>
            {post.excerpt}
          </p>

          {/* Article body with Dynamic HTML Blocks */}
          <div className="space-y-8" style={BODY}>
            {blocks.map((block: any, i: number) => (
              <div key={i} className="flex flex-col gap-6">
                {/* Texto HTML-Safe */}
                <div 
                  className="prose prose-invert max-w-none text-muted-foreground text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
                
                {/* Imagem do bloco com Ponto Focal */}
                {block.image && (
                  <div className="relative overflow-hidden w-full h-[360px] border border-border rounded-sm">
                    <img
                      src={block.image}
                      alt={`Ilustração do bloco ${i + 1}`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: block.focalPoint || "center" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-border flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-muted-foreground uppercase tracking-wider">Tags:</span>
            {["Fazer250", "FZ25", post.tag, "2026"].map((tag) => (
              <Link 
                key={tag} 
                href={`/?search=${tag}`}
                className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide"
              >
                <Tag size={9} />{tag}
              </Link>
            ))}
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1 h-6 bg-primary" />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">Posts recomendados</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => (
                  <article key={p.id} className="group bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <Link href={`/post/${p.slug}`} className="block">
                      <div className="relative overflow-hidden" style={{ height: "160px" }}>
                        <img 
                          src={optimizeUnsplashUrl(p.img, 600, 340)} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          style={{ objectPosition: p.imgFocalPoint || "center" }}
                        />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[p.tag] || "bg-[#252525] text-white"}`}>
                          {p.tag}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">
                          {p.title}
                        </h4>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {p.readTime}
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        {(() => {
          const postTags = [post.tag];
          if (post.seoKeywords) {
            post.seoKeywords.split(",").forEach((k: string) => {
              const trimmed = k.trim();
              if (trimmed && !postTags.includes(trimmed)) {
                postTags.push(trimmed);
              }
            });
          }
          return <Sidebar postTags={postTags} />;
        })()}
      </div>
    </div>
  );
}
