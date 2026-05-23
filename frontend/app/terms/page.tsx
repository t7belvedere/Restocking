import { LegalPage } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — restocking",
};

export default function TermsPage() {
  return <LegalPage type="terms" />;
}
