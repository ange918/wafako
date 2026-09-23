"use client";

import { motion } from "framer-motion";
import { CloudUpload, FileText } from "lucide-react";
import { MainActionCard } from "./MainActionCard";
import { CATEGORY_ICONS } from "./categoryIcons";
import { Badge, SEVERITY_TONE } from "@/components/ui/Badge";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORIES, SEVERITY_LABELS } from "@/lib/mock-data";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDateTime } from "@/lib/utils";

export function HomeTab({ onDeclare }: { onDeclare: () => void }) {
  const { incidents, profile, actions, pendingCount } = useAppState();

  // Seules les déclarations du service de l'agent lui sont présentées.
  const mine = incidents
    .filter((incident) => incident.service === profile.service)
    .slice(0, 6);

  const openActions = actions.filter(
    (action) => action.status !== "termine",
  ).length;

  return (
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={fadeUp}>
        <MainActionCard onDeclare={onDeclare} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <MiniStat label="Mes déclarations" value={String(mine.length)} />
        <MiniStat label="Actions ouvertes" value={String(openActions)} />
        <MiniStat label="En attente" value={String(pendingCount)} tone="warn" />
      </motion.div>

      <motion.section variants={fadeUp}>
        <h2 className="font-display mb-3 px-1 text-lg font-extrabold text-fg">
          Déclarations récentes — {profile.service}
        </h2>

        {mine.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center">
            <FileText className="mx-auto size-8 text-fg-muted/60" />
            <p className="mt-3 text-sm font-semibold text-fg">
              Aucune déclaration pour ce service
            </p>
            <p className="mt-1 text-xs text-fg-muted">
              Votre première fiche apparaîtra ici.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {mine.map((incident) => {
              // La première catégorie porte l'icône ; les autres sont
              // rappelées dans le libellé.
              const [first, ...others] = incident.categories;
              const Icon = CATEGORY_ICONS[first] ?? CATEGORY_ICONS.autre;
              const base =
                CATEGORIES.find((item) => item.id === first)?.label ??
                "Événement";
              const label =
                others.length > 0 ? `${base} +${others.length}` : base;
              return (
                <motion.li
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-hospital/10 text-hospital">
                    <Icon className="size-5.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-fg">
                        {label}
                      </p>
                      {incident.sync === "en_attente" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-extrabold text-warn">
                          <CloudUpload className="size-3" />
                          En attente
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                      {incident.description}
                    </p>
                    <p className="mt-1.5 text-[11px] text-fg-muted/80">
                      {incident.reference} ·{" "}
                      {formatDateTime(incident.declaredAt)}
                    </p>
                  </div>

                  <Badge tone={SEVERITY_TONE[incident.severity]}>
                    {SEVERITY_LABELS[incident.severity]}
                  </Badge>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.section>
    </motion.div>
  );
}

function MiniStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-soft">
      <p
        className={
          tone === "warn"
            ? "font-display text-2xl font-extrabold text-warn"
            : "font-display text-2xl font-extrabold text-fg"
        }
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight font-semibold text-fg-muted">
        {label}
      </p>
    </div>
  );
}
