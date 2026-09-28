import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyUserToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    try {
      const decoded = await verifyUserToken(token);
      if (!decoded) {
        return NextResponse.json({ user: null });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      return NextResponse.json({ user });
    } catch (e) {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error("Erro ao checar sessão:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
