import { PrismaClient } from "@prisma/client";
import { processImageBase64, saveOptimizedImageBuffer } from "../src/lib/image-utils";
import fs from "fs";
import path from "path";

import { toNumericGroupId } from "../src/app/data";

const prisma = new PrismaClient();

function isDefaultImage(url?: string | null): boolean {
  if (!url) return true;
  if (url.includes("unsplash.com")) return true;
  return false;
}

/**
 * AÇÃO 1: Fazer upload de uma imagem ANTES de criar/enviar os posts.
 * Aceita uma string Base64 ou um caminho para arquivo local no disco.
 * Retorna a URL final da imagem salva.
 */
export async function uploadImageFirst(imageInput: string | Buffer): Promise<string> {
  if (typeof imageInput === "string") {
    if (imageInput.startsWith("data:image") || imageInput.length > 300) {
      // Processar string Base64
      return await processImageBase64(imageInput);
    } else if (fs.existsSync(imageInput)) {
      // Ler arquivo de imagem do disco local
      const buffer = fs.readFileSync(imageInput);
      return await saveOptimizedImageBuffer(buffer);
    } else if (imageInput.startsWith("http")) {
      return imageInput;
    }
  } else if (Buffer.isBuffer(imageInput)) {
    return await saveOptimizedImageBuffer(imageInput);
  }
  throw new Error("Formato de imagem inválido. Envie um caminho de arquivo, Base64 ou Buffer.");
}

export interface PostVersionData {
  title: string;
  summary?: string;
  tag?: string;
  category?: string;
  blocksText?: string[]; // Array de textos para os blocos
  [key: string]: any;
}

export interface MultiLangPostPayload {
  groupId?: string; // translationGroupId compartilhado
  images: {
    hero?: string | Buffer; // Imagem 1 (Featured)
    [key: string]: string | Buffer | undefined; // img-2, img-3, etc. (ou índices '2', '3')
  };
  posts: {
    pt?: PostVersionData;
    en?: PostVersionData;
    es?: PostVersionData;
  };
}

/**
 * AÇÃO 2: Fluxo Completo: Enviar Imagens Primeiro -> Enviar Posts Depois.
 * 1. Faz upload/processamento de todas as imagens informadas.
 * 2. Preenche automaticamente as URLs das imagens nos payloads de todas as línguas (PT, EN, ES).
 * 3. Salva/Atualiza os posts no banco de dados garantindo que todas as versões fiquem com as imagens reais.
 */
export async function sendImagesThenPosts(payload: MultiLangPostPayload) {
  console.log("=== FLUXO: ENVIANDO IMAGENS PRIMEIRO, DEPOIS POSTS ===");
  const groupId = toNumericGroupId(payload.groupId);
  const uploadedImageUrls: Record<string, string> = {};

  // Step 1: Upload / Processar Imagens Primeiro
  console.log("\n1. Processando e fazendo upload das imagens...");
  for (const [key, imgVal] of Object.entries(payload.images)) {
    if (!imgVal) continue;
    const keyNormalized = key === "hero" ? "img-1" : key.startsWith("img-") ? key : `img-${key}`;
    console.log(`   -> Uploading ${keyNormalized}...`);
    const imageUrl = await uploadImageFirst(imgVal);
    uploadedImageUrls[keyNormalized] = imageUrl;
    console.log(`      URL gerada: ${imageUrl}`);
  }

  // Step 2: Construir o objeto output multi-idioma com as URLs das imagens já vinculadas
  console.log("\n2. Vinculando URLs reais das imagens a todas as versões de idioma (PT, EN, ES)...");
  const outputData: Record<string, any> = { id: groupId };

  const langs: Array<"pt" | "en" | "es"> = ["pt", "en", "es"];
  for (const lang of langs) {
    const postData = payload.posts[lang];
    if (!postData || !postData.title) continue;

    const langObj: Record<string, any> = {
      title: postData.title,
      summary: postData.summary || postData.title,
      tag: postData.tag || "Reviews",
      category: postData.category || "Notícias",
      ...uploadedImageUrls, // Copiar todas as imagens (img-1, img-2, img-3, etc) para o idioma
    };

    if (postData.blocksText && Array.isArray(postData.blocksText)) {
      postData.blocksText.forEach((text, i) => {
        langObj[`block-${i + 1}`] = text;
      });
    }

    outputData[lang] = langObj;
  }

  // Step 3: Salvar Posts no Banco via API/Prisma
  console.log("\n3. Criando/Atualizando posts no banco de dados...");
  const response = await fetch("http://localhost:3000/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_SECRET_KEY || "motonapratica-secret-key-2026",
    },
    body: JSON.stringify({ output: outputData }),
  }).catch(() => null);

  if (response && response.ok) {
    const resData = await response.json();
    console.log("✅ Post enviado via API com sucesso!", resData);
    return resData;
  } else {
    console.log("ℹ️ API HTTP não respondeu (dev server pode estar offline). Salvando diretamente via Prisma client...");
    // Fallback de escrita direta via Prisma
    const createdPosts: any[] = [];
    for (const lang of langs) {
      const langData = outputData[lang];
      if (!langData || !langData.title) continue;

      const slugBase = langData.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
      let slug = slugBase;
      let counter = 1;
      while (await prisma.post.findUnique({ where: { slug } })) {
        counter++;
        slug = `${slugBase}-${counter}`;
      }

      const featuredImg = langData["img-1"] || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";
      const blocks: any[] = [];

      for (let i = 1; i <= 20; i++) {
        const rawText = langData[`block-${i}`];
        if (!rawText) continue;
        const blockImg = langData[`img-${i + 1}`] || "";
        blocks.push({
          text: rawText,
          image: blockImg,
          focalPoint: "center",
        });
      }

      const post = await prisma.post.upsert({
        where: { slug },
        update: {
          title: langData.title,
          excerpt: langData.summary,
          img: featuredImg,
          blocks,
          translationGroupId: groupId,
          lang,
        },
        create: {
          slug,
          tag: langData.tag || "Reviews",
          category: langData.category || "Notícias",
          title: langData.title,
          excerpt: langData.summary,
          readTime: "5 min",
          img: featuredImg,
          blocks,
          translationGroupId: groupId,
          lang,
          date: new Date(),
        },
      });
      createdPosts.push(post);
    }
    console.log(`✅ ${createdPosts.length} post(s) salvos diretamente no banco! GroupId: ${groupId}`);
    return { success: true, posts: createdPosts };
  }
}

