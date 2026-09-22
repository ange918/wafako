"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import {
  Badge,
  INCIDENT_STATUS_TONE,
  SEVERITY_TONE,
} from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { CATEGORY_ICONS } from "@/components/dashboard/categoryIcons";
import {
  CATEGORIES,
  SERVICES,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  STATUS_LABELS,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { Incident, Severity } from "@/types";

export function IncidentsTable({
  incidents,
  onOpen,
}: {
  incidents: Incident[];
  onOpen: (incident: Incident) => void;
}) {
  const [severity, setSeverity] = useState<Severity | "toutes">("toutes");
  const [service, setService] = useState<string>("tous");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      incidents.filter((incident) => {
        if (severity !== "toutes" && incident.severity !== severity)
          return false;
        if (service !== "tous" && incident.service !== service) return false;
        if (query.trim()) {
          const haystack =
            `${incident.reference} ${incident.description} ${incident.declaredBy}`.toLowerCase();
          if (!haystack.includes(query.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [incidents, severity, service, query],
  );

  return (
    <Card>
      <CardHeader
        title="Incidents déclarés"
        subtitle={`${filtered.length} événement${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""}`}
        action={
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-fg-muted sm:inline-flex">
            <SlidersHorizontal className="size-4" />
            Filtres actifs
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une référence, une description…"
            aria-label="Rechercher un incident"
            className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-fg outline-none placeholder:text-fg-muted/70 focus:border-hospital"
          />
        </div>

        <FilterSelect
          label="Gravité"
          value={severity}
          onChange={(value) => setSeverity(value as Severity | "toutes")}
          options={[
            { value: "toutes", label: "Toutes gravités" },
            ...SEVERITY_ORDER.map((item) => ({
              value: item,
              label: SEVERITY_LABELS[item],
            })),
          ]}
        />

        <FilterSelect
          label="Service"
          value={service}
          onChange={setService}
          options={[
            { value: "tous", label: "Tous services" },
            ...SERVICES.map((item) => ({ value: item, label: item })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-fg-muted">
          Aucun incident ne correspond à ces filtres.
        </p>
      ) : (
        <>
          {/* Table sur desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-bold text-fg-muted uppercase">
                  <th className="px-6 py-3">Référence</th>
                  <th className="px-6 py-3">Catégorie</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Gravité</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Déclaré le</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((incident) => {
                  const Icon = CATEGORY_ICONS[incident.category];
                  const label =
                    CATEGORIES.find((item) => item.id === incident.category)
                      ?.label ?? "—";
                  return (
                    <motion.tr
                      key={incident.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors hover:bg-muted"
                    >
                      <td className="px-6 py-4 font-display font-extrabold text-fg">
                        {incident.reference}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-fg-muted">
                          <Icon className="size-4 text-hospital" />
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-fg-muted">
                        {incident.service}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={SEVERITY_TONE[incident.severity]}>
                          {SEVERITY_LABELS[incident.severity]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={INCIDENT_STATUS_TONE[incident.status]}>
                          {STATUS_LABELS[incident.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-fg-muted">
                        {formatDate(incident.declaredAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpen(incident)}
                          className="rounded-full bg-hospital/10 px-4 py-2 text-xs font-bold text-hospital transition-colors hover:bg-hospital hover:text-white"
                        >
                          Analyser
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cartes sur petits écrans */}
          <ul className="divide-y divide-line lg:hidden">
            {filtered.map((incident) => (
              <li key={incident.id}>
                <button
                  type="button"
                  onClick={() => onOpen(incident)}
                  className="w-full px-6 py-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm font-extrabold text-fg">
                      {incident.reference}
                    </span>
                    <Badge tone={SEVERITY_TONE[incident.severity]}>
                      {SEVERITY_LABELS[incident.severity]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                    {incident.description}
                  </p>
                  <p className="mt-2 text-[11px] text-fg-muted/80">
                    {incident.service} · {formatDate(incident.declaredAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface pl-3.5">
        <Filter className="size-3.5 text-fg-muted" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="h-10 rounded-full bg-transparent pr-3.5 text-sm font-semibold text-fg outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
