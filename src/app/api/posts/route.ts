import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { revalidatePath } from "next/cache";
import { processImageBase64, saveAudioBuffer, calculateReadTime } from "@/lib/image-utils";
import { toNumericGroupId } from "../../data";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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

  // Se colidir com outro post (ex: versão PT), usar sufixo semântico de idioma (-en, -es) em vez de número (-2)
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
  return slug
    .trim()
    .replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "")
    .replace(/^\/+/, "");
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

  // Se a string não começar com protocolo http://, https:// ou caminho /uploads/, é uma string Base64!
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/uploads/")) {
    try {
      const savedUrl = await processImageBase64(url);
      return savedUrl;
    } catch (e) {
      console.error("Erro ao converter Base64 em extractImageUrl:", e);
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

  // Inferência automática pelo título se tag não foi informada ou for genérica
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
    if (match[1]) {
      const clean = match[1].trim();
      if (clean && clean !== selfSlug) {
        slugs.push(clean);
      }
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
    .replace(/href=(["'])\/?pt\/posts?\//gi, 'href=$1/post/')
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

  const matches = Array.from(htmlText.matchAll(/[\{\[]\s*(?:id|img|image)\s*=\s*(\d+)\s*[\}\]]/gi));
  let processed = htmlText;

  for (const match of matches) {
    const orderNum = parseInt(match[1], 10);
    const imgKey = `img-${orderNum}`;
    const imgUrl = await extractImageUrl(langData[imgKey]);
    if (imgUrl) {
      const altText = langData[`alt-${orderNum}`] || langData[`alt_${orderNum}`] || langData[`img-${orderNum}-alt`] || `Imagem ${orderNum}`;
      const captionText = langData[`caption-${orderNum}`] || langData[`caption_${orderNum}`] || langData[`legenda-${orderNum}`] || "";

      const figureHtml = captionText
        ? `<figure class="my-6 text-center"><img src="${imgUrl}" alt="${altText}" class="w-full h-auto object-cover border border-border rounded-sm mx-auto" loading="lazy" /><figcaption class="text-xs text-muted-foreground mt-2 italic">${captionText}</figcaption></figure>`
        : `<img src="${imgUrl}" alt="${altText}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;

      processed = processed.replace(match[0], figureHtml);
    } else {
      processed = processed.replace(match[0], "");
    }
  }

  return cleanBlockHtml(processed);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "pt";
    const orderByParam = url.searchParams.get("orderBy") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

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
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar posts", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const rawBody = await req.json();
    let body = Array.isArray(rawBody) ? rawBody[0] : rawBody;

    if (body && typeof body === "object" && "json" in body && body.json) {
      body = body.json;
    }

    let output = body?.output || (body?.pt || body?.en || body?.es ? body : null);

    if (typeof output === "string") {
      try {
        output = JSON.parse(output);
      } catch (e) {
        console.error("Falha ao fazer parse do output recebido como string:", e);
      }
    }

    const explicitMentionedSlugs: string[] = Array.isArray(body?.mentioned_slugs || body?.mentionedSlugs) ? (body?.mentioned_slugs || body?.mentionedSlugs) : [];

    // SUPORTE A POST MULTI-IDIOMA (OUTPUT DE AUTOMACÃO N8N)
    if (output && typeof output === "object") {
      const rawGroupId = output.translationGroupId || output.group_id || output.groupId || output.id || output.pt?.id || output.en?.id || output.es?.id || body.translationGroupId || body.group_id || body.groupId || body.id || body.post_id;
      const translationGroupId = toNumericGroupId(rawGroupId);
      const createdPosts: any[] = [];
      const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

      const langs = ["pt", "en", "es"];

      // Buscar posts existentes do mesmo translationGroupId para aproveitar imagens reais já cadastradas
      const existingGroupPosts = translationGroupId ? await prisma.post.findMany({
        where: {
          translationGroupId
        },
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

        // O 'id' fornecido representa o ID do Grupo de Tradução (translationGroupId), ID do post ou Slug do post
        const targetLangId = langData.id ? String(langData.id).trim() : (body.id || body.post_id || body.postId) ? String(body.id || body.post_id || body.postId).trim() : undefined;
        const targetLangSlug = langData.slug ? cleanSlug(langData.slug) : body.slug ? cleanSlug(body.slug) : undefined;

        let existingPostForLang = null;

        // 1. Buscar por translationGroupId + lang
        if (translationGroupId) {
          existingPostForLang = await prisma.post.findFirst({
            where: { translationGroupId, lang }
          });
        }

        // 2. Buscar por ID do post
        if (!existingPostForLang && targetLangId) {
          const byId = await prisma.post.findUnique({ where: { id: targetLangId } });
          if (byId && (byId.lang === lang || !byId.lang)) {
            existingPostForLang = byId;
          }
        }

        // 3. Buscar por Slug do post
        if (!existingPostForLang && targetLangSlug) {
          const bySlug = await prisma.post.findUnique({ where: { slug: targetLangSlug } });
          if (bySlug && (bySlug.lang === lang || !bySlug.lang)) {
            existingPostForLang = bySlug;
          }
        }

        // SE O POST JÁ EXISTIR NO BANCO DE DADOS, PRESERVA O SLUG ORIGINAL!
        // NUNCA GERAR NOVO SLUG NEM ALTERAR O SLUG/URL DE UM POST QUE JÁ EXISTE NO GOOGLE.
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
            dbRealBlockImgs[i - 1] || "";

          const hasImgTagInText = processedBlockText.includes("<img");

          blocks.push({
            text: processedBlockText,
            image: hasImgTagInText ? "" : rawBlockImg,
            focalPoint: "center",
          });
        }

        const postUrlPath = lang === "en" ? `/en/post/${finalSlug}` : lang === "es" ? `/es/post/${finalSlug}` : `/post/${finalSlug}`;

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
            }
          });
        } else {
          post = await prisma.post.upsert({
            where: { slug: finalSlug },
            update: {
              tag: postTag,
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
            },
            create: {
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
            },
          });
        }

        createdPosts.push({
          id: post.id,
          lang: post.lang,
          slug: post.slug,
          title: post.title,
          url: `https://motonapratica.online${postUrlPath}`
        });
      }

      // INCREMENTAR COLUNA 'mentions' NOS POSTS MENCIONADOS
      if (extractedMentionedSlugs.size > 0) {
        await prisma.post.updateMany({
          where: {
            slug: {
              in: Array.from(extractedMentionedSlugs)
            }
          },
          data: {
            mentions: {
              increment: 1
            }
          }
        });
      }

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/eventos");

      return NextResponse.json({
        success: true,
        message: `Post multi-idioma (${createdPosts.length} versões) salvo com sucesso!`,
        translationGroupId,
        mentionedSlugsCount: extractedMentionedSlugs.size,
        posts: createdPosts,
      });
    }

    // SUPORTE A POST ÚNICO MANUAL
    const {
      title,
      slug: customSlug,
      tag = "Eventos",
      category = "Notícias",
      excerpt = "",
      readTime = "5 min",
      img = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200",
      imgFocalPoint = "center",
      blocks = [],
      seoTitle,
      seoDescription,
      seoKeywords,
      lang = "pt",
      translationGroupId,
    } = body;

    const finalTranslationGroupId = toNumericGroupId(translationGroupId || body.group_id || body.groupId || body.id || body.post_id || body.postId);
    const rawLang = body.lang || body.language || body.idioma;
    let targetLang = rawLang ? String(rawLang).toLowerCase().trim() : "";

    // Se o idioma não for informado explicitamente, inferir pelo slug/título para evitar salvar posts em inglês como 'pt'
    if (!targetLang) {
      const textToTest = `${customSlug || ""} ${title || ""}`.toLowerCase();
      if (
        textToTest.includes("is the") || textToTest.includes("is-the") ||
        textToTest.includes("the future") || textToTest.includes("the-future") ||
        textToTest.includes("work motorcycle") || textToTest.includes("work-motorcycle") ||
        textToTest.includes("why your") || textToTest.includes("why-your") ||
        textToTest.includes("is it worth") || textToTest.includes("is-it-worth") ||
        textToTest.includes("financing a") || textToTest.includes("financing-a")
      ) {
        targetLang = "en";
      } else if (
        textToTest.includes("el futuro") || textToTest.includes("el-futuro") ||
        textToTest.includes("por que") || textToTest.includes("por-que") ||
        textToTest.includes("para trabajar") || textToTest.includes("para-trabajar") ||
        textToTest.includes("vale la pena") || textToTest.includes("vale-la-pena")
      ) {
        targetLang = "es";
      } else {
        targetLang = "pt";
      }
    }

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    // REGRA DE MATCHING E PRESERVAÇÃO DE SLUG/UUID NO ENDPOINT:
    const targetIdStr = (body.id || body.post_id || body.postId) ? String(body.id || body.post_id || body.postId).trim() : undefined;
    const targetSlugStr = customSlug ? cleanSlug(customSlug) : body.slug ? cleanSlug(body.slug) : undefined;

    let existingSinglePost = null;

    // 1. Tentar por translationGroupId + lang
    if (finalTranslationGroupId) {
      existingSinglePost = await prisma.post.findFirst({
        where: {
          translationGroupId: finalTranslationGroupId,
          lang: targetLang
        }
      });
    }

    // 2. Tentar por ID do post
    if (!existingSinglePost && targetIdStr) {
      const byId = await prisma.post.findUnique({ where: { id: targetIdStr } });
      if (byId) {
        existingSinglePost = byId;
      }
    }

    // 3. Tentar por SLUG do post (garante que atualizações enviadas por slug encontrem o post original)
    if (!existingSinglePost && targetSlugStr) {
      const bySlug = await prisma.post.findUnique({ where: { slug: targetSlugStr } });
      if (bySlug) {
        existingSinglePost = bySlug;
      }
    }

    // SE O POST JÁ EXISTE NO BANCO DE DADOS, PRESERVA ABSOLUTAMENTE O SLUG ORIGINAL!
    // NUNCA MUDAR O SLUG NEM CRIAR UM NOVO UUID/POST PARA POSTS JÁ EXISTENTES.
    const finalSlug = existingSinglePost
      ? existingSinglePost.slug
      : (targetSlugStr || await generateUniqueSlug(title, existingSinglePost?.id, targetLang));

    const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

    const cleanedBlocks = Array.isArray(blocks) ? blocks.map((b: any) => {
      if (b && typeof b.text === "string") {
        const found = extractMentionedSlugsFromHtml(b.text, finalSlug);
        found.forEach(s => extractedMentionedSlugs.add(s));
        const cleanedText = cleanBlockHtml(b.text);
        const hasImgTagInText = cleanedText.includes("<img");
        return {
          ...b,
          text: cleanedText,
          image: hasImgTagInText ? "" : (b.image || "")
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
      // UPDATE: Se o post do mesmo translationGroupId e idioma existe, ATUALIZA ele!
      post = await prisma.post.update({
        where: { id: existingSinglePost.id },
        data: {
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
      // CREATE: Se não existe post para este translationGroupId + idioma, CRIA para este idioma!
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
      await prisma.post.updateMany({
        where: {
          slug: {
            in: Array.from(extractedMentionedSlugs)
          }
        },
        data: {
          mentions: {
            increment: 1
          }
        }
      });
    }

    try {
      await prisma.notification.create({
        data: {
          type: "POST_UPDATE",
          message: `📝 Post "${post.title}" (${(post.lang || "pt").toUpperCase()}) ${existingSinglePost ? "atualizado" : "criado"} via API`,
          postId: post.id,
          postTitle: post.title,
        }
      });
    } catch (notifErr) {
      console.warn("Erro ao criar notificação no POST /api/posts:", notifErr);
    }

    revalidatePath("/");
    revalidatePath("/posts");

    const postUrlPath = lang === "en" ? `/en/post/${post.slug}` : lang === "es" ? `/es/post/${post.slug}` : `/post/${post.slug}`;

    return NextResponse.json({
      success: true,
      message: "Post salvo com sucesso!",
      post: {
        id: post.id,
        lang: post.lang,
        slug: post.slug,
        title: post.title,
        url: `https://motonapratica.online${postUrlPath}`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao salvar post", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const reqUrl = new URL(req.url);
    const apiKeyQuery = reqUrl.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    let body: any = {};
    let fileFromFormData: File | null = null;
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await req.formData();
        formData.forEach((value, key) => {
          if (value instanceof File) {
            if (key === "audio" || key === "file" || key === "narration" || key === "audio_file") fileFromFormData = value;
            else if (key === "image" || key === "img") body[key] = value;
          } else {
            body[key] = value;
          }
        });
      } catch (formDataErr: any) {
        console.warn("[PATCH /api/posts] req.formData() falhou, tentando fallback para JSON/Text:", formDataErr?.message || formDataErr);
        try {
          body = await req.json();
        } catch (jsonErr) {
          try {
            const rawText = await req.text();
            body = JSON.parse(rawText);
          } catch (textErr) {
            body = {};
          }
        }
      }
    } else {
      try {
        body = await req.json();
      } catch (e) {
        try {
          const rawText = await req.text();
          body = JSON.parse(rawText);
        } catch (textErr) {
          body = {};
        }
      }
    }

    const {
      id, post_id, postId, translationGroupId, group_id, groupId, slug,
      position, pos, imgKey,
      image, img,
      audioUrl, audio_url, audio, narrationUrl, narration_url, audio_path, audioPath, url, file,
      lang,
      alt, altText, alt_text, caption, legenda, focalPoint, focal_point
    } = body;

    const targetIdentifier = id || post_id || postId || translationGroupId || group_id || groupId || slug;
    if (!targetIdentifier) {
      return NextResponse.json({ error: "É necessário fornecer o id, translationGroupId ou slug do post." }, { status: 400 });
    }

    const rawAudioInput = fileFromFormData || audio || audioUrl || audio_url || narrationUrl || narration_url || audio_path || audioPath || url || file;
    let finalAudioUrl: string | null = null;

    if (rawAudioInput) {
      if (typeof rawAudioInput === "string") {
        const trimmedAudioStr = rawAudioInput.trim();
        if (trimmedAudioStr.startsWith("http://") || trimmedAudioStr.startsWith("https://")) {
          finalAudioUrl = trimmedAudioStr;
        } else {
          // Processar string Base64 de áudio
          const matches = trimmedAudioStr.match(/^data:audio\/([a-z0-9\+\-]+);base64,/i);
          const ext = matches ? (matches[1] === "mpeg" ? "mp3" : matches[1]) : "mp3";
          const cleanBase64 = trimmedAudioStr.replace(/^data:[^;]+;base64,/i, "").trim();
          const buffer = Buffer.from(cleanBase64, "base64");
          finalAudioUrl = await saveAudioBuffer(buffer, ext);
        }
      } else if (typeof rawAudioInput === "object" && rawAudioInput && "arrayBuffer" in rawAudioInput) {
        const fileObj = rawAudioInput as File;
        const bytes = await fileObj.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = fileObj.name ? (fileObj.name.split(".").pop() || "mp3") : "mp3";
        finalAudioUrl = await saveAudioBuffer(buffer, ext);
      }
    }

    const rawImageInput = body.image || body.img;
    let finalImageUrl: string | null = null;

    if (rawImageInput) {
      if (typeof rawImageInput === "string") {
        if (rawImageInput.startsWith("data:image") || (rawImageInput.length > 200 && !rawImageInput.startsWith("http"))) {
          try {
            finalImageUrl = await processImageBase64(rawImageInput);
          } catch (err: any) {
            console.error("Erro ao processar Base64 na rota PATCH:", err);
            return NextResponse.json({ error: "Falha ao processar imagem Base64.", details: err.message }, { status: 400 });
          }
        } else {
          finalImageUrl = rawImageInput;
        }
      } else if (typeof rawImageInput === "object" && rawImageInput && "arrayBuffer" in rawImageInput) {
        try {
          const fileObj = rawImageInput as File;
          const bytes = await fileObj.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const { saveOptimizedImageBuffer } = await import("@/lib/image-utils");
          finalImageUrl = await saveOptimizedImageBuffer(buffer);
        } catch (err: any) {
          console.error("Erro ao processar arquivo de imagem na rota PATCH:", err);
          return NextResponse.json({ error: "Falha ao processar arquivo de imagem.", details: err.message }, { status: 400 });
        }
      }
    }

    if (!finalImageUrl && !finalAudioUrl) {
      return NextResponse.json({ error: "É necessário fornecer uma imagem ('image') ou um áudio ('audio')." }, { status: 400 });
    }

    if (typeof finalImageUrl === "string" && finalImageUrl.includes("/uploads/")) {
      const fname = finalImageUrl.split("/uploads/").pop()?.split("?")[0];
      if (fname) finalImageUrl = `/uploads/${fname}`;
    }

    const targetIdentifierStr = String(targetIdentifier).trim();
    const numericTargetId = /^\d+$/.test(targetIdentifierStr) ? parseInt(targetIdentifierStr, 10) : undefined;

    // O 'id' fornecido representa o ID do Grupo de Tradução (translationGroupId), ID do post ou slug do post
    const initialPosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: targetIdentifierStr },
          ...(numericTargetId ? [{ translationGroupId: numericTargetId }] : []),
          { slug: targetIdentifierStr }
        ]
      }
    });

    if (initialPosts.length === 0) {
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

    // Se o parâmetro 'lang' for informado (ex: 'pt', 'en', 'es'), filtrar posts para aplicar a essa língua específica
    const targetLang = lang ? String(lang).trim().toLowerCase() : null;
    if (targetLang && finalAudioUrl && !finalImageUrl) {
      const langFiltered = postsToUpdate.filter(p => p.lang === targetLang);
      if (langFiltered.length > 0) {
        postsToUpdate = langFiltered;
      }
    }

    const rawPos = position !== undefined ? position : (pos !== undefined ? pos : imgKey);
    let posNum = 1;
    if (typeof rawPos === "number") {
      posNum = rawPos;
    } else if (typeof rawPos === "string") {
      const match = rawPos.match(/\d+/);
      if (match) posNum = parseInt(match[0], 10);
    }

    const updatedPostsInfo: any[] = [];
    const metaAlt = alt || altText || alt_text;
    const metaCaption = caption || legenda;
    const metaFocal = focalPoint || focal_point;

    for (const post of postsToUpdate) {
      const updateData: any = {};
      if (finalAudioUrl) updateData.audioUrl = finalAudioUrl;

      if (!finalImageUrl && finalAudioUrl) {
        const updated = await prisma.post.update({
          where: { id: post.id },
          data: updateData
        });
        revalidatePath("/");
        revalidatePath(`/post/${updated.slug}`);
        updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug, audioUrl: finalAudioUrl });
      } else if (posNum === 1) {
        if (finalImageUrl) updateData.img = finalImageUrl;
        if (metaFocal) updateData.imgFocalPoint = metaFocal;

        const updated = await prisma.post.update({
          where: { id: post.id },
          data: updateData
        });
        revalidatePath("/");
        revalidatePath(`/post/${updated.slug}`);
        updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug });
      } else {
        const blockIndex = posNum - 2;
        const rawBlocks = Array.isArray(post.blocks) ? (post.blocks as any[]) : [];

        if (blockIndex >= 0 && blockIndex < rawBlocks.length) {
          const updatedBlocks = [...rawBlocks];
          const targetBlock = { ...updatedBlocks[blockIndex] };
          if (finalImageUrl) targetBlock.image = finalImageUrl;
          if (metaAlt) targetBlock.alt = metaAlt;
          if (metaCaption) targetBlock.caption = metaCaption;
          if (metaFocal) targetBlock.focalPoint = metaFocal;

          const blockAltText = metaAlt || `Imagem ${posNum}`;

          if (targetBlock.text && finalImageUrl) {
            const placeholderRegex = new RegExp(`[\\{\\[]\\s*(?:id|img|image)\\s*=\\s*${posNum}\\s*[\\}\\]]`, "gi");
            if (metaCaption) {
              targetBlock.text = targetBlock.text.replace(
                placeholderRegex,
                `<figure class="my-6 text-center"><img src="${finalImageUrl}" alt="${blockAltText}" class="w-full h-auto object-cover border border-border rounded-sm mx-auto" loading="lazy" /><figcaption class="text-xs text-muted-foreground mt-2 italic">${metaCaption}</figcaption></figure>`
              );
            } else {
              targetBlock.text = targetBlock.text.replace(
                placeholderRegex,
                `<img src="${finalImageUrl}" alt="${blockAltText}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`
              );
            }
          }

          updatedBlocks[blockIndex] = targetBlock;

          const updated = await prisma.post.update({
            where: { id: post.id },
            data: {
              ...updateData,
              blocks: updatedBlocks
            }
          });

          revalidatePath("/");
          revalidatePath(`/post/${updated.slug}`);
          updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug });
        }
      }

      try {
        if (finalAudioUrl && !finalImageUrl) {
          await prisma.notification.create({
            data: {
              type: "AUDIO",
              message: `🎵 Narração em áudio anexada com sucesso ao post "${post.title}" (${(post.lang || "pt").toUpperCase()})`,
              postId: post.id,
              postTitle: post.title,
            }
          });
        } else if (finalImageUrl) {
          await prisma.notification.create({
            data: {
              type: "IMAGE",
              message: `🖼️ Nova imagem inserida no post "${post.title}" (${(post.lang || "pt").toUpperCase()})`,
              postId: post.id,
              postTitle: post.title,
            }
          });
        }
      } catch (notifErr) {
        console.warn("Erro ao criar notificação no PATCH /api/posts:", notifErr);
      }
    }

    if (updatedPostsInfo.length === 0) {
      return NextResponse.json({
        error: `Nenhum post pôde ser atualizado para os critérios informados.`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: finalAudioUrl && !finalImageUrl
        ? `Áudio de narração anexado com sucesso a ${updatedPostsInfo.length} post(s)!`
        : `Conteúdo anexado com sucesso a ${updatedPostsInfo.length} post(s)!`,
      audioUrl: finalAudioUrl,
      imageUrl: finalImageUrl,
      updatedPosts: updatedPostsInfo
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao anexar arquivo ao post", details: error.message }, { status: 500 });
  }
}
