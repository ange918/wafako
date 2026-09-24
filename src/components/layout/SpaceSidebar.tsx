"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ShieldPlus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { backdrop } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface SidebarItem<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  /** Pastille de comptage, masquée à zéro. */
  count?: number;
}

interface SidebarProps<T extends string> {
  items: SidebarItem<T>[];
  active: T;
  onSelect: (id: T) => void;
  /** Intitulé de la rubrique, au-dessus de la navigation. */
  heading: string;
  /** Contenu libre sous la navigation : annuaire, rappel, statistiques. */
  extra?: React.ReactNode;
  /** Lien de sortie, en bas de barre. */
  exitHref?: string;
  exitLabel?: string;
}

/**
 * Navigation latérale commune aux quatre espaces.
 *
 * Barre fixe à partir de `lg`, panneau coulissant en dessous : le même
 * inventaire de rubriques sert les deux, pour qu'aucune section ne se perde
 * hors de l'écran sur un téléphone.
 */
function NavContent<T extends string>({
  items,
  active,
  onSelect,
  heading,
  extra,
  exitHref = "/",
  exitLabel = "Quitter l'espace",
  layoutId,
  onClose,
}: SidebarProps<T> & { layoutId: string; onClose?: () => void }) {
  return (
    <>
      <div className="flex h-18 shrink-0 items-center gap-2.5 px-6">
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
        {heading}
      </p>

      <nav className="space-y-1 px-3">
        {items.map((item) => {
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
              <span className="relative min-w-0 flex-1 text-left">
                {item.label}
              </span>
              {item.count ? (
                <span className="font-display relative grid min-w-6 place-items-center rounded-full bg-alert px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {extra ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-5">{extra}</div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href={exitHref}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-white/55 transition-colors hover:text-white"
        >
          <LogOut className="size-5" />
          {exitLabel}
        </Link>
      </div>
    </>
  );
}

/** Barre fixe, à partir de `lg`. */
export function SpaceSidebar<T extends string>(props: SidebarProps<T>) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0a2540] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
      <NavContent {...props} layoutId={`${props.heading}-desktop`} />
    </aside>
  );
}

/** Panneau coulissant, en dessous de `lg`. */
export function SpaceSidebarDrawer<T extends string>({
  open,
  onClose,
  ...props
}: SidebarProps<T> & { open: boolean; onClose: () => void }) {
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
            aria-label="Navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#0a2540] text-white shadow-lift"
          >
            <NavContent
              {...props}
              onSelect={(id) => {
                props.onSelect(id);
                onClose();
              }}
              layoutId={`${props.heading}-mobile`}
              onClose={onClose}
            />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
