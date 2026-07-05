import { useState } from "react";
import { Search, Menu, X, ChevronRight, Clock, Tag, Instagram, Youtube, Facebook, ArrowRight } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format";
const IMG1 = "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=640&h=420&fit=crop&auto=format";
const IMG2 = "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=640&h=420&fit=crop&auto=format";
const IMG3 = "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=640&h=420&fit=crop&auto=format";
const IMG4 = "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=640&h=420&fit=crop&auto=format";
const IMG5 = "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=640&h=420&fit=crop&auto=format";

const NAV_LINKS = ["Home", "Reviews", "Manutenção", "Rotas", "Equipamentos", "Sobre"];

const POSTS = [
  {
    id: 1,
    tag: "Review",
    title: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    excerpt: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    date: "12 Jun 2025",
    readTime: "8 min",
    img: IMG1,
  },
  {
    id: 2,
    tag: "Manutenção",
    title: "Troca de óleo na FZ25: passo a passo sem enrolação",
    excerpt: "Óleos recomendados, torque do dreno e dicas pra não sujar a escapamento. Custo total: R$ 87.",
    date: "28 Mai 2025",
    readTime: "5 min",
    img: IMG2,
  },
  {
    id: 3,
    tag: "Rotas",
    title: "Serra da Canastra de moto: a rota que todo piloto tem que fazer",
    excerpt: "Saí de BH num sábado às 6h. Estradas perfeitas, frio na cara e 620 km de pura satisfação.",
    date: "15 Mai 2025",
    readTime: "6 min",
    img: IMG3,
  },
  {
    id: 4,
    tag: "Equipamentos",
    title: "Capacete HJC RPHA 11 Pro depois de 1 ano: vale os R$ 1.400?",
    excerpt: "Review honesto sem jabá. Ventilação, peso, visibilidade e o que mudou depois de muita chuva.",
    date: "3 Mai 2025",
    readTime: "7 min",
    img: IMG4,
  },
  {
    id: 5,
    tag: "Review",
    title: "Michelin Pilot Street 2 na Fazer: diferença real ou papo de vendedor?",
    excerpt: "Troquei os originais com 12.000 km. A diferença em frenagem na chuva foi imediata.",
    date: "20 Abr 2025",
    readTime: "4 min",
    img: IMG5,
  },
];

const CATEGORIES = [
  { label: "Reviews", count: 12 },
  { label: "Manutenção", count: 9 },
  { label: "Rotas", count: 7 },
  { label: "Equipamentos", count: 11 },
  { label: "Dicas", count: 6 },
  { label: "Customização", count: 4 },
];

const TAG_COLORS: Record<string, string> = {
  Review: "bg-[#C8102E] text-white",
  Manutenção: "bg-[#252525] text-[#AAAAAA]",
  Rotas: "bg-[#252525] text-[#AAAAAA]",
  Equipamentos: "bg-[#252525] text-[#AAAAAA]",
};

