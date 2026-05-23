import { LegalPage } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies — restocking",
};

export default function CookiesPage() {
  return <LegalPage type="cookies" />;
}
