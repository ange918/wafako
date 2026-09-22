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
 * Connexion soignant.
 *
 * Les identifiants ne sont pas vérifiés — il n'y a pas de serveur — mais un
 * compte doit exister sur cet appareil, sans quoi la session ouvrirait un
 * profil vide. L'espace administrateur, lui, passe par son propre garde par
 * mot de passe sur `/admin/dashboard`.
 */
export function LoginForm() {
  const router = useRouter();
  const { signIn, hasAccount } = useAppState();
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
    if (!hasAccount) {
      setError(
        "Aucun compte n'existe sur cet appareil. Créez-en un pour commencer à déclarer.",
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    signIn();
    router.push("/dashboard");
  };

  return (
    <AuthShell
      title="Se connecter"
      subtitle="Retrouvez vos déclarations, vos actions et la prochaine réunion CREX de votre service."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-hospital hover:underline"
          >
            S&apos;inscrire
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          name="identifier"
          label="E-mail ou téléphone"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="votre e-mail ou numéro"
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
            className="absolute top-8.5 right-3 rounded-lg p-1.5 text-fg-muted transition-colors hover:text-fg"
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
          variant="ink"
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

        <p className="text-center text-xs leading-relaxed text-fg-muted">
          Les identifiants ne sont pas vérifiés, mais un compte doit avoir été
          créé sur cet appareil.
        </p>
      </form>
    </AuthShell>
  );
}
