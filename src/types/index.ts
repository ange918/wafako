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

/* ------------------------------------------------------------------ */
/* Annuaire de l'établissement                                          */
/* ------------------------------------------------------------------ */

/**
 * Nature d'un compte de l'annuaire.
 *
 * « soignant » couvre tout le personnel qui déclare ; « docteur » désigne les
 * médecins à qui la cellule qualité transmet une déclaration selon la
 * spécialité concernée.
 */
export type PersonKind = "soignant" | "docteur";

export interface Person {
  id: string;
  kind: PersonKind;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hospitalId: string;
  /** Service de rattachement, pour un membre du personnel. */
  service?: string;
  /** Intitulé du poste, pour un membre du personnel. */
  role?: string;
  /** Spécialité médicale, pour un docteur. */
  specialty?: string;
  registeredAt: string;
}

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
  /**
   * Docteurs à qui la fiche est transmise, choisis selon la spécialité
   * concernée. Plusieurs destinataires sont possibles quand l'événement
   * touche deux domaines.
   */
  assignedTo: string[];
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
  /** Catégorie professionnelle du déclarant : colonne « Cat/Prof » du relevé. */
  declaredByRole?: string;
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
  /**
   * Autres fiches portant sur le même événement, rapprochées par la cellule
   * qualité. Colonne « N° EVT Groupe » du relevé.
   */
  relatedReferences?: string[];
  /** Plan d'action de l'étape 3 de la grille ALARM. */
  alarmPlan?: AlarmPlanRow[];
}

export interface ActionItem {
  id: string;
  title: string;
  /** Intitulé court, colonne « Résumé » du tableau de suivi. */
  summary?: string;
  /** Employés à qui l'action est attribuée, par identifiant d'annuaire. */
  assigneeIds?: string[];
  /** Qui a attribué l'action. */
  assignedBy?: string;
  incidentReference: string;
  service: string;
  owner: string;
  /** Date à laquelle le CREX a arrêté l'action. */
  decisionDate?: string;
  dueDate: string;
  status: ActionStatus;
  priority: Severity;
  /** Point d'avancement noté à la réunion suivante. */
  followUp?: string;
  /** Date de clôture effective, une fois l'action soldée. */
  closedAt?: string;
}

/**
 * Jour du mois retenu pour le CREX, service par service.
 *
 * Les comptes rendus du CHIC montrent des dates distinctes d'un service à
 * l'autre : le calendrier est donc réglé par service, et non globalement.
 */
export type CrexCalendar = Record<string, number>;

/** Réunion périodique (CREX) ou rassemblement déclenché en urgence. */
export type MeetingKind = "crex" | "urgence";

export interface CrexMeeting {
  id: string;
  kind: MeetingKind;
  title: string;
  /** ISO 8601. */
  scheduledAt: string;
  service: string;
  /** Nom de l'animateur, tel qu'affiché. */
  facilitator: string;
  /** Animateur choisi dans l'annuaire, quand il y est inscrit. */
  facilitatorId?: string;
  incidentReferences: string[];
  /**
   * Personnes ayant confirmé leur présence, par identifiant d'annuaire. Le
   * nombre de participants en découle : il n'est pas saisi à la main.
   */
  confirmedBy: string[];
  done: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  /** Un rassemblement urgent touche tous les utilisateurs, quel que soit leur poste. */
  urgent: boolean;
  /**
   * Destinataire visé : « tous » pour un rassemblement, « direction » pour le
   * rapport de classement, « docteur » pour une fiche transmise, « employe »
   * pour une action attribuée.
   */
  audience?: "tous" | "direction" | "docteur" | "employe";
  /** Identifiants d'annuaire visés, quand la notification ne concerne pas tout le monde. */
  targetIds?: string[];
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

/**
 * Ligne du plan d'action de la grille ALARM (étape 3), une par famille de
 * facteurs retenue : cause identifiée, action décidée et son suivi.
 */
export interface AlarmPlanRow {
  factor: AlarmFactorKey;
  cause: string;
  action: string;
  priority: Severity;
  owner: string;
  /** Échéance au format aaaa-mm-jj, telle que saisie. */
  dueDate: string;
  indicators: string;
  notes: string;
}

export interface AlarmFactor {
  key: AlarmFactorKey;
  label: string;
  description: string;
  /** Sous-facteurs proposés à la case à cocher, repris de la grille du CHIC. */
  items: string[];
}

export interface UserProfile {
  /** Identifiant dans l'annuaire, créé à l'inscription. */
  personId?: string;
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
