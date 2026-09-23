/**
 * Calendrier des CREX.
 *
 * Les comités de retour d'expérience du Centre Hospitalier International de
 * Calavi se tiennent à date fixe, un jour donné du mois, et chaque service a
 * la sienne. Ce module traduit ce réglage en échéances datées : la prochaine
 * réunion d'un service, et la période qu'elle couvre — c'est-à-dire les
 * événements classés depuis la réunion précédente.
 */

import type { CrexCalendar } from "@/types";

/** Jour retenu à défaut de réglage pour le service. */
export const DEFAULT_CREX_DAY = 10;

/** Février s'arrête au 28 : au-delà, la réunion sauterait certains mois. */
export const MAX_CREX_DAY = 28;

/** Heure conventionnelle de début, faute de créneau saisi. */
const CREX_HOUR = 9;

export function clampCrexDay(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_CREX_DAY;
  return Math.min(MAX_CREX_DAY, Math.max(1, Math.round(value)));
}

export function crexDayFor(calendar: CrexCalendar, service: string) {
  return clampCrexDay(calendar[service] ?? DEFAULT_CREX_DAY);
}

/** Réunion du mois de `reference`, au jour retenu. */
function meetingOf(reference: Date, day: number) {
  return new Date(
    reference.getFullYear(),
    reference.getMonth(),
    clampCrexDay(day),
    CREX_HOUR,
    0,
    0,
    0,
  );
}

/**
 * Prochaine échéance à partir d'un instant donné.
 *
 * `fromMs` vaut 0 avant hydratation, l'horloge n'existant pas au rendu
 * serveur : la fonction renvoie alors `null` plutôt qu'une date inventée.
 */
export function nextCrexDate(day: number, fromMs: number): Date | null {
  if (!fromMs) return null;
  const from = new Date(fromMs);
  const thisMonth = meetingOf(from, day);
  if (thisMonth.getTime() > fromMs) return thisMonth;
  return meetingOf(new Date(from.getFullYear(), from.getMonth() + 1, 1), day);
}

/** La `count` échéances précédant `date`, de la plus récente à la plus ancienne. */
export function previousCrexDates(day: number, date: Date, count: number) {
  return Array.from({ length: count }, (_, index) =>
    meetingOf(
      new Date(date.getFullYear(), date.getMonth() - (index + 1), 1),
      day,
    ),
  );
}

/**
 * Période couverte par une réunion : ce qui a été classé depuis la précédente.
 * Bornes incluse au début, exclue à la fin.
 */
export function crexPeriod(meeting: Date, day: number) {
  const [previous] = previousCrexDates(day, meeting, 1);
  return { start: previous, end: meeting };
}

/** « du 11 août au 10 sept. 2026 » */
export function formatCrexPeriod(period: { start: Date; end: Date }) {
  const format = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return `du ${format(period.start)} au ${format(period.end)}`;
}
