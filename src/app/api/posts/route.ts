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

/**
 * Substitui os marcadores no formato {translation_group_id}=N{texto_alt}
 * pela tag HTML <img> real com a URL correspondente a img-N e a legenda alt da IA.
 */
function processImagePlaceholdersInHtml(htmlText: string, langData: any): string {
  if (!htmlText) return "";

  return htmlText.replace(/\{[^}]*\}=(\d+)\{([^}]*)\}/gi, (match, orderStr, altText) => {
    const orderNum = parseInt(orderStr, 10);
    const imgKey = `img-${orderNum}`;
    const imgUrl = extractImageUrl(langData[imgKey]);

    if (imgUrl) {
      const cleanAlt = altText ? altText.trim() : "Imagem do artigo";
      return `<img src="${imgUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
    }
    return "";
  });
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

    // Desembrulha invólucros nativos do n8n do tipo { json: { ... } }
    if (body && typeof body === "object" && "json" in body && body.json) {
      body = body.json;
    }

    const output = body?.output || (body?.en && body?.pt ? body : null);

    // SUPORTE A MULTI-IDIOMA AUTOMÁTICO DO N8N (output: { id, en, es, pt })
    if (output && typeof output === "object") {
      const translationGroupId = output.id || `group-${Date.now()}`;
      const createdPosts: any[] = [];

      const langs = ["pt", "en", "es"];

      for (const lang of langs) {
        const langData = output[lang];
        if (!langData || !langData.title) continue;

        const finalSlug = langData.slug?.trim() || generateSlug(langData.title);

        // Extrair imagem destacada (Hero) de img-1
        const featuredImg =
          extractImageUrl(langData["img-1"]) ||
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

        // Construir os blocos processando os marcadores {group_id}=N{alt} para tags <img>
        const blocks: any[] = [];
        for (let i = 1; i <= 5; i++) {
          const rawBlockText = langData[`block-${i}`];
          if (!rawBlockText) continue;

          // Processa o HTML substituindo os marcadores de imagem
          const processedBlockText = processImagePlaceholdersInHtml(rawBlockText, langData);
          const blockImg = extractImageUrl(langData[`img-${i + 1}`]);

          blocks.push({
            text: processedBlockText,
            image: blockImg,
            focalPoint: "center",
          });
        }

        const postUrlPath = lang === "en" ? `/en/post/${finalSlug}` : lang === "es" ? `/es/post/${finalSlug}` : `/post/${finalSlug}`;

        // Upsert do post para cada idioma
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

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/eventos");

      return NextResponse.json({
        success: true,
        message: `Post multi-idioma (${createdPosts.length} versões) criado com sucesso!`,
        translationGroupId,
        posts: createdPosts,
      });
    }

    // SUPORTE A POST ÚNICO (MANUAL / TRADICIONAL)
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

    const post = await prisma.post.upsert({
      where: { slug: finalSlug },
      update: {
        title,
        excerpt: excerpt || title,
        blocks: Array.isArray(blocks) ? blocks : [],
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
        blocks: Array.isArray(blocks) ? blocks : [],
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${tag}, ${category}, Moto na Prática`,
        translationGroupId,
        lang,
        date: new Date(),
      },
    });

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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API de automação de posts:", error);
    return NextResponse.json({ error: "Erro interno ao processar automação.", details: error.message }, { status: 500 });
  }
}
