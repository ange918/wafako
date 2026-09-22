"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CloudUpload,
  Pill,
  Signal,
  TriangleAlert,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Séquence rejouée en boucle dans le hero : une déclaration part hors-ligne,
 * s'empile dans la file locale, puis se synchronise au retour du réseau.
 */
type Phase = "online" | "offline" | "queued" | "syncing" | "synced";

const SEQUENCE: { phase: Phase; hold: number }[] = [
  { phase: "online", hold: 2200 },
  { phase: "offline", hold: 2000 },
  { phase: "queued", hold: 2400 },
  { phase: "syncing", hold: 1800 },
  { phase: "synced", hold: 2200 },
];

export function PhoneOfflineVisual() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const { phase } = SEQUENCE[index];

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % SEQUENCE.length),
      SEQUENCE[index].hold,
    );
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion]);

  const offline = phase === "offline" || phase === "queued";
  const queueCount =
    phase === "queued" || phase === "syncing" ? 2 : phase === "offline" ? 1 : 0;

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Halo décoratif */}
      <motion.div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[3rem] bg-vivid/18 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Châssis chrome, en écho au visuel de référence */}
      <div className="chrome-gradient rounded-[2.75rem] p-[3px] shadow-lift">
        <div className="relative overflow-hidden rounded-[2.6rem] bg-surface">
          {/* Encoche */}
          <div className="absolute left-1/2 top-2.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-ink/90" />

          {/* Barre d'état */}
          <div className="flex items-center justify-between px-6 pb-3 pt-4">
            <span className="text-[11px] font-semibold text-fg-muted">
              09:41
            </span>
            <motion.span
              animate={{ opacity: offline ? 0.35 : 1 }}
              className="text-fg-muted"
            >
              {offline ? (
                <WifiOff className="size-3.5" />
              ) : (
                <Signal className="size-3.5" />
              )}
            </motion.span>
          </div>

          {/* Badge d'état réseau */}
          <div className="px-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={offline ? "offline" : "online"}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22 }}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold",
                  offline
                    ? "bg-warn/15 text-warn"
                    : "bg-success/15 text-success",
                )}
              >
                <motion.span
                  className={cn(
                    "size-2 rounded-full",
                    offline ? "bg-warn" : "bg-success",
                  )}
                  animate={reduceMotion ? undefined : { scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                {offline
                  ? `Hors-ligne — ${queueCount} fiche${queueCount > 1 ? "s" : ""} en attente`
                  : "Connecté"}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Corps de l'écran */}
          <div className="space-y-3 p-4 pt-3">
            <div className="rounded-2xl bg-alert p-4 text-white shadow-soft">
              <p className="text-[11px] font-semibold uppercase opacity-80">
                Action rapide
              </p>
              <p className="font-display text-lg font-extrabold">
                Déclarer un EI
              </p>
              <p className="mt-0.5 text-[11px] opacity-85">
                3 clics — 40 secondes
              </p>
            </div>

            {/* File d'attente locale */}
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {Array.from({ length: Math.max(queueCount, 1) }).map((_, i) => {
                  const isSynced =
                    phase === "synced" || (phase === "online" && i === 0);
                  return (
                    <motion.div
                      key={`row-${i}`}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.28 }}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-muted px-3 py-2.5"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-hospital/12 text-hospital">
                        {i === 0 ? (
                          <Pill className="size-4" />
                        ) : (
                          <TriangleAlert className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-fg">
                          {i === 0
                            ? "Erreur médicamenteuse"
                            : "Chute de patient"}
                        </p>
                        <p className="text-[10px] text-fg-muted">Réanimation</p>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={`${phase}-${i}`}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.18 }}
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full",
                            isSynced
                              ? "bg-success/18 text-success"
                              : phase === "syncing"
                                ? "bg-hospital/15 text-hospital"
                                : "bg-warn/18 text-warn",
                          )}
                        >
                          {isSynced ? (
                            <Check className="size-3.5" />
                          ) : phase === "syncing" ? (
                            <motion.span
                              animate={
                                reduceMotion ? undefined : { rotate: 360 }
                              }
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="grid place-items-center"
                            >
                              <CloudUpload className="size-3.5" />
                            </motion.span>
                          ) : (
                            <span className="size-1.5 rounded-full bg-current" />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bandeau de synchronisation */}
            <AnimatePresence>
              {phase === "syncing" || phase === "synced" ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-[11px] font-bold",
                    phase === "synced"
                      ? "bg-success/15 text-success"
                      : "bg-hospital/12 text-hospital",
                  )}
                >
                  {phase === "synced"
                    ? "Toutes les fiches sont synchronisées"
                    : "Synchronisation en cours…"}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mx-auto mb-3 h-1 w-24 rounded-full bg-fg/15" />
        </div>
      </div>
    </div>
  );
}
