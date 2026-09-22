"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldPlus } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

type Space = "agent" | "admin";

const LOGIN_PATH: Record<Space, string> = {
  agent: "/login",
  admin: "/admin/login",
};

const HOME_PATH: Record<Space, string> = {
  agent: "/dashboard",
  admin: "/admin/dashboard",
};

/** Écran d'attente pendant la lecture de la session ou une redirection. */
function Splash({ label }: { label: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.span
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="grid size-12 place-items-center rounded-2xl bg-hospital text-white"
        >
          <ShieldPlus className="size-6" />
        </motion.span>
        <p className="text-sm font-semibold text-fg-muted">{label}</p>
      </div>
    </div>
  );
}

/**
 * Protège les espaces connectés.
 *
 * Aucune déclaration n'est possible sans compte : un visiteur non authentifié
 * est renvoyé vers la connexion. La redirection attend `hydrated`, sinon un
 * utilisateur déjà connecté serait éjecté avant la lecture du stockage.
 */
export function RequireAuth({
  space,
  children,
}: {
  space: Space;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hydrated, isAuthenticated, isAdminAuthenticated } = useAppState();
  const allowed = space === "admin" ? isAdminAuthenticated : isAuthenticated;

  useEffect(() => {
    if (hydrated && !allowed) router.replace(LOGIN_PATH[space]);
  }, [hydrated, allowed, router, space]);

  if (!hydrated) return <Splash label="Vérification de votre session…" />;
  if (!allowed) return <Splash label="Connexion requise — redirection…" />;

  return <>{children}</>;
}

/**
 * Inverse du précédent : évite qu'un utilisateur déjà connecté retombe sur un
 * formulaire de connexion.
 */
export function RedirectIfAuthenticated({
  space,
  children,
}: {
  space: Space;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hydrated, isAuthenticated, isAdminAuthenticated } = useAppState();
  const signedIn = space === "admin" ? isAdminAuthenticated : isAuthenticated;

  useEffect(() => {
    if (hydrated && signedIn) router.replace(HOME_PATH[space]);
  }, [hydrated, signedIn, router, space]);

  if (hydrated && signedIn) {
    return <Splash label="Vous êtes déjà connecté — redirection…" />;
  }

  return <>{children}</>;
}
