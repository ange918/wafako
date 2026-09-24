"use client";

import { motion } from "framer-motion";
import { CircleCheck, UserRoundCheck, Users } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { cn } from "@/lib/utils";
import type { CrexMeeting } from "@/types";

/**
 * Confirmation de présence à une réunion.
 *
 * Le nombre de participants n'est jamais saisi : il découle des confirmations
 * reçues, ce qui évite un chiffre annoncé qui ne correspond à personne.
 */
export function AttendanceButton({
  meeting,
  personId,
  className,
}: {
  meeting: CrexMeeting;
  personId?: string;
  className?: string;
}) {
  const { confirmAttendance } = useAppState();
  const confirmed = personId
    ? (meeting.confirmedBy ?? []).includes(personId)
    : false;

  if (!personId) {
    return (
      <p className={cn("text-xs text-fg-muted", className)}>
        Créez un compte pour confirmer votre présence.
      </p>
    );
  }

  if (confirmed) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-success/12 px-4 py-2 text-xs font-bold text-success",
          className,
        )}
      >
        <CircleCheck className="size-4" />
        Présence confirmée
      </p>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={() => confirmAttendance(meeting.id, personId)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-xs font-bold text-on-ink transition-[filter] hover:brightness-125",
        className,
      )}
    >
      <UserRoundCheck className="size-4" />
      Je confirme ma présence
    </motion.button>
  );
}

/** Compteur de participants confirmés, avec les noms quand on les connaît. */
export function AttendanceCount({
  meeting,
  withNames = false,
  className,
}: {
  meeting: CrexMeeting;
  withNames?: boolean;
  className?: string;
}) {
  const { people } = useAppState();
  const ids = meeting.confirmedBy ?? [];
  const names = people
    .filter((person) => ids.includes(person.id))
    .map(
      (person) =>
        `${person.kind === "docteur" ? "Dr " : ""}${person.firstName} ${person.lastName}`,
    );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-fg-muted",
        className,
      )}
    >
      <Users className="size-3.5 shrink-0" />
      {ids.length} participant{ids.length > 1 ? "s" : ""} confirmé
      {ids.length > 1 ? "s" : ""}
      {withNames && names.length > 0 ? ` · ${names.join(", ")}` : ""}
    </span>
  );
}
