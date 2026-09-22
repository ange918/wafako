"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const STEPS = [
  {
    number: "01",
    title: "Le soignant déclare",
    body: "Depuis son téléphone, au lit du patient. Trois écrans, une quarantaine de secondes. Sans réseau, la fiche est conservée localement et part dès le retour de la connexion.",
  },
  {
    number: "02",
    title: "Le référent analyse",
    body: "L'événement est qualifié puis passé à la grille ALARM. Les 7 facteurs contributifs orientent vers les causes systémiques plutôt que vers la faute individuelle.",
  },
  {
    number: "03",
    title: "L'établissement corrige",
    body: "Chaque cause devient une action assignée et datée, revue en CREX. La direction suit les délais et le taux de résolution depuis son cockpit.",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="border-y border-line bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <motion.div
          variants={stagger(0, 0.1)}
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

          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative"
              >
                <span className="font-display block text-5xl font-extrabold text-hospital/25">
                  {step.number}
                </span>
                <h3 className="font-display mt-3 text-xl font-extrabold text-fg">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
