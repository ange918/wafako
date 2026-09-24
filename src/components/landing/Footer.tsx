"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./Logo";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Modules", href: "#modules" },
      { label: "Fonctionnement", href: "#fonctionnement" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Espace soignant", href: "/login" },
      { label: "Espace docteur", href: "/docteur/connexion" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide de la déclaration", href: "#fonctionnement" },
      { label: "Protocole ALARM", href: "#modules" },
      { label: "Organisation d'un CREX", href: "#modules" },
      { label: "Culture de sécurité", href: "#fonctionnement" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "#contact" },
      { label: "Politique de confidentialité", href: "#contact" },
      { label: "Conditions d'utilisation", href: "#contact" },
      { label: "Traitement des données de santé", href: "#contact" },
    ],
  },
];

const CONTACTS = [
  { icon: MapPin, label: "Cotonou, Bénin" },
  { icon: Mail, label: "contact@safecare.bj" },
  { icon: Phone, label: "+229 21 00 00 00" },
];

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Conformité APDP Bénin",
    body: "Traitement des données de santé déclaré auprès de l'Autorité de Protection des Données à caractère Personnel.",
  },
  {
    icon: ServerCog,
    title: "Hébergement au Bénin",
    body: "Les données restent sur le territoire national, chiffrées au repos comme en transit.",
  },
  {
    icon: Lock,
    title: "Déclaration non punitive",
    body: "Les signalements servent l'analyse des causes, jamais la sanction individuelle.",
  },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-line bg-muted"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-24 size-96 rounded-full bg-hospital/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        {/* Trois garanties, mises en avant avant les liens */}
        <motion.div
          variants={stagger(0, 0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {GUARANTEES.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={EASE_OUT}
              className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-success/12 text-success">
                <item.icon className="size-5" />
              </span>
              <p className="font-display mt-3.5 text-sm font-extrabold text-fg">
                {item.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
                {item.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={stagger(0, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]"
        >
          <motion.div variants={fadeUp}>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Plateforme de gestion et de déclaration des événements
              indésirables pour les hôpitaux publics du Bénin.
            </p>

            <ul className="mt-6 space-y-2.5">
              {CONTACTS.map((contact) => (
                <li
                  key={contact.label}
                  className="flex items-center gap-2.5 text-sm text-fg-muted"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-hospital">
                    <contact.icon className="size-4" />
                  </span>
                  {contact.label}
                </li>
              ))}
            </ul>

            <motion.div
              whileHover={{ x: 4 }}
              transition={EASE_OUT}
              className="mt-6"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-hospital"
              >
                Créer un compte soignant
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </motion.div>

          {COLUMNS.map((column) => (
            <motion.div key={column.title} variants={fadeUp}>
              <h3 className="font-display text-sm font-extrabold text-fg uppercase">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-hospital"
                    >
                      <span className="h-px w-0 bg-hospital transition-all duration-300 group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-muted">
            © {new Date().getFullYear()} SafeCare. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-xs font-semibold text-fg-muted">
              Bénin · Santé publique
            </span>
            <Link
              href="/qualite"
              className="text-xs font-medium text-fg-muted/70 transition-colors hover:text-hospital"
            >
              Cellule qualité
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium text-fg-muted/70 transition-colors hover:text-hospital"
            >
              Espace Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
