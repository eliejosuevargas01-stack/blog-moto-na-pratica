import { prisma } from "../../lib/db";
import { CATEGORIES, TEKO, optimizeUnsplashUrl } from "../data";
import Link from "next/link";
import { ChevronRight, ArrowRight, Tag } from "lucide-react";

interface SidebarProps {
  postTags?: string[];
}

export default async function Sidebar({ postTags }: SidebarProps = {}) {
  let categoryCounts: Record<string, number> = {};
  let tagsList: string[] = [];

  if (postTags && postTags.length > 0) {
    tagsList = postTags;
  } else {
    try {
      const posts = await prisma.post.findMany({
        select: { tag: true, seoKeywords: true }
      });
      const uniqueTags = new Set<string>();
      posts.forEach(p => {
        if (p.tag) uniqueTags.add(p.tag);
        if (p.seoKeywords) {
          p.seoKeywords.split(",").forEach(k => {
            const trimmed = k.trim();
            if (trimmed) uniqueTags.add(trimmed);
          });
        }
      });
      if (uniqueTags.size === 0) {
        tagsList = ["Fazer250", "FZ25", "Yamaha", "Review", "Manutenção", "Naked", "Pilotagem", "Segurança", "Rota", "Pneu", "2026"];
      } else {
        tagsList = Array.from(uniqueTags);
      }
    } catch (e) {
      tagsList = ["Fazer250", "FZ25", "Yamaha", "Review", "Manutenção", "Naked", "Pilotagem", "Segurança", "Rota", "Pneu", "2026"];
    }
  }

  try {
    const grouped = await prisma.post.groupBy({
      by: ["tag"],
      _count: { id: true }
    });
    grouped.forEach(g => {
      categoryCounts[g.tag] = g._count.id;
    });
  } catch (error) {
    CATEGORIES.forEach(c => {
      categoryCounts[c.label] = c.count;
    });
  }

  const finalCategories = [
    { label: "Reviews", tag: "Review", path: "/reviews" },
    { label: "Manutenção", tag: "Manutenção", path: "/manutencao" },
    { label: "Rotas", tag: "Rotas", path: "/rotas" },
    { label: "Equipamentos", tag: "Equipamentos", path: "/equipamentos" }
  ].map(cat => ({
    ...cat,
    count: categoryCounts[cat.tag] || 0
  }));

  const SIDEBAR_IMG = optimizeUnsplashUrl("https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb", 300, 130);

  return (
    <aside className="space-y-10">
      {/* About Box */}
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
        <Link href="/sobre" className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-primary uppercase tracking-wider hover:gap-2 transition-all">
          Conhecer mais <ArrowRight size={12} />
        </Link>
      </div>

      {/* Dynamic Categories */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 bg-primary" />
          <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Categorias</h3>
        </div>
        <ul>
          {finalCategories.map((cat) => (
            <li key={cat.label}>
              <Link href={cat.path} className="group flex items-center justify-between w-full py-2.5 border-b border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-2">
                  <ChevronRight size={11} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                  {cat.label}
                </span>
                <span className="text-[11px] bg-secondary px-1.5 py-0.5">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 bg-primary" />
          <h3 style={TEKO} className="text-[20px] font-semibold uppercase tracking-wide">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagsList.map((tag) => (
            <Link key={tag} href={`/?search=${tag}`} className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide">
              <Tag size={9} />{tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
