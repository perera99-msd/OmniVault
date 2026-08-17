import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and public endpoints that should never be blocked
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/Logos") ||
    pathname.startsWith("/Backgrounds") ||
    pathname.startsWith("/icons") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  // Check for the HttpOnly session cookie
  const session = request.cookies.get("__session")?.value;

  if (!session) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/session (auth API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api/auth/session|_next/static|_next/image|favicon.ico|manifest.json|apple-icon.png|icon.png).*)",
  ],
};
