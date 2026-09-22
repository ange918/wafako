"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  ALARM_DISTRIBUTION,
  MONTHLY_TREND,
  SERVICE_DISTRIBUTION,
} from "@/lib/mock-data";

/**
 * Graphiques construits en Tailwind et SVG inline : aucune librairie de
 * charting, conformément au périmètre frontend maquetté.
 */

export function ServiceBarChart() {
  const max = Math.max(...SERVICE_DISTRIBUTION.map((item) => item.count));

  return (
    <Card>
      <CardHeader
        title="Répartition par service"
        subtitle="Déclarations reçues sur les 6 derniers mois"
      />
      <div className="space-y-3.5 px-6 py-5">
        {SERVICE_DISTRIBUTION.map((item, index) => (
          <div key={item.service}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-fg">
                {item.service}
              </span>
              <span className="font-display text-sm font-extrabold text-fg-muted tabular-nums">
                {item.count}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-hospital to-softblue"
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.count / max) * 100}%` }}
                viewport={{ once: true }}
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
const ALARM_TOTAL = ALARM_DISTRIBUTION.reduce(
  (sum, item) => sum + item.count,
  0,
);

/**
 * Segments du donut, calculés une fois au chargement du module : le décalage
 * de chaque arc est la somme des longueurs des précédents.
 */
const DONUT_SEGMENTS = ALARM_DISTRIBUTION.map((item, index) => ({
  ...item,
  color: DONUT_COLORS[index % DONUT_COLORS.length],
  share: item.count / ALARM_TOTAL,
  dash: (item.count / ALARM_TOTAL) * DONUT_CIRCUMFERENCE,
  offset:
    (ALARM_DISTRIBUTION.slice(0, index).reduce(
      (sum, previous) => sum + previous.count,
      0,
    ) /
      ALARM_TOTAL) *
    DONUT_CIRCUMFERENCE,
}));

export function AlarmDonut() {
  return (
    <Card>
      <CardHeader
        title="Causes ALARM"
        subtitle="Facteurs contributifs identifiés en analyse"
      />
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
            {DONUT_SEGMENTS.map((segment, index) => (
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
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-fg">
                {ALARM_TOTAL}
              </p>
              <p className="text-[11px] font-semibold text-fg-muted">
                facteurs
              </p>
            </div>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-2">
          {DONUT_SEGMENTS.map((segment) => (
            <li key={segment.key} className="flex items-center gap-2.5 text-sm">
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
    </Card>
  );
}

export function MonthlyTrend() {
  const max = Math.max(...MONTHLY_TREND.map((item) => item.value));

  return (
    <Card>
      <CardHeader
        title="Tendance mensuelle"
        subtitle="Une hausse traduit une meilleure culture de déclaration"
      />
      <div className="flex h-52 gap-3 px-6 py-6">
        {MONTHLY_TREND.map((item, index) => (
          <div
            key={item.month}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="font-display text-xs font-extrabold text-fg-muted tabular-nums">
              {item.value}
            </span>
            {/* Ce conteneur porte la hauteur definie contre laquelle le
                pourcentage de la barre est resolu. */}
            <div className="relative w-full flex-1">
              <motion.div
                className="absolute inset-x-0 bottom-0 rounded-t-xl bg-gradient-to-t from-hospital to-softblue"
                initial={{ height: 0 }}
                whileInView={{ height: `${(item.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
              />
            </div>
            <span className="text-xs font-semibold text-fg-muted">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
