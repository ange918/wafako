"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  ClipboardList,
  House,
  Settings,
  Siren,
} from "lucide-react";
import {
  SpaceSidebar,
  SpaceSidebarDrawer,
  type SidebarItem,
} from "@/components/layout/SpaceSidebar";
import { TopBar } from "./TopBar";
import { BottomNav, type DashboardTab } from "./BottomNav";
import { HomeTab } from "./HomeTab";
import { ActionsTab } from "./ActionsTab";
import { CrexTab } from "./CrexTab";
import { SettingsTab } from "./SettingsTab";
import { DeclarationStepper } from "./DeclarationStepper";
import { useAppState } from "@/components/providers/AppStateProvider";

export function DashboardShell() {
  const [tab, setTab] = useState<DashboardTab>("accueil");
  const [stepperOpen, setStepperOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pendingCount, actions, profile } = useAppState();

  const openActions = actions.filter(
    (action) =>
      action.status !== "termine" &&
      (profile.personId
        ? (action.assigneeIds ?? []).includes(profile.personId)
        : false),
  ).length;

  const items: SidebarItem<DashboardTab>[] = [
    { id: "accueil", label: "Accueil", icon: House },
    {
      id: "actions",
      label: "Mes actions",
      icon: ClipboardList,
      count: openActions,
    },
    { id: "crex", label: "Prochaine CREX", icon: CalendarClock },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-dvh bg-canvas lg:pl-64">
      {/* Barre latérale sur grand écran, panneau coulissant sur mobile : la
          barre du bas reste le geste principal du téléphone. */}
      <SpaceSidebar
        items={items}
        active={tab}
        onSelect={setTab}
        heading="Espace soignant"
        exitHref="/logout"
        exitLabel="Se déconnecter"
        extra={
          <button
            type="button"
            onClick={() => setStepperOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl bg-alert px-3.5 py-3 text-sm font-bold text-white transition-[filter] hover:brightness-110"
          >
            <Siren className="size-5" />
            Déclarer un EI
          </button>
        }
      />
      <SpaceSidebarDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        active={tab}
        onSelect={setTab}
        heading="Espace soignant"
        exitHref="/logout"
        exitLabel="Se déconnecter"
      />

      <TopBar
        onHome={() => setTab("accueil")}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* Le padding bas dégage la barre de navigation fixe. */}
      <main className="mx-auto max-w-3xl px-4 pt-5 pb-28 lg:pb-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {tab === "accueil" ? (
              <HomeTab onDeclare={() => setStepperOpen(true)} />
            ) : tab === "actions" ? (
              <ActionsTab />
            ) : tab === "crex" ? (
              <CrexTab />
            ) : (
              <SettingsTab />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sur grand écran, la navigation passe par la barre latérale. */}
      <div className="lg:hidden">
        <BottomNav
          active={tab}
          onSelect={setTab}
          onDeclare={() => setStepperOpen(true)}
          pendingCount={pendingCount}
        />
      </div>

      <DeclarationStepper
        open={stepperOpen}
        onClose={() => setStepperOpen(false)}
        // Après validation, on revient à l'accueil : la fiche qui vient
        // d'être créée y apparaît en tête de liste.
        onDeclared={() => setTab("accueil")}
      />
    </div>
  );
}
