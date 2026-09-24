"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

/**
 * Liste déroulante des docteurs, à sélection multiple.
 *
 * Une même déclaration peut relever de deux domaines : le choix n'est donc
 * pas exclusif. Les docteurs sont regroupés par spécialité, comme ils le sont
 * dans l'annuaire de l'établissement.
 */
export function DoctorPicker({
  doctors,
  selected,
  onToggle,
  label = "Transmettre à",
  hint,
}: {
  doctors: Person[];
  selected: string[];
  onToggle: (id: string) => void;
  label?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const container = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = doctors.filter((doctor) =>
      needle
        ? `${doctor.firstName} ${doctor.lastName} ${doctor.specialty ?? ""}`
            .toLowerCase()
            .includes(needle)
        : true,
    );
    const map = new Map<string, Person[]>();
    matching.forEach((doctor) => {
      const key = doctor.specialty ?? "Spécialité non précisée";
      map.set(key, [...(map.get(key) ?? []), doctor]);
    });
    return [...map.entries()];
  }, [doctors, query]);

  const chosen = doctors.filter((doctor) => selected.includes(doctor.id));

  return (
    <div ref={container} className="relative">
      <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-fg">
        <Stethoscope className="size-4 text-hospital" />
        {label}
        <span className="font-normal text-fg-muted">
          {hint ?? "selon le domaine concerné · plusieurs choix possibles"}
        </span>
      </p>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={doctors.length === 0}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left transition-colors",
          doctors.length === 0
            ? "cursor-not-allowed border-dashed border-line text-fg-muted"
            : "border-line bg-surface hover:border-hospital/50",
        )}
      >
        <span className="min-w-0 flex-1 text-sm">
          {doctors.length === 0 ? (
            <span className="text-fg-muted">Aucun docteur inscrit</span>
          ) : chosen.length === 0 ? (
            <span className="text-fg-muted">
              Sélectionner un ou plusieurs docteurs…
            </span>
          ) : (
            <span className="font-semibold text-fg">
              {chosen
                .map((doctor) => `Dr ${doctor.firstName} ${doctor.lastName}`)
                .join(", ")}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4.5 shrink-0 text-fg-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {chosen.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chosen.map((doctor) => (
            <span
              key={doctor.id}
              className="rounded-full bg-hospital/10 px-3 py-1 text-[11px] font-bold text-hospital"
            >
              Dr {doctor.lastName} · {doctor.specialty}
            </span>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="sticky top-0 border-b border-line bg-surface p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nom ou spécialité…"
                  aria-label="Rechercher un docteur"
                  className="h-10 w-full rounded-xl border border-line bg-canvas pr-3 pl-9 text-sm text-fg outline-none focus:border-hospital"
                />
              </div>
            </div>

            {groups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-fg-muted">
                Aucun docteur ne correspond.
              </p>
            ) : (
              groups.map(([specialty, list]) => (
                <div key={specialty}>
                  <p className="bg-muted px-4 py-1.5 text-[11px] font-bold tracking-wide text-fg-muted uppercase">
                    {specialty}
                  </p>
                  {list.map((doctor) => {
                    const active = selected.includes(doctor.id);
                    return (
                      <button
                        key={doctor.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => onToggle(doctor.id)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-md border",
                            active
                              ? "border-transparent bg-hospital text-white"
                              : "border-line",
                          )}
                        >
                          {active ? <Check className="size-3" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-fg">
                            Dr {doctor.firstName} {doctor.lastName}
                          </span>
                          <span className="block truncate text-xs text-fg-muted">
                            {doctor.email}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
