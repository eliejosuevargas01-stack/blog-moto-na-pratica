import { MetadataRoute } from "next";
import { prisma } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.com.br";

  // Páginas estáticas nativas
  const routes = [
    "",
    "/sobre",
    "/reviews",
    "/manutencao",
    "/rotas",
    "/equipamentos"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Buscar páginas dinâmicas criadas pelo usuário
  let dbPages: any[] = [];
  try {
    dbPages = await prisma.page.findMany({
      where: { isStatic: false },
      select: { slug: true, updatedAt: true }
    });
  } catch (e) {
    console.warn("Failed to fetch pages for sitemap.", e);
  }

  const dynamicPageRoutes = dbPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Buscar todos os posts dinâmicos do banco
  let dbPosts: any[] = [];
  try {
    dbPosts = await prisma.post.findMany({
      select: { slug: true, updatedAt: true }
    });
  } catch (e) {
    console.warn("Failed to fetch posts for sitemap.", e);
  }

  const postRoutes = dbPosts.map((post) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...dynamicPageRoutes, ...postRoutes];
}
