/**
 * Modèle de domaine SafeCare.
 *
 * Périmètre frontend : ces types décrivent un état persisté en localStorage,
 * jamais une API. Le vocabulaire de classement reprend celui des documents de
 * travail du Centre Hospitalier International de Calavi (grille ALARM et
 * comptes rendus de CREX).
 */

export type Severity = "mineur" | "modere" | "grave" | "critique";

export type IncidentStatus =
  | "nouveau"
  | "classe"
  | "en_analyse"
  | "action_en_cours"
  | "cloture";

export type ActionStatus = "a_faire" | "en_cours" | "termine";

export type SyncStatus = "synchronise" | "en_attente";

export type CategoryId =
  | "medicament"
  | "chute"
  | "infection"
  | "materiel"
  | "identite"
  | "acte"
  | "organisation"
  | "autre";

export interface Category {
  id: CategoryId;
  label: string;
  /** Nom d'icône Lucide, résolu côté composant. */
  icon: string;
  hint: string;
}

/** Qui a subi l'événement. */
export type VictimKind = "professionnel" | "usager" | "patient" | "aucune";

export interface Hospital {
  id: string;
  name: string;
  city: string;
}

/* ------------------------------------------------------------------ */
/* Classement par la cellule qualité                                    */
/* ------------------------------------------------------------------ */

/** « Evt » / « Dys » dans les comptes rendus du CHIC. */
export type EventNature = "evenement" | "dysfonctionnement";

/**
 * Étape du parcours de soins où l'événement survient. Les comptes rendus du
 * CHIC utilisent les abréviations Acc-Cs, Prépa, Ttt.
 */
export type CareStage = "accueil" | "preparation" | "traitement" | "autre";

/**
 * Échelle de criticité. Seules « Acceptable » et « Tolérable » apparaissent
 * dans les documents fournis ; le dernier niveau est une hypothèse à confirmer
 * auprès de l'établissement.
 */
export type CriticalityLevel = "acceptable" | "tolerable" | "inacceptable";

/**
 * Décision de la cellule qualité, reprise telle quelle des comptes rendus :
 * SS = sans suivi, ACT = action d'amélioration, AA = analyse approfondie.
 */
export type TriageDecision = "sans_suivi" | "action" | "analyse_approfondie";

export interface Classification {
  nature: EventNature;
  /** Une déclaration peut relever de plusieurs familles à la fois. */
  families: AlarmFactorKey[];
  stage: CareStage;
  criticality: CriticalityLevel;
  decision: TriageDecision;
  /** Justification, attendue notamment pour une décision « sans suivi ». */
  comment?: string;
  classifiedBy: string;
  classifiedAt: string;
}

export interface Incident {
  id: string;
  reference: string;
  /** Plusieurs catégories possibles : un événement touche souvent plusieurs secteurs. */
  categories: CategoryId[];
  severity: Severity;
  status: IncidentStatus;
  service: string;
  hospitalId: string;
  /** Lieu précis de survenue, distinct du service de rattachement du déclarant. */
  location: string;
  victim: VictimKind;
  description: string;
  /** Ce qui a été fait dans l'immédiat, avant toute analyse. */
  firstActions: string;
  /** Ce que le déclarant propose pour éviter que cela se reproduise. */
  preventionProposals: string;
  /** ISO 8601. Horodatage automatique à la déclaration. */
  occurredAt: string;
  declaredAt: string;
  declaredBy: string;
  /** Nom du fichier joint, simulé — aucun binaire n'est stocké. */
  attachmentName?: string;
  sync: SyncStatus;
  /** Renseigné par la cellule qualité, absent tant que la fiche n'est pas classée. */
  classification?: Classification;
  alarm?: Partial<Record<AlarmFactorKey, string>>;
  /** Facteurs contributifs cochés dans la grille ALARM. */
  alarmChecks?: Partial<Record<AlarmFactorKey, string[]>>;
  /** Évaluation du caractère évitable, prévue par la grille du CHIC. */
  avoidable?: "oui" | "non" | "indetermine";
}

export interface ActionItem {
  id: string;
  title: string;
  incidentReference: string;
  service: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
  priority: Severity;
}

/** Réunion périodique (CREX) ou rassemblement déclenché en urgence. */
export type MeetingKind = "crex" | "urgence";

export interface CrexMeeting {
  id: string;
  kind: MeetingKind;
  title: string;
  /** ISO 8601. */
  scheduledAt: string;
  service: string;
  facilitator: string;
  incidentReferences: string[];
  participants: number;
  done: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  /** Un rassemblement urgent touche tous les utilisateurs, quel que soit leur poste. */
  urgent: boolean;
  meetingId?: string;
  read: boolean;
}

/**
 * Les 7 familles de facteurs du protocole ALARM, dans l'ordre et avec les
 * libellés de la grille du CHIC.
 */
export type AlarmFactorKey =
  | "institution"
  | "organisation"
  | "environnement"
  | "equipe"
  | "procedures"
  | "individu"
  | "patient";

export interface AlarmFactor {
  key: AlarmFactorKey;
  label: string;
  description: string;
  /** Sous-facteurs proposés à la case à cocher, repris de la grille du CHIC. */
  items: string[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  hospitalId: string;
  service: string;
  role: string;
}

/** Brouillon manipulé par le stepper de déclaration. */
export interface DeclarationDraft {
  categories: CategoryId[];
  severity: Severity;
  location: string;
  victim: VictimKind;
  description: string;
  firstActions: string;
  preventionProposals: string;
  attachmentName?: string;
  occurredAt: string;
}
