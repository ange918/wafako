"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock,
  Microscope,
  Siren,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  body: string;
  metric: { icon: LucideIcon; label: string };
  preview: React.ReactNode;
}

/* Aperçus miniatures : ils montrent l'écran réel de chaque étape plutôt que
   de le décrire, ce qui remplit la section sans la surcharger de texte. */

function DeclarationPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl bg-alert px-3 py-2 text-white">
        <Siren className="size-3.5 shrink-0" />
        <span className="text-[11px] font-bold">Déclarer un EI</span>
      </div>
      <div className="flex gap-2">
        {["Médicament", "Chute", "Infection"].map((label, index) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + index * 0.08 }}
            className={
              index === 0
                ? "flex-1 rounded-lg border border-hospital bg-hospital/10 px-2 py-1.5 text-center text-[9px] font-bold text-hospital"
                : "flex-1 rounded-lg border border-line px-2 py-1.5 text-center text-[9px] font-semibold text-fg-muted"
            }
          >
            {label}
          </motion.span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-warn/12 px-2.5 py-1.5">
        <span className="size-1.5 rounded-full bg-warn" />
        <span className="text-[9px] font-bold text-warn">
          Hors-ligne — sauvegardé sur l&apos;appareil
        </span>
      </div>
    </div>
  );
}

function AlarmPreview() {
  const factors = [
    { label: "Équipe", filled: true },
    { label: "Environnement", filled: true },
    { label: "Tâche", filled: true },
    { label: "Organisation", filled: false },
  ];
  return (
    <div className="space-y-1.5">
      {factors.map((factor, index) => (
        <motion.div
          key={factor.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + index * 0.07 }}
          className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5"
        >
          <span
            className={
              factor.filled
                ? "grid size-4 shrink-0 place-items-center rounded-full bg-success text-white"
                : "grid size-4 shrink-0 place-items-center rounded-full bg-muted"
            }
          >
            {factor.filled ? <Check className="size-2.5" /> : null}
          </span>
          <span className="text-[9px] font-semibold text-fg-muted">
            {factor.label}
          </span>
          <span className="ml-auto h-1 w-8 rounded-full bg-muted">
            <motion.span
              className="block h-full rounded-full bg-hospital"
              initial={{ width: 0 }}
              whileInView={{ width: factor.filled ? "100%" : "25%" }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.07, duration: 0.5 }}
            />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ActionPreview() {
  const actions = [
    { label: "Fiche de relève écrite", done: true },
    { label: "Audit barrières de lit", done: true },
    { label: "Étiquettes pré-imprimées", done: false },
  ];
  return (
    <div className="space-y-1.5">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + index * 0.08 }}
          className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5"
        >
          <span
            className={
              action.done
                ? "grid size-4 shrink-0 place-items-center rounded-md bg-success text-white"
                : "size-4 shrink-0 rounded-md border-2 border-line"
            }
          >
            {action.done ? <Check className="size-2.5" /> : null}
          </span>
          <span
            className={
              action.done
                ? "text-[9px] font-semibold text-fg-muted line-through"
                : "text-[9px] font-semibold text-fg"
            }
          >
            {action.label}
          </span>
        </motion.div>
      ))}
      <div className="flex items-center justify-between rounded-lg bg-success/12 px-2.5 py-1.5">
        <span className="text-[9px] font-bold text-success">
          Taux de clôture
        </span>
        <span className="font-display text-[11px] font-extrabold text-success">
          68 %
        </span>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Siren,
    title: "Le soignant déclare",
    body: "Depuis son téléphone, au lit du patient. Trois écrans suffisent. Sans réseau, la fiche est conservée localement et part dès le retour de la connexion.",
    metric: { icon: Timer, label: "~40 secondes" },
    preview: <DeclarationPreview />,
  },
  {
    number: "02",
    icon: Microscope,
    title: "Le référent analyse",
    body: "L'événement est qualifié puis passé à la grille ALARM. Les 7 facteurs contributifs orientent vers les causes systémiques plutôt que vers la faute individuelle.",
    metric: { icon: Users, label: "7 facteurs ALARM" },
    preview: <AlarmPreview />,
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "L'établissement corrige",
    body: "Chaque cause devient une action assignée et datée, revue en CREX. La direction suit les délais et le taux de résolution depuis son cockpit.",
    metric: { icon: TrendingUp, label: "Suivi jusqu'à clôture" },
    preview: <ActionPreview />,
  },
];

export function HowItWorks() {
  return (
    <section
      id="fonctionnement"
      className="relative overflow-hidden border-y border-line bg-muted"
    >
      {/* Halos décoratifs, en écho au dégradé du hero */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 top-16 size-96 rounded-full bg-hospital/8 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-vivid/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <motion.div
          variants={stagger(0, 0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-bold text-hospital uppercase"
          >
            Fonctionnement
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display mt-3 max-w-2xl text-3xl leading-tight font-extrabold text-fg sm:text-4xl lg:text-5xl"
          >
            Une boucle courte, du terrain à la décision
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-2xl text-lg text-fg-muted"
          >
            Un même signalement traverse les trois étapes sans ressaisie. Rien
            ne se perd entre le chevet du patient et la salle de réunion.
          </motion.p>

          {/* Rail animé reliant les trois étapes */}
          <div className="relative mt-16">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-0.5 bg-line lg:block"
            >
              <motion.span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-hospital via-softblue to-vivid"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-3 lg:gap-7">
              {STEPS.map((step, index) => (
                <motion.article
                  key={step.number}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={EASE_OUT}
                  className="group relative"
                >
                  {/* Pastille numérotée, posée sur le rail */}
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-on-ink shadow-lift transition-colors duration-300 group-hover:bg-hospital">
                      <step.icon className="size-6" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-hospital/20 transition-colors duration-300 group-hover:text-hospital/40">
                      {step.number}
                    </span>
                  </div>

                  <div className="mt-5 rounded-3xl border border-line bg-surface p-6 shadow-soft">
                    <h3 className="font-display text-xl font-extrabold text-fg">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                      {step.body}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-hospital/10 px-3 py-1 text-xs font-bold text-hospital">
                      <step.metric.icon className="size-3.5" />
                      {step.metric.label}
                    </span>

                    {/* Aperçu de l'écran correspondant */}
                    <div className="mt-5 rounded-2xl border border-line bg-muted p-3">
                      {step.preview}
                    </div>
                  </div>

                  {/* Flèche de liaison entre les cartes, masquée sur la dernière */}
                  {index < STEPS.length - 1 ? (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.15 }}
                      className="absolute -right-5 top-4 hidden size-6 place-items-center rounded-full bg-canvas text-hospital lg:grid"
                    >
                      <ArrowRight className="size-3.5" />
                    </motion.span>
                  ) : null}
                </motion.article>
              ))}
            </div>
          </div>

          {/* Bandeau de synthèse */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-3xl border border-line bg-surface px-7 py-6 text-center"
          >
            {[
              { icon: Clock, value: "40 s", label: "pour déclarer" },
              { icon: Microscope, value: "7", label: "facteurs analysés" },
              {
                icon: ClipboardCheck,
                value: "100 %",
                label: "des actions tracées",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-hospital/10 text-hospital">
                  <item.icon className="size-5" />
                </span>
                <div className="text-left">
                  <p className="font-display text-xl font-extrabold text-fg">
                    {item.value}
                  </p>
                  <p className="text-xs font-semibold text-fg-muted">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
