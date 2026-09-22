import type {
  ActionItem,
  AlarmFactor,
  Category,
  CrexMeeting,
  Hospital,
  Incident,
  Severity,
} from "@/types";

/**
 * Données fictives.
 *
 * Toutes les dates sont des chaînes ISO figées : une date calculée au moment du
 * rendu (`new Date()` au niveau module) diffère entre le rendu serveur et
 * l'hydratation client et provoque un mismatch React.
 */

export const HOSPITALS: Hospital[] = [
  { id: "cnhu", name: "CNHU-HKM", city: "Cotonou" },
  { id: "chumel", name: "CHU-MEL", city: "Cotonou" },
  { id: "chud-bor", name: "CHUD-Borgou", city: "Parakou" },
  { id: "chud-op", name: "CHUD-Ouémé/Plateau", city: "Porto-Novo" },
  { id: "chud-zou", name: "CHUD-Zou/Collines", city: "Abomey" },
  { id: "hz-surulere", name: "Hôpital de Zone de Suru-Léré", city: "Cotonou" },
];

export const SERVICES = [
  "Urgences",
  "Pédiatrie",
  "Maternité",
  "Chirurgie",
  "Réanimation",
  "Médecine interne",
  "Laboratoire",
  "Pharmacie",
  "Imagerie",
] as const;

export const ROLES = [
  "Infirmier(ère)",
  "Médecin",
  "Sage-femme",
  "Aide-soignant(e)",
  "Pharmacien(ne)",
  "Technicien(ne) de laboratoire",
  "Cadre de santé",
] as const;

export const CATEGORIES: Category[] = [
  {
    id: "medicament",
    label: "Erreur médicamenteuse",
    icon: "Pill",
    hint: "Dose, voie, patient ou horaire erroné",
  },
  {
    id: "chute",
    label: "Chute de patient",
    icon: "PersonStanding",
    hint: "Chute au lit, au fauteuil ou en déambulation",
  },
  {
    id: "infection",
    label: "Infection associée aux soins",
    icon: "Biohazard",
    hint: "Infection nosocomiale suspectée ou confirmée",
  },
  {
    id: "materiel",
    label: "Panne / matériel",
    icon: "Wrench",
    hint: "Équipement défaillant ou indisponible",
  },
  {
    id: "identite",
    label: "Erreur d'identité",
    icon: "UserRoundX",
    hint: "Erreur d'identification du patient",
  },
  {
    id: "acte",
    label: "Acte de soin",
    icon: "Stethoscope",
    hint: "Geste, protocole ou surveillance non conforme",
  },
  {
    id: "organisation",
    label: "Organisation",
    icon: "Network",
    hint: "Défaut de transmission, effectif ou circuit",
  },
  {
    id: "autre",
    label: "Autre",
    icon: "CircleEllipsis",
    hint: "Événement non couvert par les autres catégories",
  },
];

export const SEVERITY_LABELS: Record<Severity, string> = {
  mineur: "Mineur",
  modere: "Modéré",
  grave: "Grave",
  critique: "Critique",
};

export const SEVERITY_ORDER: Severity[] = [
  "mineur",
  "modere",
  "grave",
  "critique",
];

export const STATUS_LABELS = {
  nouveau: "Nouveau",
  en_analyse: "En analyse",
  action_en_cours: "Action en cours",
  cloture: "Clôturé",
} as const;

export const ACTION_STATUS_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
} as const;

