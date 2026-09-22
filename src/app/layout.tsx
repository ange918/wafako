import type { Metadata, Viewport } from "next";
import { Archivo, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SafeCare BJ",
    default: "SafeCare BJ — Sécurité & qualité des soins au Bénin",
  },
  description:
    "Plateforme de déclaration et de gestion des événements indésirables pour les hôpitaux publics du Bénin. Déclaration en 3 clics, analyse ALARM, plans d'actions et CREX.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f4c81" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      // Next 16 ne force plus le saut en haut de page quand `scroll-behavior:
      // smooth` est défini en CSS : cet attribut restaure ce comportement.
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${jakarta.variable} h-full antialiased`}
      // Le thème est appliqué par un script avant l'hydratation.
      suppressHydrationWarning
    >
      <body className="min-h-full bg-canvas font-sans text-fg">
        <ThemeProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
