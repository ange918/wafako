"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Microscope,
  Settings2,
  ShieldPlus,
  Siren,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { backdrop } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "cockpit"
  | "incidents"
  | "alarm"
  | "actions"
  | "crex"
  | "utilisateurs"
  | "configuration";

const ITEMS: { id: AdminSection; label: string; icon: LucideIcon }[] = [
  { id: "cockpit", label: "Cockpit", icon: LayoutDashboard },
  { id: "incidents", label: "Incidents EI", icon: Siren },
  { id: "alarm", label: "Analyse ALARM", icon: Microscope },
  { id: "actions", label: "Actions", icon: ClipboardList },
  { id: "crex", label: "CREX", icon: CalendarCheck },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users },
  { id: "configuration", label: "Configuration", icon: Settings2 },
];

interface NavProps {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}

/**
 * Contenu de navigation, partagé entre la barre fixe du bureau et le panneau
 * coulissant du mobile : la liste des sections n'existe qu'à un seul endroit.
 */
function NavContent({
  active,
  onSelect,
  layoutId,
  onClose,
}: NavProps & { layoutId: string; onClose?: () => void }) {
  return (
    <>
      <div className="flex h-18 items-center gap-2.5 px-6">
        <span className="grid size-9 place-items-center rounded-xl bg-white/12">
          <ShieldPlus className="size-5" />
        </span>
        <span className="font-display text-lg font-extrabold">SafeCare</span>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="ml-auto grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <p className="px-6 pt-4 pb-2 text-[11px] font-bold tracking-wide text-white/40 uppercase">
        Pilotage
      </p>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors",
                isActive ? "text-white" : "text-white/55 hover:text-white",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-2xl bg-white/12"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <item.icon className="relative size-5 shrink-0" />
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-white/55 transition-colors hover:text-white"
        >
          <LogOut className="size-5" />
          Quitter la console
        </Link>
      </div>
    </>
  );
}

/** Barre fixe, à partir de `lg`. */
export function Sidebar({ active, onSelect }: NavProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0a2540] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
      <NavContent
        active={active}
        onSelect={onSelect}
        layoutId="admin-nav-desktop"
      />
    </aside>
  );
}

/**
 * Panneau coulissant, en dessous de `lg`.
 *
 * Remplace l'ancienne rangée de pastilles en défilement horizontal, qui
 * masquait les dernières sections hors de l'écran.
 */
export function SidebarDrawer({
  open,
  onClose,
  active,
  onSelect,
}: NavProps & { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation de la console"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#0a2540] text-white shadow-lift"
          >
            <NavContent
              active={active}
              onSelect={(section) => {
                onSelect(section);
                onClose();
              }}
              layoutId="admin-nav-mobile"
              onClose={onClose}
            />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
