"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "300 000",
    period: "FCFA / an",
    tagline: "Pour un établissement qui démarre sa démarche qualité.",
    features: [
      "1 établissement",
      "Jusqu'à 50 utilisateurs",
      "Déclaration 3 clics & mode hors-ligne",
      "Plan d'actions simple",
      "Support par e-mail",
    ],
    featured: false,
    cta: "Choisir Starter",
  },
  {
    name: "Standard",
    price: "600 000",
    period: "FCFA / an",
    tagline: "Le socle complet pour piloter la sécurité des soins.",
    features: [
      "1 établissement, services illimités",
      "Utilisateurs illimités",
      "Analyse ALARM 7 facteurs",
      "Module CREX & notes exportables",
      "Tableau de bord Direction",
      "Support prioritaire",
    ],
    featured: true,
    cta: "Choisir Standard",
  },
  {
    name: "Premium",
    price: "Sur devis",
    period: "multi-sites",
    tagline: "Pour un groupe hospitalier ou une direction départementale.",
    features: [
      "Établissements illimités",
      "Consolidation multi-sites",
      "Rôles & permissions avancés",
      "Accompagnement au déploiement",
      "Formation des référents qualité",
      "Interlocuteur dédié",
    ],
    featured: false,
    cta: "Nous contacter",
  },
];

export function Pricing() {
  return (
    <section
      id="tarifs"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
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
          Tarifs
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mt-3 max-w-2xl text-3xl leading-tight font-extrabold text-fg sm:text-4xl lg:text-5xl"
        >
          Un abonnement par établissement
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-lg text-fg-muted"
        >
          Sans coût par déclaration : le volume de signalements ne doit jamais
          être un frein financier.
        </motion.p>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={EASE_OUT}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 shadow-soft",
                plan.featured
                  ? "border-transparent bg-ink text-on-ink lg:-mt-4 lg:pb-10 shadow-lift"
                  : "border-line bg-surface",
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-vivid px-3.5 py-1.5 text-xs font-bold text-white">
                  <Sparkles className="size-3.5" />
                  Le plus choisi
                </span>
              ) : null}

              <h3
                className={cn(
                  "font-display text-xl font-extrabold",
                  plan.featured ? "text-on-ink" : "text-fg",
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-2 text-sm",
                  plan.featured ? "text-on-ink/70" : "text-fg-muted",
                )}
              >
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-display text-4xl font-extrabold",
                    plan.featured ? "text-on-ink" : "text-fg",
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    plan.featured ? "text-on-ink/60" : "text-fg-muted",
                  )}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        plan.featured ? "text-softblue" : "text-success",
                      )}
                    />
                    <span
                      className={
                        plan.featured ? "text-on-ink/85" : "text-fg-muted"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={plan.name === "Premium" ? "#contact" : "/register"}
                variant={plan.featured ? "primary" : "outline"}
                size="md"
                className="mt-8 w-full"
              >
                {plan.cta}
              </ButtonLink>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
