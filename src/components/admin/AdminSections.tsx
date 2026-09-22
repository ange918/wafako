"use client";

import { motion } from "framer-motion";
import { Building2, Mail, ShieldCheck, UserRoundCheck } from "lucide-react";
import {
  Badge,
  ACTION_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  ACTION_STATUS_LABELS,
  ALARM_FACTORS,
  HOSPITALS,
  ROLES,
  SERVICES,
  SEVERITY_LABELS,
} from "@/lib/mock-data";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDate } from "@/lib/utils";

export function ActionsSection() {
  const { actions } = useAppState();

  return (
    <Card>
      <CardHeader
        title="Plan d'actions consolidé"
        subtitle={`${actions.filter((a) => a.status !== "termine").length} action(s) encore ouvertes`}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-bold text-fg-muted uppercase">
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Incident</th>
              <th className="px-6 py-3">Responsable</th>
              <th className="px-6 py-3">Échéance</th>
              <th className="px-6 py-3">Priorité</th>
              <th className="px-6 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {actions.map((action) => (
              <tr key={action.id} className="transition-colors hover:bg-muted">
                <td className="max-w-sm px-6 py-4 font-semibold text-fg">
                  {action.title}
                </td>
                <td className="px-6 py-4 font-display font-extrabold text-fg-muted">
                  {action.incidentReference}
                </td>
                <td className="px-6 py-4 text-fg-muted">{action.owner}</td>
                <td className="px-6 py-4 text-fg-muted">
                  {formatDate(action.dueDate)}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={SEVERITY_TONE[action.priority]}>
                    {SEVERITY_LABELS[action.priority]}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge tone={ACTION_STATUS_TONE[action.status]}>
                    {ACTION_STATUS_LABELS[action.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AlarmSection() {
  const { incidents } = useAppState();
  const analysed = incidents.filter(
    (incident) => incident.alarm && Object.keys(incident.alarm).length > 0,
  );

  return (
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader
            title="Les 7 facteurs du protocole ALARM"
            subtitle="Cadre d'analyse des causes racines d'un événement indésirable"
          />
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 xl:grid-cols-3">
            {ALARM_FACTORS.map((factor, index) => (
              <div
                key={factor.key}
                className="rounded-2xl border border-line bg-muted p-4"
              >
                <span className="font-display grid size-8 place-items-center rounded-xl bg-hospital text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-bold text-fg">{factor.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader
            title="Analyses documentées"
            subtitle={`${analysed.length} incident(s) disposant d'une grille remplie`}
          />
          {analysed.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-fg-muted">
              Aucune analyse enregistrée. Ouvrez un incident depuis
              l&apos;onglet « Incidents EI » pour remplir sa grille.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {analysed.map((incident) => (
                <li key={incident.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-sm font-extrabold text-fg">
                      {incident.reference}
                    </span>
                    <Badge tone={SEVERITY_TONE[incident.severity]}>
                      {SEVERITY_LABELS[incident.severity]}
                    </Badge>
                    <span className="text-xs text-fg-muted">
                      {incident.service}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {Object.entries(incident.alarm ?? {})
                      .filter(([, value]) => value?.trim())
                      .map(([key, value]) => {
                        const factor = ALARM_FACTORS.find((f) => f.key === key);
                        return (
                          <li key={key} className="text-xs leading-relaxed">
                            <span className="font-bold text-hospital">
                              {factor?.label ?? key} :{" "}
                            </span>
                            <span className="text-fg-muted">{value}</span>
                          </li>
                        );
                      })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

const MOCK_USERS = [
  {
    name: "Aline Dossou",
    role: "Infirmière",
    service: "Réanimation",
    active: true,
  },
  {
    name: "Dr Kofi Houngbé",
    role: "Médecin",
    service: "Chirurgie",
    active: true,
  },
  {
    name: "Florence Zinsou",
    role: "Sage-femme",
    service: "Maternité",
    active: true,
  },
  {
    name: "Pascal Agbo",
    role: "Technicien labo",
    service: "Laboratoire",
    active: true,
  },
  {
    name: "Sika Bio",
    role: "Manipulateur",
    service: "Imagerie",
    active: false,
  },
  {
    name: "Rachidou Tchibozo",
    role: "Cadre de santé",
    service: "Urgences",
    active: true,
  },
];

export function UsersSection() {
  return (
    <Card>
      <CardHeader
        title="Utilisateurs"
        subtitle={`${MOCK_USERS.filter((u) => u.active).length} comptes actifs`}
        action={
          <Button variant="ink" size="sm">
            <UserRoundCheck className="size-4" />
            Inviter
          </Button>
        }
      />
      <ul className="divide-y divide-line">
        {MOCK_USERS.map((user) => (
          <li key={user.name} className="flex items-center gap-4 px-6 py-4">
            <span className="font-display grid size-10 shrink-0 place-items-center rounded-2xl bg-hospital/12 text-sm font-extrabold text-hospital">
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-fg">{user.name}</p>
              <p className="text-xs text-fg-muted">
                {user.role} · {user.service}
              </p>
            </div>
            <Badge tone={user.active ? "success" : "neutral"}>
              {user.active ? "Actif" : "Suspendu"}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ConfigurationSection() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader
          title="Établissements"
          subtitle="Périmètre couvert par l'abonnement"
        />
        <ul className="divide-y divide-line">
          {HOSPITALS.map((hospital) => (
            <li key={hospital.id} className="flex items-center gap-3 px-6 py-4">
              <Building2 className="size-5 shrink-0 text-hospital" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-fg">
                  {hospital.name}
                </p>
                <p className="text-xs text-fg-muted">{hospital.city}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Services & rôles"
            subtitle="Référentiel de l'établissement"
          />
          <div className="space-y-5 px-6 py-5">
            <div>
              <p className="mb-2 text-xs font-bold text-fg-muted uppercase">
                Services ({SERVICES.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-fg-muted"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-fg-muted uppercase">
                Rôles ({ROLES.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-fg-muted"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Conformité & notifications" />
          <div className="space-y-3 px-6 py-5">
            <p className="flex items-start gap-3 text-sm text-fg-muted">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              Données hébergées au Bénin, conformes aux exigences de
              l&apos;APDP.
            </p>
            <p className="flex items-start gap-3 text-sm text-fg-muted">
              <Mail className="mt-0.5 size-5 shrink-0 text-hospital" />
              Alerte e-mail au référent qualité pour toute déclaration de
              gravité grave ou critique.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
