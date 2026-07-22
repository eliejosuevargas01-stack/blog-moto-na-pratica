import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { revalidatePath } from "next/cache";
import { triggerN8nWebhook } from "../../actions";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: Request) {
  try {
    // Autenticação da API via Header ou Query String
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const body = await req.json();
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
    } = body;

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() || generateSlug(title);

    // Verificar se já existe slug idêntico
    const existing = await prisma.post.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Já existe um post com o slug '${finalSlug}'. Escolha um slug diferente.` },
        { status: 400 }
      );
    }

    // Criar o post
    const post = await prisma.post.create({
      data: {
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
        date: new Date(),
      },
    });

    // Revalidar caches públicos do Next.js
    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/eventos");
    revalidatePath(`/post/${finalSlug}`);
    revalidatePath("/sitemap.xml");

    // Acionar Webhook do n8n (caso esteja configurado)
    try {
      await triggerN8nWebhook(post);
    } catch (e) {
      console.warn("Webhook n8n não disparado:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Post criado com sucesso via automação API!",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online"}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API de automação de posts:", error);
    return NextResponse.json({ error: "Erro interno ao processar automação.", details: error.message }, { status: 500 });
  }
}