/** Les 7 facteurs du protocole ALARM. */
export const ALARM_FACTORS: AlarmFactor[] = [
  {
    key: "patient",
    label: "Facteurs liés au patient",
    description: "État clinique, comorbidités, langue, adhésion aux soins",
  },
  {
    key: "tache",
    label: "Facteurs liés à la tâche",
    description:
      "Protocoles disponibles, clarté des consignes, aide à la décision",
  },
  {
    key: "individu",
    label: "Facteurs liés au soignant",
    description: "Compétence, fatigue, charge mentale, expérience du poste",
  },
  {
    key: "equipe",
    label: "Facteurs liés à l'équipe",
    description: "Communication, transmissions, supervision, entraide",
  },
  {
    key: "environnement",
    label: "Environnement de travail",
    description: "Effectifs, matériel, locaux, interruptions, bruit",
  },
  {
    key: "organisation",
    label: "Organisation & management",
    description: "Politique de service, planification, ressources allouées",
  },
  {
    key: "institution",
    label: "Contexte institutionnel",
    description: "Tutelle, financement, contraintes réglementaires",
  },
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc_001",
    reference: "EI-2026-0148",
    category: "medicament",
    severity: "grave",
    status: "en_analyse",
    service: "Réanimation",
    hospitalId: "cnhu",
    description:
      "Administration d'une dose double d'anticoagulant suite à une transmission orale non tracée entre deux équipes.",
    occurredAt: "2026-09-18T06:40:00.000Z",
    declaredAt: "2026-09-18T07:15:00.000Z",
    declaredBy: "A. Dossou",
    sync: "synchronise",
    alarm: {
      equipe: "Transmission orale sans support écrit lors de la relève de 6h.",
      environnement:
        "Deux départs simultanés non remplacés sur le poste de nuit.",
    },
  },
  {
    id: "inc_002",
    reference: "EI-2026-0147",
    category: "chute",
    severity: "modere",
    status: "action_en_cours",
    service: "Médecine interne",
    hospitalId: "cnhu",
    description:
      "Chute d'un patient âgé lors d'un lever nocturne non accompagné. Barrières de lit non relevées.",
    occurredAt: "2026-09-17T22:10:00.000Z",
    declaredAt: "2026-09-17T23:02:00.000Z",
    declaredBy: "M. Adjovi",
    sync: "synchronise",
  },
  {
    id: "inc_003",
    reference: "EI-2026-0146",
    category: "infection",
    severity: "critique",
    status: "en_analyse",
    service: "Chirurgie",
    hospitalId: "chumel",
    description:
      "Trois infections du site opératoire détectées sur la même semaine dans le bloc B.",
    occurredAt: "2026-09-15T11:00:00.000Z",
    declaredAt: "2026-09-16T08:30:00.000Z",
    declaredBy: "Dr K. Houngbé",
    sync: "synchronise",
    alarm: {
      environnement:
        "Traçabilité de la stérilisation incomplète sur deux cycles.",
      organisation: "Audit d'hygiène du bloc B reporté deux fois.",
    },
  },
  {
    id: "inc_004",
    reference: "EI-2026-0145",
    category: "materiel",
    severity: "modere",
    status: "cloture",
    service: "Imagerie",
    hospitalId: "chud-bor",
    description:
      "Panne de l'échographe principal pendant 36 heures, reports d'examens non urgents.",
    occurredAt: "2026-09-12T09:20:00.000Z",
    declaredAt: "2026-09-12T10:05:00.000Z",
    declaredBy: "S. Bio",
    sync: "synchronise",
  },
  {
    id: "inc_005",
    reference: "EI-2026-0144",
    category: "identite",
    severity: "grave",
    status: "action_en_cours",
    service: "Laboratoire",
    hospitalId: "cnhu",
    description:
      "Interversion de deux tubes de prélèvement portant des étiquettes manuscrites similaires.",
    occurredAt: "2026-09-10T14:45:00.000Z",
    declaredAt: "2026-09-10T15:30:00.000Z",
    declaredBy: "P. Agbo",
    sync: "synchronise",
  },
  {
    id: "inc_006",
    reference: "EI-2026-0143",
    category: "acte",
    severity: "mineur",
    status: "cloture",
    service: "Maternité",
    hospitalId: "chumel",
    description:
      "Retard de surveillance post-partum lié à un pic d'activité simultané en salle de naissance.",
    occurredAt: "2026-09-08T03:25:00.000Z",
    declaredAt: "2026-09-08T05:00:00.000Z",
    declaredBy: "F. Zinsou",
    sync: "synchronise",
  },
  {
    id: "inc_007",
    reference: "EI-2026-0142",
    category: "organisation",
    severity: "modere",
    status: "nouveau",
    service: "Urgences",
    hospitalId: "chud-op",
    description:
      "Absence de médecin sénior joignable pendant 2 heures sur la garde de week-end.",
    occurredAt: "2026-09-06T19:00:00.000Z",
    declaredAt: "2026-09-06T21:40:00.000Z",
    declaredBy: "R. Tchibozo",
    sync: "synchronise",
  },
  {
    id: "inc_008",
    reference: "EI-2026-0141",
    category: "medicament",
    severity: "mineur",
    status: "cloture",
    service: "Pédiatrie",
    hospitalId: "cnhu",
    description:
      "Erreur de dilution rattrapée avant administration grâce au double contrôle.",
    occurredAt: "2026-09-03T10:15:00.000Z",
    declaredAt: "2026-09-03T10:50:00.000Z",
    declaredBy: "A. Dossou",
    sync: "synchronise",
  },
];

