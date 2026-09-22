"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CalendarClock, MapPin, Users } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { fadeUp, stagger } from "@/lib/motion";
import { clockStore } from "@/lib/external-store";
import { countdownParts, formatDateTime } from "@/lib/utils";

export function CrexTab() {
  const { crexMeetings, nextCrex } = useAppState();

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

      {nextCrex ? (
        <motion.div variants={fadeUp}>
          <NextCrexCard
            title={nextCrex.title}
            scheduledAt={nextCrex.scheduledAt}
            facilitator={nextCrex.facilitator}
            service={nextCrex.service}
            participants={nextCrex.participants}
            references={nextCrex.incidentReferences}
          />
        </motion.div>
      ) : (
        <motion.p
          variants={fadeUp}
          className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-fg-muted"
        >
          Aucune réunion planifiée pour le moment.
        </motion.p>
      )}

      <motion.section variants={fadeUp}>
        <h3 className="font-display mb-3 px-1 text-base font-extrabold text-fg">
          Historique
        </h3>
        <ul className="space-y-2.5">
          {crexMeetings
            .filter((meeting) => meeting.id !== nextCrex?.id)
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
}: {
  title: string;
  scheduledAt: string;
  facilitator: string;
  service: string;
  participants: number;
  references: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-on-ink shadow-lift">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-vivid/25 blur-3xl"
      />

      <p className="relative text-xs font-bold tracking-wide text-on-ink/60 uppercase">
        Prochaine réunion
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
        <p className="flex items-center gap-2">
          <Users className="size-4 shrink-0 text-softblue" />
          {participants} participants · animé par {facilitator}
        </p>
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
