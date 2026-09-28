import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const decoded = await verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    if (comment.userId !== decoded.userId) {
      return NextResponse.json({ error: "Permissão negada." }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    return NextResponse.json({ error: "Erro ao deletar comentário." }, { status: 500 });
  }
}
