import { type NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "restocking.locale";
const SUPPORTED_LOCALES = ["fr", "en"];

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("fr")) return "fr";

  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon.svg") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle /en/... prefixed routes
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const targetPath = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    const response = NextResponse.rewrite(new URL(targetPath, request.url));
    response.cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // For non-prefixed routes, set locale from cookie or accept-language header
  const locale = getLocale(request);
  const response = NextResponse.next();
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
