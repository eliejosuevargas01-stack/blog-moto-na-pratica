import { useNavigate } from "react-router";
import { Clock, ArrowRight } from "lucide-react";
import { POSTS, TAG_COLORS, TEKO, BODY } from "../data";
import { Sidebar } from "./Home";

interface Props {
  tag: string;
  title: string;
  description: string;
  heroImg: string;
  icon: React.ReactNode;
}

export default function CategoryPage({ tag, title, description, heroImg, icon }: Props) {
  const navigate = useNavigate();
  const posts = POSTS.filter((p) => p.tag === tag);
  const allOthers = POSTS.filter((p) => p.tag !== tag).slice(0, 3);

  return (
    <div>
      {/* CATEGORY HERO */}
      <div className="relative overflow-hidden border-b border-border" style={{ height: "280px" }}>
        <img src={heroImg} alt={title} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-[800px]">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-primary">{icon}</span>
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
          <button onClick={() => navigate("/")} className="hover:text-primary transition-colors uppercase tracking-wide">Home</button>
          <span>/</span>
          <span className="text-foreground uppercase tracking-wide">{title}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">

        <div>
          {/* Count */}
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
              <article
                onClick={() => navigate(`/post/${posts[0].slug}`)}
                className="group bg-card border border-border overflow-hidden cursor-pointer flex flex-col sm:flex-row"
                style={{ transition: "transform .25s ease, box-shadow .25s ease" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="relative overflow-hidden shrink-0 sm:w-[280px]" style={{ height: "200px" }}>
                  <img src={posts[0].img} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[posts[0].tag]}`}>{posts[0].tag}</span>
                </div>
                <div className="p-6 flex flex-col justify-center flex-1">
                  <h3 style={TEKO} className="text-[28px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">{posts[0].title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{posts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock size={11} /> {posts[0].readTime} · {posts[0].date}</span>
                    <span className="text-[12px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">Ler <ArrowRight size={12} /></span>
                  </div>
                </div>
              </article>

              {/* Remaining in 2-col grid */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {posts.slice(1).map((post) => (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/post/${post.slug}`)}
                      className="group bg-card border border-border overflow-hidden cursor-pointer flex flex-col"
                      style={{ transition: "transform .25s ease, box-shadow .25s ease" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(0,0,0,.40)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div className="relative overflow-hidden" style={{ height: "180px" }}>
                        <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag]}`}>{post.tag}</span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 style={TEKO} className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock size={10} /> {post.readTime} · {post.date}</div>
                      </div>
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
              <button
                onClick={() => navigate("/")}
                className="mt-6 flex items-center gap-2 bg-primary text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors mx-auto hover:bg-[#A50D25]"
              >
                Ver todos os posts <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* See also */}
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-1 h-6 bg-primary" />
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">Veja também</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {allOthers.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/post/${post.slug}`)}
                  className="group bg-card border border-border overflow-hidden cursor-pointer"
                  style={{ transition: "transform .25s ease, box-shadow .25s ease" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div className="relative overflow-hidden" style={{ height: "130px" }}>
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${TAG_COLORS[post.tag]}`}>{post.tag}</span>
                  </div>
                  <div className="p-3">
                    <h4 style={TEKO} className="text-[17px] font-semibold uppercase leading-tight text-foreground group-hover:text-primary transition-colors">{post.title}</h4>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
