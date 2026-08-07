import { prisma } from "../../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeImageUrl, slugify } from "../../data";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Clock, ChevronLeft, Tag, Eye, Globe } from "lucide-react";
import TableOfContents from "../../components/TableOfContents";
import CommentsSection from "../../components/CommentsSection";
import SafeHtml from "../../components/SafeHtml";
import PostActionsBar from "../../components/PostActionsBar";
import PostViewTracker from "../../components/PostViewTracker";
import AudioNarrationPlayer from "../../components/AudioNarrationPlayer";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

function extractListOrContent(htmlSnippet: string): string {
  if (!htmlSnippet) return "";
  const listMatch = htmlSnippet.match(/<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>/i);
  if (listMatch) {
    return listMatch[0];
  }
  const pMatches = htmlSnippet.match(/<p[\s\S]*?<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    const items = pMatches
      .map(p => p.replace(/<\/?p[^>]*>/g, '').trim())
      .filter(t => t.length > 0 && !/pontos\s+(fortes|fracos)|prós|contras|👍|👎|✅|❌/i.test(t))
      .map(t => `<li>${t.replace(/^[•\-\*\s]+/, '')}</li>`);
    if (items.length > 0) {
      return `<ul>${items.join('')}</ul>`;
    }
  return "";
}

function normalizeProsConsHtml(html: string): string {
  if (!html) return "";

  let cleanInput = html
    .replace(/^<ul[^>]*>\s*<li[^>]*>/i, '')
    .replace(/<\/li>\s*<\/ul>$/i, '');

  const hasProsKeyword = /(?:pontos\s+fortes|prós|pros|👍|✅)/i.test(cleanInput);
  const hasConsKeyword = /(?:pontos\s+fracos|contras|desvantagens|cons|👎|❌)/i.test(cleanInput);

  if (!hasProsKeyword && !hasConsKeyword && !cleanInput.includes('box-pros-cons') && !cleanInput.includes('pros-contras')) {
    return cleanInput;
  }

  if (cleanInput.includes('box-pros') && cleanInput.includes('box-cons')) {
    cleanInput = cleanInput.replace(/<li[^>]*>\s*(<div\b[^>]*class=["'][^"']*box-pros-cons[\s\S]*?<\/div>)\s*<\/li>/gi, '$1');
    return cleanInput;
  }

  // 1. CASO ESPECIAL: O HTML possui uma lista de <li> onde alguns são Prós e outros são Contras
  const allLiMatches = Array.from(cleanInput.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi));
  if (allLiMatches.length > 0) {
    const prosLis: string[] = [];
    const consLis: string[] = [];
    let currentMode: 'pros' | 'cons' = 'pros';
    let foundExplicitLabels = false;

    for (const match of allLiMatches) {
      const fullLi = match[0];
      const liInner = match[1];
      const cleanText = liInner.replace(/<[^>]*>/g, '').trim();

      const isConsLi = /^(?:contras?|pontos\s+fracos|desvantagens|cons|👎|❌)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:contras?|pontos\s+fracos|desvantagens|cons|👎|❌)\s*:?\s*<\/strong>/i.test(liInner);
      
      const isProsLi = /^(?:prós|pros|pontos\s+fortes|vantagens|👍|✅)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:prós|pros|pontos\s+fortes|vantagens|👍|✅)\s*:?\s*<\/strong>/i.test(liInner);

      if (isConsLi) {
        foundExplicitLabels = true;
        currentMode = 'cons';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:contras?|pontos\s+fracos|desvantagens|cons|👎|❌)\s*:?\s*(?:<\/strong>)?\s*/i, '');
        consLis.push(`<li>${cleanedLi}</li>`);
      } else if (isProsLi) {
        foundExplicitLabels = true;
        currentMode = 'pros';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:prós|pros|pontos\s+fortes|vantagens|👍|✅)\s*:?\s*(?:<\/strong>)?\s*/i, '');
        prosLis.push(`<li>${cleanedLi}</li>`);
      } else {
        if (currentMode === 'cons') {
          consLis.push(fullLi);
        } else {
          prosLis.push(fullLi);
        }
      }
    }

    if (foundExplicitLabels && prosLis.length > 0 && consLis.length > 0) {
      const prosBox = `<div class="box-pros"><h4>👍 Pontos Fortes</h4><ul>${prosLis.join('')}</ul></div>`;
      const consBox = `<div class="box-cons"><h4>👎 Pontos Fracos</h4><ul>${consLis.join('')}</ul></div>`;
      const prefixMatch = cleanInput.split(/<(h[1-6]|p|ul|ol)\b/i);
      const prefix = prefixMatch && prefixMatch[0] ? prefixMatch[0] : "";
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  // 2. CASO GERAL: Seções com Títulos H2/H3 separados (ex: MT-09 com H3 "Pontos Fortes" e H3 "Pontos Fracos")
  const prosTagRegex = /<(h[1-6]|p|div|strong)\b[^>]*>[\s\S]*?(?:pontos\s+fortes|prós|pros|👍|✅)[\s\S]*?<\/\1>/gi;
  const consTagRegex = /<(h[1-6]|p|div|strong)\b[^>]*>[\s\S]*?(?:pontos\s+fracos|contras|desvantagens|👎|❌)[\s\S]*?<\/\1>/gi;

  const prosMatch = prosTagRegex.exec(cleanInput);
  const consMatch = consTagRegex.exec(cleanInput);

  if (prosMatch && consMatch) {
    const prosStart = prosMatch.index;
    const consStart = consMatch.index;

    let prefix = "";
    let prosSection = "";
    let consSection = "";

    if (prosStart < consStart) {
      prefix = cleanInput.substring(0, prosStart);
      prosSection = cleanInput.substring(prosStart + prosMatch[0].length, consStart);
      consSection = cleanInput.substring(consStart + consMatch[0].length);
    } else {
      prefix = cleanInput.substring(0, consStart);
      consSection = cleanInput.substring(consStart + consMatch[0].length, prosStart);
      prosSection = cleanInput.substring(prosStart + prosMatch[0].length);
    }

    const prosList = extractListOrContent(prosSection);
    const consList = extractListOrContent(consSection);

    if (prosList || consList) {
      const prosBox = prosList ? `<div class="box-pros"><h4>👍 Pontos Fortes</h4>${prosList}</div>` : "";
      const consBox = consList ? `<div class="box-cons"><h4>👎 Pontos Fracos</h4>${consList}</div>` : "";
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  return cleanInput;
}

function cleanBlockHtml(html: string): string {
  if (!html) return "";
  let cleaned = html
    .replace(/\\n/g, "")
    .replace(/<p>\s*(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+\s*<\/p>/gi, "")
    .replace(/(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+/gi, "")
    .replace(/\{[^}]*\}=\d+\{[^}]*\}/gi, "")
    .trim();

  if (cleaned.includes("<table") && !cleaned.includes('class="table-wrapper"')) {
    cleaned = cleaned.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, '<div class="table-wrapper"><table$1>$2</table></div>');
  }

  return normalizeProsConsHtml(cleaned);
}

function injectHeadingIds(html: string): string {
  if (!html) return "";
  return html.replace(/<(h[23])\b([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    if (attrs.includes('id=')) return match;
    const cleanText = content.replace(/<[^>]*>/g, "");
    const id = slugify(cleanText);
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}

import { findPostBySlugOrId, generatePostMetadata } from "@/lib/post-helpers";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(props: PostPageProps) {
  return generatePostMetadata(props.params.slug, "pt");
}

export default async function PostPage(props: PostPageProps, langOverride?: string) {
  const { slug } = props.params;
  const lang = langOverride || "pt";
  let post: any = null;
  let related: any[] = [];
  let translations: any[] = [];

  try {
    post = await findPostBySlugOrId(slug, lang);
  } catch (error) {
    console.warn("Post query failed, falling back to static POSTS.", error);
    post = POSTS.find(p => p.slug === slug || String(p.id) === slug);
  }

  if (!post) {
    return notFound();
  }

  const currentLang = post.lang || "pt";
  const expectedPrefix = currentLang === "en" ? "/en/post" : currentLang === "es" ? "/es/post" : "/post";
  const expectedPath = `${expectedPrefix}/${post.slug}`;

  if (slug !== post.slug) {
    redirect(expectedPath);
  }

  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  if (post.translationGroupId) {
    try {
      translations = await prisma.post.findMany({
        where: { translationGroupId: post.translationGroupId },
        select: { lang: true, slug: true, title: true }
      });
    } catch (e) {
      translations = [];
    }
  }

  try {
    related = await prisma.post.findMany({
      where: {
        AND: [
          langFilter,
          { id: { not: post.id } },
          { tag: post.tag }
        ]
      },
      take: 2,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    related = POSTS.filter(p => p.slug !== post.slug && p.tag === post.tag).slice(0, 2);
  }

  if (related.length === 0) {
    try {
      related = await prisma.post.findMany({
        where: {
          AND: [
            langFilter,
            { id: { not: post.id } }
          ]
        },
        take: 2,
        orderBy: { createdAt: "desc" }
      });
    } catch (error) {
      related = POSTS.filter(p => p.slug !== post.slug).slice(0, 2);
    }
  }

  let blocks: any[] = [];
  if (Array.isArray(post.blocks)) {
    blocks = post.blocks;
  } else if (typeof post.blocks === "string") {
    try {
      blocks = JSON.parse(post.blocks);
    } catch (e) {
      blocks = [];
    }
  } else {
    const paragraphs = (post.content ?? "").split("\n\n").filter(Boolean);
    const htmlParagraphs = paragraphs.map((p: string) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return `<h2>${p.replace(/\*\*/g, "")}</h2>`;
      }
      return `<p>${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    });

    const size = Math.ceil(htmlParagraphs.length / 3);
    for (let i = 0; i < 3; i++) {
      blocks.push({
        text: htmlParagraphs.slice(i * size, (i + 1) * size).join("\n"),
        image: "",
        focalPoint: "center"
      });
    }
  }

  const dynamicPostTags: string[] = [post.tag];
  if (post.seoKeywords) {
    post.seoKeywords.split(",").forEach((k: string) => {
      const trimmed = k.trim();
      if (trimmed && !dynamicPostTags.includes(trimmed)) {
        dynamicPostTags.push(trimmed);
      }
    });
  }

  const createdDate = post.createdAt ? new Date(post.createdAt) : (post.date ? new Date(post.date) : new Date());
  const updatedDate = post.updatedAt ? new Date(post.updatedAt) : null;
  const isUpdated = updatedDate && (updatedDate.getTime() - createdDate.getTime() > 24 * 60 * 60 * 1000);

  const dateLocale = currentLang === "en" ? "en-US" : currentLang === "es" ? "es-ES" : "pt-BR";
  const formattedCreated = createdDate.toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" });
  const formattedUpdated = updatedDate ? updatedDate.toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" }) : "";

  const recommendedSectionTitle = currentLang === "en" ? "Recommended Posts" : currentLang === "es" ? "Artículos Recomendados" : "Posts recomendados";
  const backHomeText = currentLang === "en" ? "Back to Home" : currentLang === "es" ? "Volver a Inicio" : "Volver para Home";
  const readTimeSuffix = currentLang === "en" ? "read time" : currentLang === "es" ? "de lectura" : "de leitura";
  const viewsSuffix = currentLang === "en" ? "views" : currentLang === "es" ? "visitas" : "visualizações";
  const updatedPrefix = currentLang === "en" ? "Updated on" : currentLang === "es" ? "Actualizado el" : "Atualizado em";

  return (
    <div>
      <PostViewTracker postId={post.id} />

      {/* POST HERO */}
      <div id="img-1" className="relative w-full overflow-hidden scroll-mt-10" style={{ height: "60vh", minHeight: "360px" }}>
        <Image 
          src={optimizeImageUrl(post.img, 1200)} 
          alt={stripHtml(post.title)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: post.imgFocalPoint || "center" }}
          unoptimized={post.img.includes("/uploads/")}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.90) 0%, rgba(0,0,0,.40) 55%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-6 pb-10 max-w-[1200px] mx-auto z-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-white uppercase tracking-wider mb-5 transition-colors w-fit"
          >
            <ChevronLeft size={14} /> {backHomeText}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[post.tag] ?? "bg-secondary text-muted-foreground"}`}>
              {post.tag}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Clock size={11} /> {post.readTime} {readTimeSuffix}</span>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Eye size={11} /> {post.views || 0} {viewsSuffix}</span>
            <span className="text-[12px] text-muted-foreground">{formattedCreated}</span>
            {isUpdated && (
              <span className="text-[11px] text-primary/80 italic">
                ({updatedPrefix} {formattedUpdated})
              </span>
            )}
          </div>
          <h1 
            style={TEKO} 
            className="text-[48px] md:text-[64px] font-semibold leading-none uppercase tracking-wide text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14">
        <div className="min-w-0">
          {/* Excerpt */}
          <p className="text-[17px] text-[#BBBBBB] leading-relaxed border-l-2 border-primary pl-5 mb-10" style={BODY}>
            {post.excerpt}
          </p>

          {/* Player de Áudio de Narração do Post com Âncora #audio */}
          <div id="audio" className="scroll-mt-24">
            <AudioNarrationPlayer audioUrl={post.audioUrl} title={stripHtml(post.title)} lang={currentLang} />
          </div>

          {/* Bar de Curtir e Compartilhar */}
          <PostActionsBar postId={post.id} postTitle={stripHtml(post.title)} initialLikes={post.likes || 0} />

          {/* Índice de Tópicos do Artigo (Table of Contents) */}
          <TableOfContents blocks={blocks} />

          {/* Article body with Dynamic HTML Blocks */}
          <div className="space-y-8" style={BODY}>
            {blocks.map((block: any, i: number) => {
              const cleanedText = cleanBlockHtml(injectHeadingIds(block.text || ""));
              const hasImageInText = cleanedText.includes("<img");
              const isImageAlreadyInText = block.image && cleanedText.includes(block.image);
              const blockImgId = `img-${i + 2}`;

              return (
                <div key={i} id={`block-${i + 1}`} className="flex flex-col gap-6 scroll-mt-24">
                  <div 
                    className="prose prose-invert max-w-none text-muted-foreground text-[15px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80 [&_a]:transition-colors"
                    dangerouslySetInnerHTML={{ __html: cleanedText }}
                  />
                  
                  {block.image && !hasImageInText && !isImageAlreadyInText && (
                    <div id={blockImgId} className="relative overflow-hidden w-full h-[360px] border border-border rounded-sm scroll-mt-24">
                      <img
                        src={optimizeImageUrl(block.image, 800)}
                        alt={`Ilustração do bloco ${i + 1}`}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: block.focalPoint || "center" }}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Post Tags */}
          <div className="mt-10 pt-8 border-t border-border flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-muted-foreground uppercase tracking-wider">Tags:</span>
            {dynamicPostTags.map((tag) => (
              <Link 
                key={tag} 
                href={`/tag/${encodeURIComponent(tag)}`}
                className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide"
              >
                <Tag size={9} />{tag}
              </Link>
            ))}
          </div>

          {/* Related posts (filtrados pelo idioma ativo) */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1 h-6 bg-primary" />
                <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide">{recommendedSectionTitle}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => {
                  const pUrl = p.lang === "en" ? `/en/post/${p.slug}` : p.lang === "es" ? `/es/post/${p.slug}` : `/post/${p.slug}`;
                  return (
                    <article key={p.id} className="group bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <Link href={pUrl} className="block">
                        <div className="relative overflow-hidden" style={{ height: "160px" }}>
                          <img 
                            src={optimizeImageUrl(p.img, 450, 260)} 
                            alt={stripHtml(p.title)} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            style={{ objectPosition: p.imgFocalPoint || "center" }}
                            loading="lazy"
                          />
                          <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[p.tag] || "bg-[#252525] text-white"}`}>
                            {p.tag}
                          </span>
                        </div>
                        <div className="p-4">
                          <SafeHtml
                            html={p.title}
                            tag="h4"
                            className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors"
                          />
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {p.readTime}
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seção de Comentários */}
          <CommentsSection postId={post.id} />
        </div>

        {/* SIDEBAR */}
        <Sidebar postTags={dynamicPostTags} />
      </div>
    </div>
  );
}
