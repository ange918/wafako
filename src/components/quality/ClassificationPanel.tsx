"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Siren, X } from "lucide-react";
import { Badge, SEVERITY_TONE } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { CATEGORY_ICONS } from "@/components/dashboard/categoryIcons";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  ALARM_FACTORS,
  CARE_STAGE_LABELS,
  CATEGORIES,
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  DECISION_CODES,
  DECISION_HINTS,
  DECISION_LABELS,
  EVENT_NATURE_LABELS,
  SEVERITY_LABELS,
  VICTIM_LABELS,
} from "@/lib/mock-data";
import { backdrop } from "@/lib/motion";
import { cn, formatDateTime } from "@/lib/utils";
import type {
  AlarmFactorKey,
  CareStage,
  CriticalityLevel,
  EventNature,
  Incident,
  TriageDecision,
} from "@/types";

const NATURES: EventNature[] = ["evenement", "dysfonctionnement"];
const STAGES: CareStage[] = ["accueil", "preparation", "traitement", "autre"];
const DECISIONS: TriageDecision[] = [
  "sans_suivi",
  "action",
  "analyse_approfondie",
];

/** Panneau de classement d'une déclaration reçue. */
export function ClassificationPanel({
  incident,
  onClose,
}: {
  incident: Incident | null;
  onClose: () => void;
}) {
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
          {/* La `key` repart d'un formulaire neuf à chaque fiche ouverte. */}
          <PanelBody key={incident.id} incident={incident} onClose={onClose} />
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function PanelBody({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const { classifyIncident, callUrgentMeeting, incidents, profile } =
    useAppState();
  const existing = incident.classification;

  /**
   * Autres fiches susceptibles de porter sur le même événement : même service,
   * fiche courante exclue. C'est la colonne « N° EVT Groupe » du relevé.
   */
  const siblings = incidents.filter(
    (item) => item.id !== incident.id && item.service === incident.service,
  );

  const [nature, setNature] = useState<EventNature>(
    existing?.nature ?? "evenement",
  );
  const [families, setFamilies] = useState<AlarmFactorKey[]>(
    existing?.families ?? [],
  );
  const [stage, setStage] = useState<CareStage>(
    existing?.stage ?? "traitement",
  );
  const [criticality, setCriticality] = useState<CriticalityLevel>(
    existing?.criticality ?? "acceptable",
  );
  const [decision, setDecision] = useState<TriageDecision>(
    existing?.decision ?? "action",
  );
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [related, setRelated] = useState<string[]>(
    incident.relatedReferences ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  // Rassemblement immédiat, proposé sur les cas qui l'exigent.
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingAt, setMeetingAt] = useState("");
  const [called, setCalled] = useState(false);

  const toggleRelated = (reference: string) =>
    setRelated((current) =>
      current.includes(reference)
        ? current.filter((item) => item !== reference)
        : [...current, reference],
    );

  const toggleFamily = (key: AlarmFactorKey) =>
    setFamilies((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const save = () => {
    if (families.length === 0) {
      setError("Sélectionnez au moins une famille de facteurs.");
      return;
    }
    if (decision === "sans_suivi" && !comment.trim()) {
      setError("Une décision « sans suivi » doit être justifiée.");
      return;
    }
    setError(null);
    classifyIncident(
      incident.id,
      {
        nature,
        families,
        stage,
        criticality,
        decision,
        comment: comment.trim() || undefined,
        classifiedBy:
          `${profile.firstName} ${profile.lastName}`.trim() ||
          "Cellule qualité",
        classifiedAt: new Date().toISOString(),
      },
      related,
    );
    onClose();
  };

  const callMeeting = () => {
    if (!meetingTitle.trim() || !meetingAt) {
      setError("Renseignez l'intitulé et l'horaire du rassemblement.");
      return;
    }
    setError(null);
    callUrgentMeeting({
      title: meetingTitle.trim(),
      scheduledAt: new Date(meetingAt).toISOString(),
      service: incident.service,
      facilitator:
        `${profile.firstName} ${profile.lastName}`.trim() || "Cellule qualité",
      incidentReferences: [incident.reference],
      participants: 0,
    });
    setCalled(true);
  };

  return (
    <motion.aside
      role="dialog"
      aria-modal="true"
      aria-label={`Classement de ${incident.reference}`}
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
          <p className="mt-1 text-sm text-fg-muted">
            {incident.service} · déclaré par {incident.declaredBy}
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
        {/* Ce que le déclarant a saisi */}
        <section className="rounded-2xl border border-line bg-muted p-5">
          <div className="flex flex-wrap gap-2">
            {incident.categories.map((id) => {
              const Icon = CATEGORY_ICONS[id] ?? CATEGORY_ICONS.autre;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-fg-muted"
                >
                  <Icon className="size-3.5 text-hospital" />
                  {CATEGORIES.find((item) => item.id === id)?.label ?? id}
                </span>
              );
            })}
            <Badge tone={SEVERITY_TONE[incident.severity]}>
              {SEVERITY_LABELS[incident.severity]}
            </Badge>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Row
              label="Lieu de survenue"
              value={incident.location || "Non précisé"}
            />
            <Row label="Victime" value={VICTIM_LABELS[incident.victim]} />
            <Row
              label="Survenu le"
              value={formatDateTime(incident.occurredAt)}
            />
            <Row
              label="Déclaré le"
              value={formatDateTime(incident.declaredAt)}
            />
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
          </div>
        </section>

        {/* Classement */}
        <section className="mt-7 space-y-6">
          <div>
            <h3 className="font-display text-lg font-extrabold text-fg">
              Classement
            </h3>
            <p className="mt-1 text-sm text-fg-muted">
              Vocabulaire repris des comptes rendus de CREX de
              l&apos;établissement.
            </p>
          </div>

          <Choice
            label="Nature"
            options={NATURES.map((value) => ({
              value,
              label: EVENT_NATURE_LABELS[value],
            }))}
            selected={nature}
            onSelect={setNature}
          />

          <div>
            <p className="mb-2 text-sm font-bold text-fg">
              Familles de facteurs
              <span className="ml-2 font-normal text-fg-muted">
                plusieurs choix possibles
              </span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ALARM_FACTORS.map((factor) => {
                const selected = families.includes(factor.key);
                return (
                  <button
                    key={factor.key}
                    type="button"
                    onClick={() => toggleFamily(factor.key)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors",
                      selected
                        ? "border-hospital bg-hospital/10 text-hospital"
                        : "border-line bg-surface text-fg-muted hover:border-hospital/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded",
                        selected
                          ? "bg-hospital text-white"
                          : "border border-line",
                      )}
                    >
                      {selected ? <Check className="size-2.5" /> : null}
                    </span>
                    {factor.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Choice
            label="Étape du parcours"
            options={STAGES.map((value) => ({
              value,
              label: CARE_STAGE_LABELS[value],
            }))}
            selected={stage}
            onSelect={setStage}
          />

          <Choice
            label="Criticité"
            options={CRITICALITY_ORDER.map((value) => ({
              value,
              label: CRITICALITY_LABELS[value],
            }))}
            selected={criticality}
            onSelect={setCriticality}
          />

          <div>
            <p className="mb-2 text-sm font-bold text-fg">Décision</p>
            <div className="space-y-2">
              {DECISIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDecision(value)}
                  aria-pressed={decision === value}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                    decision === value
                      ? "border-hospital bg-hospital/10"
                      : "border-line bg-surface hover:border-hospital/40",
                  )}
                >
                  <span
                    className={cn(
                      "font-display grid size-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold",
                      decision === value
                        ? "bg-hospital text-white"
                        : "bg-muted text-fg-muted",
                    )}
                  >
                    {DECISION_CODES[value]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-fg">
                      {DECISION_LABELS[value]}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-fg-muted">
                      {DECISION_HINTS[value]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            name="comment"
            label="Commentaire"
            hint={decision === "sans_suivi" ? "requis" : "facultatif"}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Justification du classement, éléments de contexte…"
            className="min-h-24"
          />

          {/* Événements liés — colonne « N° EVT Groupe » du relevé */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-fg">
              <Link2 className="size-4 text-hospital" />
              Événements liés
              <span className="font-normal text-fg-muted">facultatif</span>
            </p>
            {siblings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-3 text-xs text-fg-muted">
                Aucune autre fiche déclarée dans ce service pour l&apos;instant.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {siblings.map((item) => {
                  const selected = related.includes(item.reference);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRelated(item.reference)}
                      aria-pressed={selected}
                      title={item.description}
                      className={cn(
                        "font-display min-h-9 rounded-full border px-3.5 text-xs font-extrabold transition-colors",
                        selected
                          ? "border-transparent bg-hospital text-white"
                          : "border-line bg-surface text-fg-muted hover:border-hospital/40",
                      )}
                    >
                      {item.reference}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-fg-muted">
              Regroupe les fiches portant sur le même événement, comme le fait
              la colonne « N° EVT Groupe » du relevé.
            </p>
          </div>

          {/* Rassemblement immédiat */}
          <div className="rounded-2xl border border-alert/30 bg-alert/5 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-alert">
              <Siren className="size-4.5" />
              Convoquer un rassemblement immédiat
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
              À réserver aux situations qui ne peuvent pas attendre le prochain
              CREX. Tous les utilisateurs sont notifiés, quel que soit leur
              poste.
            </p>

            {called ? (
              <p className="mt-4 rounded-xl bg-success/12 px-4 py-3 text-sm font-semibold text-success">
                Rassemblement convoqué. La notification est partie à tous les
                utilisateurs.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <Input
                  name="meetingTitle"
                  label="Intitulé"
                  value={meetingTitle}
                  onChange={(event) => setMeetingTitle(event.target.value)}
                  placeholder="Objet du rassemblement"
                />
                <Input
                  name="meetingAt"
                  label="Date et heure"
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(event) => setMeetingAt(event.target.value)}
                />
                <Button
                  variant="alert"
                  size="md"
                  className="w-full"
                  onClick={callMeeting}
                >
                  <Siren className="size-4" />
                  Convoquer et notifier
                </Button>
              </div>
            )}
          </div>

          {error ? (
            <p className="rounded-2xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
              {error}
            </p>
          ) : null}
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Button variant="ink" size="md" onClick={save}>
              <Check className="size-4" />
              Enregistrer le classement
            </Button>
            <Button variant="ghost" size="md" onClick={onClose}>
              Annuler
            </Button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">
            L&apos;enregistrement transmet un rapport à la direction et inscrit
            la fiche au relevé du prochain CREX.
          </p>
        </div>
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

function Block({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="rounded-xl bg-surface px-4 py-3">
      <p className="text-xs font-semibold text-fg-muted">{label}</p>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-fg">
        {value}
      </p>
    </div>
  );
}

function Choice<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-fg">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={selected === option.value}
            className={cn(
              "min-h-10 rounded-full border px-4 text-xs font-bold transition-colors",
              selected === option.value
                ? "border-transparent bg-ink text-on-ink"
                : "border-line bg-surface text-fg-muted hover:border-hospital/40",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
