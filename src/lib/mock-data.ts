import type {
  AlarmFactor,
  Category,
  Hospital,
  Severity,
  UserProfile,
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

/**
 * Profil vide, utilisé tant qu'aucun compte n'a été créé sur cet appareil.
 * Aucune identité n'est inventée : les champs se remplissent à l'inscription.
 */
export const EMPTY_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  hospitalId: "",
  service: "",
  role: "",
};
