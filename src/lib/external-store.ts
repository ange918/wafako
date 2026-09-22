/**
 * Lecture d'états externes (localStorage, réseau, horloge) via
 * `useSyncExternalStore`.
 *
 * Ces valeurs n'existent pas au rendu serveur. Les initialiser dans un
 * `useEffect` provoquerait un rendu en cascade que React 19 déconseille ; le
 * mécanisme de snapshot serveur/client gère ce cas nativement, sans mismatch
 * d'hydratation.
 */

type Listener = () => void;

export interface ExternalStore<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
}

/**
 * Store dont la valeur réelle n'est lue qu'au premier abonnement, donc après
 * hydratation. `getSnapshot` renvoie toujours une référence stable.
 */
export function createLazyStore<T>(options: {
  /** Valeur rendue par le serveur et au premier rendu client. */
  initial: T;
  /** Lecture réelle, exécutée côté client uniquement. */
  load: () => T;
}): ExternalStore<T> & {
  set: (next: T) => void;
  get: () => T;
} {
  let snapshot = options.initial;
  let loaded = false;
  const listeners = new Set<Listener>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      if (!loaded) {
        loaded = true;
        snapshot = options.load();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => options.initial,
    get: () => snapshot,
    set(next) {
      loaded = true;
      snapshot = next;
      emit();
    },
  };
}

/** Connectivité réseau réelle du navigateur. */
export const networkStore: ExternalStore<boolean> = (() => {
  let snapshot = true;
  const listeners = new Set<Listener>();

  const update = () => {
    snapshot = navigator.onLine;
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      snapshot = navigator.onLine;
      listeners.add(listener);
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    },
    getSnapshot: () => snapshot,
    // Le serveur ne connaît pas l'état réseau : on suppose connecté.
    getServerSnapshot: () => true,
  };
})();

/**
 * Horloge à la seconde.
 *
 * La valeur est mise en cache entre deux ticks pour que `getSnapshot` reste
 * stable pendant un rendu.
 */
export const clockStore: ExternalStore<number> = (() => {
  let snapshot = 0;
  const listeners = new Set<Listener>();
  let timer: number | null = null;

  const tick = () => {
    snapshot = Date.now();
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      if (snapshot === 0) snapshot = Date.now();
      listeners.add(listener);
      if (timer === null) timer = window.setInterval(tick, 1000);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      };
    },
    getSnapshot: () => snapshot,
    // 0 signale « horloge pas encore disponible » côté serveur.
    getServerSnapshot: () => 0,
  };
})();
