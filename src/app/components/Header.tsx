"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { TEKO, PORTAL_NAV_LINKS, INSTITUTIONAL_LINKS } from "../data";
import SocialLinks from "./SocialLinks";
import { getTranslation } from "../i18n/translations";

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

  const t = getTranslation(currentLang);

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

    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLang);
    router.push(url.pathname + url.search);
    router.refresh();
  };

  const isInstitutionalActive = 
    pathname?.startsWith("/sobre") ||
    pathname?.startsWith("/politica") ||
    pathname?.startsWith("/equipe") ||
    pathname?.startsWith("/contato") ||
    pathname?.startsWith("/anuncie") ||
    pathname?.startsWith("/termos");

  const dynamicLinks = customPages.filter(p => 
    !INSTITUTIONAL_LINKS.some(inst => inst.path === `/${p.slug}`) &&
    !PORTAL_NAV_LINKS.some(port => port.path === `/${p.slug}`)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}&lang=${currentLang}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] px-4 py-1.5 flex items-center justify-between z-50">
        <span className="text-[10px] sm:text-[11px] text-[#4B5563] tracking-widest uppercase truncate whitespace-nowrap">
          {t.topBar}
        </span>
        <div className="flex items-center gap-4">
          {/* SELETOR DROPDOWN DE IDIOMA NO HEADER */}
          <div className="flex items-center border-r border-[#E5E7EB] pr-3">
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-white border border-[#E5E7EB] text-[#111827] text-[11px] font-bold uppercase rounded px-2 py-0.5 outline-none cursor-pointer hover:border-primary transition-colors"
              aria-label="Selecionar Idioma"
            >
              <option value="pt">🇧🇷 PT</option>
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center">
            <SocialLinks iconSize={13} className="flex items-center gap-3.5 text-[#4B5563]" />
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="block w-1 h-8 bg-primary" aria-hidden="true" />
            <span style={TEKO} className="text-[26px] font-semibold tracking-wide leading-none text-[#111827] uppercase">
              MOTO <span className="text-primary">NA PRÁTICA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {PORTAL_NAV_LINKS.map(({ label, path }) => {
              const isHome = path === "/";
              const isActive = isHome ? pathname === "/" : pathname === path || (path !== "/" && pathname?.startsWith(path.split("?")[0]));
              return (
                <Link
                  key={path}
                  href={path}
                  style={TEKO}
                  className={`px-2.5 py-1.5 text-[16px] xl:text-[17px] font-medium uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary font-semibold" : "text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Submenu Institucional Desktop */}
            <div className="relative group">
              <Link
                href="/sobre"
                style={TEKO}
                className={`px-2.5 py-1.5 text-[16px] xl:text-[17px] font-medium uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  isInstitutionalActive ? "text-primary font-semibold" : "text-[#4B5563] hover:text-[#111827]"
                }`}
              >
                Institucional
                <ChevronDown size={12} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                <div className="bg-white border border-[#E5E7EB] shadow-lg rounded-sm py-2 min-w-[210px]">
                  {INSTITUTIONAL_LINKS.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="block px-4 py-2 text-[13px] text-[#4B5563] hover:text-primary hover:bg-[#F9FAFB] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Páginas Extras Dinâmicas */}
            {dynamicLinks.map(page => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                style={TEKO}
                className={`px-2.5 py-1.5 text-[16px] xl:text-[17px] font-medium uppercase tracking-wider transition-colors ${
                  pathname === `/${page.slug}` ? "text-primary font-semibold" : "text-[#4B5563] hover:text-[#111827]"
                }`}
              >
                {page.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#4B5563] hover:text-[#111827] transition-colors"
              aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              aria-expanded={searchOpen}
            >
              <Search size={16} />
            </button>
            <button
              className="lg:hidden p-2 text-[#4B5563] hover:text-[#111827] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu principal"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {searchOpen && (
          <div className="border-t border-[#E5E7EB] px-4 py-3 bg-white/98">
            <form onSubmit={handleSearchSubmit} className="max-w-[600px] mx-auto flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-sm px-3 py-2">
              <Search size={14} className="text-[#9CA3AF] shrink-0" />
              <input
                autoFocus
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
              />
            </form>
          </div>
        )}

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-[#E5E7EB] bg-white max-h-[calc(100vh-56px)] overflow-y-auto">
            {/* Editorias */}
            <div className="px-5 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Editorias do Portal</span>
            </div>
            {PORTAL_NAV_LINKS.map(({ label, path }) => {
              const isHome = path === "/";
              const isActive = isHome ? pathname === "/" : pathname === path || (path !== "/" && pathname?.startsWith(path.split("?")[0]));
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMenuOpen(false)}
                  style={TEKO}
                  className={`flex w-full items-center justify-between px-5 py-3 text-[18px] font-medium uppercase tracking-wider border-b border-[#E5E7EB] transition-colors ${
                    isActive ? "text-primary font-semibold" : "text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {label}
                  <ChevronRight size={14} />
                </Link>
              );
            })}

            {/* Institucional Mobile */}
            <div className="px-5 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Institucional & E-E-A-T</span>
            </div>
            {INSTITUTIONAL_LINKS.map(({ label, path }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex w-full items-center justify-between px-5 py-2.5 text-[14px] font-medium border-b border-[#E5E7EB] transition-colors ${
                    isActive ? "text-primary font-bold bg-[#F3F4F6]" : "text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {label}
                  <ChevronRight size={13} className="text-primary shrink-0" />
                </Link>
              );
            })}

            {/* Páginas Extras Dinâmicas */}
            {dynamicLinks.length > 0 && (
              <>
                <div className="px-5 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Outras Páginas</span>
                </div>
                {dynamicLinks.map(page => (
                  <Link
                    key={page.slug}
                    href={`/${page.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-between px-5 py-2.5 text-[14px] text-[#4B5563] hover:text-[#111827] border-b border-[#E5E7EB]"
                  >
                    {page.title}
                    <ChevronRight size={13} className="text-primary shrink-0" />
                  </Link>
                ))}
              </>
            )}

            <div className="p-5 flex justify-center border-t border-[#E5E7EB] bg-card">
              <SocialLinks iconSize={16} showLabels className="flex items-center justify-center gap-5 text-[#4B5563]" />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
