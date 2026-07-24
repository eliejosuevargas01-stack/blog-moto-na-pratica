import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractImageUrl(imgField: any): string {
  if (!imgField) return "";
  if (typeof imgField === "string") {
    if (imgField.startsWith("http")) return imgField;
    return "";
  }
  if (typeof imgField === "object" && imgField.url) {
    return imgField.url;
  }
  return "";
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

function cleanBlockHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<p>\s*(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+\s*<\/p>/gi, "")
    .replace(/(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+/gi, "")
    .replace(/\{[^}]*\}=\d+\{[^}]*\}/gi, "")
    .trim();
}

function processImagePlaceholdersInHtml(htmlText: string, langData: any): string {
  if (!htmlText) return "";

  let processed = htmlText.replace(/\{[^}]*\}=(\d+)\{([^}]*)\}/gi, (match, orderStr, altText) => {
    const orderNum = parseInt(orderStr, 10);
    const imgKey = `img-${orderNum}`;
    const imgUrl = extractImageUrl(langData[imgKey]);

    if (imgUrl) {
      const cleanAlt = altText ? altText.trim() : "Imagem do artigo";
      return `<img src="${imgUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
    }
    return "";
  });

  return cleanBlockHtml(processed);
}

/**
 * GET /api/posts
 * Permite buscar posts ordenados por mentions, views, likes ou createdAt
 * Exemplo: GET /api/posts?orderBy=mentions&order=asc&limit=10&lang=pt
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "pt";
    const orderByParam = url.searchParams.get("orderBy") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const validOrderByFields = ["createdAt", "mentions", "views", "likes", "title"];
    const orderByField = validOrderByFields.includes(orderByParam) ? orderByParam : "createdAt";

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { lang },
          ...(lang === "pt" ? [{ lang: null }] : [])
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

    const output = body?.output || (body?.en && body?.pt ? body : null);
    const explicitMentionedSlugs: string[] = Array.isArray(body?.mentioned_slugs || body?.mentionedSlugs) ? (body?.mentioned_slugs || body?.mentionedSlugs) : [];

    // SUPORTE A POST MULTI-IDIOMA (OUTPUT DE AUTOMACÃO N8N)
    if (output && typeof output === "object") {
      const translationGroupId = output.id || `group-${Date.now()}`;
      const createdPosts: any[] = [];
      const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

      const langs = ["pt", "en", "es"];

      for (const lang of langs) {
        const langData = output[lang];
        if (!langData || !langData.title) continue;

        const finalSlug = langData.slug?.trim() || generateSlug(langData.title);

        const featuredImg =
          extractImageUrl(langData["img-1"]) ||
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

        const blocks: any[] = [];
        for (let i = 1; i <= 5; i++) {
          const rawBlockText = langData[`block-${i}`];
          if (!rawBlockText) continue;

          const foundSlugs = extractMentionedSlugsFromHtml(rawBlockText, finalSlug);
          foundSlugs.forEach(s => extractedMentionedSlugs.add(s));

          const processedBlockText = processImagePlaceholdersInHtml(rawBlockText, langData);
          const rawBlockImg = extractImageUrl(langData[`img-${i + 1}`]);

          // Evita imagem duplicada se o texto HTML já tiver a tag <img> embutida
          const hasImgTagInText = processedBlockText.includes("<img");

          blocks.push({
            text: processedBlockText,
            image: hasImgTagInText ? "" : rawBlockImg,
            focalPoint: "center",
          });
        }

        const postUrlPath = lang === "en" ? `/en/post/${finalSlug}` : lang === "es" ? `/es/post/${finalSlug}` : `/post/${finalSlug}`;

        const post = await prisma.post.upsert({
          where: { slug: finalSlug },
          update: {
            title: langData.title,
            excerpt: langData.summary || langData.title,
            readTime: "5 min",
            img: featuredImg,
            blocks,
            seoTitle: langData["meta-title"] || langData.title,
            seoDescription: langData["meta-description"] || langData.summary,
            seoKeywords: langData["meta-tags"] || "MotoGP, Moto na Prática",
            translationGroupId,
            lang,
          },
          create: {
            slug: finalSlug,
            tag: "MotoGP",
            category: "Notícias",
            title: langData.title,
            excerpt: langData.summary || langData.title,
            readTime: "5 min",
            img: featuredImg,
            imgFocalPoint: "center",
            blocks,
            seoTitle: langData["meta-title"] || langData.title,
            seoDescription: langData["meta-description"] || langData.summary,
            seoKeywords: langData["meta-tags"] || "MotoGP, Moto na Prática",
            translationGroupId,
            lang,
            date: new Date(),
          },
        });

        createdPosts.push({
          id: post.id,
          lang: post.lang,
          slug: post.slug,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}${postUrlPath}`,
        });
      }

      // Incrementar mentions no Supabase para todos os slugs citados
      if (extractedMentionedSlugs.size > 0) {
        await prisma.post.updateMany({
          where: { slug: { in: Array.from(extractedMentionedSlugs) } },
          data: { mentions: { increment: 1 } },
        });
      }

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/eventos");

      return NextResponse.json({
        success: true,
        message: `Post multi-idioma (${createdPosts.length} versões) criado com sucesso!`,
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

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() || generateSlug(title);
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

    const post = await prisma.post.upsert({
      where: { slug: finalSlug },
      update: {
        title,
        excerpt: excerpt || title,
        blocks: cleanedBlocks,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${tag}, ${category}, Moto na Prática`,
        translationGroupId,
        lang,
      },
      create: {
        slug: finalSlug,
        tag,
        category,
        title,
        excerpt: excerpt || title,
        readTime,
        img,
        imgFocalPoint,
        blocks: cleanedBlocks,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${tag}, ${category}, Moto na Prática`,
        translationGroupId,
        lang,
        date: new Date(),
      },
    });

    if (extractedMentionedSlugs.size > 0) {
      await prisma.post.updateMany({
        where: { slug: { in: Array.from(extractedMentionedSlugs) } },
        data: { mentions: { increment: 1 } },
      });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/eventos");
    revalidatePath(`/post/${finalSlug}`);

    return NextResponse.json({
      success: true,
      message: "Post criado com sucesso!",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        lang: post.lang,
        mentions: post.mentions,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API de automação de posts:", error);
    return NextResponse.json({ error: "Erro interno ao processar automação.", details: error.message }, { status: 500 });
  }
}
