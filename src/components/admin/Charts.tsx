"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChartColumn, ChartPie, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/components/providers/AppStateProvider";
import { ALARM_FACTORS } from "@/lib/mock-data";
import type { AlarmFactorKey } from "@/types";

/**
 * Graphiques du cockpit.
 *
 * Aucune série n'est pré-remplie : tout est calculé sur les incidents
 * réellement déclarés. Tant qu'aucune donnée n'existe, chaque carte affiche un
 * état vide plutôt qu'une courbe inventée.
 */

function EmptyChart({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
        {icon}
      </span>
      <p className="max-w-xs text-sm text-fg-muted">{message}</p>
    </div>
  );
}

export function ServiceBarChart() {
  const { incidents } = useAppState();

  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const incident of incidents) {
      counts.set(incident.service, (counts.get(incident.service) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const max = rows.length > 0 ? Math.max(...rows.map((row) => row.count)) : 0;

  return (
    <Card>
      <CardHeader
        title="Répartition par service"
        subtitle={
          rows.length > 0
            ? `${incidents.length} déclaration${incidents.length > 1 ? "s" : ""} réparties sur ${rows.length} service${rows.length > 1 ? "s" : ""}`
            : "Calculée sur les déclarations reçues"
        }
      />

      {rows.length === 0 ? (
        <EmptyChart
          icon={<ChartColumn className="size-6" />}
          message="Aucune déclaration pour le moment. La répartition apparaîtra dès la première fiche enregistrée."
        />
      ) : (
        <div className="space-y-3.5 px-6 py-5">
          {rows.map((row, index) => (
            <div key={row.service}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-fg">
                  {row.service}
                </span>
                <span className="font-display text-sm font-extrabold text-fg-muted tabular-nums">
                  {row.count}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-hospital to-softblue"
                  initial={{ width: 0 }}
                  animate={{ width: `${(row.count / max) * 100}%` }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const DONUT_COLORS = [
  "var(--hospital)",
  "var(--softblue)",
  "var(--vivid)",
  "var(--warn)",
  "var(--success)",
  "var(--alert)",
  "var(--fg-muted)",
];

const DONUT_RADIUS = 62;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export function AlarmDonut() {
  const { incidents } = useAppState();

  const { segments, total } = useMemo(() => {
    // Un facteur compte dès qu'il est renseigné dans la grille d'un incident.
    const counts = new Map<AlarmFactorKey, number>();
    for (const incident of incidents) {
      for (const factor of ALARM_FACTORS) {
        if ((incident.alarm?.[factor.key] ?? "").trim()) {
          counts.set(factor.key, (counts.get(factor.key) ?? 0) + 1);
        }
      }
    }

    const present = ALARM_FACTORS.filter((factor) => counts.has(factor.key));
    const sum = [...counts.values()].reduce((acc, value) => acc + value, 0);

    // Le décalage d'un arc est la somme des précédents. Calculé par somme
    // préfixe plutôt que par accumulation, pour rester sans effet de bord —
    // au plus 7 facteurs, le coût est négligeable.
    const built = present.map((factor, index) => {
      const count = counts.get(factor.key) ?? 0;
      const before = present
        .slice(0, index)
        .reduce((acc, previous) => acc + (counts.get(previous.key) ?? 0), 0);
      return {
        key: factor.key,
        label: factor.label,
        count,
        share: count / sum,
        dash: (count / sum) * DONUT_CIRCUMFERENCE,
        offset: (before / sum) * DONUT_CIRCUMFERENCE,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      };
    });

    return { segments: built, total: sum };
  }, [incidents]);

  return (
    <Card>
      <CardHeader
        title="Causes ALARM"
        subtitle={
          total > 0
            ? `${total} facteur${total > 1 ? "s" : ""} relevé${total > 1 ? "s" : ""} en analyse`
            : "Facteurs contributifs relevés en analyse"
        }
      />

      {total === 0 ? (
        <EmptyChart
          icon={<ChartPie className="size-6" />}
          message="Aucune grille ALARM n'a encore été remplie. Ouvrez un incident depuis « Incidents EI » pour documenter ses facteurs contributifs."
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-7 px-6 py-6 sm:flex-row">
          <div className="relative shrink-0">
            <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={DONUT_RADIUS}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="18"
              />
              {segments.map((segment, index) => (
                <motion.circle
                  key={segment.key}
                  cx="80"
                  cy="80"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="18"
                  strokeDasharray={`${segment.dash} ${DONUT_CIRCUMFERENCE - segment.dash}`}
                  strokeDashoffset={-segment.offset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-2xl font-extrabold text-fg">
                  {total}
                </p>
                <p className="text-[11px] font-semibold text-fg-muted">
                  facteurs
                </p>
              </div>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-2">
            {segments.map((segment) => (
              <li
                key={segment.key}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="flex-1 text-fg-muted">{segment.label}</span>
                <span className="font-display font-extrabold text-fg tabular-nums">
                  {Math.round(segment.share * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

const MONTH_LABELS = [
  "Janv",
  "Févr",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

export function MonthlyTrend() {
  const { incidents } = useAppState();

  /*
   * Les mois affichés sont déduits des déclarations elles-mêmes, du plus ancien
   * au plus récent. Partir de la date du jour introduirait un écart entre le
   * rendu serveur et le rendu client.
   */
  const rows = useMemo(() => {
    if (incidents.length === 0) return [];

    const counts = new Map<string, number>();
    for (const incident of incidents) {
      const date = new Date(incident.declaredAt);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        return { label: MONTH_LABELS[Number(month)], year, value };
      });
  }, [incidents]);

  const max = rows.length > 0 ? Math.max(...rows.map((row) => row.value)) : 0;

  return (
    <Card>
      <CardHeader
        title="Tendance mensuelle"
        subtitle="Une hausse traduit une meilleure culture de déclaration"
      />

      {rows.length === 0 ? (
        <EmptyChart
          icon={<TrendingUp className="size-6" />}
          message="La tendance se construira au fil des déclarations enregistrées."
        />
      ) : (
        <div className="flex h-52 gap-3 px-6 py-6">
          {rows.map((row, index) => (
            <div
              key={`${row.year}-${row.label}`}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="font-display text-xs font-extrabold text-fg-muted tabular-nums">
                {row.value}
              </span>
              {/* Ce conteneur porte la hauteur définie contre laquelle le
                  pourcentage de la barre est résolu. */}
              <div className="relative w-full flex-1">
                <motion.div
                  className="absolute inset-x-0 bottom-0 rounded-t-xl bg-gradient-to-t from-hospital to-softblue"
                  initial={{ height: 0 }}
                  animate={{ height: `${(row.value / max) * 100}%` }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-fg-muted">
                {row.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
