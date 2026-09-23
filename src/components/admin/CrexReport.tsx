"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  ALARM_FACTORS,
  CRITICALITY_LABELS,
  DECISION_CODES,
  DECISION_LABELS,
  HOSPITALS,
  SERVICES,
  SEVERITY_LABELS,
} from "@/lib/mock-data";
import { clockStore } from "@/lib/external-store";
import {
  crexDayFor,
  crexPeriod,
  formatCrexPeriod,
  nextCrexDate,
  previousCrexDates,
} from "@/lib/crex";
import { formatDate } from "@/lib/utils";
import type { Incident, TriageDecision } from "@/types";

/** Nombre de réunions passées proposées dans le sélecteur de période. */
const HISTORY_DEPTH = 6;

const STAGE_CODES = {
  accueil: "Acc-Cs",
  preparation: "Prépa",
  traitement: "Ttt",
  autre: "Autre",
} as const;

/**
 * Compte rendu de CREX.
 *
 * Reprend la structure des comptes rendus de l'établissement : participants,
 * relevé des événements de la période, décisions, commentaires sur les fiches
 * classées sans suivi, suivi des actions et date de la réunion suivante. Tout
 * est dérivé des fiches classées — rien n'est saisi deux fois.
 */
export function CrexReport() {
  const { incidents, actions, crexCalendar, profile } = useAppState();
  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );

  const [service, setService] = useState<string>(
    profile.service || SERVICES[0],
  );
  // 0 = réunion à venir, 1 = la précédente, etc.
  const [offset, setOffset] = useState(0);

  const day = crexDayFor(crexCalendar, service);
  const upcoming = nextCrexDate(day, now);

  const meetings = useMemo(
    () =>
      upcoming
        ? [upcoming, ...previousCrexDates(day, upcoming, HISTORY_DEPTH)]
        : [],
    [upcoming, day],
  );

  const meeting = meetings[offset] ?? null;
  const period = meeting ? crexPeriod(meeting, day) : null;

  /** Fiches classées du service sur la période couverte par la réunion. */
  const listed = useMemo(() => {
    if (!period) return [];
    return incidents
      .filter((incident) => incident.service === service)
      .filter((incident) => {
        const stamp = incident.classification?.classifiedAt;
        if (!stamp) return false;
        const time = new Date(stamp).getTime();
        return time >= period.start.getTime() && time < period.end.getTime();
      })
      .sort(
        (a, b) =>
          new Date(a.declaredAt).getTime() - new Date(b.declaredAt).getTime(),
      );
  }, [incidents, service, period]);

  const pending = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.service === service && !incident.classification,
      ).length,
    [incidents, service],
  );

  const byDecision = (decision: TriageDecision) =>
    listed.filter((incident) => incident.classification?.decision === decision);

  const references = new Set(listed.map((incident) => incident.reference));
  const decidedActions = actions.filter((action) =>
    references.has(action.incidentReference),
  );
  const openActions = actions.filter((action) => action.status !== "termine");

  const hospital = HOSPITALS.find((item) => item.id === profile.hospitalId);

  return (
    <div className="space-y-6">
      <Card data-print-hidden>
        <CardHeader
          title="Compte rendu de CREX"
          subtitle="Généré à partir des fiches classées de la période"
          action={
            <Button
              variant="ink"
              size="md"
              onClick={() => window.print()}
              disabled={!meeting}
            >
              <Printer className="size-4" />
              Imprimer / PDF
            </Button>
          }
        />
        <div className="flex flex-wrap gap-4 px-6 py-5">
          <label className="min-w-52 flex-1">
            <span className="mb-1.5 block text-sm font-semibold text-fg">
              Service
            </span>
            <select
              value={service}
              onChange={(event) => {
                setService(event.target.value);
                setOffset(0);
              }}
              className="h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm font-semibold text-fg outline-none focus:border-hospital"
            >
              {SERVICES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-52 flex-1">
            <span className="mb-1.5 block text-sm font-semibold text-fg">
              Réunion
            </span>
            <select
              value={offset}
              onChange={(event) => setOffset(Number(event.target.value))}
              disabled={meetings.length === 0}
              className="h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm font-semibold text-fg outline-none focus:border-hospital"
            >
              {meetings.length === 0 ? (
                <option value={0}>Calcul en cours…</option>
              ) : (
                meetings.map((date, index) => (
                  <option key={date.toISOString()} value={index}>
                    {formatDate(date.toISOString())}
                    {index === 0 ? " (à venir)" : ""}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      </Card>

      {meeting && period ? (
        <article className="print-sheet rounded-3xl border border-line bg-surface p-6 shadow-soft lg:p-10">
          <header className="border-b-2 border-fg pb-5">
            <p className="text-xs font-bold tracking-wide text-fg-muted uppercase">
              {hospital?.name ?? "Établissement"}
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold text-fg">
              Compte rendu de CREX — {service}
            </h2>
            <p className="mt-1.5 text-sm text-fg-muted">
              Réunion du {formatDate(meeting.toISOString())} · événements
              classés {formatCrexPeriod(period)}
            </p>
          </header>

          <Section index={1} title="Participants">
            <Participants incidents={listed} />
          </Section>

          <Section index={2} title="Relevé des événements déclarés">
            {listed.length === 0 ? (
              <Empty>
                Aucune fiche classée sur cette période pour ce service.
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-4xl border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-y border-line bg-muted text-xs font-bold text-fg-muted uppercase">
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Cat/Prof</th>
                      <th className="px-3 py-2.5">Étape</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Criticité</th>
                      <th className="px-3 py-2.5">Famille</th>
                      <th className="px-3 py-2.5">Décision</th>
                      <th className="px-3 py-2.5">N° EVT Groupe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {listed.map((incident) => {
                      const classification = incident.classification;
                      return (
                        <tr key={incident.id} className="align-top">
                          <td className="font-display px-3 py-2.5 font-extrabold text-fg">
                            {incident.reference}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {formatDate(incident.occurredAt)}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {incident.declaredByRole ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {classification
                              ? STAGE_CODES[classification.stage]
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {classification?.nature === "dysfonctionnement"
                              ? "Dys"
                              : "Evt"}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {classification
                              ? CRITICALITY_LABELS[classification.criticality]
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {classification?.families
                              .map(
                                (key) =>
                                  ALARM_FACTORS.find(
                                    (factor) => factor.key === key,
                                  )?.label ?? key,
                              )
                              .join(", ") ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-fg">
                            {classification
                              ? DECISION_CODES[classification.decision]
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-fg-muted">
                            {incident.relatedReferences?.join(", ") ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Legend />
          </Section>

          <Section index={3} title="Décisions du comité">
            <SubSection index="3.1" title="Actions d'amélioration (ACT)">
              <IncidentLines incidents={byDecision("action")} />
            </SubSection>
            <SubSection index="3.2" title="Analyses approfondies à mener (AA)">
              <IncidentLines incidents={byDecision("analyse_approfondie")} />
            </SubSection>
            <SubSection index="3.3" title="Actions décidées après analyse">
              {decidedActions.length === 0 ? (
                <Empty>
                  Aucune action rattachée aux événements de cette période.
                </Empty>
              ) : (
                <ul className="space-y-2">
                  {decidedActions.map((action) => (
                    <li key={action.id} className="text-sm leading-relaxed">
                      <span className="font-display font-extrabold text-fg">
                        {action.incidentReference}
                      </span>{" "}
                      <span className="text-fg">{action.title}</span>
                      <span className="text-fg-muted">
                        {" "}
                        — pilote {action.owner || "à désigner"}, échéance{" "}
                        {formatDate(action.dueDate)}, priorité{" "}
                        {SEVERITY_LABELS[action.priority].toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SubSection>
          </Section>

          <Section
            index={4}
            title="Commentaires sur les événements classés sans suivi"
          >
            {byDecision("sans_suivi").length === 0 ? (
              <Empty>Aucun événement classé sans suivi sur la période.</Empty>
            ) : (
              <ul className="space-y-3">
                {byDecision("sans_suivi").map((incident) => (
                  <li key={incident.id} className="text-sm leading-relaxed">
                    <span className="font-display font-extrabold text-fg">
                      {incident.reference}
                    </span>
                    <span className="text-fg-muted">
                      {" "}
                      — {incident.classification?.comment ?? "sans commentaire"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section index={5} title="Suivi des actions en cours">
            {openActions.length === 0 ? (
              <Empty>Aucune action ouverte.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-y border-line bg-muted text-xs font-bold text-fg-muted uppercase">
                      <th className="px-3 py-2.5">Code EVT</th>
                      <th className="px-3 py-2.5">Résumé</th>
                      <th className="px-3 py-2.5">Pilote</th>
                      <th className="px-3 py-2.5">Échéance</th>
                      <th className="px-3 py-2.5">Suivi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {openActions.map((action) => (
                      <tr key={action.id} className="align-top">
                        <td className="font-display px-3 py-2.5 font-extrabold text-fg">
                          {action.incidentReference}
                        </td>
                        <td className="px-3 py-2.5 text-fg">
                          {action.summary ?? action.title}
                        </td>
                        <td className="px-3 py-2.5 text-fg-muted">
                          {action.owner || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-fg-muted">
                          {formatDate(action.dueDate)}
                        </td>
                        <td className="px-3 py-2.5 text-fg-muted">
                          {action.followUp ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section index={6} title="Prochaine réunion">
            <p className="text-sm text-fg">
              {offset === 0
                ? `Prochain CREX de ${service} le ${formatDate(
                    meeting.toISOString(),
                  )}.`
                : `CREX suivant le ${formatDate(
                    meetings[offset - 1].toISOString(),
                  )}.`}{" "}
              <span className="text-fg-muted">
                Le comité se tient le {day} de chaque mois pour ce service.
              </span>
            </p>
            {pending > 0 ? (
              <p className="mt-2 text-sm text-fg-muted">
                {pending} fiche{pending > 1 ? "s" : ""} de ce service attend
                {pending > 1 ? "ent" : ""} encore son classement et
                n&apos;apparaî{pending > 1 ? "ssent" : "t"} donc pas au relevé.
              </p>
            ) : null}
          </Section>

          <footer className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-fg-muted">
            Document produit par SafeCare à partir des fiches enregistrées sur
            cet appareil. Sans serveur, il ne couvre pas les déclarations faites
            depuis d&apos;autres postes.
          </footer>
        </article>
      ) : null}
    </div>
  );
}

/**
 * Participants.
 *
 * Aucune liste de présence n'est inventée : les participants attendus sont les
 * déclarants des fiches à l'ordre du jour et la cellule qualité qui les a
 * classées, regroupés par catégorie professionnelle.
 */
function Participants({ incidents }: { incidents: Incident[] }) {
  const groups = new Map<string, Set<string>>();
  const add = (role: string, name: string) => {
    if (!name.trim()) return;
    const set = groups.get(role) ?? new Set<string>();
    set.add(name.trim());
    groups.set(role, set);
  };

  incidents.forEach((incident) => {
    add(
      incident.declaredByRole || "Catégorie non précisée",
      incident.declaredBy,
    );
    if (incident.classification) {
      add("Cellule qualité", incident.classification.classifiedBy);
    }
  });

  if (groups.size === 0) {
    return <Empty>Aucun participant à lister pour cette période.</Empty>;
  }

  return (
    <>
      <ul className="space-y-2">
        {[...groups.entries()].map(([role, names]) => (
          <li key={role} className="text-sm leading-relaxed">
            <span className="font-bold text-fg">{role} : </span>
            <span className="text-fg-muted">{[...names].join(", ")}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-fg-muted">
        Liste déduite des fiches de la période : déclarants et cellule qualité.
      </p>
    </>
  );
}

function IncidentLines({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return <Empty>Aucun événement dans cette rubrique.</Empty>;
  }
  return (
    <ul className="space-y-2">
      {incidents.map((incident) => (
        <li key={incident.id} className="text-sm leading-relaxed">
          <span className="font-display font-extrabold text-fg">
            {incident.reference}
          </span>
          <span className="text-fg-muted"> — {incident.description}</span>
          {incident.preventionProposals.trim() ? (
            <span className="text-fg-muted">
              {" "}
              Proposition du déclarant : {incident.preventionProposals}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-display text-base font-extrabold text-fg">
        {index}. {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SubSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <h4 className="text-sm font-bold text-fg">
        {index} {title}
      </h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-fg-muted">{children}</p>;
}

/** Abréviations du relevé, reprises telles quelles des comptes rendus. */
function Legend() {
  return (
    <p className="mt-3 text-xs leading-relaxed text-fg-muted">
      Evt : événement · Dys : dysfonctionnement · Acc-Cs : accueil et
      consultation · Prépa : préparation · Ttt : traitement ·{" "}
      {(["sans_suivi", "action", "analyse_approfondie"] as const)
        .map(
          (decision) =>
            `${DECISION_CODES[decision]} : ${DECISION_LABELS[
              decision
            ].toLowerCase()}`,
        )
        .join(" · ")}
      .
    </p>
  );
}
