import { prisma } from "../../../lib/db";
import { TAG_COLORS, TEKO, BODY, optimizeImageUrl, slugify } from "../../data";
import Sidebar from "../../components/Sidebar";
import EditorialTrustLinks from "../../components/EditorialTrustLinks";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Clock, ChevronLeft, Tag, Eye, ShieldCheck } from "lucide-react";
import TableOfContents from "../../components/TableOfContents";
import CommentsSection from "../../components/CommentsSection";
import SafeHtml, { SAFE_DOMPURIFY_CONFIG } from "../../components/SafeHtml";
import DOMPurify from "isomorphic-dompurify";
import PostActionsBar from "../../components/PostActionsBar";
import PostViewTracker from "../../components/PostViewTracker";
import AudioNarrationPlayer from "../../components/AudioNarrationPlayer";
import { findPostBySlugOrId, generatePostMetadata } from "@/lib/post-helpers";
import {
  buildArticleViewModel,
  buildArticleStructuredData,
} from "@/lib/editorial-contract";
import AuthorByline from "../../components/AuthorByline";
import FreshnessMeta from "../../components/FreshnessMeta";
import ArticleSources from "../../components/ArticleSources";
import ArticleDisclosure from "../../components/ArticleDisclosure";
import CorrectionNotice from "../../components/CorrectionNotice";

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
      .map((p) => p.replace(/<\/?p[^>]*>/g, "").trim())
      .filter((t) => t.length > 0 && !/pontos\s+(fortes|fracos)|prós|contras|👍|👎|✅|❌/i.test(t))
      .map((t) => `<li>${t.replace(/^[•\-\*\s]+/, "")}</li>`);
    if (items.length > 0) {
      return `<ul>${items.join("")}</ul>`;
    }
  }
  return "";
}

