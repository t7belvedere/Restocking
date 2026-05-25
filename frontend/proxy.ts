import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const GEO_LOCALE: Record<string, (typeof routing.locales)[number]> = {
  // fr
  FR: "fr", MC: "fr", LU: "fr", BE: "fr", DZ: "fr", MA: "fr", TN: "fr", CI: "fr", SN: "fr", CM: "fr", BF: "fr", ML: "fr", GN: "fr", BJ: "fr", CG: "fr", GA: "fr", TD: "fr", NE: "fr", TG: "fr", CD: "fr", RW: "fr", BI: "fr", MG: "fr", MU: "fr", HT: "fr", GF: "fr", GP: "fr", MQ: "fr", NC: "fr", PF: "fr",
  // en
  GB: "en", US: "en", CA: "en", AU: "en", NZ: "en", IE: "en", IN: "en", NG: "en", PK: "en", PH: "en", ZA: "en", KE: "en", GH: "en", SG: "en", JM: "en", TT: "en",
  // es
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", GQ: "es",
  // de
  DE: "de", AT: "de", LI: "de", CH: "de",
  // it
  IT: "it", SM: "it", VA: "it",
};

function negotiateLocale(request: NextRequest): (typeof routing.locales)[number] {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && routing.locales.includes(cookie as (typeof routing.locales)[number])) {
    return cookie as (typeof routing.locales)[number];
  }

  // Vercel geo-IP (production only)
  const country = (request as any).geo?.country as string | undefined;
  if (country && GEO_LOCALE[country]) {
    return GEO_LOCALE[country];
  }

  const header = request.headers.get("accept-language");
  if (header) {
    for (const entry of header.split(",")) {
      const code = entry.split(";")[0].trim().slice(0, 2).toLowerCase();
      if (routing.locales.includes(code as (typeof routing.locales)[number])) {
        return code as (typeof routing.locales)[number];
      }
    }
  }

  return routing.defaultLocale;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] ?? "";

  const isLocalePrefix =
    firstSegment.length > 0 && routing.locales.includes(firstSegment as (typeof routing.locales)[number]);

  if (isLocalePrefix && firstSegment !== routing.defaultLocale) {
    // /en/terms → redirect to /terms with NEXT_LOCALE cookie set
    const rest = segments.length > 1 ? "/" + segments.slice(1).join("/") : "/";
    const res = NextResponse.redirect(new URL(rest, request.url));
    res.cookies.set("NEXT_LOCALE", firstSegment, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  if (isLocalePrefix && firstSegment === routing.defaultLocale) {
    // /fr/terms → redirect to /terms (default locale, no prefix needed)
    const rest = segments.length > 1 ? "/" + segments.slice(1).join("/") : "/";
    return NextResponse.redirect(new URL(rest, request.url));
  }

  // No locale prefix — detect locale, pass through
  const locale = negotiateLocale(request);
  const res = NextResponse.next();

  // Only set cookie if it changed or doesn't exist (skip for POST/Server Actions)
  const existingCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (request.method !== "POST" && existingCookie !== locale) {
    res.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }

  if (request.cookies.get("restocking.locale")) {
    res.cookies.delete("restocking.locale");
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