/* Shared Teko display font style */
const TEKO: React.CSSProperties = { fontFamily: "'Teko', sans-serif" };
const BODY: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" };

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <div className="min-h-screen bg-background text-foreground" style={BODY}>

      {/* ─── TOP BAR ─── */}
      <div className="bg-[#0A0A0A] border-b border-border px-4 py-1.5 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground tracking-widest uppercase">
          Blog independente · experiência real na estrada
        </span>
        <div className="flex items-center gap-4 text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors"><Instagram size={13} /></a>
          <a href="#" className="hover:text-primary transition-colors"><Youtube size={13} /></a>
          <a href="#" className="hover:text-primary transition-colors"><Facebook size={13} /></a>
        </div>
      </div>

      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0">
            <span className="block w-1 h-8 bg-primary" aria-hidden="true" />
            <span style={TEKO} className="text-[26px] font-semibold tracking-wide leading-none text-foreground uppercase">
              MOTO<span className="text-primary">NA</span>PRÁTICA
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                style={TEKO}
                className={`px-3 py-1.5 text-[17px] font-medium uppercase tracking-wider transition-colors ${
                  activeNav === link ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Search size={16} />
            </button>
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border px-4 py-3 bg-[#111111]">
            <div className="max-w-[600px] mx-auto flex items-center gap-2 bg-secondary rounded-sm px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input autoFocus placeholder="Buscar posts..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-card">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => { setActiveNav(link); setMenuOpen(false); }}
                style={TEKO}
                className="flex w-full items-center justify-between px-5 py-3 text-[18px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-border"
              >
                {link}
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* ─── HERO — 75vh, overlay leve para a moto aparecer ─── */}
      <section className="relative w-full overflow-hidden" style={{ height: "75vh", minHeight: "420px" }}>
        <img
          src={HERO_IMG}
          alt="Fazer 250 Solid Grey 2026"
          className="w-full h-full object-cover object-center"
        />
        {/* overlay ajustado: moto aparece mais */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.10) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 50%, transparent 100%)" }}
        />

        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-12 max-w-[820px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1">
              Post em destaque
            </span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Clock size={11} /> 8 min de leitura
            </span>
          </div>
          <h1
            style={TEKO}
            className="text-[64px] md:text-[80px] font-semibold leading-none uppercase tracking-wide text-foreground mb-4"
          >
            Fazer 250<br />
            <span className="text-primary">Solid Grey 2026:</span><br />
            6 meses de uso real
          </h1>
          <p className="text-[15px] text-[#BBBBBB] max-w-[520px] leading-relaxed mb-7">
            Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.
          </p>
          <button className="flex items-center gap-2 bg-primary hover:bg-[#A50D25] text-white text-[14px] font-bold uppercase tracking-wider px-6 py-3 transition-colors w-fit">
            Ler artigo completo <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ─── BREAKING BAR ─── */}
      <div className="bg-primary py-2 px-6 flex items-center gap-3 overflow-hidden">
        <span style={TEKO} className="text-white text-[15px] font-semibold uppercase tracking-widest shrink-0 bg-[#A50D25] px-2 py-0.5">
          Novo
        </span>
        <span className="text-white text-[14px] truncate">
          Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?
        </span>
        <button className="text-white/80 hover:text-white text-[13px] font-semibold uppercase ml-auto shrink-0 flex items-center gap-1">
          Ler <ChevronRight size={13} />
        </button>
      </div>

      {/* ─── MAIN CONTENT — espaçamento generoso py-16 ─── */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">

        {/* ── Posts ── */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-7 bg-primary" aria-hidden="true" />
              <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground">
                Últimos posts
              </h2>
            </div>
            <button className="text-[12px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={13} />
            </button>
          </div>

          {/* Featured large post — hover: translateY + shadow */}
          <article
            className="group mb-8 bg-card border border-border overflow-hidden cursor-pointer transition-all duration-300"
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
            <div className="relative overflow-hidden" style={{ height: "280px" }}>
              <img
                src={POSTS[0].img}
                alt={POSTS[0].title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
              <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[POSTS[0].tag]}`}>
                {POSTS[0].tag}
              </span>
            </div>
            <div className="p-6">
              <h3
                style={TEKO}
                className="text-[32px] font-semibold uppercase leading-tight text-foreground mb-3 group-hover:text-primary transition-colors"
              >
                {POSTS[0].title}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">{POSTS[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Clock size={11} /> {POSTS[0].readTime} de leitura · {POSTS[0].date}
                </span>
                <button className="text-[13px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                  Ler <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </article>

          {/* Grid of smaller posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {POSTS.slice(1).map((post) => (
              <article
                key={post.id}
                className="group bg-card border border-border overflow-hidden flex flex-col cursor-pointer"
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
                <div className="relative overflow-hidden" style={{ height: "185px" }}>
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[post.tag]}`}>
                    {post.tag}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    style={TEKO}
                    className="text-[22px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors"
                  >
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto">
                    <Clock size={10} /> {post.readTime} · {post.date}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load more */}
          <div className="mt-10 flex justify-center">
            <button
              style={TEKO}
              className="px-10 py-3 border border-border text-[18px] font-medium uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Carregar mais posts
            </button>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="space-y-10">

          {/* About */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-5 bg-primary" aria-hidden="true" />
              <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Sobre o blog</h3>
            </div>
            <div className="w-full overflow-hidden mb-5" style={{ height: "120px" }}>
              <img src={IMG3} alt="Dono do blog na estrada" className="w-full h-full object-cover object-center opacity-80" />
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada — sem patrocinador, sem jabá. Só experiência real.
            </p>
          </div>

          {/* Categories */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-5 bg-primary" aria-hidden="true" />
              <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Categorias</h3>
            </div>
            <ul className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.label}>
                  <button className="group flex items-center justify-between w-full py-2.5 border-b border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
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

          {/* Tags */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-5 bg-primary" aria-hidden="true" />
              <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Fazer250", "FZ25", "Yamaha", "Review", "Manutenção", "Naked", "Moto", "Pilotagem", "Segurança", "Rota", "Pneu", "2026"].map((tag) => (
                <button
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide"
                >
                  <Tag size={9} />{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-primary p-6">
            <h3 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-white mb-1">
              Receba novos posts
            </h3>
            <p className="text-[12px] text-white/70 mb-5 leading-relaxed">Sem spam. Só artigo novo quando sai.</p>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] px-3 py-2.5 mb-2.5 outline-none focus:border-white/60 transition-colors"
            />
            <button style={TEKO} className="w-full bg-[#111111] hover:bg-[#0A0A0A] text-white text-[18px] font-medium uppercase tracking-widest py-2.5 transition-colors">
              Inscrever
            </button>
          </div>
        </aside>
      </main>

      {/* ─── BANNER MOTO ─── */}
      <section className="relative overflow-hidden border-t border-b border-border" style={{ height: "220px" }}>
        <img src={IMG5} alt="Fazer 250 Solid Grey 2026" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(0,0,0,.75), rgba(0,0,0,.35))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">A moto do blog</span>
          <h2 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase text-white leading-none tracking-wide">
            Yamaha FZ25 · Solid Grey 2026
          </h2>
          <p className="text-[#AAAAAA] text-[14px] mt-3">8.400 km rodados · Motor 249cc · Minha companheira diária</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0A0A0A] border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-1 h-7 bg-primary" />
              <span style={TEKO} className="text-[24px] font-semibold uppercase tracking-wide text-foreground">
                MOTO<span className="text-primary">NA</span>PRÁTICA
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Blog independente sobre motos. Experiência real, sem filtro e sem patrocínio.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={16} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube size={16} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={16} /></a>
            </div>
          </div>
          <div>
            <h4 style={TEKO} className="text-[18px] font-semibold uppercase tracking-widest text-foreground mb-5">Seções</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary" /> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={TEKO} className="text-[18px] font-semibold uppercase tracking-widest text-foreground mb-5">Posts recentes</h4>
            <ul className="space-y-4">
              {POSTS.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <a href="#" className="group flex items-start gap-2">
                    <span className="block w-0.5 shrink-0 bg-border group-hover:bg-primary transition-colors mt-1" style={{ minHeight: "14px" }} />
                    <span className="text-[12px] text-muted-foreground group-hover:text-foreground leading-snug transition-colors">
                      {post.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-[11px] text-muted-foreground tracking-widest uppercase">
          © 2025 Moto na Prática · Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
