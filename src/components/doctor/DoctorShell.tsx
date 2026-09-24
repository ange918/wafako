"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  ClipboardList,
  Inbox,
  LogOut,
  Menu,
  Siren,
  Stethoscope,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import {
  SpaceSidebar,
  SpaceSidebarDrawer,
  type SidebarItem,
} from "@/components/layout/SpaceSidebar";
import { DoctorIncidentCard } from "./DoctorIncidentCard";
import { ActionList } from "@/components/actions/ActionList";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppState } from "@/components/providers/AppStateProvider";
import { HOSPITALS } from "@/lib/mock-data";
import { clockStore } from "@/lib/external-store";
import {
  crexDayFor,
  crexPeriod,
  formatCrexPeriod,
  nextCrexDate,
} from "@/lib/crex";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDate, formatDateTime } from "@/lib/utils";

type DoctorSection = "fiches" | "actions" | "reunions" | "profil";

const TITLES: Record<DoctorSection, { title: string; subtitle: string }> = {
  fiches: {
    title: "Fiches transmises",
    subtitle: "Déclarations confiées à votre spécialité",
  },
  actions: {
    title: "Mes actions",
    subtitle: "Actions correctives qui vous sont attribuées",
  },
  reunions: {
    title: "Réunions",
    subtitle: "CREX mensuel et rassemblements convoqués",
  },
  profil: { title: "Mon profil", subtitle: "Compte docteur de cet appareil" },
};

