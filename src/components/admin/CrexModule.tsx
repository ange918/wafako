"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CrexReport } from "./CrexReport";
import { Input, Select } from "@/components/ui/Field";
import { AttendanceCount } from "@/components/meetings/Attendance";
import { useAppState } from "@/components/providers/AppStateProvider";
import { SERVICES } from "@/lib/mock-data";
import { fadeUp } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";

export function CrexModule() {
  const { crexMeetings, scheduleCrex, staff, doctors } = useAppState();
  // L'animateur est choisi dans l'annuaire ; la saisie libre ne sert que
  // tant qu'aucun compte n'a été créé.
  const people = [...staff, ...doctors];
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !service || !date || !facilitator.trim()) {
      setError("Complétez tous les champs pour planifier la réunion.");
      return;
    }
    setError(null);
    const animator = people.find((person) => person.id === facilitator);
    scheduleCrex({
      kind: "crex",
      title: title.trim(),
      service,
      scheduledAt: new Date(date).toISOString(),
      facilitator: animator
        ? `${animator.kind === "docteur" ? "Dr " : ""}${animator.firstName} ${animator.lastName}`
        : facilitator.trim(),
      facilitatorId: animator?.id,
      incidentReferences: [],
      confirmedBy: [],
      done: false,
    });
    setConfirmation(`« ${title.trim()} » a été planifiée.`);
    setTitle("");
    setService("");
    setDate("");
    setFacilitator("");
    window.setTimeout(() => setConfirmation(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader
            title="Planifier une réunion exceptionnelle"
            subtitle="En complément du CREX mensuel, qui se tient à date fixe"
          />
          <form onSubmit={submit} noValidate className="space-y-4 px-6 py-5">
            <Input
              name="crexTitle"
              label="Intitulé"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Intitulé de la réunion"
            />
            <Select
              name="crexService"
              label="Service concerné"
              value={service}
              onChange={(event) => setService(event.target.value)}
            >
              <option value="">Sélectionner…</option>
              {SERVICES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              name="crexDate"
              label="Date et heure"
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            {people.length > 0 ? (
              <Select
                name="crexFacilitator"
                label="Animée par"
                value={facilitator}
                onChange={(event) => setFacilitator(event.target.value)}
              >
                <option value="">Sélectionner…</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.kind === "docteur" ? "Dr " : ""}
                    {person.firstName} {person.lastName}
                    {person.specialty ? ` — ${person.specialty}` : ""}
                    {person.service ? ` — ${person.service}` : ""}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                name="crexFacilitator"
                label="Animée par"
                hint="aucun compte dans l'annuaire"
                value={facilitator}
                onChange={(event) => setFacilitator(event.target.value)}
                placeholder="Nom de l'animateur"
              />
            )}

            <p className="rounded-2xl border border-line bg-muted px-4 py-3 text-xs leading-relaxed text-fg-muted">
              Les participants ne se saisissent pas : chacun confirme sa
              présence depuis son espace, et le compte se met à jour tout seul.
            </p>

            {error ? (
              <p className="rounded-2xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="ink" size="lg" className="w-full">
              <CalendarPlus className="size-4.5" />
              Planifier la réunion
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
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Réunions planifiées"
              subtitle={`${crexMeetings.length} au total`}
            />
            {crexMeetings.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-fg-muted">
                Aucune réunion planifiée. Utilisez le formulaire pour en créer
                une.
              </p>
            ) : null}
            <ul className="divide-y divide-line">
              {crexMeetings.map((meeting) => (
                <li
                  key={meeting.id}
                  className="flex items-start justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-fg">
                      {meeting.title}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {formatDateTime(meeting.scheduledAt)} · {meeting.service}{" "}
                      · animée par {meeting.facilitator}
                    </p>
                    <AttendanceCount
                      meeting={meeting}
                      withNames
                      className="mt-1.5"
                    />
                  </div>
                  <span
                    className={
                      meeting.done
                        ? "shrink-0 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success"
                        : "shrink-0 rounded-full bg-hospital/12 px-3 py-1 text-xs font-bold text-hospital"
                    }
                  >
                    {meeting.done ? "Tenue" : "À venir"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <CrexReport />
    </div>
  );
}
