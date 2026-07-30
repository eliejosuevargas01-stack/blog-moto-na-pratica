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

async function generateUniqueSlug(title: string, existingId?: string): Promise<string> {
  const baseSlug = generateSlug(title) || `post-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing || (existingId && existing.id === existingId)) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

function cleanSlug(slug?: string): string {
  if (!slug) return "";
  return slug
    .trim()
    .replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "")
    .replace(/^\/+/, "");
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
    .replace(/href=(["'])\/?pt\/posts?\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?posts\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?en\/posts\//gi, 'href=$1/en/post/')
    .replace(/href=(["'])\/?es\/posts\//gi, 'href=$1/es/post/')
    .trim();
}

function processImagePlaceholdersInHtml(htmlText: string, langData: any): string {
  if (!htmlText) return "";

  let processed = htmlText
    // Suporte ao formato {id=1}, {id=2}, [id=1], [id=2], {img=1}, [img=1], {image=1}
    .replace(/[\{\[]\s*(?:id|img|image)\s*=\s*(\d+)\s*[\}\]]/gi, (match, orderStr) => {
      const orderNum = parseInt(orderStr, 10);
      const imgKey = `img-${orderNum}`;
      const imgUrl = extractImageUrl(langData[imgKey]);
      if (imgUrl) {
        return `<img src="${imgUrl}" alt="Imagem ${orderNum}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
      }
      return "";
    })
    // Suporte ao formato com legenda {Legenda}=2{Alt}
    .replace(/\{[^}]*\}=(\d+)\{([^}]*)\}/gi, (match, orderStr, altText) => {
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
      const translationGroupId = output.id || output.pt?.id || output.en?.id || output.es?.id || body.id || body.translationGroupId || `group-${Date.now()}`;
      const createdPosts: any[] = [];
      const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

      const langs = ["pt", "en", "es"];

      for (const lang of langs) {
        const langData = output[lang];
        if (!langData || !langData.title) continue;

        // Gerar slug automaticamente e garantindo unicidade (-2, -3 se já existir no banco)
        const finalSlug = await generateUniqueSlug(langData.title);

        const featuredImg =
          extractImageUrl(langData["img-1"]) ||
          extractImageUrl(output.pt?.["img-1"]) ||
          extractImageUrl(output.en?.["img-1"]) ||
          extractImageUrl(output.es?.["img-1"]) ||
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

        const blocks: any[] = [];
        for (let i = 1; i <= 20; i++) {
          const rawBlockText = langData[`block-${i}`];
          if (!rawBlockText) continue;

          const foundSlugs = extractMentionedSlugsFromHtml(rawBlockText, finalSlug);
          foundSlugs.forEach(s => extractedMentionedSlugs.add(s));

          const processedBlockText = processImagePlaceholdersInHtml(rawBlockText, langData);
          const rawBlockImg =
            extractImageUrl(langData[`img-${i + 1}`]) ||
            extractImageUrl(output.pt?.[`img-${i + 1}`]) ||
            extractImageUrl(output.en?.[`img-${i + 1}`]) ||
            extractImageUrl(output.es?.[`img-${i + 1}`]);

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

    const finalTranslationGroupId = translationGroupId || body.group_id || body.groupId || body.id || null;

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    // Gerar slug automaticamente e garantindo unicidade (-2, -3 se já existir)
    const finalSlug = await generateUniqueSlug(title);
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
        translationGroupId: finalTranslationGroupId,
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
        translationGroupId: finalTranslationGroupId,
        lang,
        date: new Date(),
      },
    });

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
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const body = await req.json();
    const { id, post_id, postId, slug, position, pos, imgKey, image, img } = body;

    const targetIdentifier = id || post_id || postId || slug;
    if (!targetIdentifier) {
      return NextResponse.json({ error: "É necessário fornecer o id ou slug do post ('id', 'post_id' ou 'slug')." }, { status: 400 });
    }

    const imageUrl = image || img;
    if (!imageUrl) {
      return NextResponse.json({ error: "É necessário fornecer a imagem ('image' ou 'img'). Pode ser URL pública ou Base64." }, { status: 400 });
    }

    let finalImageUrl = imageUrl;
    if (typeof imageUrl === "string" && imageUrl.startsWith("data:image")) {
      const uploadRes = await fetch(new URL("/api/upload", req.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl })
      });
      const uploadJson = await uploadRes.json();
      if (uploadJson.url) {
        finalImageUrl = uploadJson.url;
      }
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id: targetIdentifier },
          { slug: targetIdentifier }
        ]
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado no banco de dados." }, { status: 404 });
    }

    const rawPos = position !== undefined ? position : (pos !== undefined ? pos : imgKey);
    let posNum = 1;
    if (typeof rawPos === "number") {
      posNum = rawPos;
    } else if (typeof rawPos === "string") {
      const match = rawPos.match(/\d+/);
      if (match) posNum = parseInt(match[0], 10);
    }

    if (posNum === 1) {
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { img: finalImageUrl }
      });
      revalidatePath("/");
      revalidatePath(`/post/${updated.slug}`);
      return NextResponse.json({
        success: true,
        message: `Imagem de Capa (Posição 1) anexada com sucesso ao post '${post.title}'!`,
        imageUrl: finalImageUrl,
        postId: post.id,
        slug: post.slug
      });
    }

    const blockIndex = posNum - 2;
    const rawBlocks = Array.isArray(post.blocks) ? (post.blocks as any[]) : [];

    if (blockIndex >= 0 && blockIndex < rawBlocks.length) {
      const updatedBlocks = [...rawBlocks];
      const targetBlock = { ...updatedBlocks[blockIndex] };
      targetBlock.image = finalImageUrl;

      if (targetBlock.text) {
        const placeholderRegex = new RegExp(`[\\{\\[]\\s*(?:id|img|image)\\s*=\\s*${posNum}\\s*[\\}\\]]`, "gi");
        targetBlock.text = targetBlock.text.replace(
          placeholderRegex,
          `<img src="${finalImageUrl}" alt="Imagem ${posNum}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`
        );
      }

      updatedBlocks[blockIndex] = targetBlock;

      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { blocks: updatedBlocks }
      });

      revalidatePath("/");
      revalidatePath(`/post/${updated.slug}`);
      return NextResponse.json({
        success: true,
        message: `Imagem da Posição ${posNum} (Bloco ${blockIndex + 1}) anexada com sucesso ao post '${post.title}'!`,
        imageUrl: finalImageUrl,
        postId: post.id,
        slug: post.slug
      });
    }

    return NextResponse.json({
      error: `Posição ${posNum} inválida. O post possui apenas ${rawBlocks.length} blocos de conteúdo.`
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao anexar imagem ao post", details: error.message }, { status: 500 });
  }
}
