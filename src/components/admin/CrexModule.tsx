"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CrexReport } from "./CrexReport";
import { Input, Select } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";
import { SERVICES } from "@/lib/mock-data";
import { fadeUp } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";

export function CrexModule() {
  const { crexMeetings, scheduleCrex } = useAppState();
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [participants, setParticipants] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !service || !date || !facilitator.trim()) {
      setError("Complétez tous les champs pour planifier la réunion.");
      return;
    }
    setError(null);
    scheduleCrex({
      kind: "crex",
      title: title.trim(),
      service,
      scheduledAt: new Date(date).toISOString(),
      facilitator: facilitator.trim(),
      incidentReferences: [],
      participants: Number(participants) || 0,
      done: false,
    });
    setConfirmation(`« ${title.trim()} » a été planifiée.`);
    setTitle("");
    setService("");
    setDate("");
    setFacilitator("");
    setParticipants("");
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
            <Input
              name="crexFacilitator"
              label="Animateur"
              value={facilitator}
              onChange={(event) => setFacilitator(event.target.value)}
              placeholder="Nom de l'animateur"
            />
            <Input
              name="crexParticipants"
              label="Participants attendus"
              type="number"
              min={0}
              value={participants}
              onChange={(event) => setParticipants(event.target.value)}
              placeholder="0"
            />

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
                      · {meeting.facilitator}
                    </p>
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
