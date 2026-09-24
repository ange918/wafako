"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";
import { SEVERITY_LABELS, SEVERITY_ORDER } from "@/lib/mock-data";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types";

/**
 * Attribution d'une action corrective.
 *
 * Utilisée par la direction comme par la cellule qualité : l'une et l'autre
 * désignent qui doit agir, dans tout l'annuaire — personnel comme docteurs.
 * L'action apparaît aussitôt dans l'espace des personnes choisies, avec une
 * notification.
 */
export function AssignActionForm({
  assignedByFallback = "La direction",
}: {
  assignedByFallback?: string;
}) {
  const { assignAction, staff, doctors, incidents, profile } = useAppState();
  const people = [...staff, ...doctors];

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [priority, setPriority] = useState<Severity>("modere");
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const toggle = (id: string) =>
    setAssignees((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Donnez un intitulé à l'action.");
      return;
    }
    if (assignees.length === 0) {
      setError("Désignez au moins un destinataire.");
      return;
    }
    if (!dueDate) {
      setError("Fixez une échéance.");
      return;
    }
    setError(null);

    const chosen = people.filter((person) => assignees.includes(person.id));
    const created = assignAction({
      title: title.trim(),
      summary: summary.trim() || undefined,
      incidentReference: reference,
      service: chosen[0]?.service ?? chosen[0]?.specialty ?? "—",
      owner: chosen
        .map((person) => `${person.firstName} ${person.lastName}`)
        .join(", "),
      assigneeIds: assignees,
      assignedBy:
        `${profile.firstName} ${profile.lastName}`.trim() || assignedByFallback,
      decisionDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      priority,
    });

    setConfirmation(
      `« ${created.title} » attribuée à ${chosen.length} personne${chosen.length > 1 ? "s" : ""}.`,
    );
    setTitle("");
    setSummary("");
    setAssignees([]);
    setDueDate("");
    setReference("");
    window.setTimeout(() => setConfirmation(null), 4000);
  };

  return (
    <Card>
      <CardHeader
        title="Attribuer une action"
        subtitle="L'action apparaît aussitôt dans l'espace des personnes désignées"
      />

      {people.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-fg-muted">
          L&apos;annuaire est vide : aucun compte n&apos;a encore été créé sur
          cet appareil. Une action ne peut être attribuée à personne.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5 px-6 py-5">
          <Input
            name="actionTitle"
            label="Intitulé de l'action"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Mettre en place le double contrôle avant administration"
          />

          <Textarea
            name="actionSummary"
            label="Description"
            hint="facultatif"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Ce qui est attendu, les moyens, le périmètre…"
            className="min-h-20"
          />

          {/* Destinataires : plusieurs personnes possibles. */}
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">
              Destinataires
              <span className="ml-2 font-normal text-fg-muted">
                plusieurs choix possibles
              </span>
            </p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-2xl border border-line p-2">
              {people.map((person) => {
                const active = assignees.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggle(person.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-hospital/10" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border",
                        active
                          ? "border-transparent bg-hospital text-white"
                          : "border-line",
                      )}
                    >
                      {active ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-fg">
                        {person.kind === "docteur" ? "Dr " : ""}
                        {person.firstName} {person.lastName}
                      </span>
                      <span className="block truncate text-xs text-fg-muted">
                        {person.specialty ??
                          [person.role, person.service]
                            .filter(Boolean)
                            .join(" · ")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              name="actionPriority"
              label="Priorité"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Severity)}
            >
              {SEVERITY_ORDER.map((level) => (
                <option key={level} value={level}>
                  {SEVERITY_LABELS[level]}
                </option>
              ))}
            </Select>
            <Input
              name="actionDueDate"
              label="Échéance"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <Select
            name="actionReference"
            label="Événement rattaché"
            hint="facultatif"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          >
            <option value="">Aucun</option>
            {incidents.map((incident) => (
              <option key={incident.id} value={incident.reference}>
                {incident.reference} — {incident.service}
              </option>
            ))}
          </Select>

          {error ? (
            <p className="rounded-2xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="ink" size="lg" className="w-full">
            <UserRoundPlus className="size-4.5" />
            Attribuer l&apos;action
          </Button>

          <AnimatePresence>
            {confirmation ? (
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-success/12 px-4 py-3 text-sm font-semibold text-success"
              >
                {confirmation}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </form>
      )}
    </Card>
  );
}
