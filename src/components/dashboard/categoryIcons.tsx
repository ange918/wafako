import {
  Biohazard,
  CircleEllipsis,
  Network,
  PersonStanding,
  Pill,
  Stethoscope,
  UserRoundX,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CategoryId } from "@/types";

/** Résout le nom d'icône stocké dans les données vers le composant Lucide. */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  medicament: Pill,
  chute: PersonStanding,
  infection: Biohazard,
  materiel: Wrench,
  identite: UserRoundX,
  acte: Stethoscope,
  organisation: Network,
  autre: CircleEllipsis,
};
