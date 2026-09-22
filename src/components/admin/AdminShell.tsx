"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CircleCheck, Siren, TriangleAlert } from "lucide-react";
import { MobileSectionNav, Sidebar, type AdminSection } from "./Sidebar";
import { AlarmDonut, MonthlyTrend, ServiceBarChart } from "./Charts";
import { IncidentsTable } from "./IncidentsTable";
import { IncidentDetailDrawer } from "./IncidentDetailDrawer";
import { CrexModule } from "./CrexModule";
import {
  ActionsSection,
  AlarmSection,
  ConfigurationSection,
  UsersSection,
} from "./AdminSections";
import { Stat } from "@/components/ui/Stat";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppState } from "@/components/providers/AppStateProvider";
import { clockStore } from "@/lib/external-store";
import { stagger } from "@/lib/motion";
import type { Incident } from "@/types";

const TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  cockpit: {
    title: "Cockpit Direction",
    subtitle: "Vue consolidée de la sécurité des soins",
  },
  incidents: {
    title: "Incidents EI",
    subtitle: "Événements déclarés par les équipes",
  },
  alarm: {
    title: "Analyse ALARM",
    subtitle: "Causes racines des événements analysés",
  },
  actions: {
    title: "Plan d'actions",
    subtitle: "Suivi des mesures correctives",
  },
  crex: { title: "CREX", subtitle: "Comités de retour d'expérience" },
  utilisateurs: {
    title: "Utilisateurs",
    subtitle: "Comptes et droits d'accès",
  },
  configuration: {
    title: "Configuration",
    subtitle: "Établissements, services et conformité",
  },
};

export function AdminShell() {
  const [section, setSection] = useState<AdminSection>("cockpit");
  const [selected, setSelected] = useState<Incident | null>(null);
  const { incidents, actions, crexMeetings } = useAppState();

  // L'horloge n'existe pas au rendu serveur : elle est lue comme un store
  // externe, qui renvoie 0 tant que la valeur réelle n'est pas disponible.
  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  const kpis = useMemo(() => {
    const total = incidents.length;
    const closed = incidents.filter((i) => i.status === "cloture").length;
    // Un taux sur zéro incident n'aurait aucun sens : on affiche un tiret.
    const rate = total === 0 ? null : Math.round((closed / total) * 100);
    const crexDone = crexMeetings.filter((m) => m.done).length;
    // Une action en retard est une action non terminée dont l'échéance est
    // passée. Avant hydratation, le retard n'est pas calculable.
    const late =
      now === 0
        ? 0
        : actions.filter(
            (action) =>
              action.status !== "termine" &&
              new Date(action.dueDate).getTime() < now,
          ).length;
    return { total, rate, crexDone, late };
  }, [incidents, actions, crexMeetings, now]);

  const header = TITLES[section];

  return (
    <div className="min-h-dvh bg-canvas lg:pl-64">
      <Sidebar active={section} onSelect={setSection} />

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display truncate text-xl font-extrabold text-fg lg:text-2xl">
                {header.title}
              </h1>
              <p className="truncate text-sm text-fg-muted">
                {header.subtitle}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-4">
            <MobileSectionNav active={section} onSelect={setSection} />
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {section === "cockpit" ? (
                <div className="space-y-6">
                  <motion.div
                    variants={stagger(0, 0.07)}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    <Stat
                      label="Total événements"
                      value={String(kpis.total)}
                      delta="Sur l'exercice en cours"
                      icon={<Siren className="size-5" />}
                    />
                    <Stat
                      label="Taux de résolution"
                      value={kpis.rate === null ? "—" : `${kpis.rate} %`}
                      delta={
                        kpis.rate === null
                          ? "Aucun incident déclaré"
                          : "Incidents clôturés"
                      }
                      icon={<CircleCheck className="size-5" />}
                      tone="success"
                    />
                    <Stat
                      label="CREX tenues"
                      value={String(kpis.crexDone)}
                      delta={`${crexMeetings.length - kpis.crexDone} à venir`}
                      icon={<CalendarCheck className="size-5" />}
                    />
                    <Stat
                      label="Alertes en retard"
                      value={String(kpis.late)}
                      delta="Actions hors délai"
                      icon={<TriangleAlert className="size-5" />}
                      tone="alert"
                    />
                  </motion.div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <ServiceBarChart />
                    <AlarmDonut />
                  </div>

                  <MonthlyTrend />

                  <IncidentsTable incidents={incidents} onOpen={setSelected} />
                </div>
              ) : section === "incidents" ? (
                <IncidentsTable incidents={incidents} onOpen={setSelected} />
              ) : section === "alarm" ? (
                <AlarmSection />
              ) : section === "actions" ? (
                <ActionsSection />
              ) : section === "crex" ? (
                <CrexModule />
              ) : section === "utilisateurs" ? (
                <UsersSection />
              ) : (
                <ConfigurationSection />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <IncidentDetailDrawer
        incident={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
