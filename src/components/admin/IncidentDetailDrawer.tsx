"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Save, X } from "lucide-react";
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
  CARE_STAGE_LABELS,
  CATEGORIES,
  CRITICALITY_LABELS,
  DECISION_CODES,
  DECISION_LABELS,
  EVENT_NATURE_LABELS,
  HOSPITALS,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  STATUS_LABELS,
  VICTIM_LABELS,
} from "@/lib/mock-data";
import { backdrop } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";
import type { AlarmFactorKey, AlarmPlanRow, Incident, Severity } from "@/types";

/** Ligne de plan vierge, créée à la volée pour une famille retenue. */
function emptyPlanRow(factor: AlarmFactorKey): AlarmPlanRow {
  return {
    factor,
    cause: "",
    action: "",
    priority: "modere",
    owner: "",
    dueDate: "",
    indicators: "",
    notes: "",
  };
}

function planRowHasContent(row: AlarmPlanRow) {
  return [
    row.cause,
    row.action,
    row.owner,
    row.dueDate,
    row.indicators,
    row.notes,
  ].some((value) => value.trim().length > 0);
}

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
  // Sous-facteurs cochés, repris de la grille du CHIC.
  const [checks, setChecks] = useState<
    Partial<Record<AlarmFactorKey, string[]>>
  >(incident.alarmChecks ?? {});
  const [avoidable, setAvoidable] = useState<Incident["avoidable"]>(
    incident.avoidable ?? "indetermine",
  );
  // Plan d'action de l'étape 3, indexé par famille pour suivre les cases
  // cochées sans recopier l'état à chaque rendu.
  const [plan, setPlan] = useState<
    Partial<Record<AlarmFactorKey, AlarmPlanRow>>
  >(() =>
    Object.fromEntries(
      (incident.alarmPlan ?? []).map((row) => [row.factor, row]),
    ),
  );
  const [saved, setSaved] = useState(false);

  const setPlanField = <K extends keyof AlarmPlanRow>(
    factor: AlarmFactorKey,
    field: K,
    value: AlarmPlanRow[K],
  ) =>
    setPlan((current) => ({
      ...current,
      [factor]: {
        ...(current[factor] ?? emptyPlanRow(factor)),
        [field]: value,
      },
    }));

  const toggleCheck = (key: AlarmFactorKey, item: string) =>
    setChecks((current) => {
      const list = current[key] ?? [];
      return {
        ...current,
        [key]: list.includes(item)
          ? list.filter((entry) => entry !== item)
          : [...list, item],
      };
    });

  // Familles retenues à l'étape 2 : elles alimentent le plan d'action.
  const activeFactors = ALARM_FACTORS.filter(
    (factor) =>
      (draft[factor.key] ?? "").trim() || (checks[factor.key] ?? []).length > 0,
  );

  const save = () => {
    const alarmPlan = activeFactors
      .map((factor) => plan[factor.key] ?? emptyPlanRow(factor.key))
      .filter(planRowHasContent);
    updateAlarm(incident.id, {
      alarm: draft,
      alarmChecks: checks,
      avoidable,
      alarmPlan,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const categories = incident.categories
    .map((id) => CATEGORIES.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  const Icon = CATEGORY_ICONS[incident.categories[0]] ?? CATEGORY_ICONS.autre;
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
            {categories.map((item) => item.label).join(" · ")} ·{" "}
            {incident.service}
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
          <Row
            label="Déclaré par"
            value={
              incident.declaredByRole
                ? `${incident.declaredBy} · ${incident.declaredByRole}`
                : incident.declaredBy
            }
          />
          <Row
            label="Lieu de survenue"
            value={incident.location || "Non précisé"}
          />
          <Row label="Victime" value={VICTIM_LABELS[incident.victim]} />
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

        {/* Classement de la cellule qualité : ce que la direction reçoit */}
        <section className="mt-6">
          <h3 className="font-display text-sm font-extrabold text-fg uppercase">
            Classement
          </h3>
          {incident.classification ? (
            <div className="mt-2 rounded-2xl border border-line bg-muted p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display rounded-xl bg-hospital px-2.5 py-1 text-xs font-extrabold text-white">
                  {DECISION_CODES[incident.classification.decision]}
                </span>
                <span className="text-sm font-bold text-fg">
                  {DECISION_LABELS[incident.classification.decision]}
                </span>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Row
                  label="Nature"
                  value={EVENT_NATURE_LABELS[incident.classification.nature]}
                />
                <Row
                  label="Étape du parcours"
                  value={CARE_STAGE_LABELS[incident.classification.stage]}
                />
                <Row
                  label="Criticité"
                  value={
                    CRITICALITY_LABELS[incident.classification.criticality]
                  }
                />
                <Row
                  label="Familles retenues"
                  value={incident.classification.families
                    .map(
                      (key) =>
                        ALARM_FACTORS.find((factor) => factor.key === key)
                          ?.label ?? key,
                    )
                    .join(" · ")}
                />
                <Row
                  label="Classé par"
                  value={incident.classification.classifiedBy}
                />
                <Row
                  label="Classé le"
                  value={formatDateTime(incident.classification.classifiedAt)}
                />
                {incident.relatedReferences?.length ? (
                  <Row
                    label="Événements liés"
                    value={incident.relatedReferences.join(", ")}
                  />
                ) : null}
              </dl>
              {incident.classification.comment ? (
                <div className="mt-4 rounded-xl bg-surface px-4 py-3">
                  <p className="text-xs font-semibold text-fg-muted">
                    Commentaire
                  </p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-fg">
                    {incident.classification.comment}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 rounded-2xl border border-dashed border-line px-5 py-6 text-sm text-fg-muted">
              Fiche pas encore classée. La cellule qualité en arrête la nature,
              la criticité et la décision, puis en transmet le rapport à la
              direction.
            </p>
          )}
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
              {activeFactors.length}/7
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
                    {/* Sous-facteurs de la grille du CHIC */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {factor.items.map((item) => {
                        const active = (checks[factor.key] ?? []).includes(
                          item,
                        );
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleCheck(factor.key, item)}
                            aria-pressed={active}
                            className={
                              active
                                ? "rounded-full border border-transparent bg-hospital px-3 py-1 text-[11px] font-bold text-white"
                                : "rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-fg-muted transition-colors hover:border-hospital/40"
                            }
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
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
          {/* Caractère évitable, prévu par la grille du CHIC */}
          <div className="mt-6 rounded-2xl border border-line bg-muted p-5">
            <p className="text-sm font-bold text-fg">
              L&apos;événement était-il évitable ?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["oui", "Oui"],
                  ["non", "Non"],
                  ["indetermine", "Indéterminé"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAvoidable(value)}
                  aria-pressed={avoidable === value}
                  className={
                    avoidable === value
                      ? "min-h-10 rounded-full border border-transparent bg-ink px-4 text-xs font-bold text-on-ink"
                      : "min-h-10 rounded-full border border-line bg-surface px-4 text-xs font-bold text-fg-muted transition-colors hover:border-hospital/40"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Étape 3 de la grille : du facteur contributif à l'action */}
          <div className="mt-8">
            <h4 className="font-display text-base font-extrabold text-fg">
              Plan d&apos;action
            </h4>
            <p className="mt-1 text-sm text-fg-muted">
              Une ligne par famille retenue ci-dessus, comme à l&apos;étape 3 de
              la grille de l&apos;établissement.
            </p>

            {activeFactors.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-line px-5 py-6 text-sm text-fg-muted">
                Renseignez d&apos;abord au moins une famille de facteurs : le
                plan d&apos;action en découle.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-5xl text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-muted text-xs font-bold text-fg-muted uppercase">
                      <th className="px-4 py-3">Facteurs contributifs</th>
                      <th className="px-4 py-3">Causes</th>
                      <th className="px-4 py-3">Actions d&apos;amélioration</th>
                      <th className="px-4 py-3">Priorité</th>
                      <th className="px-4 py-3">Pilote</th>
                      <th className="px-4 py-3">Échéance</th>
                      <th className="px-4 py-3">Indicateurs</th>
                      <th className="px-4 py-3">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {activeFactors.map((factor) => {
                      const row = plan[factor.key] ?? emptyPlanRow(factor.key);
                      const selected = checks[factor.key] ?? [];
                      return (
                        <tr key={factor.key} className="align-top">
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-fg">
                              {factor.label}
                            </p>
                            {selected.length > 0 ? (
                              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                                {selected.join(" · ")}
                              </p>
                            ) : null}
                          </td>
                          <PlanCell
                            label={`Causes — ${factor.label}`}
                            value={row.cause}
                            onChange={(value) =>
                              setPlanField(factor.key, "cause", value)
                            }
                          />
                          <PlanCell
                            label={`Actions — ${factor.label}`}
                            value={row.action}
                            onChange={(value) =>
                              setPlanField(factor.key, "action", value)
                            }
                          />
                          <td className="px-4 py-3">
                            <select
                              aria-label={`Priorité — ${factor.label}`}
                              value={row.priority}
                              onChange={(event) =>
                                setPlanField(
                                  factor.key,
                                  "priority",
                                  event.target.value as Severity,
                                )
                              }
                              className="h-10 w-full min-w-28 rounded-xl border border-line bg-surface px-2 text-xs font-semibold text-fg outline-none focus:border-hospital"
                            >
                              {SEVERITY_ORDER.map((level) => (
                                <option key={level} value={level}>
                                  {SEVERITY_LABELS[level]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <PlanCell
                            label={`Pilote — ${factor.label}`}
                            value={row.owner}
                            onChange={(value) =>
                              setPlanField(factor.key, "owner", value)
                            }
                          />
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              aria-label={`Échéance — ${factor.label}`}
                              value={row.dueDate}
                              onChange={(event) =>
                                setPlanField(
                                  factor.key,
                                  "dueDate",
                                  event.target.value,
                                )
                              }
                              className="h-10 w-full min-w-36 rounded-xl border border-line bg-surface px-2 text-xs text-fg outline-none focus:border-hospital"
                            />
                          </td>
                          <PlanCell
                            label={`Indicateurs — ${factor.label}`}
                            value={row.indicators}
                            onChange={(value) =>
                              setPlanField(factor.key, "indicators", value)
                            }
                          />
                          <PlanCell
                            label={`Observations — ${factor.label}`}
                            value={row.notes}
                            onChange={(value) =>
                              setPlanField(factor.key, "notes", value)
                            }
                          />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
        <Button variant="ink" size="md" onClick={save}>
          <Save className="size-4" />
          Enregistrer l&apos;analyse
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

/** Cellule de saisie libre du plan d'action. */
function PlanCell({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <td className="px-4 py-3">
      <textarea
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="w-full min-w-40 resize-y rounded-xl border border-line bg-surface px-3 py-2 text-xs text-fg outline-none focus:border-hospital"
      />
    </td>
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
