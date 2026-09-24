"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCheck,
  Inbox,
  Info,
  Menu,
  TriangleAlert,
  Users,
} from "lucide-react";
import { ClassificationPanel } from "./ClassificationPanel";
import { DirectorySection, DirectorySidebar } from "./DirectoryPanel";
import {
  SpaceSidebar,
  SpaceSidebarDrawer,
  type SidebarItem,
} from "@/components/layout/SpaceSidebar";
import { Badge, SEVERITY_TONE } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CATEGORY_ICONS } from "@/components/dashboard/categoryIcons";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  CATEGORIES,
  DECISION_CODES,
  DECISION_LABELS,
  SEVERITY_LABELS,
} from "@/lib/mock-data";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";
import type { Incident } from "@/types";

type QualitySection = "inbox" | "classees" | "annuaire";

const TITLES: Record<QualitySection, { title: string; subtitle: string }> = {
  inbox: {
    title: "Déclarations à classer",
    subtitle: "Fiches reçues, en attente de classement",
  },
  classees: {
    title: "Déclarations classées",
    subtitle: "Fiches traitées et transmises",
  },
  annuaire: {
    title: "Annuaire",
    subtitle: "Personnel et docteurs de l'établissement",
  },
};

export function QualityShell() {
  const { incidents, pendingClassification, doctors, staff } = useAppState();
  const [selected, setSelected] = useState<Incident | null>(null);
  const [section, setSection] = useState<QualitySection>("inbox");
  const [menuOpen, setMenuOpen] = useState(false);

  const { inbox, classified } = useMemo(
    () => ({
      inbox: incidents.filter((incident) => !incident.classification),
      classified: incidents.filter((incident) => incident.classification),
    }),
    [incidents],
  );

  const items: SidebarItem<QualitySection>[] = [
    {
      id: "inbox",
      label: "À classer",
      icon: Inbox,
      count: pendingClassification,
    },
    { id: "classees", label: "Classées", icon: CheckCheck },
    {
      id: "annuaire",
      label: "Annuaire",
      icon: Users,
      count: staff.length + doctors.length,
    },
  ];

  const header = TITLES[section];

  return (
    <div className="min-h-dvh bg-canvas lg:pl-64">
      <SpaceSidebar
        items={items}
        active={section}
        onSelect={setSection}
        heading="Cellule qualité"
        exitLabel="Quitter l'espace"
        extra={<DirectorySidebar />}
      />
      <SpaceSidebarDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        active={section}
        onSelect={setSection}
        heading="Cellule qualité"
        exitLabel="Quitter l'espace"
        extra={<DirectorySidebar />}
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
              className="mx-auto max-w-5xl space-y-6"
            >
              {section === "annuaire" ? (
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-line bg-muted p-5">
                    <Info className="mt-0.5 size-5 shrink-0 text-hospital" />
                    <p className="text-xs leading-relaxed text-fg-muted">
                      L&apos;annuaire se remplit à chaque inscription faite sur
                      cet appareil : les soignants depuis « Créer un compte »,
                      les médecins depuis l&apos;inscription docteur. C&apos;est
                      lui qui alimente la liste des destinataires au moment du
                      classement.
                    </p>
                  </div>
                  <DirectorySection />
                </>
              ) : (
                <>
                  {/* Le circuit multi-utilisateurs n'existe pas sans serveur : le dire. */}
                  <div className="flex items-start gap-3 rounded-3xl border border-warn/30 bg-warn/8 p-5">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" />
                    <p className="text-sm leading-relaxed text-fg-muted">
                      <span className="font-bold text-fg">Circuit simulé.</span>{" "}
                      Cet espace ne voit que les déclarations faites depuis{" "}
                      <span className="font-semibold">ce navigateur</span>. Une
                      fiche saisie sur le téléphone d&apos;un soignant n&apos;y
                      apparaîtra pas : la remontée entre postes demanderait un
                      serveur.
                    </p>
                  </div>

                  <motion.div
                    variants={stagger(0, 0.07)}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <Stat
                      label="À classer"
                      value={pendingClassification}
                      tone="alert"
                    />
                    <Stat
                      label="Classées"
                      value={classified.length}
                      tone="success"
                    />
                    <Stat
                      label="Docteurs inscrits"
                      value={doctors.length}
                      tone="neutral"
                    />
                  </motion.div>

                  {section === "inbox" ? (
                    <Card>
                      <CardHeader
                        title="Déclarations à classer"
                        subtitle={
                          inbox.length > 0
                            ? `${inbox.length} fiche${inbox.length > 1 ? "s" : ""} en attente`
                            : "Les nouvelles déclarations arrivent ici"
                        }
                      />
                      {inbox.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
                            <Inbox className="size-6" />
                          </span>
                          <p className="max-w-sm text-sm text-fg-muted">
                            Aucune déclaration en attente. Les fiches transmises
                            par les soignants apparaissent ici pour être
                            classées.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-line">
                          {inbox.map((incident) => (
                            <IncidentRow
                              key={incident.id}
                              incident={incident}
                              onOpen={() => setSelected(incident)}
                              actionLabel="Classer"
                            />
                          ))}
                        </ul>
                      )}
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader
                        title="Déjà classées"
                        subtitle={`${classified.length} fiche${classified.length > 1 ? "s" : ""}`}
                      />
                      {classified.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-fg-muted">
                          Aucune fiche classée pour le moment.
                        </p>
                      ) : (
                        <ul className="divide-y divide-line">
                          {classified.map((incident) => (
                            <IncidentRow
                              key={incident.id}
                              incident={incident}
                              onOpen={() => setSelected(incident)}
                              actionLabel="Revoir"
                            />
                          ))}
                        </ul>
                      )}
                    </Card>
                  )}

                  <div className="flex items-start gap-3 rounded-2xl border border-line bg-muted p-5">
                    <Info className="mt-0.5 size-5 shrink-0 text-hospital" />
                    <p className="text-xs leading-relaxed text-fg-muted">
                      Le vocabulaire de classement — nature, familles de
                      facteurs, étape du parcours, criticité et décision SS /
                      ACT / AA — reprend celui des comptes rendus de CREX de
                      l&apos;établissement. La codification des références et
                      l&apos;échelle complète de criticité restent à confirmer.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ClassificationPanel
        incident={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "alert" | "success" | "neutral";
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
    >
      <p
        className={
          tone === "alert"
            ? "font-display text-3xl font-extrabold text-alert"
            : tone === "success"
              ? "font-display text-3xl font-extrabold text-success"
              : "font-display text-3xl font-extrabold text-fg"
        }
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-fg-muted">{label}</p>
    </motion.div>
  );
}

function IncidentRow({
  incident,
  onOpen,
  actionLabel,
}: {
  incident: Incident;
  onOpen: () => void;
  actionLabel: string;
}) {
  const [first, ...others] = incident.categories;
  const Icon = CATEGORY_ICONS[first] ?? CATEGORY_ICONS.autre;
  const base =
    CATEGORIES.find((item) => item.id === first)?.label ?? "Événement";
  const decision = incident.classification?.decision;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-muted"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-hospital/10 text-hospital">
          <Icon className="size-5.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-extrabold text-fg">
              {incident.reference}
            </span>
            <span className="text-xs text-fg-muted">
              {base}
              {others.length > 0 ? ` +${others.length}` : ""}
            </span>
            {decision ? (
              <Badge tone="info">
                {DECISION_CODES[decision]} · {DECISION_LABELS[decision]}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
            {incident.description}
          </p>
          <p className="mt-1.5 text-[11px] text-fg-muted/80">
            {incident.service} · {formatDateTime(incident.declaredAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge tone={SEVERITY_TONE[incident.severity]}>
            {SEVERITY_LABELS[incident.severity]}
          </Badge>
          <span className="rounded-full bg-hospital/10 px-3 py-1 text-xs font-bold text-hospital">
            {actionLabel}
          </span>
        </div>
      </button>
    </li>
  );
}
