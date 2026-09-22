import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Modules", href: "#modules" },
      { label: "Fonctionnement", href: "#fonctionnement" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Espace soignant", href: "/dashboard" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide de la déclaration", href: "#fonctionnement" },
      { label: "Protocole ALARM", href: "#modules" },
      { label: "Organisation d'un CREX", href: "#modules" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "#contact" },
      { label: "Politique de confidentialité", href: "#contact" },
      { label: "Conditions d'utilisation", href: "#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-line bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Plateforme de gestion et de déclaration des événements
              indésirables pour les hôpitaux publics du Bénin.
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-fg-muted">
              <p className="flex items-center gap-2.5">
                <MapPin className="size-4 text-hospital" />
                Cotonou, Bénin
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 text-hospital" />
                contact@safecare.bj
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 text-hospital" />
                +229 21 00 00 00
              </p>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-extrabold text-fg uppercase">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-hospital"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-line bg-surface p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
          <p className="text-sm leading-relaxed text-fg-muted">
            <span className="font-semibold text-fg">
              Conformité APDP Bénin.
            </span>{" "}
            Les données de santé sont hébergées au Bénin, chiffrées au repos et
            en transit. Les déclarations sont exploitées de manière non
            punitive, conformément aux principes de la culture de sécurité.
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-muted">
            © {new Date().getFullYear()} SafeCare BJ. Tous droits réservés.
          </p>
          <Link
            href="/admin"
            className="text-xs font-medium text-fg-muted/70 transition-colors hover:text-hospital"
          >
            Espace Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
