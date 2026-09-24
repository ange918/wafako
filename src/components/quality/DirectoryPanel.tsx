"use client";

import { Building2, Stethoscope, UserRound, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/components/providers/AppStateProvider";
import { HOSPITALS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { Person } from "@/types";

/** Regroupe les personnes par service ou par spécialité. */
function groupBy(people: Person[], key: "service" | "specialty") {
  const map = new Map<string, Person[]>();
  people.forEach((person) => {
    const bucket = person[key] ?? "Non précisé";
    map.set(bucket, [...(map.get(bucket) ?? []), person]);
  });
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Annuaire condensé, affiché dans la barre latérale de la cellule qualité.
 *
 * C'est de là que part la transmission : on doit voir d'un coup d'œil qui
 * travaille dans l'établissement et quel docteur couvre quel domaine.
 */
export function DirectorySidebar() {
  const { staff, doctors } = useAppState();

  return (
    <div className="space-y-5 pb-4">
      <div>
        <p className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold tracking-wide text-white/40 uppercase">
          <Users className="size-3.5" />
          Personnel ({staff.length})
        </p>
        {staff.length === 0 ? (
          <p className="px-1 text-xs leading-relaxed text-white/45">
            Aucun compte soignant créé sur cet appareil.
          </p>
        ) : (
          <div className="space-y-3">
            {groupBy(staff, "service").map(([service, list]) => (
              <div key={service}>
                <p className="px-1 text-[11px] font-bold text-white/55">
                  {service}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {list.map((person) => (
                    <li
                      key={person.id}
                      className="truncate px-1 text-xs text-white/70"
                    >
                      {person.firstName} {person.lastName}
                      <span className="text-white/40">
                        {person.role ? ` · ${person.role}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold tracking-wide text-white/40 uppercase">
          <Stethoscope className="size-3.5" />
          Docteurs ({doctors.length})
        </p>
        {doctors.length === 0 ? (
          <p className="px-1 text-xs leading-relaxed text-white/45">
            Aucun docteur inscrit. Les fiches ne peuvent pas encore être
            transmises.
          </p>
        ) : (
          <div className="space-y-3">
            {groupBy(doctors, "specialty").map(([specialty, list]) => (
              <div key={specialty}>
                <p className="px-1 text-[11px] font-bold text-white/55">
                  {specialty}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {list.map((person) => (
                    <li
                      key={person.id}
                      className="truncate px-1 text-xs text-white/70"
                    >
                      Dr {person.firstName} {person.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Annuaire complet, en pleine page. */
export function DirectorySection() {
  const { staff, doctors } = useAppState();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader
          title="Personnel de l'établissement"
          subtitle={`${staff.length} compte${staff.length > 1 ? "s" : ""} soignant${staff.length > 1 ? "s" : ""}`}
        />
        {staff.length === 0 ? (
          <Empty
            icon={<Users className="size-6" />}
            body="Aucun compte soignant n'a été créé sur cet appareil. Chaque inscription alimente cet annuaire."
          />
        ) : (
          <div className="divide-y divide-line">
            {groupBy(staff, "service").map(([service, list]) => (
              <div key={service} className="px-6 py-4">
                <p className="text-xs font-bold tracking-wide text-fg-muted uppercase">
                  {service}
                </p>
                <ul className="mt-2 space-y-2">
                  {list.map((person) => (
                    <PersonRow key={person.id} person={person} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Docteurs par spécialité"
          subtitle={`${doctors.length} docteur${doctors.length > 1 ? "s" : ""} inscrit${doctors.length > 1 ? "s" : ""}`}
        />
        {doctors.length === 0 ? (
          <Empty
            icon={<Stethoscope className="size-6" />}
            body="Aucun docteur inscrit. Sans docteur dans l'annuaire, une fiche classée ne peut être transmise à personne."
          />
        ) : (
          <div className="divide-y divide-line">
            {groupBy(doctors, "specialty").map(([specialty, list]) => (
              <div key={specialty} className="px-6 py-4">
                <p className="text-xs font-bold tracking-wide text-fg-muted uppercase">
                  {specialty}
                </p>
                <ul className="mt-2 space-y-2">
                  {list.map((person) => (
                    <PersonRow key={person.id} person={person} doctor />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PersonRow({
  person,
  doctor = false,
}: {
  person: Person;
  doctor?: boolean;
}) {
  const hospital = HOSPITALS.find((item) => item.id === person.hospitalId);
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-hospital/10 text-hospital">
        {doctor ? (
          <Stethoscope className="size-4.5" />
        ) : (
          <UserRound className="size-4.5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-fg">
          {doctor ? "Dr " : ""}
          {person.firstName} {person.lastName}
        </p>
        <p className="truncate text-xs text-fg-muted">
          {person.email} · inscrit le {formatDate(person.registeredAt)}
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 text-xs text-fg-muted sm:inline-flex">
        <Building2 className="size-3.5" />
        {hospital?.name ?? "—"}
      </span>
    </li>
  );
}

function Empty({ icon, body }: { icon: React.ReactNode; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-fg-muted">
        {icon}
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}
