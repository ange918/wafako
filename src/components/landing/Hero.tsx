"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleCheck, ShieldCheck, Siren } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneOfflineVisual } from "./PhoneOfflineVisual";
import { fadeUp, stagger } from "@/lib/motion";

const PROOF_POINTS = [
  "Déclaration en 3 clics",
  "Fonctionne hors-ligne",
  "Analyse ALARM intégrée",
];

export function Hero() {
  return (
    <section className="surface-gradient relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-24">
        <motion.div
          variants={stagger(0.05, 0.1)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl leading-[1.08] font-extrabold text-fg sm:text-5xl lg:text-6xl"
          >
            Sécurité &amp; qualité
            <br />
            des soins au Bénin
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted"
          >
            La plateforme qui permet aux équipes hospitalières de déclarer un
            événement indésirable en moins d&apos;une minute, même sans réseau,
            et à la direction d&apos;en tirer des plans d&apos;actions suivis.
          </motion.p>

          <motion.span
            variants={fadeUp}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-hospital/25 bg-surface/70 px-4 py-1.5 text-xs font-bold text-hospital backdrop-blur"
          >
            <ShieldCheck className="size-3.5" />
            Conforme aux exigences APDP Bénin
          </motion.span>

          {/* Deux colonnes dès le mobile : les CTA restent sur une seule ligne. */}
          <motion.div
            variants={fadeUp}
            className="mt-4 grid grid-cols-2 gap-3 sm:flex"
          >
            <ButtonLink
              href="/register"
              variant="ink"
              size="lg"
              wrapperClassName="w-full sm:w-auto"
              className="w-full px-4 sm:px-7"
            >
              Commencer
              <ArrowRight className="size-4.5 shrink-0" />
            </ButtonLink>
            {/* La déclaration passe obligatoirement par la connexion. */}
            <ButtonLink
              href="/login"
              variant="alert"
              size="lg"
              wrapperClassName="w-full sm:w-auto"
              className="w-full px-4 sm:px-7"
            >
              <Siren className="size-4.5 shrink-0" />
              Déclarer un EI
            </ButtonLink>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5"
          >
            {PROOF_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-semibold text-fg-muted"
              >
                <CircleCheck className="size-4 text-success" />
                {point}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhoneOfflineVisual />
        </motion.div>
      </div>
    </section>
  );
}
