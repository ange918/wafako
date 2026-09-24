"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";

/**
 * Connexion docteur.
 *
 * Le mot de passe n'est pas vérifié — il n'y a pas de serveur — mais
 * l'adresse doit correspondre à un compte docteur créé sur cet appareil :
 * c'est elle qui désigne le docteur dont on ouvre le tableau de bord.
 */
export function DoctorLoginForm() {
  const router = useRouter();
  const { doctors, signInDoctor } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Renseignez votre adresse e-mail et votre mot de passe.");
      return;
    }
    const match = doctors.find(
      (doctor) => doctor.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!match) {
      setError(
        "Aucun compte docteur ne correspond à cette adresse sur cet appareil.",
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    signInDoctor(match.id);
    router.push("/docteur");
  };

  return (
    <AuthShell
      title="Espace docteur"
      subtitle="Retrouvez les déclarations qui vous sont transmises, vos actions et les réunions convoquées."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/docteur/inscription"
            className="font-semibold text-hospital hover:underline"
          >
            S&apos;inscrire comme docteur
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          name="doctorEmail"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="s.agbodjan@cnhu.bj"
        />
        <Input
          name="doctorPassword"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Votre mot de passe"
        />

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
          Le mot de passe n&apos;est pas vérifié dans cette maquette : sans
          serveur, aucun identifiant ne peut l&apos;être.
        </p>
      </form>
    </AuthShell>
  );
}
