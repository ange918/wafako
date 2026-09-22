"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldPlus } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

/**
 * Route de déconnexion.
 *
 * Fermer la session depuis une page protégée déclencherait son garde d'accès,
 * qui redirigerait vers la connexion avant que la navigation vers l'accueil
 * n'aboutisse. Cette page, elle, n'est pas protégée : la session peut y être
 * fermée sans course.
 */
export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAppState();

  useEffect(() => {
    signOut();
    router.replace("/");
  }, [signOut, router]);

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
        <p className="text-sm font-semibold text-fg-muted">Déconnexion…</p>
      </div>
    </div>
  );
}
