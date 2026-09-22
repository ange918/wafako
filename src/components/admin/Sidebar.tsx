"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

export function Sidebar({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0a2540] text-white lg:flex lg:fixed lg:inset-y-0 lg:left-0">
      <div className="flex h-18 items-center gap-2.5 px-6">
        <span className="grid size-9 place-items-center rounded-xl bg-white/12">
          <ShieldPlus className="size-5" />
        </span>
        <span className="font-display text-lg font-extrabold">
          SafeCare<span className="text-[#62b0e8]"> BJ</span>
        </span>
      </div>

      <p className="px-6 pt-4 pb-2 text-[11px] font-bold tracking-wide text-white/40 uppercase">
        Pilotage
      </p>

      <nav className="flex-1 space-y-1 px-3">
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
                  layoutId="admin-nav-active"
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
    </aside>
  );
}

/** Navigation de repli sur petits écrans : la console reste desktop-first. */
export function MobileSectionNav({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 lg:hidden">
      <div className="flex gap-2 pb-1">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors",
              active === item.id
                ? "border-transparent bg-ink text-on-ink"
                : "border-line bg-surface text-fg-muted",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
