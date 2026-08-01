import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/careers") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public");

  if (!req.auth && !isPublic) {
    if (isApi) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