function normalizeProsConsHtml(html: string): string {
  if (!html) return "";

  if (html.includes('class="box-pros-cons"') || html.includes('class="pros-contras-box"')) {
    return html;
  }

  let cleanInput = html
    .replace(/^<ul[^>]*>\s*<li[^>]*>/i, "")
    .replace(/<\/li>\s*<\/ul>$/i, "");

  const hasProsKeyword = /(?:pontos\s+fortes|prós|pros|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)/i.test(cleanInput);
  const hasConsKeyword = /(?:pontos\s+fracos|contras|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)/i.test(cleanInput);

  if (!hasProsKeyword && !hasConsKeyword) {
    return cleanInput;
  }

  if (cleanInput.includes("box-pros") && cleanInput.includes("box-cons")) {
    cleanInput = cleanInput.replace(/<li[^>]*>\s*(<div\b[^>]*class=["'][^"']*box-pros-cons[\s\S]*?<\/div>)\s*<\/li>/gi, "$1");
    return cleanInput;
  }

  const allLiMatches = Array.from(cleanInput.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi));
  if (allLiMatches.length > 0) {
    const prosLis: string[] = [];
    const consLis: string[] = [];
    let currentMode: "pros" | "cons" = "pros";
    let foundExplicitLabels = false;

    for (const match of allLiMatches) {
      const fullLi = match[0];
      const liInner = match[1];
      const cleanText = liInner.replace(/<[^>]*>/g, "").trim();

      const isConsLi =
        /^(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?/i.test(cleanText) ||
        /<strong>\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*<\/strong>/i.test(liInner);

      const isProsLi =
        /^(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?/i.test(cleanText) ||
        /<strong>\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*<\/strong>/i.test(liInner);

      if (isConsLi) {
        foundExplicitLabels = true;
        currentMode = "cons";
        const cleanedLi = liInner.replace(/^(?:<strong>)?\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*(?:<\/strong>)?\s*/i, "");
        consLis.push(`<li>${cleanedLi}</li>`);
      } else if (isProsLi) {
        foundExplicitLabels = true;
        currentMode = "pros";
        const cleanedLi = liInner.replace(/^(?:<strong>)?\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*(?:<\/strong>)?\s*/i, "");
        prosLis.push(`<li>${cleanedLi}</li>`);
      } else {
        if (currentMode === "cons") {
          consLis.push(fullLi);
        } else {
          prosLis.push(fullLi);
        }
      }
    }

    if (foundExplicitLabels && prosLis.length > 0 && consLis.length > 0) {
      const prosBox = `<div class="box-pros"><h4>👍 Pontos Fortes</h4><ul>${prosLis.join("")}</ul></div>`;
      const consBox = `<div class="box-cons"><h4>👎 Pontos Fracos</h4><ul>${consLis.join("")}</ul></div>`;
      const prefixMatch = cleanInput.split(/<(h[1-6]|p|ul|ol)\b/i);
      const prefix = prefixMatch && prefixMatch[0] ? prefixMatch[0] : "";
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  const prosHeaderRegex = /<(h[2-4])\b[^>]*>\s*(?:pontos\s+fortes|prós|pros|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*<\/\1>/gi;
  const consHeaderRegex = /<(h[2-4])\b[^>]*>\s*(?:pontos\s+fracos|contras|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*<\/\1>/gi;

  const prosMatch = prosHeaderRegex.exec(cleanInput);
  const consMatch = consHeaderRegex.exec(cleanInput);

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

    if (prosList && consList) {
      const prosBox = `<div class="box-pros"><h4>👍 Pontos Fortes</h4>${prosList}</div>`;
      const consBox = `<div class="box-cons"><h4>👎 Pontos Fracos</h4>${consList}</div>`;
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  return cleanInput;
}

function cleanBlockHtml(html: string): string {
  if (!html) return "";
  let cleaned = html
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .replace(/>\s*\r?\n\s*</g, "><")
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
    if (attrs.includes("id=")) return match;
    const cleanText = content.replace(/<[^>]*>/g, "");
    const id = slugify(cleanText);
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}

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
  let rawPost: any = null;
  let related: any[] = [];

  try {
    rawPost = await findPostBySlugOrId(slug, lang);
  } catch (error) {
    console.warn("Post query failed", error);
    rawPost = null;
  }

  if (!rawPost) {
    return notFound();
  }

  const viewModel = buildArticleViewModel(rawPost);

  const currentLang = viewModel.lang || "pt";
  const expectedPrefix = currentLang === "en" ? "/en/post" : currentLang === "es" ? "/es/post" : "/post";
  const expectedPath = `${expectedPrefix}/${viewModel.slug}`;

  if (slug !== viewModel.slug) {
    redirect(expectedPath);
  }

  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  try {
    related = await prisma.post.findMany({
      where: {
        AND: [
          langFilter,
          { id: { not: viewModel.id } },
          { tag: viewModel.tag },
        ],
      },
      take: 2,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    related = [];
  }

  if (related.length === 0) {
    try {
      related = await prisma.post.findMany({
        where: {
          AND: [
            langFilter,
            { id: { not: viewModel.id } },
          ],
        },
        take: 2,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      related = [];
    }
  }

  let blocks: any[] = viewModel.blocks;
  if (!blocks || blocks.length === 0) {
    const paragraphs = (viewModel.content ?? "").split("\n\n").filter(Boolean);
    const htmlParagraphs = paragraphs.map((p: string) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return `<h2>${p.replace(/\*\*/g, "")}</h2>`;
      }
      return `<p>${p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
    });

    const size = Math.ceil(htmlParagraphs.length / 3) || 1;
    blocks = [];
    for (let i = 0; i < 3; i++) {
      const slice = htmlParagraphs.slice(i * size, (i + 1) * size).join("\n");
      if (slice) {
        blocks.push({
          text: slice,
          image: "",
          focalPoint: "center",
        });
      }
    }
  }

  const dynamicPostTags: string[] = [viewModel.tag];
  if (viewModel.seoKeywords) {
    viewModel.seoKeywords.split(",").forEach((k: string) => {
      const trimmed = k.trim();
      if (trimmed && !dynamicPostTags.includes(trimmed)) {
        dynamicPostTags.push(trimmed);
      }
    });
  }

  const recommendedSectionTitle = currentLang === "en" ? "Recommended Posts" : currentLang === "es" ? "Artículos Recomendados" : "Posts recomendados";
  const backHomeText = currentLang === "en" ? "Back to Home" : currentLang === "es" ? "Volver a Inicio" : "Volver para Home";
  const readTimeSuffix = currentLang === "en" ? "read time" : currentLang === "es" ? "de leitura" : "de leitura";
  const viewsSuffix = currentLang === "en" ? "views" : currentLang === "es" ? "visitas" : "visualizações";

  const structuredData = buildArticleStructuredData(viewModel);

  return (
    <div>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PostViewTracker postId={viewModel.id} />

      {/* POST HERO */}
      <div id="img-1" className="relative w-full overflow-hidden scroll-mt-10" style={{ height: "60vh", minHeight: "360px" }}>
        <Image 
          src={optimizeImageUrl(viewModel.img, 1200)}
          alt={stripHtml(viewModel.title)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: viewModel.imgFocalPoint || "center" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.90) 0%, rgba(0,0,0,.40) 55%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-6 pb-10 max-w-[1200px] mx-auto z-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-white/80 hover:text-white uppercase tracking-wider mb-5 transition-colors w-fit"
          >
            <ChevronLeft size={14} /> {backHomeText}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[viewModel.tag] ?? "bg-white/20 text-white"}`}>
              {viewModel.tag}
            </span>
            {viewModel.meta.personalExperienceVerified && (
              <span className="flex items-center gap-1 bg-emerald-600/90 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                <ShieldCheck size={13} /> Experiência Real Verificada
              </span>
            )}
            <span className="flex items-center gap-1 text-[12px] text-white/80"><Clock size={11} /> {viewModel.readTime} {readTimeSuffix}</span>
            <span className="flex items-center gap-1 text-[12px] text-white/80"><Eye size={11} /> {viewModel.views || 0} {viewsSuffix}</span>
            <FreshnessMeta
              publishedAt={viewModel.meta.publishedAt}
              modifiedAt={viewModel.meta.modifiedAt}
              lang={currentLang}
            />
            <AuthorByline author={viewModel.meta.author} />
          </div>
          <SafeHtml 
            tag="h1"
            style={TEKO} 
            className="text-[48px] md:text-[64px] font-semibold leading-none uppercase tracking-wide text-white"
            html={viewModel.title}
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-14">
        <div className="min-w-0 max-w-[70ch] mx-auto w-full">
          {/* Excerpt */}
          <p className="text-[17px] md:text-[18px] text-[#374151] leading-relaxed border-l-4 border-primary pl-5 mb-8 font-normal" style={BODY}>
            {viewModel.excerpt}
          </p>

          {/* Disclosure e Correção */}
          <ArticleDisclosure disclosure={viewModel.meta.disclosure} />
          <CorrectionNotice correction={viewModel.meta.correction} />

          {/* Player de Áudio de Narração do Post com Âncora #audio */}
          <div id="audio" className="scroll-mt-24 mb-6">
            <AudioNarrationPlayer audioUrl={viewModel.audioUrl} title={stripHtml(viewModel.title)} lang={currentLang} />
          </div>

          {/* Bar de Curtir e Compartilhar */}
          <div className="mb-8">
            <PostActionsBar postId={viewModel.id} postTitle={stripHtml(viewModel.title)} initialLikes={viewModel.likes || 0} />
          </div>

          {/* Índice de Tópicos do Artigo (Table of Contents) */}
          <TableOfContents blocks={blocks} />

          {/* Article body with Dynamic HTML Blocks */}
          <div className="space-y-8" style={BODY}>
            {(() => {
              let mediaBlockCount = 0;
              const MAX_MEDIA_BLOCKS = 2;

              return blocks.map((block: any, i: number) => {
                const cleanedText = cleanBlockHtml(injectHeadingIds(block.text || ""));
                const sanitizedBlockText = DOMPurify.sanitize(cleanedText, SAFE_DOMPURIFY_CONFIG);
                const hasImageInText = cleanedText.includes("<img");
                const isImageAlreadyInText = block.image && cleanedText.includes(block.image);
                const shouldRenderImage = Boolean(block.image && !hasImageInText && !isImageAlreadyInText && mediaBlockCount < MAX_MEDIA_BLOCKS);

                if (shouldRenderImage) {
                  mediaBlockCount++;
                }

                const blockImgId = `img-${i + 2}`;

                return (
                  <div key={i} id={`block-${i + 1}`} className="flex flex-col gap-6 scroll-mt-24">
                    <div 
                      className="prose max-w-none text-foreground text-[16px] md:text-[17.5px] leading-relaxed [&_a]:text-accent [&_a]:underline [&_a:hover]:text-accent/80 [&_a]:transition-colors"
                      dangerouslySetInnerHTML={{ __html: sanitizedBlockText }}
                    />
                    
                    {shouldRenderImage && (
                      <figure id={blockImgId} className="w-full my-6 scroll-mt-24">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted shadow-xs">
                          <img
                            src={optimizeImageUrl(block.image, 960)}
                            alt={block.caption || `Ilustração do artigo - parte ${mediaBlockCount}`}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: block.focalPoint || "center" }}
                            loading="lazy"
                          />
                        </div>
                        {block.caption ? (
                          <figcaption className="text-xs text-muted-foreground text-center mt-2.5 italic">
                            {block.caption}
                          </figcaption>
                        ) : (
                          <figcaption className="text-xs text-muted-foreground text-center mt-2.5 italic">
                            Registro fotográfico e detalhes: {stripHtml(viewModel.title)}
                          </figcaption>
                        )}
                      </figure>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Fontes Estruturadas do Artigo */}
          <ArticleSources sources={viewModel.meta.sources} />

          {/* Editorial Process Integration */}
          <div className="mt-8">
            <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Sobre nosso processo editorial</p>
            <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">Este conteúdo segue a Política Editorial do Moto na Prática.</p>
            <EditorialTrustLinks />
          </div>

          {/* Dynamic Post Tags */}
          <div className="mt-10 pt-8 border-t border-border flex items-center gap-2.5 flex-wrap">
            <span className="text-[12px] font-bold text-foreground uppercase tracking-wider mr-1">Tags:</span>
            {dynamicPostTags.map((tag) => (
              <Link 
                key={tag} 
                href={`/tag/${encodeURIComponent(tag)}`}
                className="flex items-center gap-1.5 px-3 py-1 bg-muted border border-border rounded-md text-[12px] font-medium text-foreground hover:text-primary hover:border-primary/50 transition-colors uppercase tracking-wide"
              >
                <Tag size={10} className="text-muted-foreground" />{tag}
              </Link>
            ))}
          </div>

          {/* Related posts (filtrados pelo idioma ativo) */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-1.5 h-6 bg-primary rounded-full" />
                <h3 style={TEKO} className="text-[24px] font-bold uppercase tracking-wide text-foreground">{recommendedSectionTitle}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => {
                  const pUrl = p.lang === "en" ? `/en/post/${p.slug}` : p.lang === "es" ? `/es/post/${p.slug}` : `/post/${p.slug}`;
                  return (
                    <article key={p.id} className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <Link href={pUrl} className="block">
                        <div className="relative w-full aspect-video overflow-hidden">
                          <img 
                            src={optimizeImageUrl(p.img, 450, 260)} 
                            alt={stripHtml(p.title)} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            style={{ objectPosition: p.imgFocalPoint || "center" }}
                            loading="lazy"
                          />
                          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm ${TAG_COLORS[p.tag] || "bg-foreground text-background"}`}>
                            {p.tag}
                          </span>
                        </div>
                        <div className="p-4">
                          <SafeHtml
                            html={p.title}
                            tag="h4"
                            className="text-[20px] font-bold uppercase leading-tight text-foreground mb-1.5 group-hover:text-primary transition-colors"
                          />
                          <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                            <Clock size={11} /> {p.readTime}
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
          <CommentsSection postId={viewModel.id} />
        </div>

        {/* SIDEBAR */}
        <Sidebar postTags={dynamicPostTags} />
      </div>
    </div>
  );
}
