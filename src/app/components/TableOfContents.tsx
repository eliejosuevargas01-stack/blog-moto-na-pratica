"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { TEKO, slugify } from "../data";

interface Heading {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

interface TableOfContentsProps {
  blocks: { text: string }[];
}

export default function TableOfContents({ blocks }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const extractedHeadings: Heading[] = [];
    const headingRegex = /<(h[23])\b[^>]*>(.*?)<\/\1>/gi;

    blocks.forEach((block) => {
      let match;
      while ((match = headingRegex.exec(block.text)) !== null) {
        const level = match[1].toLowerCase() === "h2" ? 2 : 3;
        const rawText = match[2];
        const cleanText = rawText.replace(/<[^>]*>/g, ""); // strip inner span or strong tags
        const id = slugify(cleanText);

        extractedHeadings.push({
          id,
          text: cleanText,
          level,
        });
      }
    });

    setHeadings(extractedHeadings);

    // Setup intersection observer to highlight active heading on scroll
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    extractedHeadings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      extractedHeadings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [blocks]);

  if (headings.length === 0) return null;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // offset header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveId(id);
    }
  };

  return (
    <div className="bg-[#141414] border border-primary/30 rounded-lg p-5 mb-10 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left outline-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 border border-primary/30 rounded text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <List size={18} />
          </div>
          <span style={TEKO} className="text-[22px] uppercase tracking-wider text-white font-semibold">
            Índice de Tópicos do Artigo
          </span>
          <span className="text-[11px] font-mono bg-[#222222] text-muted-foreground px-2 py-0.5 rounded-full border border-border">
            {headings.length} tópicos
          </span>
        </div>
        <div className="text-muted-foreground group-hover:text-white transition-colors p-1">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4 transition-all duration-300">
          {headings.map((h, idx) => {
            const isActive = activeId === h.id;
            const isH2 = h.level === 2;

            return (
              <li
                key={`${h.id}-${idx}`}
                style={{
                  paddingLeft: isH2 ? "0px" : "1.25rem",
                }}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => scrollToSection(e, h.id)}
                  className={`flex items-start gap-2 text-[14px] leading-relaxed transition-all duration-200 border-l-2 px-3 py-1.5 rounded-r-sm ${
                    isActive
                      ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                      : isH2
                      ? "border-white/10 text-white font-medium hover:text-white hover:bg-white/[0.06] hover:border-primary/50"
                      : "border-transparent text-[#CCCCCC] text-[13.5px] hover:text-white hover:bg-white/[0.04] hover:border-primary/40"
                  }`}
                >
                  <span className={`text-[11px] font-mono shrink-0 mt-0.5 ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {isH2 ? `•` : `└`}
                  </span>
                  <span>{h.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
