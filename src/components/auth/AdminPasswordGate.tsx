"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  ShieldAlert,
  ShieldPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppState } from "@/components/providers/AppStateProvider";
import { fadeUp } from "@/lib/motion";

/**
 * Empreinte SHA-256 du mot de passe attendu, jamais le mot de passe lui-même.
 *
 * Le dépôt étant public, y écrire le mot de passe en clair l'exposerait à
 * quiconque le consulte. L'empreinte évite cette fuite, mais ne rend pas
 * l'accès sûr pour autant : la vérification se fait dans le navigateur, elle
 * reste contournable. Ce garde écarte un visiteur de passage, rien de plus.
 *
 * Pour changer le mot de passe sans toucher au code, définir
 * `NEXT_PUBLIC_ADMIN_PASSWORD_HASH` (voir .env.example).
 */
const DEFAULT_HASH =
  "728f6ba445c867305d55e3dae547bd8baa609bb70c049200c9a37c55715d72fc";

const EXPECTED_HASH = (
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH ?? DEFAULT_HASH
).toLowerCase();

/** Casse et espaces tolérés : les claviers mobiles capitalisent d'eux-mêmes. */
function normalize(input: string) {
  return input.trim().toLowerCase();
}

async function digest(input: string) {
  const bytes = new TextEncoder().encode(normalize(input));
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function AdminPasswordGate() {
  const { signInAdmin } = useAppState();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = EXPECTED_HASH.length === 64;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      setError("Saisissez le mot de passe d'accès.");
      return;
    }
    // `crypto.subtle` n'existe qu'en contexte sécurisé (https ou localhost).
    if (typeof crypto === "undefined" || !crypto.subtle) {
      setError(
        "Vérification impossible : ouvrez cette page en HTTPS ou sur localhost.",
      );
      return;
    }
    setChecking(true);
    const hash = await digest(value);
    setChecking(false);
    if (hash !== EXPECTED_HASH) {
      setError("Mot de passe incorrect.");
      return;
    }
    setError(null);
    signInAdmin();
  };

  return (
    <div className="surface-gradient grid min-h-dvh place-items-center px-5 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-lift sm:p-9"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-ink text-on-ink">
            <ShieldPlus className="size-6" />
          </span>
          <ThemeToggle />
        </div>

        <h1 className="font-display mt-6 text-2xl font-extrabold text-fg">
          Console d&apos;administration
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Cet espace est réservé à la direction et aux référents qualité.
          Saisissez le mot de passe d&apos;accès pour continuer.
        </p>

        {configured ? (
          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
            <div className="relative">
              <Input
                name="adminPassword"
                label="Mot de passe d'accès"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={
                  visible
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute top-8.5 right-3 rounded-lg p-1.5 text-fg-muted transition-colors hover:text-fg"
              >
                {visible ? (
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
              disabled={checking}
            >
              {checking ? (
                <LoaderCircle className="size-4.5 animate-spin" />
              ) : (
                <Lock className="size-4.5" />
              )}
              {checking ? "Vérification…" : "Accéder à la console"}
            </Button>
          </form>
        ) : (
          /* Un garde qui s'ouvre quand il est mal configuré ne vaut rien. */
          <p className="mt-7 flex items-start gap-3 rounded-2xl bg-warn/12 px-4 py-3.5 text-sm leading-relaxed font-semibold text-warn">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            L&apos;accès n&apos;est pas configuré sur ce déploiement. Définissez
            la variable d&apos;environnement{" "}
            <code>NEXT_PUBLIC_ADMIN_PASSWORD_HASH</code>, puis relancez le
            build.
          </p>
        )}

        <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-fg-muted">
          Ce mot de passe filtre l&apos;accès mais ne constitue pas une sécurité
          : l&apos;application n&apos;a pas de serveur, la vérification se fait
          dans le navigateur et reste contournable. Ne vous y fiez pas pour
          protéger des données réelles de patients.
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Retour au site public
        </Link>
      </motion.div>
    </div>
  );
}
