import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// GET: List comments for a post (by post ID or slug)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "O parametro postId e obrigatorio." }, { status: 400 });
    }

    // Buscar post pelo id ou slug
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
    console.error("Erro ao buscar comentarios:", error);
    return NextResponse.json({ error: "Erro interno ao carregar comentarios." }, { status: 500 });
  }
}

// POST: Add a new comment
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Voce precisa estar logado para comentar." }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (e) {
      return NextResponse.json({ error: "Sessao expirada ou invalida." }, { status: 401 });
    }

    const body = await request.json();
    const { content, postId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "O comentario nao pode estar vazio." }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "O postId e obrigatorio." }, { status: 400 });
    }

    // Buscar post pelo ID ou Slug
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
      return NextResponse.json({ error: "Post nao encontrado." }, { status: 404 });
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
    console.error("Erro ao criar comentario:", error);
    return NextResponse.json({ error: "Erro ao publicar comentario." }, { status: 500 });
  }
}
