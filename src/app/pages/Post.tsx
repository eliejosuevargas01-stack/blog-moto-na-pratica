import { useParams, useNavigate } from "react-router";
import { Clock, ChevronLeft, Tag, ArrowRight } from "lucide-react";
import { POSTS, TAG_COLORS, TEKO, BODY } from "../data";
import { Sidebar } from "./Home";

export default function Post() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = POSTS.find((p) => p.slug === slug) ?? POSTS[0];
  const related = POSTS.filter((p) => p.id !== post.id && p.tag === post.tag).slice(0, 2);

  const paragraphs = (post.content ?? "").split("\n\n").filter(Boolean);

  return (
    <div>
      {/* POST HERO */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "360px" }}>
        <img src={post.img} alt={post.title} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.90) 0%, rgba(0,0,0,.40) 55%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:px-12 max-w-[900px]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-white uppercase tracking-wider mb-5 transition-colors w-fit"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[post.tag] ?? "bg-secondary text-muted-foreground"}`}>
              {post.tag}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Clock size={11} /> {post.readTime} de leitura</span>
            <span className="text-[12px] text-muted-foreground">{post.date}</span>
          </div>
          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold leading-none uppercase tracking-wide text-white">
            {post.title}
          </h1>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">

        <div>
          {/* Excerpt */}
          <p className="text-[17px] text-[#BBBBBB] leading-relaxed border-l-2 border-primary pl-5 mb-10" style={BODY}>
            {post.excerpt}
          </p>

          {/* Article body */}
          <div className="space-y-5" style={BODY}>
            {paragraphs.map((para, i) => {
              if (para.startsWith("**") && para.endsWith("**")) {
                const text = para.replace(/\*\*/g, "");
                return (
                  <h2 key={i} style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground pt-4 border-t border-border">
                    {text}
                  </h2>
                );
              }
              const formatted = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
              return (
                <p key={i} className="text-[15px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-border flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-muted-foreground uppercase tracking-wider">Tags:</span>
            {["Fazer250", "FZ25", post.tag, "2026"].map((tag) => (
              <button key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide">
                <Tag size={9} />{tag}
              </button>
            ))}
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1 h-6 bg-primary" />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">Posts relacionados</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => (
                  <article
                    key={p.id}
                    onClick={() => navigate(`/post/${p.slug}`)}
                    className="group bg-card border border-border overflow-hidden cursor-pointer"
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
                    <div className="relative overflow-hidden" style={{ height: "160px" }}>
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[p.tag]}`}>{p.tag}</span>
                    </div>
                    <div className="p-4">
                      <h4 style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">{p.title}</h4>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {p.readTime} · {p.date}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* All posts that don't have related */}
          {related.length === 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1 h-6 bg-primary" />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">Mais posts</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {POSTS.filter((p) => p.id !== post.id).slice(0, 2).map((p) => (
                  <article
                    key={p.id}
                    onClick={() => navigate(`/post/${p.slug}`)}
                    className="group bg-card border border-border overflow-hidden cursor-pointer"
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
                    <div className="relative overflow-hidden" style={{ height: "160px" }}>
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[p.tag]}`}>{p.tag}</span>
                    </div>
                    <div className="p-4">
                      <h4 style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">{p.title}</h4>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {p.readTime} · {p.date}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
