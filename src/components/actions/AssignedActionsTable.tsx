"use client";

import { ClipboardList } from "lucide-react";
import {
  Badge,
  ACTION_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/components/providers/AppStateProvider";
import { ACTION_STATUS_LABELS, SEVERITY_LABELS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

/**
 * Suivi des actions attribuées, en lecture.
 *
 * La cellule qualité doit voir ce qu'elle a confié et à qui, sans pouvoir
 * modifier l'état à la place de la personne concernée.
 */
export function AssignedActionsTable() {
  const { actions, people } = useAppState();

  const namesOf = (ids: string[] | undefined) =>
    (ids ?? [])
      .map((id) => people.find((person) => person.id === id))
      .filter((person) => person !== undefined)
      .map(
        (person) =>
          `${person.kind === "docteur" ? "Dr " : ""}${person.firstName} ${person.lastName}`,
      )
      .join(", ");

  return (
    <Card>
      <CardHeader
        title="Actions attribuées"
        subtitle={`${actions.filter((action) => action.status !== "termine").length} encore ouverte(s)`}
      />
      {actions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
            <ClipboardList className="size-6" />
          </span>
          <p className="max-w-sm text-sm text-fg-muted">
            Aucune action attribuée pour le moment. Le formulaire ci-dessus en
            confie une à qui de droit.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold text-fg-muted uppercase">
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Destinataires</th>
                <th className="px-6 py-3">Échéance</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {actions.map((action) => (
                <tr key={action.id} className="align-top">
                  <td className="max-w-sm px-6 py-4">
                    <p className="font-semibold text-fg">{action.title}</p>
                    {action.incidentReference ? (
                      <p className="font-display mt-0.5 text-xs font-extrabold text-fg-muted">
                        {action.incidentReference}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-fg-muted">
                    {namesOf(action.assigneeIds) || action.owner}
                  </td>
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
      )}
    </Card>
  );
}
