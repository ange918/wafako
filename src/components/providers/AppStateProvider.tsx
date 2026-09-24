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
  CRITICALITY_LABELS,
  DECISION_LABELS,
  EMPTY_PROFILE,
} from "@/lib/mock-data";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { createLazyStore, networkStore } from "@/lib/external-store";
import { clampCrexDay } from "@/lib/crex";
import { uid } from "@/lib/utils";
import type {
  ActionItem,
  ActionStatus,
  AlarmPlanRow,
  AppNotification,
  Classification,
  CrexCalendar,
  CrexMeeting,
  DeclarationDraft,
  Incident,
  Person,
  UserProfile,
} from "@/types";

interface PersistedState {
  profile: UserProfile;
  /** Annuaire de l'établissement : personnel et docteurs inscrits. */
  people: Person[];
  /** Docteur connecté sur cet appareil, par identifiant d'annuaire. */
  currentDoctorId: string | null;
  incidents: Incident[];
  actions: ActionItem[];
  crexMeetings: CrexMeeting[];
  /** Jour du mois retenu pour le CREX, service par service. */
  crexCalendar: CrexCalendar;
  forcedOffline: boolean;
  notifications: AppNotification[];
  /** Session soignant simulée : conditionne l'accès à /dashboard. */
  isAuthenticated: boolean;
  /** Session de la cellule qualité, qui reçoit et classe les déclarations. */
  isQualityAuthenticated: boolean;
  /** Session administrateur, distincte de celle du soignant. */
  isAdminAuthenticated: boolean;
  /**
   * false tant que le stockage local n'a pas été lu, c'est-à-dire pendant le
   * rendu serveur et le premier rendu client. Les gardes d'accès attendent ce
   * drapeau avant de rediriger, sinon un visiteur connecté serait renvoyé vers
   * la connexion le temps d'une frame.
   */
  hydrated: boolean;
}

/**
 * Instantané rendu par le serveur et au premier rendu client.
 *
 * L'application démarre vide : aucun incident, aucune action et aucune réunion
 * n'est pré-remplie. Tout ce qui s'affiche vient de ce que les utilisateurs
 * saisissent.
 */
const SERVER_STATE: PersistedState = {
  profile: EMPTY_PROFILE,
  people: [],
  currentDoctorId: null,
  incidents: [],
  actions: [],
  crexMeetings: [],
  crexCalendar: {},
  forcedOffline: false,
  notifications: [],
  isAuthenticated: false,
  isQualityAuthenticated: false,
  isAdminAuthenticated: false,
  hydrated: false,
};

const stateStore = createLazyStore<PersistedState>({
  initial: SERVER_STATE,
  // Exécuté au premier abonnement, donc après hydratation.
  load: () => ({
    profile: readJson(STORAGE_KEYS.profile, EMPTY_PROFILE),
    people: readJson<Person[]>(STORAGE_KEYS.people, []),
    currentDoctorId: readJson<string | null>(STORAGE_KEYS.doctorSession, null),
    incidents: readJson<Incident[]>(STORAGE_KEYS.incidents, []),
    actions: readJson<ActionItem[]>(STORAGE_KEYS.actions, []),
    crexMeetings: readJson<CrexMeeting[]>(STORAGE_KEYS.crex, []),
    crexCalendar: readJson<CrexCalendar>(STORAGE_KEYS.crexCalendar, {}),
    forcedOffline: readJson(STORAGE_KEYS.forcedOffline, false),
    notifications: readJson<AppNotification[]>(STORAGE_KEYS.notifications, []),
    isAuthenticated: readJson(STORAGE_KEYS.session, false),
    isQualityAuthenticated: readJson(STORAGE_KEYS.quality, false),
    isAdminAuthenticated: readJson(STORAGE_KEYS.adminSession, false),
    hydrated: true,
  }),
});

