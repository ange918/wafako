"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileDown, Save, X } from "lucide-react";
import {
  Badge,
  INCIDENT_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICONS } from "@/components/dashboard/categoryIcons";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  ALARM_FACTORS,
  CATEGORIES,
  HOSPITALS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/lib/mock-data";
import { backdrop } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";
import type { AlarmFactorKey, Incident } from "@/types";

/** Panneau latéral d'analyse : grille ALARM à 7 facteurs. */
export function IncidentDetailDrawer({
  incident,
  onClose,
}: {
  incident: Incident | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!incident) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [incident, onClose]);

  return (
    <AnimatePresence>
      {incident ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
          />

          {/* La `key` remonte le panneau quand on change d'incident : le
              brouillon repart de la grille de l'incident affiché. */}
          <DrawerPanel
            key={incident.id}
            incident={incident}
            onClose={onClose}
          />
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function DrawerPanel({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const { updateAlarm } = useAppState();
  const [draft, setDraft] = useState<Partial<Record<AlarmFactorKey, string>>>(
    incident.alarm ?? {},
  );
  const [saved, setSaved] = useState(false);

  const filledCount = ALARM_FACTORS.filter((factor) =>
    (draft[factor.key] ?? "").trim(),
  ).length;

  const save = () => {
    updateAlarm(incident.id, draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const category = CATEGORIES.find((item) => item.id === incident.category);
  const Icon = CATEGORY_ICONS[incident.category];
  const hospital = HOSPITALS.find((item) => item.id === incident.hospitalId);

  return (
    <motion.aside
      role="dialog"
      aria-modal="true"
      aria-label={`Analyse de ${incident.reference}`}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-surface shadow-lift"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold text-fg">
            {incident.reference}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            {Icon ? <Icon className="size-4 text-hospital" /> : null}
            {category?.label} · {incident.service}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le panneau"
          className="rounded-full p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone={SEVERITY_TONE[incident.severity]}>
            Gravité : {SEVERITY_LABELS[incident.severity]}
          </Badge>
          <Badge tone={INCIDENT_STATUS_TONE[incident.status]}>
            {STATUS_LABELS[incident.status]}
          </Badge>
          {incident.sync === "en_attente" ? (
            <Badge tone="warn">Non synchronisé</Badge>
          ) : null}
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl border border-line bg-muted p-5 text-sm sm:grid-cols-2">
          <Row label="Établissement" value={hospital?.name ?? "—"} />
          <Row label="Déclaré par" value={incident.declaredBy} />
          <Row label="Survenu le" value={formatDateTime(incident.occurredAt)} />
          <Row label="Déclaré le" value={formatDateTime(incident.declaredAt)} />
          {incident.attachmentName ? (
            <Row label="Pièce jointe" value={incident.attachmentName} />
          ) : null}
        </dl>

        <section className="mt-6">
          <h3 className="font-display text-sm font-extrabold text-fg uppercase">
            Description
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            {incident.description}
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-fg">
                Grille d&apos;analyse ALARM
              </h3>
              <p className="mt-1 text-sm text-fg-muted">
                Documentez les facteurs ayant contribué à l&apos;événement.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-hospital/10 px-3 py-1 text-xs font-bold text-hospital">
              {filledCount}/7
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {ALARM_FACTORS.map((factor, index) => (
              <motion.div
                key={factor.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border border-line p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      (draft[factor.key] ?? "").trim()
                        ? "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success text-white"
                        : "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-extrabold text-fg-muted"
                    }
                  >
                    {(draft[factor.key] ?? "").trim() ? (
                      <Check className="size-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`alarm-${factor.key}`}
                      className="block text-sm font-bold text-fg"
                    >
                      {factor.label}
                    </label>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {factor.description}
                    </p>
                    <textarea
                      id={`alarm-${factor.key}`}
                      value={draft[factor.key] ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [factor.key]: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Constat, élément factuel…"
                      className="mt-2.5 w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted/70 focus:border-hospital"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
        <Button variant="ink" size="md" onClick={save}>
          <Save className="size-4" />
          Enregistrer l&apos;analyse
        </Button>
        <Button variant="outline" size="md">
          <FileDown className="size-4" />
          Exporter la fiche
        </Button>

        <AnimatePresence>
          {saved ? (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-auto text-sm font-bold text-success"
            >
              Analyse enregistrée
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.aside>
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