export function DoctorShell() {
  const router = useRouter();
  const [section, setSection] = useState<DoctorSection>("fiches");
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    currentDoctor,
    incidents,
    actions,
    crexMeetings,
    crexCalendar,
    signOutDoctor,
  } = useAppState();

  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  /** Fiches dont la cellule qualité a désigné ce docteur comme destinataire. */
  const assigned = useMemo(
    () =>
      incidents.filter((incident) =>
        currentDoctor
          ? (incident.classification?.assignedTo ?? []).includes(
              currentDoctor.id,
            )
          : false,
      ),
    [incidents, currentDoctor],
  );

  const myActions = useMemo(
    () =>
      actions.filter((action) =>
        currentDoctor
          ? (action.assigneeIds ?? []).includes(currentDoctor.id)
          : false,
      ),
    [actions, currentDoctor],
  );

  const urgentMeetings = crexMeetings.filter(
    (meeting) => meeting.kind === "urgence",
  );

  const items: SidebarItem<DoctorSection>[] = [
    {
      id: "fiches",
      label: "Fiches transmises",
      icon: Inbox,
      count: assigned.filter((incident) => incident.status !== "cloture")
        .length,
    },
    {
      id: "actions",
      label: "Mes actions",
      icon: ClipboardList,
      count: myActions.filter((action) => action.status !== "termine").length,
    },
    { id: "reunions", label: "Réunions", icon: CalendarClock },
    { id: "profil", label: "Mon profil", icon: UserRound },
  ];

  const header = TITLES[section];
  const hospital = HOSPITALS.find(
    (item) => item.id === currentDoctor?.hospitalId,
  );

  const day = crexDayFor(crexCalendar, currentDoctor?.specialty ?? "");
  const monthly = nextCrexDate(day, now);

  const signOut = () => {
    signOutDoctor();
    router.push("/");
  };

  return (
    <div className="min-h-dvh bg-canvas lg:pl-64">
      <SpaceSidebar
        items={items}
        active={section}
        onSelect={setSection}
        heading="Espace docteur"
        exitLabel="Se déconnecter"
        extra={
          currentDoctor ? (
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm font-bold text-white">
                Dr {currentDoctor.firstName} {currentDoctor.lastName}
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {currentDoctor.specialty}
              </p>
            </div>
          ) : null
        }
      />
      <SpaceSidebarDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        active={section}
        onSelect={setSection}
        heading="Espace docteur"
        exitLabel="Se déconnecter"
      />

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-fg lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-xl font-extrabold text-fg lg:text-2xl">
                {header.title}
              </h1>
              <p className="truncate text-sm text-fg-muted">
                {header.subtitle}
              </p>
            </div>
            <NotificationBell />
            <ThemeToggle />
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
              className="mx-auto max-w-4xl space-y-6"
            >
              {section === "fiches" ? (
                <>
                  <div className="flex items-start gap-3 rounded-3xl border border-warn/30 bg-warn/8 p-5">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" />
                    <p className="text-sm leading-relaxed text-fg-muted">
                      <span className="font-bold text-fg">Circuit simulé.</span>{" "}
                      Vous ne voyez ici que les fiches classées depuis{" "}
                      <span className="font-semibold">ce navigateur</span>. La
                      transmission entre postes demanderait un serveur.
                    </p>
                  </div>

                  {assigned.length === 0 ? (
                    <EmptyState
                      icon={<Inbox className="size-6" />}
                      title="Aucune fiche transmise"
                      body="La cellule qualité vous adressera les déclarations relevant de votre spécialité au moment du classement."
                    />
                  ) : (
                    <motion.div
                      variants={stagger(0, 0.06)}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {assigned.map((incident) => (
                        <motion.div key={incident.id} variants={fadeUp}>
                          <DoctorIncidentCard incident={incident} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : section === "actions" ? (
                <ActionList
                  actions={myActions}
                  emptyLabel="Aucune action ne vous est attribuée pour le moment."
                />
              ) : section === "reunions" ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader
                      title="Prochain CREX"
                      subtitle={currentDoctor?.specialty ?? "Votre domaine"}
                    />
                    <div className="px-6 py-5">
                      {monthly ? (
                        <>
                          <p className="font-display text-2xl font-extrabold text-fg">
                            {formatDate(monthly.toISOString())}
                          </p>
                          <p className="mt-1 text-sm text-fg-muted">
                            Fiches classées{" "}
                            {formatCrexPeriod(crexPeriod(monthly, day))}
                          </p>
                          <p className="mt-3 text-xs text-fg-muted">
                            La réunion se tient le {day} de chaque mois. Le jour
                            se règle dans la configuration de
                            l&apos;établissement.
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-fg-muted">
                          Calcul de la prochaine réunion…
                        </p>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      title="Rassemblements convoqués"
                      subtitle={`${urgentMeetings.length} au total`}
                    />
                    {urgentMeetings.length === 0 ? (
                      <p className="px-6 py-12 text-center text-sm text-fg-muted">
                        Aucun rassemblement immédiat convoqué.
                      </p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {urgentMeetings.map((meeting) => (
                          <li
                            key={meeting.id}
                            className="flex items-start gap-3 px-6 py-4"
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-alert/12 text-alert">
                              <Siren className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-fg">
                                {meeting.title}
                              </p>
                              <p className="mt-0.5 text-xs text-fg-muted">
                                {formatDateTime(meeting.scheduledAt)} ·{" "}
                                {meeting.service}
                              </p>
                            </div>
                            <Badge tone="alert">Urgent</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader
                    title="Mon profil"
                    subtitle="Compte docteur enregistré sur cet appareil"
                  />
                  {currentDoctor ? (
                    <>
                      <dl className="grid gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-2">
                        <Row
                          label="Nom"
                          value={`Dr ${currentDoctor.firstName} ${currentDoctor.lastName}`}
                        />
                        <Row
                          label="Spécialité"
                          value={currentDoctor.specialty ?? "—"}
                        />
                        <Row
                          label="Établissement"
                          value={hospital?.name ?? "—"}
                        />
                        <Row label="E-mail" value={currentDoctor.email} />
                        <Row label="Téléphone" value={currentDoctor.phone} />
                        <Row
                          label="Inscrit le"
                          value={formatDate(currentDoctor.registeredAt)}
                        />
                      </dl>
                      <div className="border-t border-line px-6 py-4">
                        <button
                          type="button"
                          onClick={signOut}
                          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-fg-muted transition-colors hover:border-alert/40 hover:text-alert"
                        >
                          <LogOut className="size-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </>
                  ) : null}
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-fg-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-fg">{value}</dd>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
          {icon}
        </span>
        <p className="font-display text-base font-extrabold text-fg">{title}</p>
        <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{body}</p>
        <Stethoscope className="mt-2 size-4 text-hospital/50" />
      </div>
    </Card>
  );
}
