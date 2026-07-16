import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se o usuário está tentando acessar alguma rota administrativa (/admin...)
  if (pathname.startsWith("/admin")) {
    // Pular a tela de login para evitar loops
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;
    
    if (!token) {
      // Sem token -> Redirecionar para login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Token inválido/expirado -> Limpar cookie e redirecionar
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Executar o middleware em todas as rotas de /admin
export const config = {
  matcher: ["/admin/:path*"],
};
