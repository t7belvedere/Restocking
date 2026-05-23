import { LegalPage } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité — restocking",
};

export default function PrivacyPage() {
  return <LegalPage type="privacy" />;
}
