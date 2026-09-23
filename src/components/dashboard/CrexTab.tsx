"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  MapPin,
  Siren,
  Users,
} from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { fadeUp, stagger } from "@/lib/motion";
import { clockStore } from "@/lib/external-store";
import {
  crexDayFor,
  crexPeriod,
  formatCrexPeriod,
  nextCrexDate,
} from "@/lib/crex";
import { countdownParts, formatDateTime } from "@/lib/utils";

export function CrexTab() {
  const { crexMeetings, crexCalendar, nextCrex, profile } = useAppState();

  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  // La réunion mensuelle n'est pas saisie : elle découle du jour retenu pour
  // le service. Un rassemblement convoqué en urgence passe devant s'il tombe
  // avant cette échéance.
  const service = profile.service || "votre service";
  const day = crexDayFor(crexCalendar, profile.service);
  const monthly = nextCrexDate(day, now);
  const period = monthly ? crexPeriod(monthly, day) : null;

  const urgentFirst =
    nextCrex &&
    monthly &&
    new Date(nextCrex.scheduledAt).getTime() < monthly.getTime()
      ? nextCrex
      : null;

  return (
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-display px-1 text-xl font-extrabold text-fg">
          Comités de retour d&apos;expérience
        </h2>
        <p className="mt-1 px-1 text-sm text-fg-muted">
          Analyse collective et non punitive des événements du service.
        </p>
      </motion.div>

      {urgentFirst ? (
        <motion.div variants={fadeUp}>
          <NextCrexCard
            title={urgentFirst.title}
            scheduledAt={urgentFirst.scheduledAt}
            facilitator={urgentFirst.facilitator}
            service={urgentFirst.service}
            participants={urgentFirst.participants}
            references={urgentFirst.incidentReferences}
            urgent={urgentFirst.kind === "urgence"}
          />
        </motion.div>
      ) : null}

      {/* Réunion mensuelle à date fixe, propre au service */}
      <motion.div variants={fadeUp}>
        {monthly && period ? (
          <NextCrexCard
            title={`CREX mensuel — ${service}`}
            scheduledAt={monthly.toISOString()}
            service={service}
            note={`Fiches classées ${formatCrexPeriod(period)}`}
            references={[]}
          />
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-fg-muted">
            Calcul de la prochaine réunion…
          </p>
        )}
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="px-1 text-xs leading-relaxed text-fg-muted"
      >
        La réunion se tient le {day} de chaque mois pour {service}. Le jour se
        règle dans la configuration de l&apos;établissement.
      </motion.p>

      <motion.section variants={fadeUp}>
        <h3 className="font-display mb-3 px-1 text-base font-extrabold text-fg">
          Historique
        </h3>
        {crexMeetings.filter((meeting) => meeting.id !== urgentFirst?.id)
          .length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-fg-muted">
            Aucune réunion passée à afficher.
          </p>
        ) : null}
        <ul className="space-y-2.5">
          {crexMeetings
            .filter((meeting) => meeting.id !== urgentFirst?.id)
            .map((meeting) => (
              <li
                key={meeting.id}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4"
              >
                <span
                  className={
                    meeting.done
                      ? "grid size-10 shrink-0 place-items-center rounded-xl bg-success/15 text-success"
                      : "grid size-10 shrink-0 place-items-center rounded-xl bg-hospital/10 text-hospital"
                  }
                >
                  {meeting.done ? (
                    <CalendarCheck className="size-5" />
                  ) : (
                    <CalendarClock className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-fg">
                    {meeting.title}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {formatDateTime(meeting.scheduledAt)} · {meeting.service}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-fg-muted">
                  {meeting.done ? "Tenue" : "À venir"}
                </span>
              </li>
            ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}

function NextCrexCard({
  title,
  scheduledAt,
  facilitator,
  service,
  participants,
  references,
  note,
  urgent = false,
}: {
  title: string;
  scheduledAt: string;
  facilitator?: string;
  service: string;
  participants?: number;
  references: string[];
  note?: string;
  urgent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-on-ink shadow-lift">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-vivid/25 blur-3xl"
      />

      <p className="relative flex items-center gap-2 text-xs font-bold tracking-wide text-on-ink/60 uppercase">
        {urgent ? <Siren className="size-4 text-alert" /> : null}
        {urgent ? "Rassemblement immédiat" : "Prochaine réunion"}
      </p>
      <h3 className="font-display relative mt-2 text-xl leading-snug font-extrabold">
        {title}
      </h3>
      <p className="relative mt-1.5 text-sm text-on-ink/70">
        {formatDateTime(scheduledAt)}
      </p>

      <Countdown targetIso={scheduledAt} />

      <div className="relative mt-5 space-y-2 text-sm text-on-ink/80">
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-softblue" />
          Service {service}
        </p>
        {facilitator ? (
          <p className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-softblue" />
            {participants ?? 0} participants · animé par {facilitator}
          </p>
        ) : null}
        {note ? (
          <p className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-softblue" />
            {note}
          </p>
        ) : null}
      </div>

      {references.length > 0 ? (
        <div className="relative mt-5">
          <p className="text-xs font-semibold text-on-ink/60">
            Événements à l&apos;ordre du jour
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {references.map((reference) => (
              <span
                key={reference}
                className="rounded-full bg-on-ink/12 px-3 py-1 text-xs font-bold"
              >
                {reference}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compte à rebours.
 *
 * `Date.now()` diffère entre serveur et client. L'horloge est donc lue comme
 * un store externe : le serveur renvoie 0 (« pas encore disponible ») et la
 * valeur réelle arrive après hydratation, sans mismatch.
 */
function Countdown({ targetIso }: { targetIso: string }) {
  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  const parts = now === 0 ? null : countdownParts(targetIso, now);

  const cells = [
    { label: "jours", value: parts?.days },
    { label: "heures", value: parts?.hours },
    { label: "min", value: parts?.minutes },
    { label: "sec", value: parts?.seconds },
  ];

  if (parts !== null && parts.total === 0) {
    return (
      <p className="relative mt-5 rounded-2xl bg-on-ink/12 px-4 py-3 text-sm font-bold">
        La réunion a commencé.
      </p>
    );
  }

  return (
    <div className="relative mt-5 grid grid-cols-4 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-2xl bg-on-ink/10 px-2 py-3 text-center"
        >
          <p className="font-display text-2xl font-extrabold tabular-nums">
            {cell.value === undefined
              ? "--"
              : String(cell.value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-on-ink/60 uppercase">
            {cell.label}
          </p>
        </div>
      ))}
    </div>
  );
}
