import CategoryView from "../components/CategoryView";
import { prisma } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "rotas" }
    });
    if (!page) return {};
    return {
      title: `${page.seoTitle || page.title} · Moto na Prática`,
      description: page.seoDescription || "Roteiros, estradas e viagens de moto. O asfalto, a terra e as dicas de cada quilômetro rodado.",
    };
  } catch (e) {
    return {
      title: "Rotas de Moto e Viagens · Moto na Prática",
    };
  }
}

export default async function RotasPage() {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({
      where: { slug: "rotas" }
    });
  } catch (error) {
    console.error("Failed to query rotas page content", error);
  }

  const title = page?.title || "Rotas";
  const content = typeof page?.content === "string" 
    ? JSON.parse(page.content) 
    : (page?.content || {});

  const description = content.description || "Roteiros, estradas e viagens de moto. O asfalto, a terra e as dicas de cada quilômetro rodado.";
  const heroImg = content.heroImg || "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1400&h=560&fit=crop&auto=format";
  const iconName = content.iconName || "Navigation";

  return (
    <CategoryView
      tag="Rotas"
      title={title}
      description={description}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
