"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const { pendingCount } = useAppState();

  return (
    <div className="min-h-dvh bg-canvas">
      <TopBar onHome={() => setTab("accueil")} />

      {/* Le padding bas dégage la barre de navigation fixe. */}
      <main className="mx-auto max-w-3xl px-4 pt-5 pb-28">
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

      <BottomNav
        active={tab}
        onSelect={setTab}
        onDeclare={() => setStepperOpen(true)}
        pendingCount={pendingCount}
      />

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
