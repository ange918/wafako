import type {
  AlarmFactor,
  CareStage,
  Category,
  CriticalityLevel,
  EventNature,
  Hospital,
  Severity,
  TriageDecision,
  UserProfile,
  VictimKind,
} from "@/types";

/**
 * Référentiels métier.
 *
 * Ce fichier ne contient aucune donnée d'activité : ni incident, ni action, ni
 * statistique. L'application démarre vide et ne montre que ce que les
 * utilisateurs y saisissent. On ne trouve ici que des nomenclatures —
 * établissements, services, rôles, catégories d'événements et facteurs ALARM —
 * sans lesquelles les formulaires ne pourraient pas être remplis.
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

/**
 * Spécialités médicales proposées à l'inscription d'un docteur.
 *
 * La liste reprend les domaines que l'on retrouve dans les documents de
 * l'établissement, dialyse et radiothérapie comprises.
 */
export const SPECIALTIES = [
  "Chirurgie",
  "Pédiatrie",
  "Gynécologie-obstétrique",
  "Médecine interne",
  "Anesthésie-réanimation",
  "Cardiologie",
  "Néphrologie et dialyse",
  "Oncologie et radiothérapie",
  "Imagerie médicale",
  "Biologie médicale",
  "Médecine d'urgence",
  "Psychiatrie",
  "Ophtalmologie",
  "Oto-rhino-laryngologie",
  "Dermatologie",
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
  classe: "Classé",
  en_analyse: "En analyse",
  action_en_cours: "Action en cours",
  cloture: "Clôturé",
} as const;

export const ACTION_STATUS_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
} as const;

/**
 * Les 7 familles de facteurs du protocole ALARM.
 *
 * Libellés, ordre et sous-facteurs repris de la « Grille d'Analyse Systémique
 * d'un Événement Indésirable » du Centre Hospitalier International de Calavi.
 */
export const ALARM_FACTORS: AlarmFactor[] = [
  {
    key: "institution",
    label: "Contexte institutionnel",
    description:
      "Ce qui dépasse l'établissement : tutelle, financement, cadre réglementaire",
    items: [
      "Contraintes économiques et financières",
      "Ressources insuffisantes",
      "Défaut de collaboration avec d'autres structures",
      "Absence de stratégie adaptée",
      "Faible culture sécurité / qualité",
      "Contexte social ou réglementaire défavorable",
    ],
  },
  {
    key: "organisation",
    label: "Management et organisation",
    description: "Pilotage, répartition des responsabilités, planification",
    items: [
      "Changement d'organisation",
      "Mauvaise définition des responsabilités",
      "Défaut de coordination",
      "Effectifs inadaptés",
      "Mauvaise planification",
      "Défaut d'information",
      "Rapports hiérarchiques tendus",
    ],
  },
  {
    key: "environnement",
    label: "Environnement de travail",
    description: "Locaux, matériel, charge de travail, conditions d'exercice",
    items: [
      "Locaux ou matériel inadaptés",
      "Conditions de travail défavorables",
      "Charge de travail excessive",
      "Défaut de formation au matériel",
      "Modification de l'environnement",
    ],
  },
  {
    key: "equipe",
    label: "Équipe",
    description: "Communication, transmissions, supervision, cohésion",
    items: [
      "Mauvaise composition de l'équipe",
      "Défaut de communication",
      "Mauvaise transmission d'information",
      "Conflits internes",
      "Défaut de supervision",
    ],
  },
  {
    key: "procedures",
    label: "Procédures opérationnelles",
    description:
      "Protocoles : existence, accessibilité, pertinence, application",
    items: [
      "Absence de protocoles",
      "Protocoles peu connus",
      "Protocoles inadaptés",
      "Difficulté d'accès à l'information",
      "Protocoles non suivis",
    ],
  },
  {
    key: "individu",
    label: "Facteurs individuels",
    description:
      "Qualification, expérience, état physique et mental du soignant",
    items: [
      "Défaut de qualification",
      "Manque de connaissances",
      "Manque d'expérience",
      "Formation incomplète",
      "Non-respect des consignes",
      "Mauvaise disposition physique ou mentale",
    ],
  },
  {
    key: "patient",
    label: "Facteurs liés au patient",
    description: "État clinique, contexte social, communication",
    items: [
      "État de santé complexe",
      "Prise en charge en urgence",
      "Difficultés de communication",
      "Facteurs sociaux ou familiaux",
      "Personnalité",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Vocabulaire de classement de la cellule qualité                      */
/* ------------------------------------------------------------------ */

export const EVENT_NATURE_LABELS: Record<EventNature, string> = {
  evenement: "Événement",
  dysfonctionnement: "Dysfonctionnement",
};

/** Abréviations Acc-Cs / Prépa / Ttt des comptes rendus du CHIC. */
export const CARE_STAGE_LABELS: Record<CareStage, string> = {
  accueil: "Accueil et consultation",
  preparation: "Préparation",
  traitement: "Traitement",
  autre: "Autre étape",
};

export const CRITICALITY_LABELS: Record<CriticalityLevel, string> = {
  acceptable: "Acceptable",
  tolerable: "Tolérable",
  inacceptable: "Inacceptable",
};

export const CRITICALITY_ORDER: CriticalityLevel[] = [
  "acceptable",
  "tolerable",
  "inacceptable",
];

/** SS / ACT / AA dans les comptes rendus du CHIC. */
export const DECISION_LABELS: Record<TriageDecision, string> = {
  sans_suivi: "Sans suivi",
  action: "Action d'amélioration",
  analyse_approfondie: "Analyse approfondie",
};

export const DECISION_CODES: Record<TriageDecision, string> = {
  sans_suivi: "SS",
  action: "ACT",
  analyse_approfondie: "AA",
};

export const DECISION_HINTS: Record<TriageDecision, string> = {
  sans_suivi:
    "Événement ponctuel ou déjà résolu. Une justification est attendue en commentaire.",
  action:
    "Donne lieu à une action d'amélioration, revue lors du prochain CREX.",
  analyse_approfondie:
    "Déclenche la grille ALARM et, si nécessaire, un rassemblement immédiat.",
};

export const VICTIM_LABELS: Record<VictimKind, string> = {
  patient: "Patient",
  professionnel: "Professionnel de santé",
  usager: "Usager ou accompagnant",
  aucune: "Aucune victime",
};

export const VICTIM_ORDER: VictimKind[] = [
  "patient",
  "professionnel",
  "usager",
  "aucune",
];

export const EMPTY_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  hospitalId: "",
  service: "",
  role: "",
};
