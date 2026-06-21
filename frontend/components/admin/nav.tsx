"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/watches", label: "Alertes" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 ml-auto">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "border-2 px-4 py-2 font-bold text-sm transition-all",
              active
                ? "border-ink bg-ink text-cream shadow-brutal-sm"
                : "border-transparent hover:border-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
