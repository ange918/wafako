"use client";

import { motion } from "framer-motion";
import { ArrowRight, Siren, Timer } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { useAppState } from "@/components/providers/AppStateProvider";

/** Carte d'appel à l'action principale : lancer une déclaration. */
export function MainActionCard({ onDeclare }: { onDeclare: () => void }) {
  const { isOnline } = useAppState();

  return (
    <motion.button
      type="button"
      onClick={onDeclare}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={EASE_OUT}
      className="relative w-full overflow-hidden rounded-3xl bg-alert p-6 text-left text-white shadow-lift"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/12"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-black/8"
      />

      <span className="relative flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/18">
          <Siren className="size-6" />
        </span>
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="grid size-9 place-items-center rounded-full bg-white/18"
        >
          <ArrowRight className="size-4.5" />
        </motion.span>
      </span>

      <span className="font-display relative mt-5 block text-2xl font-extrabold">
        Déclarer un événement indésirable
      </span>
      <span className="relative mt-1.5 block text-sm text-white/85">
        Trois étapes, moins d&apos;une minute. Horodatage automatique.
      </span>

      <span className="relative mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-xs font-bold">
          <Timer className="size-3.5" />
          ~40 secondes
        </span>
        {!isOnline ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-bold">
            Sera sauvegardé localement
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}
