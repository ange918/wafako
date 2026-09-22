"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, FileDown, FileText, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
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
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !service || !date || !facilitator.trim()) {
      setError("Complétez tous les champs pour planifier la réunion.");
      return;
    }
    setError(null);
    scheduleCrex({
      title: title.trim(),
      service,
      scheduledAt: new Date(date).toISOString(),
      facilitator: facilitator.trim(),
      incidentReferences: [],
      participants: 8,
      done: false,
    });
    setConfirmation(`« ${title.trim()} » a été planifiée.`);
    setTitle("");
    setService("");
    setDate("");
    setFacilitator("");
    window.setTimeout(() => setConfirmation(null), 3000);
  };

  /** Export simulé : aucun fichier n'est produit en périmètre frontend. */
  const simulateExport = (format: "pdf" | "word") => {
    setExporting(format);
    window.setTimeout(() => setExporting(null), 1400);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader
          title="Planifier un CREX"
          subtitle="Comité de retour d'expérience"
        />
        <form onSubmit={submit} noValidate className="space-y-4 px-6 py-5">
          <Input
            name="crexTitle"
            label="Intitulé"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="CREX Urgences — octobre"
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
            placeholder="Dr K. Houngbé"
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
                    {formatDateTime(meeting.scheduledAt)} · {meeting.service} ·{" "}
                    {meeting.facilitator}
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

        <Card>
          <CardHeader
            title="Note de CREX"
            subtitle="Compte rendu prêt à diffuser aux équipes"
          />
          <div className="px-6 py-5">
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-muted p-4">
              <FileText className="mt-0.5 size-5 shrink-0 text-hospital" />
              <p className="text-sm leading-relaxed text-fg-muted">
                La note reprend les événements analysés, les causes ALARM
                retenues et les actions décidées avec leurs échéances.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="ink"
                size="md"
                onClick={() => simulateExport("pdf")}
                disabled={exporting !== null}
              >
                {exporting === "pdf" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Exporter en PDF
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => simulateExport("word")}
                disabled={exporting !== null}
              >
                {exporting === "word" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Exporter en Word
              </Button>
            </div>

            <p className="mt-3 text-xs text-fg-muted">
              Export simulé : aucun fichier n&apos;est généré dans cette
              maquette frontend.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
