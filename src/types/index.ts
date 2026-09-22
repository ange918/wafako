/**
 * Modèle de domaine SafeCare BJ.
 *
 * Périmètre strictement frontend : ces types décrivent des données fictives
 * persistées en localStorage, jamais une API.
 */

export type Severity = "mineur" | "modere" | "grave" | "critique";

export type IncidentStatus =
  | "nouveau"
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

export interface Hospital {
  id: string;
  name: string;
  city: string;
}

export interface Incident {
  id: string;
  reference: string;
  category: CategoryId;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  hospitalId: string;
  description: string;
  /** ISO 8601. Horodatage automatique à la déclaration. */
  occurredAt: string;
  declaredAt: string;
  declaredBy: string;
  /** Nom du fichier joint, simulé — aucun binaire n'est stocké. */
  attachmentName?: string;
  sync: SyncStatus;
  alarm?: Partial<Record<AlarmFactorKey, string>>;
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

export interface CrexMeeting {
  id: string;
  title: string;
  /** ISO 8601. */
  scheduledAt: string;
  service: string;
  facilitator: string;
  incidentReferences: string[];
  participants: number;
  done: boolean;
}

/**
 * Les 7 facteurs du protocole ALARM (Association of Litigation And Risk
 * Management), utilisés pour l'analyse des causes racines.
 */
export type AlarmFactorKey =
  | "patient"
  | "tache"
  | "individu"
  | "equipe"
  | "environnement"
  | "organisation"
  | "institution";

export interface AlarmFactor {
  key: AlarmFactorKey;
  label: string;
  description: string;
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

export interface AdminProfile {
  email: string;
  hospitalId: string;
}

/** Brouillon manipulé par le stepper de déclaration. */
export interface DeclarationDraft {
  category: CategoryId | null;
  severity: Severity;
  description: string;
  attachmentName?: string;
  occurredAt: string;
}
