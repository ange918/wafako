"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Badge,
  ACTION_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  ACTION_STATUS_LABELS,
  ALARM_FACTORS,
  HOSPITALS,
  ROLES,
  SERVICES,
  SEVERITY_LABELS,
} from "@/lib/mock-data";
import { clockStore } from "@/lib/external-store";
import {
  MAX_CREX_DAY,
  clampCrexDay,
  crexDayFor,
  nextCrexDate,
} from "@/lib/crex";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDate, initials } from "@/lib/utils";

export function ActionsSection() {
  const { actions } = useAppState();

  return (
    <Card>
      <CardHeader
        title="Plan d'actions consolidé"
        subtitle={`${actions.filter((a) => a.status !== "termine").length} action(s) encore ouvertes`}
      />
      {actions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
            <ClipboardList className="size-6" />
          </span>
          <p className="max-w-sm text-sm text-fg-muted">
            Aucune action corrective enregistrée. Les actions naissent de
            l&apos;analyse des incidents déclarés.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Colonnes du tableau de suivi des actions de l'établissement. */}
          <table className="w-full min-w-5xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold text-fg-muted uppercase">
                <th className="px-6 py-3">Code EVT</th>
                <th className="px-6 py-3">Résumé</th>
                <th className="px-6 py-3">Description de l&apos;action</th>
                <th className="px-6 py-3">Pilote</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Date de décision</th>
                <th className="px-6 py-3">Échéance</th>
                <th className="px-6 py-3">Suivi</th>
                <th className="px-6 py-3">État</th>
                <th className="px-6 py-3">Clôture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {actions.map((action) => (
                <tr
                  key={action.id}
                  className="transition-colors hover:bg-muted"
                >
                  <td className="px-6 py-4 font-display font-extrabold text-fg-muted">
                    {action.incidentReference}
                  </td>
                  <td className="px-6 py-4 font-semibold text-fg">
                    {action.summary ?? action.title}
                  </td>
                  <td className="max-w-sm px-6 py-4 text-fg-muted">
                    {action.title}
                  </td>
                  <td className="px-6 py-4 text-fg-muted">{action.owner}</td>
                  <td className="px-6 py-4">
                    <Badge tone={SEVERITY_TONE[action.priority]}>
                      {SEVERITY_LABELS[action.priority]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-fg-muted">
                    {action.decisionDate
                      ? formatDate(action.decisionDate)
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-fg-muted">
                    {formatDate(action.dueDate)}
                  </td>
                  <td className="max-w-xs px-6 py-4 text-fg-muted">
                    {action.followUp ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={ACTION_STATUS_TONE[action.status]}>
                      {ACTION_STATUS_LABELS[action.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-fg-muted">
                    {action.closedAt ? formatDate(action.closedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

/**
 * Utilisateurs.
 *
 * Sans backend, le seul compte connu est celui créé sur cet appareil. Aucune
 * liste d'utilisateurs n'est inventée.
 */
export function UsersSection() {
  const { profile, hasAccount, incidents } = useAppState();
  const hospital = HOSPITALS.find((item) => item.id === profile.hospitalId);

  if (!hasAccount) {
    return (
      <Card>
        <CardHeader title="Utilisateurs" subtitle="Comptes déclarants" />
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
            <Users className="size-6" />
          </span>
          <p className="max-w-sm text-sm text-fg-muted">
            Aucun compte n&apos;a encore été créé. Les comptes soignants
            apparaîtront ici après leur inscription.
          </p>
        </div>
      </Card>
    );
  }

  const declared = incidents.filter(
    (incident) =>
      incident.declaredBy ===
      `${profile.firstName.charAt(0)}. ${profile.lastName}`,
  ).length;

  return (
    <Card>
      <CardHeader title="Utilisateurs" subtitle="1 compte sur cet appareil" />
      <ul className="divide-y divide-line">
        <li className="flex items-center gap-4 px-6 py-4">
          <span className="font-display grid size-10 shrink-0 place-items-center rounded-2xl bg-hospital/12 text-sm font-extrabold text-hospital">
            {initials(profile.firstName, profile.lastName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-fg">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate text-xs text-fg-muted">
              {profile.role} · {profile.service} · {hospital?.name ?? "—"}
            </p>
          </div>
          <Badge tone="info">
            {declared} déclaration{declared > 1 ? "s" : ""}
          </Badge>
        </li>
      </ul>
      <p className="border-t border-line px-6 py-4 text-xs leading-relaxed text-fg-muted">
        Les comptes sont stockés dans le navigateur de chaque soignant. Une
        consolidation multi-utilisateurs demanderait un serveur.
      </p>
    </Card>
  );
}

/**
 * Calendrier des CREX.
 *
 * Les comptes rendus de l'établissement montrent des dates de réunion
 * distinctes d'un service à l'autre : le jour du mois se règle donc service
 * par service.
 */
function CrexCalendarCard() {
  const { crexCalendar, setCrexDay } = useAppState();
  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  return (
    <Card>
      <CardHeader
        title="Calendrier des CREX"
        subtitle="Jour du mois retenu pour la réunion de chaque service"
      />
      <ul className="divide-y divide-line">
        {SERVICES.map((service) => {
          const day = crexDayFor(crexCalendar, service);
          const next = nextCrexDate(day, now);
          return (
            <li
              key={service}
              className="flex flex-wrap items-center gap-3 px-6 py-4"
            >
              <CalendarDays className="size-5 shrink-0 text-hospital" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-fg">{service}</p>
                <p className="text-xs text-fg-muted">
                  {next
                    ? `Prochaine réunion le ${formatDate(next.toISOString())}`
                    : "Prochaine réunion calculée après chargement"}
                </p>
              </div>
              <label className="flex items-center gap-2">
                <span className="text-xs font-semibold text-fg-muted">
                  Jour
                </span>
                <input
                  type="number"
                  min={1}
                  max={MAX_CREX_DAY}
                  value={day}
                  onChange={(event) =>
                    setCrexDay(
                      service,
                      clampCrexDay(Number(event.target.value)),
                    )
                  }
                  aria-label={`Jour du CREX — ${service}`}
                  className="h-10 w-20 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-fg outline-none focus:border-hospital"
                />
              </label>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-line px-6 py-4 text-xs leading-relaxed text-fg-muted">
        Le jour est borné au 28 pour que la réunion tombe tous les mois, février
        compris. Chaque CREX traite les fiches classées depuis le précédent ; un
        cas qui ne peut pas attendre donne lieu à un rassemblement immédiat,
        convoqué par la cellule qualité.
      </p>
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
        <CrexCalendarCard />

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
