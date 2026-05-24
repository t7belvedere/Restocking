import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["fr", "en"] as const;
const DEFAULT_LOCALE = "fr";
const COOKIE_NAME = "restocking.locale";

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && LOCALES.includes(cookie as (typeof LOCALES)[number])) {
    return cookie;
  }
  // Check Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.toLowerCase().includes("fr")) return "fr";
  if (acceptLang.toLowerCase().includes("en")) return "en";
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, auth callbacks, Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|avif|xml|txt|css|js|json)$/)
  ) {
    return NextResponse.next();
  }

  // Check if the path already has a locale prefix: /en/... or /fr/...
  const localeMatch = pathname.match(/^\/(fr|en)(\/.*)?$/);
  if (localeMatch) {
    const locale = localeMatch[1];
    const cleanPath = localeMatch[2] || "/";

    // Rewrite to the clean path (internal, user doesn't see this)
    const response = NextResponse.rewrite(new URL(cleanPath, request.url));
    response.cookies.set(COOKIE_NAME, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    return response;
  }

  // No locale prefix — redirect to the appropriate locale
  const locale = getLocale(request);
  const newPath = locale === DEFAULT_LOCALE
    ? pathname
    : `/${locale}${pathname}`;

  if (newPath !== pathname) {
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Default locale, no prefix needed — set cookie and proceed
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, DEFAULT_LOCALE, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|auth|favicon\\.ico|icon\\.svg).*)"],
};
