import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/auth";

// GET: List comments for a post (by post ID or slug)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "O parâmetro postId é obrigatório." }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id: String(postId) },
          { slug: String(postId) }
        ]
      },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json({ comments: [] });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json({ error: "Erro interno ao carregar comentários." }, { status: 500 });
  }
}

// POST: Add a new comment
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Você precisa estar logado para comentar." }, { status: 401 });
    }

    const decoded = await verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Sessão expirada ou inválida." }, { status: 401 });
    }

    const body = await request.json();
    const { content, postId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "O comentário não pode estar vazio." }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "O postId é obrigatório." }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id: String(postId) },
          { slug: String(postId) }
        ]
      },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        userId: decoded.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return NextResponse.json({ error: "Erro ao publicar comentário." }, { status: 500 });
  }
}
