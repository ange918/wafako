/**
 * Accès localStorage tolérant aux erreurs.
 *
 * localStorage peut lever : navigation privée, stockage désactivé, quota
 * dépassé. Toute l'application doit rester utilisable sans persistance, donc
 * chaque accès échoue silencieusement plutôt que de casser le rendu.
 */

const PREFIX = "safecare.";

export const STORAGE_KEYS = {
  profile: `${PREFIX}profile`,
  admin: `${PREFIX}admin`,
  incidents: `${PREFIX}incidents`,
  actions: `${PREFIX}actions`,
  crex: `${PREFIX}crex`,
  forcedOffline: `${PREFIX}forcedOffline`,
  theme: `${PREFIX}theme`,
  session: `${PREFIX}session`,
  quality: `${PREFIX}qualitySession`,
  notifications: `${PREFIX}notifications`,
  adminSession: `${PREFIX}adminSession`,
} as const;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* stockage indisponible : rien à faire */
  }
}

/** Remet la démonstration à zéro depuis l'écran Paramètres. */
export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach(removeKey);
}
