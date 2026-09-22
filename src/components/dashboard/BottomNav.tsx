"use client";

import { motion } from "framer-motion";
import { CalendarClock, ClipboardList, Settings, Siren } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardTab = "accueil" | "actions" | "crex" | "parametres";

const TABS: { id: DashboardTab; label: string; icon: LucideIcon }[] = [
  { id: "actions", label: "Mes actions", icon: ClipboardList },
  { id: "crex", label: "Prochaine CREX", icon: CalendarClock },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

/**
 * Barre de navigation fixe.
 *
 * « Déclarer » est une action, pas un onglet : elle ouvre le stepper depuis
 * n'importe quel écran. Le retour à l'accueil se fait par l'avatar ou le
 * bouton maison de la barre supérieure.
 */
export function BottomNav({
  active,
  onSelect,
  onDeclare,
  pendingCount,
}: {
  active: DashboardTab;
  onSelect: (tab: DashboardTab) => void;
  onDeclare: () => void;
  pendingCount: number;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        <motion.button
          type="button"
          onClick={onDeclare}
          whileTap={{ scale: 0.93 }}
          className="relative flex min-h-18 flex-col items-center justify-center gap-1 px-2 py-2.5 text-alert"
        >
          <span className="relative grid size-9 place-items-center rounded-2xl bg-alert text-white">
            <Siren className="size-5" />
            {pendingCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-warn text-[10px] font-extrabold text-white">
                {pendingCount}
              </span>
            ) : null}
          </span>
          <span className="text-[11px] font-bold">Déclarer</span>
        </motion.button>

        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              whileTap={{ scale: 0.93 }}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-18 flex-col items-center justify-center gap-1 px-2 py-2.5",
                isActive ? "text-hospital" : "text-fg-muted",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-hospital"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <tab.icon className="size-5.5" />
              <span className="text-center text-[11px] font-bold leading-tight">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
