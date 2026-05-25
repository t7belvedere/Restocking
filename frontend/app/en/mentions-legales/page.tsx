import { LegalPage } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice — restocking",
};

export default function MentionsLegalesEnPage() {
  return <LegalPage type="mentionsLegales" />;
}
