import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Microscope,
  Settings2,
  Siren,
  Users,
} from "lucide-react";
import type { SidebarItem } from "@/components/layout/SpaceSidebar";

export type AdminSection =
  | "cockpit"
  | "incidents"
  | "alarm"
  | "actions"
  | "crex"
  | "utilisateurs"
  | "configuration";

/**
 * Sections de la console de direction.
 *
 * Le rendu de la barre est commun aux quatre espaces
 * (`components/layout/SpaceSidebar`) ; il ne reste ici que l'inventaire.
 */
export const ADMIN_ITEMS: SidebarItem<AdminSection>[] = [
  { id: "cockpit", label: "Cockpit", icon: LayoutDashboard },
  { id: "incidents", label: "Incidents EI", icon: Siren },
  { id: "alarm", label: "Analyse ALARM", icon: Microscope },
  { id: "actions", label: "Actions", icon: ClipboardList },
  { id: "crex", label: "CREX", icon: CalendarCheck },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users },
  { id: "configuration", label: "Configuration", icon: Settings2 },
];
