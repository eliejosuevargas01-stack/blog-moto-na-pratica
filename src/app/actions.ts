"use server";

import { prisma } from "../lib/db";
import { signToken, checkCredentials } from "../lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- AUTENTICAÇÃO ---

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  const isValid = checkCredentials(username, password);

  if (!isValid) {
    return { error: "Usuário ou senha incorretos." };
  }

  // Criar token de sessão e setar cookie
  const token = await signToken(username);
  
  cookies().set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete("admin_token");
  redirect("/admin/login");
}

// --- CRUD DE POSTS ---

export async function savePostAction(data: {
  id?: string;
  slug: string;
  tag: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  img: string;
  imgFocalPoint: string;
  blocks: { text: string; image: string; focalPoint: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}) {
  try {
    // Validar slug
    const existing = await prisma.post.findFirst({
      where: {
        slug: data.slug,
        id: data.id ? { not: data.id } : undefined
      }
    });

    if (existing) {
      return { error: "Já existe um post com esta URL (slug). Escolha outro." };
    }

    if (data.id) {
      // Atualização
      await prisma.post.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          tag: data.tag,
          category: data.category,
          title: data.title,
          excerpt: data.excerpt,
          readTime: data.readTime,
          img: data.img,
          imgFocalPoint: data.imgFocalPoint,
          blocks: data.blocks as any,
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.excerpt,
          seoKeywords: data.seoKeywords || ""
        }
      });
    } else {
      // Criação
      await prisma.post.create({
        data: {
          slug: data.slug,
          tag: data.tag,
          category: data.category,
          title: data.title,
          excerpt: data.excerpt,
          readTime: data.readTime,
          img: data.img,
          imgFocalPoint: data.imgFocalPoint,
          blocks: data.blocks as any,
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.excerpt,
          seoKeywords: data.seoKeywords || ""
        }
      });
    }

    // Revalidar caches públicos
    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    revalidatePath(`/post/${data.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar post:", error);
    return { error: "Erro interno ao salvar post no banco de dados." };
  }
}

export async function deletePostAction(id: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    await prisma.post.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    if (post) revalidatePath(`/post/${post.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { error: "Erro ao deletar post." };
  }
}

// --- CRUD DE PÁGINAS ---

export async function savePageAction(data: {
  id?: string;
  slug: string;
  title: string;
  isStatic: boolean;
  content: any;
  seoTitle?: string;
  seoDescription?: string;
}) {
  try {
    // Validar slug
    const existing = await prisma.page.findFirst({
      where: {
        slug: data.slug,
        id: data.id ? { not: data.id } : undefined
      }
    });

    if (existing) {
      return { error: "Já existe uma página com esta URL (slug). Escolha outro." };
    }

    if (data.id) {
      await prisma.page.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    } else {
      await prisma.page.create({
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    }

    // Revalidar rotas
    revalidatePath("/");
    revalidatePath("/sobre");
    revalidatePath(`/${data.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar página:", error);
    return { error: "Erro ao salvar página." };
  }
}

export async function deletePageAction(id: string) {
  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (page?.isStatic) {
      return { error: "Páginas fixas do sistema (Home e Sobre) não podem ser deletadas." };
    }
    
    await prisma.page.delete({ where: { id } });

    revalidatePath("/sitemap.xml");
    if (page) revalidatePath(`/${page.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar página:", error);
    return { error: "Erro ao deletar página." };
  }
}