/** Applique une modification partielle et persiste les clés concernées. */
function patchState(patch: Partial<PersistedState>) {
  const next = { ...stateStore.get(), ...patch };
  if (patch.profile) writeJson(STORAGE_KEYS.profile, next.profile);
  if (patch.people) writeJson(STORAGE_KEYS.people, next.people);
  if (patch.currentDoctorId !== undefined) {
    writeJson(STORAGE_KEYS.doctorSession, next.currentDoctorId);
  }
  if (patch.incidents) writeJson(STORAGE_KEYS.incidents, next.incidents);
  if (patch.actions) writeJson(STORAGE_KEYS.actions, next.actions);
  if (patch.crexMeetings) writeJson(STORAGE_KEYS.crex, next.crexMeetings);
  if (patch.crexCalendar)
    writeJson(STORAGE_KEYS.crexCalendar, next.crexCalendar);
  if (patch.forcedOffline !== undefined) {
    writeJson(STORAGE_KEYS.forcedOffline, next.forcedOffline);
  }
  if (patch.notifications) {
    writeJson(STORAGE_KEYS.notifications, next.notifications);
  }
  if (patch.isAuthenticated !== undefined) {
    writeJson(STORAGE_KEYS.session, next.isAuthenticated);
  }
  if (patch.isQualityAuthenticated !== undefined) {
    writeJson(STORAGE_KEYS.quality, next.isQualityAuthenticated);
  }
  if (patch.isAdminAuthenticated !== undefined) {
    writeJson(STORAGE_KEYS.adminSession, next.isAdminAuthenticated);
  }
  stateStore.set(next);
}

/** Ce que le panneau d'analyse enregistre en une fois. */
export interface AlarmAnalysis {
  alarm: Incident["alarm"];
  alarmChecks?: Incident["alarmChecks"];
  avoidable?: Incident["avoidable"];
  alarmPlan?: AlarmPlanRow[];
}

interface AppStateValue extends PersistedState {
  /**
   * Un compte a-t-il été créé sur cet appareil ? Sans backend, c'est la seule
   * notion de compte qui existe : la connexion ne peut pas inventer d'identité.
   */
  hasAccount: boolean;
  /** Connectivité effective : réseau réel ET interrupteur de démonstration. */
  isOnline: boolean;
  pendingCount: number;
  nextCrex: CrexMeeting | null;
  setProfile: (profile: UserProfile) => void;
  setForcedOffline: (value: boolean) => void;
  signIn: () => void;
  signInAdmin: () => void;
  signOut: () => void;
  addIncident: (draft: DeclarationDraft) => Incident;
  classifyIncident: (
    incidentId: string,
    classification: Classification,
    relatedReferences?: string[],
  ) => void;
  /** Règle le jour du mois du CREX d'un service. */
  setCrexDay: (service: string, day: number) => void;
  notify: (
    notification: Omit<AppNotification, "id" | "createdAt" | "read">,
  ) => void;
  markNotificationsRead: () => void;
  callUrgentMeeting: (
    meeting: Omit<CrexMeeting, "id" | "kind" | "done" | "confirmedBy">,
  ) => CrexMeeting;
  signInQuality: () => void;
  unreadCount: number;
  /** Fiches reçues et pas encore classées par la cellule qualité. */
  pendingClassification: number;
  /** Docteur connecté sur cet appareil, s'il y en a un. */
  currentDoctor: Person | null;
  /** Docteurs inscrits, triés par spécialité puis par nom. */
  doctors: Person[];
  /** Personnel soignant inscrit. */
  staff: Person[];
  registerPerson: (person: Omit<Person, "id" | "registeredAt">) => Person;
  signInDoctor: (personId: string) => void;
  signOutDoctor: () => void;
  /** Attribue une action corrective à un ou plusieurs employés. */
  assignAction: (
    action: Omit<ActionItem, "id" | "status"> & { status?: ActionStatus },
  ) => ActionItem;
  updateActionStatus: (id: string, status: ActionStatus) => void;
  updateAlarm: (incidentId: string, analysis: AlarmAnalysis) => void;
  scheduleCrex: (meeting: Omit<CrexMeeting, "id">) => CrexMeeting;
  confirmAttendance: (meetingId: string, personId: string) => void;
  syncPending: () => void;
  clearData: () => void;
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

  /**
   * Inscription à l'annuaire.
   *
   * Sans serveur, l'annuaire vit dans ce navigateur : il ne rassemble que les
   * comptes créés sur cet appareil.
   */
  const registerPerson = useCallback(
    (person: Omit<Person, "id" | "registeredAt">) => {
      const created: Person = {
        ...person,
        id: uid("per"),
        registeredAt: new Date().toISOString(),
      };
      patchState({ people: [...stateStore.get().people, created] });
      return created;
    },
    [],
  );

  const signInDoctor = useCallback(
    (personId: string) => patchState({ currentDoctorId: personId }),
    [],
  );

  const signOutDoctor = useCallback(
    () => patchState({ currentDoctorId: null }),
    [],
  );

  const setProfile = useCallback(
    (profile: UserProfile) => patchState({ profile }),
    [],
  );

  const setForcedOffline = useCallback(
    (forcedOffline: boolean) => patchState({ forcedOffline }),
    [],
  );

  const signIn = useCallback(() => patchState({ isAuthenticated: true }), []);

  const signInAdmin = useCallback(
    () => patchState({ isAdminAuthenticated: true }),
    [],
  );

