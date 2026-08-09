import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  const isGuestOnly = pathname === "/" || pathname.startsWith("/login");

  const isPublic =
    isGuestOnly ||
    pathname.startsWith("/careers") ||

    pathname.startsWith("/invite") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") ||

    pathname.startsWith("/api/stripe/webhook");

  if (req.auth && isGuestOnly) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (!req.auth && !isPublic) {
    if (isApi) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (req.auth && !isPublic && !isApi) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
