import { prisma } from "../../lib/db";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let posts: any[] = [];
  let pages: any[] = [];

  try {
    posts = await prisma.post.findMany({
      orderBy: { date: "desc" }
    });

    pages = await prisma.page.findMany({
      orderBy: { slug: "asc" }
    });
  } catch (error) {
    console.error("Erro ao carregar dados do admin:", error);
  }

  // Converter campos prisma Date para ISO string para evitar problemas de serialização client-side
  const serializedPosts = posts.map(p => ({
    ...p,
    date: p.date instanceof Date ? p.date.toISOString() : p.date,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }));

  const serializedPages = pages.map(p => ({
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }));

  return (
    <AdminDashboard 
      initialPosts={serializedPosts} 
      initialPages={serializedPages} 
    />
  );
}
