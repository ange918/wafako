"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Badge,
  INCIDENT_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { CATEGORY_ICONS } from "@/components/dashboard/categoryIcons";
import {
  ALARM_FACTORS,
  CARE_STAGE_LABELS,
  CRITICALITY_LABELS,
  DECISION_CODES,
  DECISION_LABELS,
  EVENT_NATURE_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  VICTIM_LABELS,
} from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/utils";
import type { Incident } from "@/types";

/**
 * Fiche transmise à un docteur.
 *
 * Reprend ce que le déclarant a saisi et le classement retenu par la cellule
 * qualité : le docteur doit pouvoir se prononcer sans avoir à réclamer la
 * fiche d'origine.
 */
export function DoctorIncidentCard({ incident }: { incident: Incident }) {
  const [open, setOpen] = useState(false);
  const Icon = CATEGORY_ICONS[incident.categories[0]] ?? CATEGORY_ICONS.autre;
  const classification = incident.classification;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-hospital/10 text-hospital">
          <Icon className="size-5.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-extrabold text-fg">
              {incident.reference}
            </span>
            <Badge tone={SEVERITY_TONE[incident.severity]}>
              {SEVERITY_LABELS[incident.severity]}
            </Badge>
            <Badge tone={INCIDENT_STATUS_TONE[incident.status]}>
              {STATUS_LABELS[incident.status]}
            </Badge>
            {classification ? (
              <Badge tone="info">
                {DECISION_CODES[classification.decision]} ·{" "}
                {DECISION_LABELS[classification.decision]}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted">
            {incident.description}
          </p>
          <p className="mt-1.5 text-[11px] text-fg-muted/80">
            {incident.service} · {formatDateTime(incident.declaredAt)} · déclaré
            par {incident.declaredBy}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 size-5 shrink-0 text-fg-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-line px-5 py-5">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Row
              label="Lieu de survenue"
              value={incident.location || "Non précisé"}
            />
            <Row label="Victime" value={VICTIM_LABELS[incident.victim]} />
            <Row
              label="Survenu le"
              value={formatDateTime(incident.occurredAt)}
            />
            {classification ? (
              <>
                <Row
                  label="Nature"
                  value={EVENT_NATURE_LABELS[classification.nature]}
                />
                <Row
                  label="Étape du parcours"
                  value={CARE_STAGE_LABELS[classification.stage]}
                />
                <Row
                  label="Criticité"
                  value={CRITICALITY_LABELS[classification.criticality]}
                />
                <Row
                  label="Familles retenues"
                  value={classification.families
                    .map(
                      (key) =>
                        ALARM_FACTORS.find((factor) => factor.key === key)
                          ?.label ?? key,
                    )
                    .join(" · ")}
                />
                <Row label="Classé par" value={classification.classifiedBy} />
              </>
            ) : null}
          </dl>

          <div className="mt-4 space-y-3">
            <Block label="Description" value={incident.description} />
            <Block
              label="Premières actions mises en place"
              value={incident.firstActions}
            />
            <Block
              label="Actions proposées pour la non-reproductibilité"
              value={incident.preventionProposals}
            />
            {classification?.comment ? (
              <Block
                label="Commentaire de la cellule qualité"
                value={classification.comment}
              />
            ) : null}
          </div>

          {incident.relatedReferences?.length ? (
            <p className="mt-4 text-xs text-fg-muted">
              Événements liés :{" "}
              <span className="font-semibold text-fg">
                {incident.relatedReferences.join(", ")}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
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

function Block({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="rounded-xl bg-muted px-4 py-3">
      <p className="text-xs font-semibold text-fg-muted">{label}</p>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-fg">
        {value}
      </p>
    </div>
  );
}
