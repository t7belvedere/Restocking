import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Migrate old cookie to next-intl's cookie
  const oldLocale = request.cookies.get("restocking.locale")?.value;
  if (oldLocale && routing.locales.includes(oldLocale as (typeof routing.locales)[number])) {
    response.cookies.set("NEXT_LOCALE", oldLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.cookies.delete("restocking.locale");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
