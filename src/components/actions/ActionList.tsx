"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  CircleCheck,
  CirclePlay,
  ListTodo,
  UserRound,
} from "lucide-react";
import {
  Badge,
  ACTION_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { useAppState } from "@/components/providers/AppStateProvider";
import { ACTION_STATUS_LABELS, SEVERITY_LABELS } from "@/lib/mock-data";
import { fadeUp, stagger } from "@/lib/motion";
import { cn, formatDate } from "@/lib/utils";
import type { ActionItem, ActionStatus } from "@/types";

const FLOW: { id: ActionStatus; label: string; icon: typeof ListTodo }[] = [
  { id: "a_faire", label: "À faire", icon: ListTodo },
  { id: "en_cours", label: "En cours", icon: CirclePlay },
  { id: "termine", label: "Terminé", icon: CircleCheck },
];

/**
 * Liste des actions correctives attribuées à une personne.
 *
 * Partagée par l'espace soignant et l'espace docteur : les deux consultent la
 * même chose, seule la source des actions diffère.
 */
export function ActionList({
  actions,
  emptyLabel,
}: {
  actions: ActionItem[];
  emptyLabel: string;
}) {
  const { updateActionStatus } = useAppState();

  return (
    <motion.div
      variants={stagger(0, 0.06)}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {actions.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-dashed border-line bg-surface px-5 py-12 text-center"
        >
          <ListTodo className="mx-auto size-8 text-fg-muted/60" />
          <p className="mt-3 text-sm font-semibold text-fg">{emptyLabel}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
            Les actions sont attribuées par la direction depuis la console, à
            partir des événements analysés.
          </p>
        </motion.div>
      ) : null}

      {actions.map((action) => (
        <motion.article
          key={action.id}
          variants={fadeUp}
          layout
          className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base leading-snug font-bold text-fg">
              {action.title}
            </h3>
            <Badge tone={SEVERITY_TONE[action.priority]}>
              {SEVERITY_LABELS[action.priority]}
            </Badge>
          </div>

          {action.summary && action.summary !== action.title ? (
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {action.summary}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-muted">
            {action.incidentReference ? (
              <span className="font-semibold">{action.incidentReference}</span>
            ) : null}
            <span>{action.service}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Échéance : {formatDate(action.dueDate)}
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
            <span>
              Responsable :{" "}
              <span className="font-semibold text-fg">{action.owner}</span>
            </span>
            {action.assignedBy ? (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                Attribuée par {action.assignedBy}
              </span>
            ) : null}
          </p>

          {/* Sélecteur d'état : grandes cibles tactiles. */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {FLOW.map((state) => {
              const active = action.status === state.id;
              return (
                <motion.button
                  key={state.id}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => updateActionStatus(action.id, state.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold transition-colors",
                    active
                      ? state.id === "termine"
                        ? "border-transparent bg-success text-white"
                        : state.id === "en_cours"
                          ? "border-transparent bg-warn text-white"
                          : "border-transparent bg-alert text-white"
                      : "border-line bg-surface text-fg-muted hover:border-hospital/40",
                  )}
                >
                  <state.icon className="size-4" />
                  {state.label}
                </motion.button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] font-semibold text-fg-muted">
            État actuel :{" "}
            <Badge tone={ACTION_STATUS_TONE[action.status]} className="ml-1">
              {ACTION_STATUS_LABELS[action.status]}
            </Badge>
          </p>
        </motion.article>
      ))}
    </motion.div>
  );
}
