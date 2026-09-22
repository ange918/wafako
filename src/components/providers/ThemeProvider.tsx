"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { STORAGE_KEYS } from "@/lib/storage";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Script exécuté avant le premier paint pour éviter le flash de thème clair.
 * Il doit rester autonome : il s'exécute avant tout bundle React.
 */
const NO_FLASH_SCRIPT = `(function(){try{var k=${JSON.stringify(
  STORAGE_KEYS.theme,
)};var s=localStorage.getItem(k);var d=s?JSON.parse(s):null;if(d!=="light"&&d!=="dark"){d=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(d==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

/**
 * La source de vérité est la classe `dark` posée sur <html> par le script
 * ci-dessus. Elle n'est lisible qu'après hydratation, d'où le store externe.
 */
const themeStore = (() => {
  let snapshot: Theme = "light";
  let loaded = false;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      if (!loaded) {
        loaded = true;
        snapshot = document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: (): Theme => "light",
    set(next: Theme) {
      loaded = true;
      snapshot = next;
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(next));
      } catch {
        /* stockage indisponible : le thème reste valable pour la session */
      }
      listeners.forEach((listener) => listener());
    },
  };
})();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => themeStore.set(next), []);
  const toggleTheme = useCallback(
    () =>
      themeStore.set(themeStore.getSnapshot() === "dark" ? "light" : "dark"),
    [],
  );

  return (
    <>
      <script
        // Contenu statique et sans entrée utilisateur.
        dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
      />
      <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return context;
}
