import CategoryView from "../components/CategoryView";
import { prisma } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "manutencao" }
    });
    if (!page) return {};
    return {
      title: `${page.seoTitle || page.title} · Moto na Prática`,
      description: page.seoDescription || "Dicas de manutenção básica e preventiva de motos na garagem. Passo a passo simplificado para você fazer em casa.",
    };
  } catch (e) {
    return {
      title: "Manutenção Preventiva de Motos · Moto na Prática",
    };
  }
}

export default async function ManutencaoPage() {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({
      where: { slug: "manutencao" }
    });
  } catch (error) {
    console.error("Failed to query maintenance page content", error);
  }

  const title = page?.title || "Manutenção";
  const content = typeof page?.content === "string" 
    ? JSON.parse(page.content) 
    : (page?.content || {});

  const description = content.description || "Dicas de manutenção básica e preventiva de motos na garagem. Passo a passo simplificado para você fazer em casa.";
  const heroImg = content.heroImg || "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1400&h=560&fit=crop&auto=format";
  const iconName = content.iconName || "Wrench";

  return (
    <CategoryView
      tag="Manutenção"
      title={title}
      description={description}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