/**
 * AÇÃO 3: Verificar Posts do Banco de Dados e Atualizar Imagens Default por Imagens Reais
 */
export async function syncAndFixDefaultImagesInDB() {
  console.log("\n=== VERIFICANDO E CORRIGINDO IMAGENS DEFAULT NO BANCO DE DADOS ===");

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      lang: true,
      title: true,
      img: true,
      audioUrl: true,
      translationGroupId: true,
      createdAt: true,
      blocks: true,
    },
  });

  const groups: Record<string, typeof posts> = {};
  for (const p of posts) {
    const key = p.translationGroupId || p.id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  let updatedCount = 0;

  for (const [groupId, groupPosts] of Object.entries(groups)) {
    let realFeaturedImg: string | null = null;

    for (const p of groupPosts) {
      if (!isDefaultImage(p.img)) {
        realFeaturedImg = p.img;
      }
    }

    const realBlockImgs: Record<number, string> = {};
    for (const p of groupPosts) {
      const blocks = Array.isArray(p.blocks) ? (p.blocks as any[]) : [];
      blocks.forEach((b: any, idx: number) => {
        if (b.image && !isDefaultImage(b.image) && !realBlockImgs[idx]) {
          realBlockImgs[idx] = b.image;
        }
      });
    }

    for (const p of groupPosts) {
      let needUpdate = false;
      let newFeaturedImg = p.img;
      const blocks = Array.isArray(p.blocks) ? (p.blocks as any[]) : [];
      const newBlocks = [...blocks];

      if (isDefaultImage(p.img) && realFeaturedImg) {
        newFeaturedImg = realFeaturedImg;
        needUpdate = true;
      }

      newBlocks.forEach((b: any, idx: number) => {
        const currentImg = b.image;
        const realImgForBlock = realBlockImgs[idx];
        if (isDefaultImage(currentImg) && realImgForBlock) {
          newBlocks[idx] = {
            ...b,
            image: realImgForBlock,
          };
          needUpdate = true;
        }
      });

      if (needUpdate) {
        console.log(`  -> Atualizando post [${p.lang}] "${p.title}" (ID: ${p.id})...`);
        await prisma.post.update({
          where: { id: p.id },
          data: {
            img: newFeaturedImg,
            blocks: newBlocks,
          },
        });
        updatedCount++;
      }
    }
  }

  console.log(`✅ Sincronização concluída! ${updatedCount} post(s) atualizado(s) com imagens reais.`);
}

// Execução CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--sync") || args.length === 0) {
    await syncAndFixDefaultImagesInDB();
  }

  if (args.includes("--example")) {
    // Demonstração do envio de imagens primeiro, depois posts
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await sendImagesThenPosts({
      groupId: "teste-envio-imagens-primeiro",
      images: {
        hero: dummyBase64,
        "2": dummyBase64,
      },
      posts: {
        pt: { title: "Post Teste PT", summary: "Resumo PT", blocksText: ["Texto bloco 1", "Texto bloco 2"] },
        en: { title: "Post Test EN", summary: "Summary EN", blocksText: ["Block 1 text", "Block 2 text"] },
        es: { title: "Post Test ES", summary: "Resumen ES", blocksText: ["Texto bloque 1", "Texto bloque 2"] },
      },
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
