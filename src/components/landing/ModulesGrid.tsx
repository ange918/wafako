"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Microscope,
  Settings2,
  Siren,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";

const MODULES: {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}[] = [
  {
    icon: Siren,
    title: "Déclaration 3 clics",
    description:
      "Catégorie, description, validation. Horodatage automatique et sauvegarde locale si le réseau manque.",
    points: ["Mode hors-ligne", "Pièce jointe photo"],
  },
  {
    icon: Microscope,
    title: "Analyse ALARM",
    description:
      "Grille des 7 facteurs contributifs pour remonter aux causes racines plutôt qu'aux responsabilités.",
    points: ["7 facteurs", "Historique d'analyse"],
  },
  {
    icon: ClipboardList,
    title: "Plan d'actions",
    description:
      "Chaque cause donne une action assignée, datée et suivie jusqu'à sa clôture effective.",
    points: ["Responsable & échéance", "Relances automatiques"],
  },
  {
    icon: CalendarCheck,
    title: "Notifications CREX",
    description:
      "Planification des comités de retour d'expérience et convocation des participants concernés.",
    points: ["Compte à rebours", "Note exportable"],
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord Direction",
    description:
      "Indicateurs de sécurité consolidés : volumes, gravité, délais de traitement, taux de résolution.",
    points: ["KPIs temps réel", "Répartition par service"],
  },
  {
    icon: Settings2,
    title: "Administration multi-sites",
    description:
      "Gestion des hôpitaux, services, utilisateurs et droits depuis une console unique.",
    points: ["Multi-établissements", "Rôles & permissions"],
  },
];

export function ModulesGrid() {
  return (
    <section
      id="modules"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      <motion.div
        variants={stagger(0, 0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeUp}
          className="text-sm font-bold text-hospital uppercase"
        >
          Six modules
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mt-3 max-w-2xl text-3xl leading-tight font-extrabold text-fg sm:text-4xl lg:text-5xl"
        >
          De la déclaration terrain à la décision de direction
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-lg text-fg-muted"
        >
          Un même événement traverse toute la chaîne, sans ressaisie et sans
          papier perdu entre deux services.
        </motion.p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <motion.article
              key={module.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={EASE_OUT}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-soft"
            >
              {/* Voile de survol */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-vivid/0 via-vivid/0 to-vivid/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="relative grid size-12 place-items-center rounded-2xl bg-hospital/10 text-hospital transition-colors duration-300 group-hover:bg-hospital group-hover:text-white">
                <module.icon className="size-6" />
              </span>

              <h3 className="font-display relative mt-5 text-xl font-extrabold text-fg">
                {module.title}
              </h3>
              <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-fg-muted">
                {module.description}
              </p>

              <ul className="relative mt-5 flex flex-wrap gap-2">
                {module.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-fg-muted"
                  >
                    {point}
                  </li>
                ))}
              </ul>

              <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-hospital opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                En savoir plus
                <ArrowRight className="size-4" />
              </span>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
