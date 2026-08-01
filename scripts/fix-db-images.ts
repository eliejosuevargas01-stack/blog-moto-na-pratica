import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function main() {
  console.log("Iniciando limpeza e normalização de URLs de imagens no banco de dados...");

  const posts = await prisma.post.findMany();
  let updatedCount = 0;

  for (const post of posts) {
    let needsUpdate = false;
    let newImg = post.img;
    let newBlocks = post.blocks;

    // Normalizar img principal
    if (newImg && typeof newImg === "string") {
      if (newImg.includes("/uploads/")) {
        const filename = newImg.split("/uploads/").pop()?.split("?")[0];
        if (filename) {
          const filePath = path.join(UPLOADS_DIR, filename);
          // Se o arquivo não existir localmente no servidor e for uma URL quebrada, fallback seguro
          if (fs.existsSync(filePath)) {
            newImg = `/uploads/${filename}`;
          } else {
            console.log(`[Post #${post.id}] Imagem de upload '${filename}' não existe em disco. Usando fallback default.`);
            newImg = DEFAULT_IMAGE;
          }
          needsUpdate = true;
        }
      }
    } else {
      newImg = DEFAULT_IMAGE;
      needsUpdate = true;
    }

    // Normalizar blocos de conteúdo
    if (newBlocks) {
      let bList: any[] = [];
      if (Array.isArray(newBlocks)) bList = newBlocks;
      else if (typeof newBlocks === "string") {
        try { bList = JSON.parse(newBlocks); } catch (e) {}
      }

      const updatedBlocks = bList.map((b: any) => {
        if (!b) return b;
        let bImg = b.image;
        if (bImg && typeof bImg === "string" && bImg.includes("/uploads/")) {
          const filename = bImg.split("/uploads/").pop()?.split("?")[0];
          if (filename) {
            const filePath = path.join(UPLOADS_DIR, filename);
            if (fs.existsSync(filePath)) {
              bImg = `/uploads/${filename}`;
            } else {
              bImg = ""; // Limpar se não existir
            }
            needsUpdate = true;
          }
        }
        return {
          ...b,
          image: bImg
        };
      });

      if (needsUpdate) {
        newBlocks = updatedBlocks;
      }
    }

    if (needsUpdate) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          img: newImg,
          blocks: newBlocks
        }
      });
      updatedCount++;
      console.log(`✔ Post #${post.id} (${post.slug}) atualizado com sucesso! Imagem: ${newImg}`);
    }
  }

  console.log(`\nConcluído! Total de ${updatedCount} posts limpos e atualizados.`);
}

main()
  .catch((e) => {
    console.error("Erro na migração de imagens:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
