"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, Wifi, WifiOff } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { cn } from "@/lib/utils";

/**
 * Badge d'état réseau.
 *
 * L'état réel n'est lisible qu'après hydratation : le store externe rend
 * « Connecté » côté serveur puis corrige la valeur sans mismatch.
 */
export function NetworkBadge({ className }: { className?: string }) {
  const { isOnline, pendingCount } = useAppState();

  const queued = pendingCount > 0;
  const tone = !isOnline
    ? "bg-warn/15 text-warn"
    : queued
      ? "bg-hospital/12 text-hospital"
      : "bg-success/15 text-success";

  const label = !isOnline
    ? queued
      ? `Hors-ligne — ${pendingCount} fiche${pendingCount > 1 ? "s" : ""} en attente`
      : "Mode hors-ligne"
    : queued
      ? "Synchronisation…"
      : "Connecté";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={label}
        initial={{ opacity: 0, y: -6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap",
          tone,
          className,
        )}
      >
        <motion.span
          className={cn(
            "size-2 rounded-full",
            !isOnline ? "bg-warn" : queued ? "bg-hospital" : "bg-success",
          )}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {!isOnline ? (
          <WifiOff className="size-3.5" />
        ) : queued ? (
          <CloudUpload className="size-3.5" />
        ) : (
          <Wifi className="size-3.5" />
        )}
        {label}
      </motion.span>
    </AnimatePresence>
  );
}
