import { LegalPage } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales — restocking",
};

export default function MentionsLegalesPage() {
  return <LegalPage type="mentionsLegales" />;
}