export const SEED_ACTIONS: ActionItem[] = [
  {
    id: "act_001",
    title: "Mettre en place une fiche de relève écrite en réanimation",
    incidentReference: "EI-2026-0148",
    service: "Réanimation",
    owner: "Cadre de santé — Réanimation",
    dueDate: "2026-10-05T00:00:00.000Z",
    status: "en_cours",
    priority: "grave",
  },
  {
    id: "act_002",
    title: "Auditer les barrières de lit des chambres 12 à 24",
    incidentReference: "EI-2026-0147",
    service: "Médecine interne",
    owner: "A. Dossou",
    // Échéance volontairement dépassée : alimente le KPI « alertes en retard ».
    dueDate: "2026-09-19T00:00:00.000Z",
    status: "a_faire",
    priority: "modere",
  },
  {
    id: "act_003",
    title: "Reprendre la traçabilité de stérilisation du bloc B",
    incidentReference: "EI-2026-0146",
    service: "Chirurgie",
    owner: "Équipe hygiène",
    dueDate: "2026-09-26T00:00:00.000Z",
    status: "en_cours",
    priority: "critique",
  },
  {
    id: "act_004",
    title: "Déployer les étiquettes pré-imprimées au laboratoire",
    incidentReference: "EI-2026-0144",
    service: "Laboratoire",
    owner: "P. Agbo",
    dueDate: "2026-10-12T00:00:00.000Z",
    status: "a_faire",
    priority: "grave",
  },
  {
    id: "act_005",
    title: "Formaliser le tableau d'astreinte des séniors",
    incidentReference: "EI-2026-0142",
    service: "Urgences",
    owner: "Direction médicale",
    dueDate: "2026-09-24T00:00:00.000Z",
    status: "termine",
    priority: "modere",
  },
];

export const SEED_CREX: CrexMeeting[] = [
  {
    id: "crex_001",
    title: "CREX Réanimation — septembre",
    scheduledAt: "2026-10-02T14:00:00.000Z",
    service: "Réanimation",
    facilitator: "Dr K. Houngbé",
    incidentReferences: ["EI-2026-0148", "EI-2026-0141"],
    participants: 9,
    done: false,
  },
  {
    id: "crex_002",
    title: "CREX Chirurgie — infections du site opératoire",
    scheduledAt: "2026-10-09T10:00:00.000Z",
    service: "Chirurgie",
    facilitator: "Équipe hygiène",
    incidentReferences: ["EI-2026-0146"],
    participants: 12,
    done: false,
  },
  {
    id: "crex_003",
    title: "CREX Maternité — août",
    scheduledAt: "2026-08-28T09:00:00.000Z",
    service: "Maternité",
    facilitator: "F. Zinsou",
    incidentReferences: ["EI-2026-0143"],
    participants: 8,
    done: true,
  },
];

/** Répartition des déclarations par service, pour le graphique du cockpit. */
export const SERVICE_DISTRIBUTION = [
  { service: "Urgences", count: 42 },
  { service: "Réanimation", count: 31 },
  { service: "Chirurgie", count: 27 },
  { service: "Maternité", count: 24 },
  { service: "Médecine interne", count: 18 },
  { service: "Pédiatrie", count: 14 },
  { service: "Laboratoire", count: 9 },
];

/** Poids des facteurs ALARM sur les analyses clôturées. */
export const ALARM_DISTRIBUTION = [
  { key: "equipe", label: "Équipe", count: 34 },
  { key: "environnement", label: "Environnement", count: 28 },
  { key: "tache", label: "Tâche", count: 21 },
  { key: "organisation", label: "Organisation", count: 17 },
  { key: "individu", label: "Soignant", count: 12 },
  { key: "patient", label: "Patient", count: 8 },
  { key: "institution", label: "Institution", count: 5 },
];

export const MONTHLY_TREND = [
  { month: "Avr", value: 18 },
  { month: "Mai", value: 24 },
  { month: "Juin", value: 31 },
  { month: "Juil", value: 28 },
  { month: "Août", value: 39 },
  { month: "Sept", value: 47 },
];

export const DEFAULT_PROFILE = {
  firstName: "Aline",
  lastName: "Dossou",
  phone: "+229 97 00 00 00",
  email: "a.dossou@cnhu.bj",
  hospitalId: "cnhu",
  service: "Réanimation",
  role: "Infirmier(ère)",
};
