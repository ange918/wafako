"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_PROFILE,
  SEED_ACTIONS,
  SEED_CREX,
  SEED_INCIDENTS,
} from "@/lib/mock-data";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { createLazyStore, networkStore } from "@/lib/external-store";
import { uid } from "@/lib/utils";
import type {
  ActionItem,
  ActionStatus,
  CrexMeeting,
  DeclarationDraft,
  Incident,
  UserProfile,
} from "@/types";

interface PersistedState {
  profile: UserProfile;
  incidents: Incident[];
  actions: ActionItem[];
  crexMeetings: CrexMeeting[];
  forcedOffline: boolean;
}

/** Instantané rendu par le serveur et au premier rendu client. */
const SERVER_STATE: PersistedState = {
  profile: DEFAULT_PROFILE,
  incidents: SEED_INCIDENTS,
  actions: SEED_ACTIONS,
  crexMeetings: SEED_CREX,
  forcedOffline: false,
};

const stateStore = createLazyStore<PersistedState>({
  initial: SERVER_STATE,
  // Exécuté au premier abonnement, donc après hydratation.
  load: () => ({
    profile: readJson(STORAGE_KEYS.profile, DEFAULT_PROFILE),
    incidents: readJson(STORAGE_KEYS.incidents, SEED_INCIDENTS),
    actions: readJson(STORAGE_KEYS.actions, SEED_ACTIONS),
    crexMeetings: readJson(STORAGE_KEYS.crex, SEED_CREX),
    forcedOffline: readJson(STORAGE_KEYS.forcedOffline, false),
  }),
});

/** Applique une modification partielle et persiste les clés concernées. */
function patchState(patch: Partial<PersistedState>) {
  const next = { ...stateStore.get(), ...patch };
  if (patch.profile) writeJson(STORAGE_KEYS.profile, next.profile);
  if (patch.incidents) writeJson(STORAGE_KEYS.incidents, next.incidents);
  if (patch.actions) writeJson(STORAGE_KEYS.actions, next.actions);
  if (patch.crexMeetings) writeJson(STORAGE_KEYS.crex, next.crexMeetings);
  if (patch.forcedOffline !== undefined) {
    writeJson(STORAGE_KEYS.forcedOffline, next.forcedOffline);
  }
  stateStore.set(next);
}

interface AppStateValue extends PersistedState {
  /** Connectivité effective : réseau réel ET interrupteur de démonstration. */
  isOnline: boolean;
  pendingCount: number;
  nextCrex: CrexMeeting | null;
  setProfile: (profile: UserProfile) => void;
  setForcedOffline: (value: boolean) => void;
  addIncident: (draft: DeclarationDraft) => Incident;
  updateActionStatus: (id: string, status: ActionStatus) => void;
  updateAlarm: (incidentId: string, alarm: Incident["alarm"]) => void;
  scheduleCrex: (meeting: Omit<CrexMeeting, "id">) => void;
  syncPending: () => void;
  resetDemo: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    stateStore.subscribe,
    stateStore.getSnapshot,
    stateStore.getServerSnapshot,
  );

  const networkOnline = useSyncExternalStore(
    networkStore.subscribe,
    networkStore.getSnapshot,
    networkStore.getServerSnapshot,
  );

  const isOnline = networkOnline && !state.forcedOffline;

  const setProfile = useCallback(
    (profile: UserProfile) => patchState({ profile }),
    [],
  );

  const setForcedOffline = useCallback(
    (forcedOffline: boolean) => patchState({ forcedOffline }),
    [],
  );

  const addIncident = useCallback((draft: DeclarationDraft) => {
    const current = stateStore.get();
    const now = new Date();
    const sequence = 149 + current.incidents.length;
    const incident: Incident = {
      id: uid("inc"),
      reference: `EI-${now.getFullYear()}-${String(sequence).padStart(4, "0")}`,
      category: draft.category ?? "autre",
      severity: draft.severity,
      status: "nouveau",
      service: current.profile.service,
      hospitalId: current.profile.hospitalId,
      description: draft.description,
      occurredAt: draft.occurredAt,
      declaredAt: now.toISOString(),
      declaredBy: `${current.profile.firstName.charAt(0)}. ${current.profile.lastName}`,
      attachmentName: draft.attachmentName,
      // Hors-ligne, la fiche reste en file d'attente locale.
      sync:
        navigator.onLine && !current.forcedOffline
          ? "synchronise"
          : "en_attente",
    };
    patchState({ incidents: [incident, ...current.incidents] });
    return incident;
  }, []);

  const updateActionStatus = useCallback((id: string, status: ActionStatus) => {
    patchState({
      actions: stateStore
        .get()
        .actions.map((action) =>
          action.id === id ? { ...action, status } : action,
        ),
    });
  }, []);

  const updateAlarm = useCallback(
    (incidentId: string, alarm: Incident["alarm"]) => {
      patchState({
        incidents: stateStore
          .get()
          .incidents.map((incident) =>
            incident.id === incidentId
              ? { ...incident, alarm, status: "en_analyse" }
              : incident,
          ),
      });
    },
    [],
  );

  const scheduleCrex = useCallback((meeting: Omit<CrexMeeting, "id">) => {
    patchState({
      crexMeetings: [
        ...stateStore.get().crexMeetings,
        { ...meeting, id: uid("crex") },
      ],
    });
  }, []);

  const syncPending = useCallback(() => {
    patchState({
      incidents: stateStore
        .get()
        .incidents.map((incident) =>
          incident.sync === "en_attente"
            ? { ...incident, sync: "synchronise" }
            : incident,
        ),
    });
  }, []);

  const resetDemo = useCallback(() => patchState(SERVER_STATE), []);

  const pendingCount = useMemo(
    () =>
      state.incidents.filter((incident) => incident.sync === "en_attente")
        .length,
    [state.incidents],
  );

  // La file d'attente se vide dès que la connexion revient.
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;
    const timer = window.setTimeout(syncPending, 1500);
    return () => window.clearTimeout(timer);
  }, [isOnline, pendingCount, syncPending]);

  const nextCrex = useMemo(() => {
    const upcoming = state.crexMeetings
      .filter((meeting) => !meeting.done)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    return upcoming[0] ?? null;
  }, [state.crexMeetings]);

  const value: AppStateValue = {
    ...state,
    isOnline,
    pendingCount,
    nextCrex,
    setProfile,
    setForcedOffline,
    addIncident,
    updateActionStatus,
    updateAlarm,
    scheduleCrex,
    syncPending,
    resetDemo,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState doit être utilisé dans un AppStateProvider");
  }
  return context;
}
