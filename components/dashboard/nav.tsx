"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DashboardNavProps {
  user: User;
  plan: string;
}

export default function DashboardNav({ user, plan }: DashboardNavProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="font-semibold text-sm tracking-tight"
        >
          restocking.app
        </Link>

        <div className="flex items-center gap-3">
          {plan === "pro" ? (
            <Badge variant="default" className="text-xs">Pro</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Free</Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Mon compte</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {plan === "free" && (
                <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                  Passer à Pro — 7,99€/mois
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
              >
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
