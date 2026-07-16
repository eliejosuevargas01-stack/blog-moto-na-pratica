"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronRight, Instagram, Youtube, Facebook } from "lucide-react";
import { TEKO } from "../data";

interface HeaderProps {
  customPages: { title: string; slug: string }[];
}

export default function Header({ customPages }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const baseLinks = [
    { label: "Home", path: "/" },
    { label: "Reviews", path: "/reviews" },
    { label: "Manutenção", path: "/manutencao" },
    { label: "Rotas", path: "/rotas" },
    { label: "Equipamentos", path: "/equipamentos" },
    { label: "Sobre", path: "/sobre" },
  ];

  // Adicionar as páginas dinâmicas customizadas criadas pelo usuário
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
                placeholder="Buscar posts..."
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
          </nav>
        )}
      </header>
    </>
  );
}
