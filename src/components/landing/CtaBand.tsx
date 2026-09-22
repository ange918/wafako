"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden rounded-[2rem] bg-ink px-7 py-14 text-center shadow-lift sm:px-12"
      >
        {/* Halo décoratif, écho au dégradé du visuel de référence */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-vivid/30 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-softblue/20 blur-3xl"
        />

        <h2 className="font-display relative mx-auto max-w-2xl text-3xl leading-tight font-extrabold text-on-ink sm:text-4xl">
          Chaque événement déclaré est un incident évité demain
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base text-on-ink/70">
          Déployez SafeCare BJ dans votre établissement et donnez à vos équipes
          un moyen simple de signaler sans crainte.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" variant="primary" size="lg">
            Créer un compte soignant
            <ArrowRight className="size-4.5" />
          </ButtonLink>
          <ButtonLink
            href="#contact"
            size="lg"
            className="border border-on-ink/25 bg-transparent text-on-ink hover:bg-on-ink/10"
          >
            Demander une démonstration
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
