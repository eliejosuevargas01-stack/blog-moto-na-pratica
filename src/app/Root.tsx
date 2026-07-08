import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { Search, Menu, X, ChevronRight, Instagram, Youtube, Facebook } from "lucide-react";
import { NAV_LINKS, POSTS, TEKO, BODY } from "./data";

export default function Root() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={BODY}>

      {/* TOP BAR */}
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

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#111111]/96 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <span className="block w-1 h-8 bg-primary" aria-hidden="true" />
            <span style={TEKO} className="text-[26px] font-semibold tracking-wide leading-none text-foreground uppercase">
              MOTO<span className="text-primary">NA</span>PRÁTICA
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                style={TEKO}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[17px] font-medium uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
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

        {searchOpen && (
          <div className="border-t border-border px-4 py-3 bg-[#111111]">
            <div className="max-w-[600px] mx-auto flex items-center gap-2 bg-secondary rounded-sm px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input autoFocus placeholder="Buscar posts..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
            </div>
          </div>
        )}

        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-card">
            {NAV_LINKS.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={() => setMenuOpen(false)}
                style={TEKO}
                className={({ isActive }) =>
                  `flex w-full items-center justify-between px-5 py-3 text-[18px] font-medium uppercase tracking-wider border-b border-border transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {label}
                <ChevronRight size={14} />
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
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
              {NAV_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <NavLink to={path} end={path === "/"} className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary" /> {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={TEKO} className="text-[18px] font-semibold uppercase tracking-widest text-foreground mb-5">Posts recentes</h4>
            <ul className="space-y-4">
              {POSTS.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <button onClick={() => navigate(`/post/${post.slug}`)} className="group flex items-start gap-2 text-left">
                    <span className="block w-0.5 shrink-0 bg-border group-hover:bg-primary transition-colors mt-1" style={{ minHeight: "14px" }} />
                    <span className="text-[12px] text-muted-foreground group-hover:text-foreground leading-snug transition-colors">
                      {post.title}
                    </span>
                  </button>
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
