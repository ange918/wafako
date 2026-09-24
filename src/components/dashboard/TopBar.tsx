"use client";

import { motion } from "framer-motion";
import { House, Menu } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { NetworkBadge } from "./NetworkBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppState } from "@/components/providers/AppStateProvider";
import { HOSPITALS } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

export function TopBar({
  onHome,
  onOpenMenu,
}: {
  onHome: () => void;
  onOpenMenu: () => void;
}) {
  const { profile } = useAppState();
  const hospital = HOSPITALS.find((item) => item.id === profile.hospitalId);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Le menu latéral reprend les mêmes rubriques que la barre du bas. */}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu de navigation"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-colors hover:text-fg lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <motion.button
            type="button"
            onClick={onHome}
            whileTap={{ scale: 0.94 }}
            aria-label="Revenir à l'accueil"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-hospital font-display text-sm font-extrabold text-white"
          >
            {initials(profile.firstName, profile.lastName)}
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-extrabold text-fg">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate text-xs text-fg-muted">
              {profile.service} · {hospital?.name ?? "Établissement"}
            </p>
          </div>

          <button
            type="button"
            onClick={onHome}
            aria-label="Accueil"
            className="grid size-10 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-colors hover:text-fg"
          >
            <House className="size-5" />
          </button>
          <ThemeToggle />
          <NotificationBell />
        </div>

        <div className="mt-3">
          <NetworkBadge />
        </div>
      </div>
    </header>
  );
}
