import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Pega o cookie do usuário
  const userCookie = request.cookies.get("user")?.value;

  // Rotas protegidas
  const isClientRoute = request.nextUrl.pathname.startsWith("/cliente");
  const isSupportRoute = request.nextUrl.pathname.startsWith("/comum");

  // 1. Verificação de Autenticação
  // Se não houver cookie de usuário, redireciona para a página de login.
  if (!userCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Verificação de Autorização
  // Se o cookie existir, verificamos o tipo de usuário.
  try {
    const user = JSON.parse(userCookie);

    // Redireciona 'administrador' se tentar acessar uma rota de 'comum'
    if (user.tipo_usuario === "administrador" && isSupportRoute) {
      return NextResponse.redirect(new URL("/administrador", request.url));
    }

    // Redireciona 'comum' se tentar acessar uma rota de 'administrador'
    if (user.tipo_usuario === "comum" && isClientRoute) {
      return NextResponse.redirect(new URL("/comum", request.url));
    }
  } catch (error) {
    // Se o cookie estiver malformado, redireciona para o login por segurança.
    console.error("Erro ao decodificar o cookie do usuário:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se passou em todas as verificações, permite o acesso.
  return NextResponse.next();
}

export const config = {
  matcher: ["/administrador/:path*", "/comum/:path*"],
};
