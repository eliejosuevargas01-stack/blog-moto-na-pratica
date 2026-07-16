import CategoryView from "../components/CategoryView";
import { prisma } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "reviews" }
    });
    if (!page) return {};
    return {
      title: `${page.seoTitle || page.title} · Moto na Prática`,
      description: page.seoDescription || "Avaliações honestas de motos, pneus, capacetes e acessórios. Comprei, usei e conto o que realmente aconteceu.",
    };
  } catch (e) {
    return {
      title: "Reviews de Motos e Equipamentos · Moto na Prática",
    };
  }
}

export default async function ReviewsPage() {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({
      where: { slug: "reviews" }
    });
  } catch (error) {
    console.error("Failed to query reviews page content", error);
  }

  const title = page?.title || "Reviews";
  const content = typeof page?.content === "string" 
    ? JSON.parse(page.content) 
    : (page?.content || {});

  const description = content.description || "Reviews honestos de peças, acessórios e motos feitos por quem usa no dia a dia, sem patrocínio.";
  const heroImg = content.heroImg || "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=560&fit=crop&auto=format";
  const iconName = content.iconName || "Star";

  return (
    <CategoryView
      tag="Review"
      title={title}
      description={description}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
