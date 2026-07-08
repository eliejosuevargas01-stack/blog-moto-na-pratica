import { useNavigate } from "react-router";
import { Clock, Tag, ChevronRight, ArrowRight } from "lucide-react";
import { POSTS, CATEGORIES, TEKO, BODY, TAG_COLORS } from "../data";

const HERO_IMG = "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format";
const BANNER_IMG = "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1400&h=500&fit=crop&auto=format";

function CardHover({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <article
      onClick={onClick}
      className={`group bg-card border border-border overflow-hidden cursor-pointer ${className ?? ""}`}
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
      {children}
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ height: "75vh", minHeight: "420px" }}>
        <img src={HERO_IMG} alt="Fazer 250 Solid Grey 2026" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.10) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 50%, transparent 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-12 max-w-[820px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1">Post em destaque</span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Clock size={11} /> 8 min de leitura</span>
          </div>
          <h1 style={TEKO} className="text-[64px] md:text-[80px] font-semibold leading-none uppercase tracking-wide text-foreground mb-4">
            Fazer 250<br /><span className="text-primary">Solid Grey 2026:</span><br />6 meses de uso real
          </h1>
          <p className="text-[15px] text-[#BBBBBB] max-w-[520px] leading-relaxed mb-7">
            Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.
          </p>
          <button
            onClick={() => navigate(`/post/${POSTS[0].slug}`)}
            className="flex items-center gap-2 bg-primary hover:bg-[#A50D25] text-white text-[14px] font-bold uppercase tracking-wider px-6 py-3 transition-colors w-fit"
          >
            Ler artigo completo <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* BREAKING BAR */}
      <div className="bg-primary py-2 px-6 flex items-center gap-3 overflow-hidden">
        <span style={TEKO} className="text-white text-[15px] font-semibold uppercase tracking-widest shrink-0 bg-[#A50D25] px-2 py-0.5">Novo</span>
        <span className="text-white text-[14px] truncate">Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?</span>
        <button
          onClick={() => navigate(`/post/${POSTS[4].slug}`)}
          className="text-white/80 hover:text-white text-[13px] font-semibold uppercase ml-auto shrink-0 flex items-center gap-1"
        >
          Ler <ChevronRight size={13} />
        </button>
      </div>

      {/* MAIN */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">

        {/* Posts */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">Últimos posts</h2>
            </div>
            <button onClick={() => navigate("/reviews")} className="text-[12px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={13} />
            </button>
          </div>

          {/* Featured */}
          <CardHover className="mb-8 flex flex-col" onClick={() => navigate(`/post/${POSTS[0].slug}`)}>
            <div className="relative overflow-hidden" style={{ height: "280px" }}>
              <img src={POSTS[0].img} alt={POSTS[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[POSTS[0].tag]}`}>{POSTS[0].tag}</span>
            </div>
            <div className="p-6">
              <h3 style={TEKO} className="text-[32px] font-semibold uppercase leading-tight text-foreground mb-3 group-hover:text-primary transition-colors">{POSTS[0].title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">{POSTS[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock size={11} /> {POSTS[0].readTime} · {POSTS[0].date}</span>
                <span className="text-[13px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">Ler <ArrowRight size={13} /></span>
              </div>
            </div>
          </CardHover>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {POSTS.slice(1, 5).map((post) => (
              <CardHover key={post.id} className="flex flex-col" onClick={() => navigate(`/post/${post.slug}`)}>
                <div className="relative overflow-hidden" style={{ height: "185px" }}>
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag]}`}>{post.tag}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 style={TEKO} className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock size={10} /> {post.readTime} · {post.date}</div>
                </div>
              </CardHover>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button style={TEKO} className="px-10 py-3 border border-border text-[18px] font-medium uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              Carregar mais posts
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* BANNER MOTO */}
      <section className="relative overflow-hidden border-t border-b border-border" style={{ height: "220px" }}>
        <img src={BANNER_IMG} alt="FZ25 Solid Grey 2026" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(0,0,0,.75), rgba(0,0,0,.35))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">A moto do blog</span>
          <h2 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase text-white leading-none tracking-wide">Yamaha FZ25 · Solid Grey 2026</h2>
          <p className="text-[#AAAAAA] text-[14px] mt-3">8.400 km rodados · Motor 249cc · Minha companheira diária</p>
        </div>
      </section>
    </>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const SIDEBAR_IMG = "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=640&h=280&fit=crop&auto=format";

  return (
    <aside className="space-y-10">
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 bg-primary" />
          <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Sobre o blog</h3>
        </div>
        <div className="overflow-hidden mb-5" style={{ height: "120px" }}>
          <img src={SIDEBAR_IMG} alt="Na estrada" className="w-full h-full object-cover opacity-80" />
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada — sem patrocinador, sem jabá.
        </p>
        <button onClick={() => navigate("/sobre")} className="mt-4 text-[12px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
          Conhecer mais <ArrowRight size={12} />
        </button>
      </div>

      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 bg-primary" />
          <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Categorias</h3>
        </div>
        <ul>
          {CATEGORIES.map((cat) => (
            <li key={cat.label}>
              <button onClick={() => navigate(cat.path)} className="group flex items-center justify-between w-full py-2.5 border-b border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-2">
                  <ChevronRight size={11} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                  {cat.label}
                </span>
                <span className="text-[11px] bg-secondary px-1.5 py-0.5">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 bg-primary" />
          <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Fazer250", "FZ25", "Yamaha", "Review", "Manutenção", "Naked", "Pilotagem", "Segurança", "Rota", "Pneu", "2026"].map((tag) => (
            <button key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide">
              <Tag size={9} />{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-primary p-6">
        <h3 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-white mb-1">Receba novos posts</h3>
        <p className="text-[12px] text-white/70 mb-5 leading-relaxed">Sem spam. Só artigo novo quando sai.</p>
        <input type="email" placeholder="seu@email.com" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] px-3 py-2.5 mb-2.5 outline-none focus:border-white/60 transition-colors" />
        <button style={TEKO} className="w-full bg-[#111111] hover:bg-[#0A0A0A] text-white text-[18px] font-medium uppercase tracking-widest py-2.5 transition-colors">
          Inscrever
        </button>
      </div>
    </aside>
  );
}
