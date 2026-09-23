"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Inbox,
  Info,
  ShieldPlus,
  TriangleAlert,
} from "lucide-react";
import { ClassificationPanel } from "./ClassificationPanel";
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

export function QualityShell() {
  const { incidents, pendingClassification } = useAppState();
  const [selected, setSelected] = useState<Incident | null>(null);

  const { inbox, classified } = useMemo(
    () => ({
      inbox: incidents.filter((incident) => !incident.classification),
      classified: incidents.filter((incident) => incident.classification),
    }),
    [incidents],
  );

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-5 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-hospital text-white">
              <ShieldPlus className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display truncate text-lg font-extrabold text-fg">
                Cellule qualité
              </h1>
              <p className="truncate text-xs text-fg-muted">
                Réception et classement des déclarations
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 lg:px-8">
        {/* Le circuit multi-utilisateurs n'existe pas sans serveur : le dire. */}
        <div className="flex items-start gap-3 rounded-3xl border border-warn/30 bg-warn/8 p-5">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" />
          <p className="text-sm leading-relaxed text-fg-muted">
            <span className="font-bold text-fg">Circuit simulé.</span> Cet
            espace ne voit que les déclarations faites depuis{" "}
            <span className="font-semibold">ce navigateur</span>. Une fiche
            saisie sur le téléphone d&apos;un soignant n&apos;y apparaîtra pas :
            la remontée entre postes demanderait un serveur.
          </p>
        </div>

        <motion.div
          variants={stagger(0, 0.07)}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-3"
        >
          <Stat label="À classer" value={pendingClassification} tone="alert" />
          <Stat label="Classées" value={classified.length} tone="success" />
          <Stat label="Total reçu" value={incidents.length} tone="neutral" />
        </motion.div>

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
                Aucune déclaration en attente. Les fiches transmises par les
                soignants apparaissent ici pour être classées.
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

        <div className="flex items-start gap-3 rounded-2xl border border-line bg-muted p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-hospital" />
          <p className="text-xs leading-relaxed text-fg-muted">
            Le vocabulaire de classement — nature, familles de facteurs, étape
            du parcours, criticité et décision SS / ACT / AA — reprend celui des
            comptes rendus de CREX de l&apos;établissement. La codification des
            références et l&apos;échelle complète de criticité restent à
            confirmer.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Quitter l&apos;espace qualité
        </Link>
      </main>

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
