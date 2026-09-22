import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Concatène des classes Tailwind en résolvant les conflits d'utilitaires. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "12 janv. 2026 à 14:30" */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "12 janv. 2026" */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Montants en francs CFA, sans décimales. */
export function formatFcfa(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

/** Initiales affichées dans les avatars. */
export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Identifiant unique sans dépendance externe.
 * `crypto.randomUUID` n'existe pas dans tous les contextes (http non sécurisé),
 * d'où le repli.
 */
export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Décompose un écart de temps pour un compte à rebours. */
export function countdownParts(targetIso: string, fromMs: number) {
  const diff = Math.max(0, new Date(targetIso).getTime() - fromMs);
  return {
    total: diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}
