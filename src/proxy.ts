import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  // Páginas exclusivas de quem está deslogado (landing e login).
  const isGuestOnly = pathname === "/" || pathname.startsWith("/login");

  const isPublic =
    isGuestOnly ||
    pathname.startsWith("/careers") ||
    // A pagina do convite cuida da sessao sozinha (mostra login sem perder
    // o token do convite no redirect).
    pathname.startsWith("/invite") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") ||
    // Webhook do Stripe: chamado pelo Stripe (sem sessao); a rota valida a
    // assinatura criptografica do evento.
    pathname.startsWith("/api/stripe/webhook");

  // Logado não acessa landing nem login: vai direto para o sistema.
  if (req.auth && isGuestOnly) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Deslogado não acessa o sistema: vai para o login.
  if (!req.auth && !isPublic) {
    if (isApi) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Página autenticada não pode ficar no bfcache do navegador: sem no-store, o
  // voltar/avançar reexibe o sistema (dashboard e nome) depois do logout.
  if (req.auth && !isPublic && !isApi) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
