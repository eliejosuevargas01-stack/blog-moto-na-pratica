import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { revalidatePath } from "next/cache";
import { processImageBase64, saveAudioBuffer, calculateReadTime } from "@/lib/image-utils";
import { toNumericGroupId } from "../../data";
import { verifyM2MAuth } from "@/lib/m2m";

function generateSlug(title: string): string {
  if (!title) return "";
  const cleanTitle = title.replace(/<[^>]*>/g, "");
  return cleanTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(title: string, existingId?: number | string, lang?: string): Promise<string> {
  const baseSlug = generateSlug(title) || `post-${Date.now()}`;
  let slug = baseSlug;
  const strExistingId = existingId ? String(existingId) : undefined;

  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!existing || (strExistingId && existing.id === strExistingId)) {
    return slug;
  }

  // Se colidir com outro post (ex: versão PT), usar sufixo semântico de idioma (-en, -es)
  if (lang && lang !== "pt") {
    const langSlug = `${baseSlug}-${lang.toLowerCase()}`;
    const existingLang = await prisma.post.findUnique({
      where: { slug: langSlug },
      select: { id: true }
    });
    if (!existingLang || (strExistingId && existingLang.id === strExistingId)) {
      return langSlug;
    }
  }

  let counter = 2;
  while (true) {
    const testSlug = `${baseSlug}-${counter}`;
    const existingTest = await prisma.post.findUnique({
      where: { slug: testSlug },
      select: { id: true }
    });

    if (!existingTest || (strExistingId && existingTest.id === strExistingId)) {
      return testSlug;
    }

    counter++;
  }
}

function cleanSlug(slug?: string): string {
  if (!slug) return "";
  const noHtml = slug.replace(/<[^>]*>/g, "");
  return noHtml
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function extractImageUrl(imgField: any): Promise<string> {
  if (!imgField) return "";
  let url = "";
  if (typeof imgField === "string") {
    url = imgField.trim();
  } else if (typeof imgField === "object" && imgField.url) {
    url = String(imgField.url).trim();
  }
  if (!url) return "";
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop()?.split("?")[0];
    if (filename) return `/uploads/${filename}`;
  }
  if (url.startsWith("data:image/") || (!url.startsWith("http") && url.length > 200)) {
    try {
      return await processImageBase64(url);
    } catch {
      return "";
    }
  }
  return url;
}

function normalizePostTag(rawTag?: string, title?: string): string {
  const lowerTag = (rawTag || "").toLowerCase().trim();
  const lowerTitle = (title || "").toLowerCase().trim();

  if (lowerTag.includes("review") || lowerTag.includes("anális") || lowerTag.includes("analis") || lowerTag.includes("teste") || lowerTag.includes("test")) return "Reviews";
  if (lowerTag.includes("manuten") || lowerTag.includes("mainten") || lowerTag.includes("oficina") || lowerTag.includes("garagem")) return "Manutenção";
  if (lowerTag.includes("rota") || lowerTag.includes("route") || lowerTag.includes("viagem") || lowerTag.includes("estrada") || lowerTag.includes("travel")) return "Rotas";
  if (lowerTag.includes("equip") || lowerTag.includes("gear") || lowerTag.includes("capacete") || lowerTag.includes("vestuário")) return "Equipamentos";
  if (lowerTag.includes("event") || lowerTag.includes("encontro") || lowerTag.includes("salão")) return "Eventos";
  if (lowerTag.includes("motogp") || lowerTag.includes("márquez") || lowerTag.includes("marquez") || lowerTag.includes("ducati") || lowerTag.includes("paddock") || lowerTag.includes("corrida")) return "MotoGP";

  if (lowerTitle.includes("review") || lowerTitle.includes("avaliação") || lowerTitle.includes("análise") || lowerTitle.includes("custos") || lowerTitle.includes("twister") || lowerTitle.includes("mt-") || lowerTitle.includes("fz25") || lowerTitle.includes("cb 300") || lowerTitle.includes("morreram") || lowerTitle.includes("died")) return "Reviews";
  if (lowerTitle.includes("manutenção") || lowerTitle.includes("óleo") || lowerTitle.includes("corrente") || lowerTitle.includes("freio") || lowerTitle.includes("pneu") || lowerTitle.includes("oficina")) return "Manutenção";
  if (lowerTitle.includes("rota") || lowerTitle.includes("viagem") || lowerTitle.includes("serra") || lowerTitle.includes("estrada") || lowerTitle.includes("roteiro")) return "Rotas";
  if (lowerTitle.includes("capacete") || lowerTitle.includes("jaqueta") || lowerTitle.includes("luva") || lowerTitle.includes("intercomunicador") || lowerTitle.includes("equipamento")) return "Equipamentos";
  if (lowerTitle.includes("motogp") || lowerTitle.includes("marquez") || lowerTitle.includes("márquez") || lowerTitle.includes("bagnaia") || lowerTitle.includes("martín") || lowerTitle.includes("cota") || lowerTitle.includes("austin")) return "MotoGP";

  return rawTag?.trim() || "Reviews";
}

