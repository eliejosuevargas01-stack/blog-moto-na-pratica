"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronRight } from "lucide-react";
import { TEKO } from "../data";
import SocialLinks from "./SocialLinks";

interface HeaderProps {
  customPages: { title: string; slug: string }[];
}

export default function Header({ customPages }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLang, setCurrentLang] = useState("pt");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname?.startsWith("/en")) {
      setCurrentLang("en");
    } else if (pathname?.startsWith("/es")) {
      setCurrentLang("es");
    } else {
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      if (match && ["pt", "en", "es"].includes(match[1])) {
        setCurrentLang(match[1]);
      } else {
        setCurrentLang("pt");
      }
    }
  }, [pathname]);

  const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;

    // 1. Se estiver lendo um artigo em /post/[slug], /en/post/[slug] ou /es/post/[slug]
    const postMatch = pathname?.match(/\/(?:en\/|es\/)?post\/([^/]+)/);

    if (postMatch && postMatch[1]) {
      const currentSlug = postMatch[1];
      try {
        const res = await fetch(`/api/posts/translate?slug=${encodeURIComponent(currentSlug)}&targetLang=${newLang}`);
        const data = await res.json();

        if (data.targetSlug) {
          const targetPath = newLang === "en" 
            ? `/en/post/${data.targetSlug}` 
            : newLang === "es" 
              ? `/es/post/${data.targetSlug}` 
              : `/post/${data.targetSlug}`;
          
          router.push(targetPath);
          return;
        }
      } catch (err) {
        console.error("Erro ao buscar tradução da slug:", err);
      }
    }

    // 2. Se estiver na Home ou outras páginas de listagem
    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLang);
    router.push(url.pathname + url.search);
    router.refresh();
  };

  const baseLinks = [
    { label: "Home", path: "/" },
    { label: "Reviews", path: "/reviews" },
    { label: "Manutenção", path: "/manutencao" },
    { label: "Rotas", path: "/rotas" },
    { label: "Equipamentos", path: "/equipamentos" },
    { label: "Eventos", path: "/eventos" },
    { label: "Sobre", path: "/sobre" },
  ];

  const dynamicLinks = customPages.map(page => ({
    label: page.title,
    path: `/${page.slug}`
  }));

  const allLinks = [...baseLinks, ...dynamicLinks];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-[#0A0A0A] border-b border-border px-4 py-1.5 flex items-center justify-between z-50">
        <span className="text-[10px] sm:text-[11px] text-muted-foreground tracking-widest uppercase truncate whitespace-nowrap">
          Blog independente · experiência real na estrada
        </span>
        <div className="flex items-center gap-4">
          {/* SELETOR DROPDOWN DE IDIOMA NO HEADER (ÚNICO PONTO DE TROCA) */}
          <div className="flex items-center border-r border-border pr-3">
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-[#181818] border border-border text-white text-[11px] font-bold uppercase rounded px-2 py-0.5 outline-none cursor-pointer hover:border-primary transition-colors"
              aria-label="Selecionar Idioma"
            >
              <option value="pt">🇧🇷 PT</option>
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center">
            <SocialLinks iconSize={13} className="flex items-center gap-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#111111]/96 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="block w-1 h-8 bg-primary" aria-hidden="true" />
            <span style={TEKO} className="text-[26px] font-semibold tracking-wide leading-none text-foreground uppercase">
              MOTO <span className="text-primary">NA PRÁTICA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map(({ label, path }) => {
              const isActive = pathname === path || (path !== "/" && pathname?.startsWith(path));
              return (
                <Link
                  key={path}
                  href={path}
                  style={TEKO}
                  className={`px-3 py-1.5 text-[17px] font-medium uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Abrir busca">
              <Search size={16} />
            </button>
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu principal">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {searchOpen && (
          <div className="border-t border-border px-4 py-3 bg-[#111111]">
            <form onSubmit={handleSearchSubmit} className="max-w-[600px] mx-auto flex items-center gap-2 bg-secondary rounded-sm px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                placeholder="Buscar posts por palavra-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </form>
          </div>
        )}

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-card">
            {allLinks.map(({ label, path }) => {
              const isActive = pathname === path || (path !== "/" && pathname?.startsWith(path));
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMenuOpen(false)}
                  style={TEKO}
                  className={`flex w-full items-center justify-between px-5 py-3 text-[18px] font-medium uppercase tracking-wider border-b border-border transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  <ChevronRight size={14} />
                </Link>
              );
            })}
            <div className="p-5 flex justify-center border-t border-border">
              <SocialLinks iconSize={16} showLabels className="flex items-center justify-center gap-5 text-muted-foreground" />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
