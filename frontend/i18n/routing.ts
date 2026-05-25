import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en", "es", "de", "it"],
  defaultLocale: "fr",
  // / → fr (no prefix), /en/... → en, /es/... → es, etc.
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
