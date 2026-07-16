import CategoryView from "../components/CategoryView";
import { prisma } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "equipamentos" }
    });
    if (!page) return {};
    return {
      title: `${page.seoTitle || page.title} · Moto na Prática`,
      description: page.seoDescription || "Análise sincera de jaquetas, capacetes, luvas e botas de proteção para motociclistas.",
    };
  } catch (e) {
    return {
      title: "Reviews de Equipamentos de Proteção · Moto na Prática",
    };
  }
}

export default async function EquipamentosPage() {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({
      where: { slug: "equipamentos" }
    });
  } catch (error) {
    console.error("Failed to query equipment page content", error);
  }

  const title = page?.title || "Equipamentos";
  const content = typeof page?.content === "string" 
    ? JSON.parse(page.content) 
    : (page?.content || {});

  const description = content.description || "Análise sincera de jaquetas, capacetes, luvas e botas de proteção para motociclistas.";
  const heroImg = content.heroImg || "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=560&fit=crop&auto=format";
  const iconName = content.iconName || "ShieldCheck";

  return (
    <CategoryView
      tag="Equipamentos"
      title={title}
      description={description}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