function extractMentionedSlugsFromHtml(html: string, selfSlug?: string): string[] {
  if (!html) return [];
  const regex = /(?:\/post\/|\/en\/post\/|\/es\/post\/|motonapratica\.online\/post\/)([a-zA-Z0-9_-]+)/gi;
  const slugs: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1]?.trim();
    if (slug && slug !== selfSlug) {
      slugs.push(slug);
    }
  }
  return Array.from(new Set(slugs));
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
  }
  return "";
}

function normalizeProsConsHtml(html: string): string {
  if (!html) return "";

  if (html.includes('class="box-pros-cons"') || html.includes('class="pros-contras-box"')) {
    return html;
  }

  let cleanInput = html
    .replace(/^<ul[^>]*>\s*<li[^>]*>/i, '')
    .replace(/<\/li>\s*<\/ul>$/i, '');

  const hasProsKeyword = /(?:pontos\s+fortes|prós|pros|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)/i.test(cleanInput);
  const hasConsKeyword = /(?:pontos\s+fracos|contras|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)/i.test(cleanInput);

  if (!hasProsKeyword && !hasConsKeyword) {
    return cleanInput;
  }

  if (cleanInput.includes('box-pros') && cleanInput.includes('box-cons')) {
    cleanInput = cleanInput.replace(/<li[^>]*>\s*(<div\b[^>]*class=["'][^"']*box-pros-cons[\s\S]*?<\/div>)\s*<\/li>/gi, '$1');
    return cleanInput;
  }

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

      const isConsLi = /^(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*<\/strong>/i.test(liInner);
      
      const isProsLi = /^(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*<\/strong>/i.test(liInner);

      if (isConsLi) {
        foundExplicitLabels = true;
        currentMode = 'cons';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*(?:<\/strong>)?\s*/i, '');
        consLis.push(`<li>${cleanedLi}</li>`);
      } else if (isProsLi) {
        foundExplicitLabels = true;
        currentMode = 'pros';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*(?:<\/strong>)?\s*/i, '');
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
    .replace(/href=(["'])\/?pt\/posts\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?posts\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?en\/posts\//gi, 'href=$1/en/post/')
    .replace(/href=(["'])\/?es\/posts\//gi, 'href=$1/es/post/')
    .trim();

  if (cleaned.includes("<table") && !cleaned.includes('class="table-wrapper"')) {
    cleaned = cleaned.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, '<div class="table-wrapper"><table class="tabela-comparativa"$1>$2</table></div>');
  }

  return normalizeProsConsHtml(cleaned);
}

async function processImagePlaceholdersInHtml(htmlText: string, langData: any): Promise<string> {
  if (!htmlText) return "";

  const regex = /\{[^}]*?order=(\d+)[^}]*?\}|\[[^\]]*?order=(\d+)[^\]]*?\]|\[(?:Image|Imagem|img|Img|IMG)\s*(\d+)\]|\{(?:Image|Imagem|img|Img|IMG)\s*(\d+)\}|\{id=(\d+)\}|\[id=(\d+)\]|\{img=(\d+)\}|\[img=(\d+)\]|\{([a-zA-Z0-9_-]+)=(\d+)\{([^}]*)\}\}/gi;

  let result = htmlText;
  const matches = Array.from(htmlText.matchAll(regex));

  for (const match of matches) {
    const rawTag = match[0];
    const orderNum = parseInt(
      match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || match[8] || match[10] || "0",
      10
    );
    const altText = match[11] || "Imagem ilustrativa do artigo";

    if (orderNum > 0) {
      const imgKey = `img-${orderNum}`;
      const imgUrl = await extractImageUrl(langData[imgKey]);

      if (imgUrl) {
        const cleanAlt = altText.trim();
        const imgTag = `<img src="${imgUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
        result = result.replace(rawTag, imgTag);
      } else {
        result = result.replace(rawTag, "");
      }
    }
  }

  return cleanBlockHtml(result);
}

export async function GET(req: Request) {
  try {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'API', action: 'api/posts GET', status: 'success' }));

    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "pt";
    const orderByParam = url.searchParams.get("orderBy") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
    let limit = parseInt(url.searchParams.get("limit") || "50", 10);
    if (isNaN(limit) || limit <= 0) limit = 50;

    const validOrderByFields = ["createdAt", "mentions", "views", "likes", "title"];
    const orderByField = validOrderByFields.includes(orderByParam) ? orderByParam : "createdAt";

    const statusParam = url.searchParams.get("status");

    const posts = await prisma.post.findMany({
      where: {
        AND: [
          statusParam ? { status: statusParam } : {},
          {
            OR: [
              { lang },
              ...(lang === "pt" ? [{ lang: null }] : [])
            ]
          }
        ]
      },
      orderBy: { [orderByField]: order },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tag: true,
        category: true,
        lang: true,
        status: true,
        mentions: true,
        views: true,
        likes: true,
        translationGroupId: true,
        createdAt: true,
        date: true,
      }
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Erro na API GET /api/posts:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao listar posts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'API', action: 'api/posts POST', status: 'success' }));

    if (!verifyM2MAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = await req.json();

    if (body?.json && typeof body.json === "object") {
      body = body.json;
    }

    let output = body?.output || (body?.en && body?.pt ? body : null);

    if (typeof output === "string") {
      try {
        output = JSON.parse(output);
      } catch (e) {
        console.error("Falha ao fazer parse do output recebido como string:", e);
      }
    }

    const explicitMentionedSlugs: string[] = Array.isArray(body?.mentioned_slugs || body?.mentionedSlugs) ? (body?.mentioned_slugs || body?.mentionedSlugs) : [];

    // SUPORTE A POST MULTI-IDIOMA (OUTPUT DE AUTOMAÇÃO N8N)
    if (output && typeof output === "object") {
      const rawGroupId = output.translationGroupId || output.group_id || output.groupId || output.id || output.pt?.id || output.en?.id || output.es?.id || body.translationGroupId || body.group_id || body.groupId || body.id || body.post_id;
      const translationGroupId = toNumericGroupId(rawGroupId);
      const createdPosts: any[] = [];
      const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

      const langs = ["pt", "en", "es"];

      // Buscar posts existentes do mesmo translationGroupId para aproveitar imagens reais já cadastradas
      const existingGroupPosts = translationGroupId ? await prisma.post.findMany({
        where: { translationGroupId },
        select: { img: true, blocks: true }
      }) : [];

      let dbRealFeaturedImg: string | null = null;
      const dbRealBlockImgs: Record<number, string> = {};

      for (const p of existingGroupPosts) {
        if (p.img && typeof p.img === "string" && !p.img.includes("unsplash.com")) {
          dbRealFeaturedImg = p.img;
        }
        const bList = Array.isArray(p.blocks) ? (p.blocks as any[]) : [];
        bList.forEach((b: any, idx: number) => {
          if (b && typeof b.image === "string" && b.image && !b.image.includes("unsplash.com") && !dbRealBlockImgs[idx]) {
            dbRealBlockImgs[idx] = b.image;
          }
        });
      }

      for (const lang of langs) {
        const langData = output[lang];
        if (!langData || !langData.title) continue;

        const targetLangId = langData.id ? String(langData.id).trim() : (body.id || body.post_id || body.postId) ? String(body.id || body.post_id || body.postId).trim() : undefined;
        const targetLangSlug = langData.slug ? cleanSlug(langData.slug) : body.slug ? cleanSlug(body.slug) : undefined;

        let existingPostForLang = null;

        if (translationGroupId) {
          existingPostForLang = await prisma.post.findFirst({
            where: { translationGroupId, lang }
          });
        }

        if (!existingPostForLang && targetLangId) {
          const byId = await prisma.post.findUnique({ where: { id: targetLangId } });
          if (byId && (byId.lang === lang || !byId.lang)) {
            existingPostForLang = byId;
          }
        }

        if (!existingPostForLang && targetLangSlug) {
          const bySlug = await prisma.post.findUnique({ where: { slug: targetLangSlug } });
          if (bySlug && (bySlug.lang === lang || !bySlug.lang)) {
            existingPostForLang = bySlug;
          }
        }

        const finalSlug = existingPostForLang
          ? existingPostForLang.slug
          : (targetLangSlug || await generateUniqueSlug(langData.title, existingPostForLang?.id, lang));

        const featuredImg =
          (await extractImageUrl(langData["img-1"])) ||
          (await extractImageUrl(output.pt?.["img-1"])) ||
          (await extractImageUrl(output.en?.["img-1"])) ||
          (await extractImageUrl(output.es?.["img-1"])) ||
          dbRealFeaturedImg ||
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

        const blocks: any[] = [];
        for (let i = 1; i <= 20; i++) {
          const rawBlockText = langData[`block-${i}`];
          if (!rawBlockText) continue;

          const foundSlugs = extractMentionedSlugsFromHtml(rawBlockText, finalSlug);
          foundSlugs.forEach(s => extractedMentionedSlugs.add(s));

          const processedBlockText = await processImagePlaceholdersInHtml(rawBlockText, langData);
          const rawBlockImg =
            (await extractImageUrl(langData[`img-${i + 1}`])) ||
            (await extractImageUrl(output.pt?.[`img-${i + 1}`])) ||
            (await extractImageUrl(output.en?.[`img-${i + 1}`])) ||
            (await extractImageUrl(output.es?.[`img-${i + 1}`])) ||
            dbRealBlockImgs[i - 1];

          const hasImgTagInText = processedBlockText.includes("<img");

          blocks.push({
            text: processedBlockText,
            image: hasImgTagInText ? "" : (rawBlockImg || ""),
            focalPoint: langData[`focalPoint-${i + 1}`] || "center",
          });
        }

        const rawPostTag = langData.tag || langData.type || langData.category || body.tag || body.type || body.category || output.tag || output.type || output.category;
        const postTag = normalizePostTag(rawPostTag, langData.title);
        const finalAudioUrl = langData.audioUrl || langData.audio_url || langData.audio || output.audioUrl || output.audio_url || output.audio || null;

        const calculatedReadTime = calculateReadTime({ title: langData.title, excerpt: langData.summary, blocks });
        const postStatus = langData.status || output.status || body.status || "publicado";

        let post;
        if (existingPostForLang) {
          post = await prisma.post.update({
            where: { id: existingPostForLang.id },
            data: {
              slug: finalSlug,
              tag: postTag,
              category: postTag,
              title: langData.title,
              excerpt: langData.summary || langData.title,
              readTime: calculatedReadTime,
              img: featuredImg,
              audioUrl: finalAudioUrl,
              status: postStatus,
              blocks,
              seoTitle: langData["meta-title"] || langData.title,
              seoDescription: langData["meta-description"] || langData.summary,
              seoKeywords: langData["meta-tags"] || `${postTag}, Moto na Prática`,
              translationGroupId,
              lang,
              updatedAt: new Date(),
            }
          });
        } else {
          post = await prisma.post.create({
            data: {
              slug: finalSlug,
              tag: postTag,
              category: postTag,
              title: langData.title,
              excerpt: langData.summary || langData.title,
              readTime: calculatedReadTime,
              img: featuredImg,
              audioUrl: finalAudioUrl,
              status: postStatus,
              imgFocalPoint: "center",
              blocks,
              seoTitle: langData["meta-title"] || langData.title,
              seoDescription: langData["meta-description"] || langData.summary,
              seoKeywords: langData["meta-tags"] || `${postTag}, Moto na Prática`,
              translationGroupId,
              lang,
              date: new Date(),
            }
          });
        }

        createdPosts.push({
          id: post.id,
          lang: post.lang,
          slug: post.slug,
          translationGroupId: post.translationGroupId,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}/post/${post.slug}`,
        });
      }

      // Atualizar contagem de menções
      if (extractedMentionedSlugs.size > 0) {
        const slugsArray = Array.from(extractedMentionedSlugs);
        await prisma.post.updateMany({
          where: { slug: { in: slugsArray } },
          data: { mentions: { increment: 1 } }
        });
      }

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/reviews");
      revalidatePath("/manutencao");
      revalidatePath("/rotas");
      revalidatePath("/equipamentos");

      return NextResponse.json({
        success: true,
        message: `Post multi-idioma (${createdPosts.length} versões) salvo com sucesso!`,
        translationGroupId,
        mentionedSlugsCount: extractedMentionedSlugs.size,
        posts: createdPosts,
      });
    }

    // SUPORTE A POST ÚNICO (MANUAL / TRADICIONAL)
    const {
      title,
      slug: customSlug,
      tag,
      category,
      excerpt,
      readTime,
      img,
      imgFocalPoint,
      blocks,
      seoTitle,
      seoDescription,
      seoKeywords,
      lang,
      translationGroupId,
    } = body;

    const finalTranslationGroupId = toNumericGroupId(translationGroupId || body.group_id || body.groupId || body.id || body.post_id || body.postId);
    const rawLang = body.lang || body.language || body.idioma;
    let targetLang = rawLang ? String(rawLang).toLowerCase().trim() : "";

    if (!targetLang) {
      const textToTest = `${customSlug || ""} ${title || ""}`.toLowerCase();
      if (textToTest.includes("is the") || textToTest.includes("the future") || textToTest.includes("why your")) {
        targetLang = "en";
      } else if (textToTest.includes("el futuro") || textToTest.includes("por que") || textToTest.includes("para trabajar")) {
        targetLang = "es";
      } else {
        targetLang = "pt";
      }
    }

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    const targetIdStr = (body.id || body.post_id || body.postId) ? String(body.id || body.post_id || body.postId).trim() : undefined;
    const targetSlugStr = customSlug ? cleanSlug(customSlug) : body.slug ? cleanSlug(body.slug) : undefined;

    let existingSinglePost = null;

    if (finalTranslationGroupId) {
      existingSinglePost = await prisma.post.findFirst({
        where: {
          translationGroupId: finalTranslationGroupId,
          lang: targetLang
        }
      });
    }

    if (!existingSinglePost && targetIdStr) {
      const byId = await prisma.post.findUnique({ where: { id: targetIdStr } });
      if (byId) {
        existingSinglePost = byId;
      }
    }

    if (!existingSinglePost && targetSlugStr) {
      const bySlug = await prisma.post.findUnique({ where: { slug: targetSlugStr } });
      if (bySlug) {
        existingSinglePost = bySlug;
      }
    }

    const finalSlug = existingSinglePost
      ? existingSinglePost.slug
      : (targetSlugStr || await generateUniqueSlug(title, existingSinglePost?.id, targetLang));

    const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

    const cleanedBlocks = Array.isArray(blocks) ? blocks.map((b: any) => {
      if (b && typeof b.text === "string") {
        const found = extractMentionedSlugsFromHtml(b.text, finalSlug);
        found.forEach(s => extractedMentionedSlugs.add(s));
        return {
          ...b,
          text: cleanBlockHtml(b.text)
        };
      }
      return b;
    }) : [];

    const rawSingleTag = body.tag || body.type || body.category || body.post_type || body.postType;
    const finalTag = normalizePostTag(rawSingleTag, title);
    const finalAudioUrlSingle = body.audioUrl || body.audio_url || body.audio || body.narrationUrl || null;
    const finalReadTime = (body.readTime && body.readTime !== "5 min")
      ? body.readTime
      : calculateReadTime({ title, excerpt, blocks: cleanedBlocks });

    const singleStatus = body.status || "publicado";

    let post;
    if (existingSinglePost) {
      post = await prisma.post.update({
        where: { id: existingSinglePost.id },
        data: {
          slug: finalSlug,
          tag: finalTag,
          category: finalTag,
          title,
          excerpt: excerpt || title,
          readTime: finalReadTime,
          audioUrl: finalAudioUrlSingle || existingSinglePost.audioUrl,
          status: singleStatus,
          blocks: cleanedBlocks,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          seoKeywords: seoKeywords || `${finalTag}, Moto na Prática`,
          translationGroupId: finalTranslationGroupId || existingSinglePost.translationGroupId,
          lang: targetLang,
          updatedAt: new Date(),
        }
      });
    } else {
      post = await prisma.post.create({
        data: {
          slug: finalSlug,
          tag: finalTag,
          category: finalTag,
          title,
          excerpt: excerpt || title,
          readTime: finalReadTime,
          img: img || "",
          imgFocalPoint: imgFocalPoint || "center",
          audioUrl: finalAudioUrlSingle,
          status: singleStatus,
          blocks: cleanedBlocks,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          seoKeywords: seoKeywords || `${finalTag}, Moto na Prática`,
          translationGroupId: finalTranslationGroupId || null,
          lang: targetLang,
          date: new Date(),
        },
      });
    }

    if (extractedMentionedSlugs.size > 0) {
      const slugsArray = Array.from(extractedMentionedSlugs);
      await prisma.post.updateMany({
        where: { slug: { in: slugsArray } },
        data: { mentions: { increment: 1 } }
      });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    revalidatePath(`/post/${finalSlug}`);

    return NextResponse.json({
      success: true,
      message: "Post salvo com sucesso!",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        lang: post.lang,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API POST /api/posts:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar o post." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'API', action: 'api/posts PATCH', status: 'success' }));

    if (!verifyM2MAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body.id = formData.get("id") || formData.get("post_id") || formData.get("postId") || formData.get("translationGroupId");
      body.position = formData.get("position") || formData.get("blockNumber");
      body.caption = formData.get("caption") || formData.get("alt");
      body.focalPoint = formData.get("focalPoint") || "center";

      const file = formData.get("image") as File;
      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const { saveOptimizedImageBuffer } = await import("@/lib/image-utils");
        body.image = await saveOptimizedImageBuffer(buffer);
      }
    } else {
      body = await req.json();
    }

    const targetIdentifier =
      body.id ||
      body.post_id ||
      body.postId ||
      body.translationGroupId ||
      body.translation_group_id ||
      body.groupId ||
      body.group_id ||
      body.slug;

    if (!targetIdentifier) {
      return NextResponse.json(
        { error: "Identificador do post obrigatório (use 'id', 'post_id', 'translationGroupId' ou 'slug')." },
        { status: 400 }
      );
    }

    const rawImage = body.image || body.img || body.imagem || body.imageUrl || body.url || body.file;
    const rawAudio = body.audio || body.audioUrl || body.audio_url || body.narrationUrl || body.voiceUrl;

    let finalImageUrl = "";
    if (rawImage) {
      finalImageUrl = await extractImageUrl(rawImage);
    }

    let finalAudioUrl = "";
    if (rawAudio) {
      if (typeof rawAudio === "string" && (rawAudio.startsWith("http") || rawAudio.startsWith("/uploads/"))) {
        finalAudioUrl = rawAudio.trim();
      } else if (typeof rawAudio === "string" && rawAudio.length > 50) {
        const cleanBase64 = rawAudio.replace(/^data:audio\/[a-z0-9\+\-]+;base64,/i, "").trim();
        const inputBuffer = Buffer.from(cleanBase64, "base64");
        finalAudioUrl = await saveAudioBuffer(inputBuffer, "mp3");
      }
    }

    const targetIdentifierStr = String(targetIdentifier).trim();
    const numericTargetId = /^\d+$/.test(targetIdentifierStr) ? parseInt(targetIdentifierStr, 10) : undefined;

    const initialPosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: targetIdentifierStr },
          ...(numericTargetId ? [{ translationGroupId: numericTargetId }] : []),
          { slug: targetIdentifierStr }
        ]
      }
    });

    if (!initialPosts || initialPosts.length === 0) {
      return NextResponse.json({ error: "Nenhum post encontrado com o id, slug ou translationGroupId fornecido." }, { status: 404 });
    }

    const groupIds = Array.from(new Set(initialPosts.map(p => p.translationGroupId).filter((g): g is number => g !== null && g !== undefined)));
    let postsToUpdate = await prisma.post.findMany({
      where: {
        OR: [
          { id: { in: initialPosts.map(p => p.id) } },
          ...(groupIds.length > 0 ? [{ translationGroupId: { in: groupIds } }] : [])
        ]
      }
    });

    const position = body.position || body.block || body.bloco || body.index || body.blockNumber || 0;
    const focalPoint = body.focalPoint || body.focal_point || "center";
    const altText = body.alt || body.caption || body.legenda || "";

    const updatedPosts = [];

    for (const post of postsToUpdate) {
      let blocks: any[] = [];
      if (Array.isArray(post.blocks)) {
        blocks = [...(post.blocks as any[])];
      } else if (typeof post.blocks === "string") {
        try {
          blocks = JSON.parse(post.blocks);
        } catch (e) {
          blocks = [];
        }
      }

      let newImg = post.img;
      let newImgFocalPoint = post.imgFocalPoint;
      let newAudioUrl = post.audioUrl;

      if (finalAudioUrl) {
        newAudioUrl = finalAudioUrl;
      }

      if (finalImageUrl) {
        if (position === 0 || position === "0" || position === "hero" || position === "capa") {
          newImg = finalImageUrl;
          newImgFocalPoint = focalPoint;
        } else {
          const blockIdx = parseInt(String(position), 10) - 1;
          if (blockIdx >= 0 && blockIdx < blocks.length) {
            blocks[blockIdx] = {
              ...blocks[blockIdx],
              image: finalImageUrl,
              focalPoint: focalPoint || blocks[blockIdx].focalPoint || "center",
              alt: altText || blocks[blockIdx].alt || "",
            };
          } else if (blockIdx >= blocks.length) {
            blocks.push({
              text: "",
              image: finalImageUrl,
              focalPoint: focalPoint,
              alt: altText,
            });
          }
        }
      }

      const updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          img: newImg,
          imgFocalPoint: newImgFocalPoint,
          audioUrl: newAudioUrl,
          blocks: blocks as any,
          updatedAt: new Date(),
        }
      });

      updatedPosts.push({
        id: updated.id,
        slug: updated.slug,
        lang: updated.lang,
        img: updated.img,
        audioUrl: updated.audioUrl,
      });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    for (const p of postsToUpdate) {
      if (p.slug) revalidatePath(`/post/${p.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: `Mídia atualizada com sucesso em ${updatedPosts.length} versões do post.`,
      posts: updatedPosts,
    });
  } catch (error: any) {
    console.error("Erro na API PATCH /api/posts:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar a atualização." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'API', action: 'api/posts DELETE', status: 'success' }));

    if (!verifyM2MAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json({ error: "Parâmetro 'id' ou 'slug' é obrigatório." }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(slug ? [{ slug }] : [])
        ]
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    if (post.translationGroupId) {
      await prisma.post.deleteMany({
        where: { translationGroupId: post.translationGroupId }
      });
    } else {
      await prisma.post.delete({ where: { id: post.id } });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    if (post.slug) revalidatePath(`/post/${post.slug}`);

    return NextResponse.json({ success: true, message: "Post deletado com sucesso." });
  } catch (error: any) {
    console.error("Erro na API DELETE /api/posts:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao deletar post." }, { status: 500 });
  }
}
