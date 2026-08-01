import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mapeamento de coleções de imagens temáticas do Unsplash para motos
const THEMATIC_IMAGES: Record<string, { hero: string; blocks: string[] }> = {
  // 1. Yamaha MT Series
  mt: {
    hero: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1568772445695-9261358dbb2c?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 2. Honda CB 300F Twister
  twister: {
    hero: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 3. Pedro Acosta / MotoGP / Corridas
  motogp: {
    hero: "https://images.unsplash.com/photo-1568772445960-e41f9d45a90d?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1515777315835-281b94c9589f?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 4. Motos 160cc
  "160cc": {
    hero: "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1568772445695-9261358dbb2c?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 5. Motos Clássicas / Vintage / Emissões
  classica: {
    hero: "https://images.unsplash.com/photo-1558981803-757c66141445?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 6. Financiamento / Move Brasil / Honda 48x
  financiamento: {
    hero: "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 7. Kawasaki Z400 / Naked Comparativo
  naked: {
    hero: "https://images.unsplash.com/photo-1568772445695-9261358dbb2c?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=680&fit=crop&auto=format"
    ]
  },
  // 8. Geral / Fallback de Alta Qualidade
  default: {
    hero: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&h=680&fit=crop&auto=format",
    blocks: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=680&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&h=680&fit=crop&auto=format"
    ]
  }
};

function getThemeForPost(slug: string, title: string): { hero: string; blocks: string[] } {
  const text = `${slug} ${title}`.toLowerCase();

  if (text.includes("mt-") || text.includes("mt0") || text.includes("mt series") || text.includes("yamaha mt")) return THEMATIC_IMAGES.mt;
  if (text.includes("twister") || text.includes("cb 300f") || text.includes("cb300")) return THEMATIC_IMAGES.twister;
  if (text.includes("acosta") || text.includes("motogp") || text.includes("ducati 2027") || text.includes("marquez") || text.includes("paddock")) return THEMATIC_IMAGES.motogp;
  if (text.includes("160cc") || text.includes("160 cc") || text.includes("cg 160")) return THEMATIC_IMAGES["160cc"];
  if (text.includes("classica") || text.includes("clásica") || text.includes("classic") || text.includes("emiss") || text.includes("emisiones")) return THEMATIC_IMAGES.classica;
  if (text.includes("move brasil") || text.includes("financi") || text.includes("48x") || text.includes("trap") || text.includes("armadilha")) return THEMATIC_IMAGES.financiamento;
  if (text.includes("z400") || text.includes("duke") || text.includes("naked")) return THEMATIC_IMAGES.naked;

  return THEMATIC_IMAGES.default;
}

async function main() {
  console.log("🚀 Restaurando imagens curadas de alta qualidade para todos os posts...");

  const posts = await prisma.post.findMany();
  let updatedCount = 0;

  for (const post of posts) {
    // Manter as imagens dos posts semente originais que já possuem fotos perfeitas
    if (
      post.slug === "fazer-250-solid-grey-2026-6-meses" ||
      post.slug === "troca-oleo-fz25-passo-a-passo" ||
      post.slug === "serra-da-canastra-de-moto" ||
      post.slug === "hjc-rpha-11-pro-review-1-ano" ||
      post.slug === "michelin-pilot-street-2-fazer" ||
      post.slug === "kit-relampago-manutencao-preventiva"
    ) {
      console.log(`⏩ Mantendo post semente original: ${post.slug}`);
      continue;
    }

    const theme = getThemeForPost(post.slug, post.title);

    // Atualizar blocos
    const rawBlocks = Array.isArray(post.blocks) ? (post.blocks as any[]) : [];
    const updatedBlocks = rawBlocks.map((b: any, idx: number) => {
      if (!b) return b;
      // Atribuir imagem de bloco se estiver vazia ou com fallback padrão
      const blockImg = theme.blocks[idx % theme.blocks.length];
      return {
        ...b,
        image: b.image && !b.image.includes("photo-1568772585407-9361f9bf3a87") ? b.image : blockImg
      };
    });

    await prisma.post.update({
      where: { id: post.id },
      data: {
        img: theme.hero,
        blocks: updatedBlocks
      }
    });

    updatedCount++;
    console.log(`✅ [${post.lang || "pt"}] "${post.title}" -> Imagem atribuída com sucesso!`);
  }

  console.log(`\n🎉 Concluído! ${updatedCount} posts foram restaurados com fotos curadas de motocicletas!`);
}

main()
  .catch((e) => {
    console.error("Erro ao restaurar imagens:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
