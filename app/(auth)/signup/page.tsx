"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">📬</div>
          <h2 className="text-2xl font-bold">Vérifie ton email</h2>
          <p className="text-muted-foreground text-sm">
            On a envoyé un lien de confirmation à{" "}
            <strong>{email}</strong>. Clique dessus pour activer ton compte.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-semibold text-lg tracking-tight">
            restocking.app
          </Link>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              Se connecter
            </Link>
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création du compte…" : "Créer mon compte gratuitement"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            En créant un compte, tu acceptes nos{" "}
            <Link href="/terms" className="underline underline-offset-2">conditions</Link>
            {" "}et notre{" "}
            <Link href="/privacy" className="underline underline-offset-2">politique de confidentialité</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