  const signInQuality = useCallback(
    () => patchState({ isQualityAuthenticated: true }),
    [],
  );

  const signOut = useCallback(
    () =>
      patchState({
        isAuthenticated: false,
        isAdminAuthenticated: false,
        isQualityAuthenticated: false,
        currentDoctorId: null,
      }),
    [],
  );

  const addIncident = useCallback((draft: DeclarationDraft) => {
    const current = stateStore.get();
    const now = new Date();
    const sequence = current.incidents.length + 1;
    const incident: Incident = {
      id: uid("inc"),
      reference: `EI-${now.getFullYear()}-${String(sequence).padStart(4, "0")}`,
      categories: draft.categories.length > 0 ? draft.categories : ["autre"],
      severity: draft.severity,
      status: "nouveau",
      service: current.profile.service,
      hospitalId: current.profile.hospitalId,
      location: draft.location.trim(),
      victim: draft.victim,
      description: draft.description,
      firstActions: draft.firstActions.trim(),
      preventionProposals: draft.preventionProposals.trim(),
      occurredAt: draft.occurredAt,
      declaredAt: now.toISOString(),
      declaredBy: `${current.profile.firstName.charAt(0)}. ${current.profile.lastName}`,
      declaredByRole: current.profile.role || undefined,
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

  const notify = useCallback(
    (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      patchState({
        notifications: [
          {
            ...notification,
            id: uid("notif"),
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...stateStore.get().notifications,
        ],
      });
    },
    [],
  );

  /**
   * Classement par la cellule qualité. Une décision « analyse approfondie »
   * fait passer la fiche en analyse ; les autres la marquent classée.
   *
   * Le classement enregistré, un rapport part vers la direction : c'est le
   * chef d'établissement qui est informé de la décision retenue, pas la
   * cellule qualité qui se la renvoie à elle-même.
   */
  const classifyIncident = useCallback(
    (
      incidentId: string,
      classification: Classification,
      relatedReferences?: string[],
    ) => {
      const target = stateStore
        .get()
        .incidents.find((incident) => incident.id === incidentId);
      patchState({
        incidents: stateStore.get().incidents.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                classification,
                relatedReferences:
                  relatedReferences && relatedReferences.length > 0
                    ? relatedReferences
                    : undefined,
                status:
                  classification.decision === "analyse_approfondie"
                    ? "en_analyse"
                    : classification.decision === "action"
                      ? "action_en_cours"
                      : "cloture",
              }
            : incident,
        ),
      });
      if (!target) return;
      notify({
        title: `Rapport de classement — ${target.reference}`,
        body:
          `${target.service} · criticité ${CRITICALITY_LABELS[
            classification.criticality
          ].toLowerCase()} · ${DECISION_LABELS[classification.decision].toLowerCase()}. ` +
          `Classé par ${classification.classifiedBy}.`,
        urgent: false,
        audience: "direction",
      });
      // Les docteurs désignés reçoivent la fiche dans leur tableau de bord.
      if (classification.assignedTo.length > 0) {
        const names = stateStore
          .get()
          .people.filter((person) =>
            classification.assignedTo.includes(person.id),
          )
          .map((person) => `Dr ${person.lastName}`)
          .join(", ");
        notify({
          title: `Déclaration transmise — ${target.reference}`,
          body: `${names || "Docteur"} · ${target.service}. Fiche à prendre en charge.`,
          urgent: false,
          audience: "docteur",
          targetIds: classification.assignedTo,
        });
      }
    },
    [notify],
  );

  const markNotificationsRead = useCallback(() => {
    patchState({
      notifications: stateStore
        .get()
        .notifications.map((item) => ({ ...item, read: true })),
    });
  }, []);

  /**
   * Rassemblement immédiat déclenché par la cellule qualité. Tous les
   * utilisateurs sont notifiés, quel que soit leur poste.
   */
  const callUrgentMeeting = useCallback(
    (meeting: Omit<CrexMeeting, "id" | "kind" | "done" | "confirmedBy">) => {
      const created: CrexMeeting = {
        ...meeting,
        id: uid("meet"),
        kind: "urgence",
        confirmedBy: [],
        done: false,
      };
      patchState({ crexMeetings: [...stateStore.get().crexMeetings, created] });
      notify({
        title: "Rassemblement immédiat",
        body: `${created.title} — ${created.service}. Votre présence est attendue.`,
        urgent: true,
        meetingId: created.id,
      });
      return created;
    },
    [notify],
  );

  /**
   * Attribution d'une action corrective par l'administration. L'action
   * apparaît aussitôt dans l'onglet « Mes actions » des employés désignés.
   */
  const assignAction = useCallback(
    (action: Omit<ActionItem, "id" | "status"> & { status?: ActionStatus }) => {
      const created: ActionItem = {
        ...action,
        id: uid("act"),
        status: action.status ?? "a_faire",
      };
      patchState({ actions: [created, ...stateStore.get().actions] });
      notify({
        title: "Nouvelle action attribuée",
        body: `${created.title} — échéance ${new Date(created.dueDate).toLocaleDateString("fr-FR")}.`,
        urgent: false,
        audience: "employe",
        targetIds: created.assigneeIds ?? [],
      });
      return created;
    },
    [notify],
  );

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
    (incidentId: string, analysis: AlarmAnalysis) => {
      patchState({
        incidents: stateStore.get().incidents.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                alarm: analysis.alarm,
                alarmChecks: analysis.alarmChecks ?? incident.alarmChecks,
                avoidable: analysis.avoidable ?? incident.avoidable,
                alarmPlan: analysis.alarmPlan ?? incident.alarmPlan,
                status: "en_analyse",
              }
            : incident,
        ),
      });
    },
    [],
  );

  const setCrexDay = useCallback((service: string, day: number) => {
    patchState({
      crexCalendar: {
        ...stateStore.get().crexCalendar,
        [service]: clampCrexDay(day),
      },
    });
  }, []);

  /**
   * Programmation d'une réunion. Tout le monde est prévenu et peut confirmer
   * sa présence depuis son espace.
   */
  const scheduleCrex = useCallback(
    (meeting: Omit<CrexMeeting, "id">) => {
      const created: CrexMeeting = { ...meeting, id: uid("crex") };
      patchState({
        crexMeetings: [...stateStore.get().crexMeetings, created],
      });
      notify({
        title: `Réunion programmée — ${created.title}`,
        body: `${new Date(created.scheduledAt).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })} · ${created.service} · animée par ${created.facilitator}. Confirmez votre présence depuis votre espace.`,
        urgent: false,
      });
      return created;
    },
    [notify],
  );

  /** Confirmation de présence : le nombre de participants en découle. */
  const confirmAttendance = useCallback(
    (meetingId: string, personId: string) => {
      patchState({
        crexMeetings: stateStore.get().crexMeetings.map((meeting) =>
          meeting.id === meetingId &&
          !(meeting.confirmedBy ?? []).includes(personId)
            ? {
                ...meeting,
                confirmedBy: [...(meeting.confirmedBy ?? []), personId],
              }
            : meeting,
        ),
      });
    },
    [],
  );

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

  // Efface les données saisies sur cet appareil, sans toucher au compte ni
  // à la session en cours.
  const clearData = useCallback(
    () =>
      patchState({
        incidents: [],
        actions: [],
        crexMeetings: [],
        notifications: [],
        forcedOffline: false,
      }),
    [],
  );

  const unreadCount = useMemo(
    () => state.notifications.filter((item) => !item.read).length,
    [state.notifications],
  );

  const pendingClassification = useMemo(
    () => state.incidents.filter((incident) => !incident.classification).length,
    [state.incidents],
  );

  const doctors = useMemo(
    () =>
      state.people
        .filter((person) => person.kind === "docteur")
        .sort(
          (a, b) =>
            (a.specialty ?? "").localeCompare(b.specialty ?? "") ||
            a.lastName.localeCompare(b.lastName),
        ),
    [state.people],
  );

  const staff = useMemo(
    () =>
      state.people
        .filter((person) => person.kind === "soignant")
        .sort(
          (a, b) =>
            (a.service ?? "").localeCompare(b.service ?? "") ||
            a.lastName.localeCompare(b.lastName),
        ),
    [state.people],
  );

  const currentDoctor = useMemo(
    () =>
      state.people.find((person) => person.id === state.currentDoctorId) ??
      null,
    [state.people, state.currentDoctorId],
  );

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
    hasAccount: state.profile.email.trim().length > 0,
    isOnline,
    pendingCount,
    nextCrex,
    setProfile,
    setForcedOffline,
    signIn,
    signInAdmin,
    signOut,
    addIncident,
    classifyIncident,
    notify,
    markNotificationsRead,
    callUrgentMeeting,
    signInQuality,
    unreadCount,
    pendingClassification,
    currentDoctor,
    doctors,
    staff,
    registerPerson,
    signInDoctor,
    signOutDoctor,
    assignAction,
    updateActionStatus,
    updateAlarm,
    scheduleCrex,
    confirmAttendance,
    setCrexDay,
    syncPending,
    clearData,
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
