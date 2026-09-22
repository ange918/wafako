"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";

/**
 * Connexion simulée : aucune vérification d'identifiants, seule la présence
 * des champs est contrôlée avant la redirection.
 */
export function LoginForm({ variant }: { variant: "agent" | "admin" }) {
  const router = useRouter();
  const { signIn, signInAdmin } = useAppState();
  const isAdmin = variant === "admin";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Renseignez votre identifiant et votre mot de passe.");
      return;
    }
    setError(null);
    setSubmitting(true);
    // Session simulée : aucun identifiant n'est vérifié, mais l'accès aux
    // espaces connectés en dépend.
    if (isAdmin) signInAdmin();
    else signIn();
    router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <AuthShell
      title={isAdmin ? "Portail administrateur" : "Se connecter"}
      subtitle={
        isAdmin
          ? "Accès réservé aux référents qualité et à la direction de l'établissement."
          : "Retrouvez vos déclarations, vos actions et la prochaine réunion CREX de votre service."
      }
      footer={
        isAdmin ? (
          <Link
            href="/"
            className="font-semibold text-hospital hover:underline"
          >
            Retour au site public
          </Link>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-hospital hover:underline"
            >
              S&apos;inscrire
            </Link>
          </>
        )
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          name="identifier"
          label={
            isAdmin ? "Adresse e-mail professionnelle" : "E-mail ou téléphone"
          }
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder={isAdmin ? "qualite@cnhu.bj" : "a.dossou@cnhu.bj"}
        />

        <div className="relative">
          <Input
            name="password"
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute right-3 top-8.5 rounded-lg p-1.5 text-fg-muted transition-colors hover:text-fg"
          >
            {showPassword ? (
              <EyeOff className="size-4.5" />
            ) : (
              <Eye className="size-4.5" />
            )}
          </button>
        </div>

        {error ? (
          <p className="rounded-2xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant={isAdmin ? "primary" : "ink"}
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle className="size-4.5 animate-spin" />
          ) : (
            <LogIn className="size-4.5" />
          )}
          {submitting ? "Connexion…" : "Se connecter"}
        </Button>

        <p className="text-center text-xs text-fg-muted">
          Démonstration : n&apos;importe quel identifiant fonctionne.
        </p>
      </form>
    </AuthShell>
  );
}
