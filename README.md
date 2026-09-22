# SafeCare BJ

Plateforme de déclaration et de gestion des **événements indésirables (EI)** pour les hôpitaux publics du Bénin : déclaration en 3 clics depuis le terrain, analyse ALARM, plans d'actions et comités de retour d'expérience (CREX).

> **Périmètre : frontend uniquement.** Aucun backend, aucune route API, aucune base de données. L'état est simulé par des données fictives et persisté dans `localStorage`, y compris la file d'attente qui reproduit le mode hors-ligne.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Animations | Framer Motion 13 |
| Icônes | lucide-react |

## Démarrage

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # build de production
npm start       # sert le build
npm run lint    # ESLint
```

## Écrans

| Route | Description |
|---|---|
| `/` | Landing publique : hero, 6 modules, fonctionnement, tarifs, conformité APDP |
| `/register` | Inscription soignant (hôpital, service, rôle) → redirige vers `/dashboard` |
| `/login` | Connexion soignant → `/dashboard` |
| `/dashboard` | Espace soignant **mobile-first** : badge réseau, déclaration, actions, CREX, paramètres |
| `/admin` | Redirige vers le portail administrateur |
| `/admin/login` | Portail administrateur → `/admin/dashboard` |
| `/admin/dashboard` | Cockpit Direction **desktop-first** : KPIs, graphiques, incidents, ALARM, CREX |

L'authentification est simulée : n'importe quel identifiant fonctionne, rien n'est vérifié.

## Mode hors-ligne

C'est la contrainte centrale du produit : les soignants déclarent depuis un smartphone, avec une connectivité incertaine.

- La connectivité effective combine les événements `online`/`offline` du navigateur **et** un interrupteur manuel dans *Paramètres → Forcer le mode hors-ligne*, pour que la démonstration soit testable sans couper le réseau.
- Une fiche déclarée hors-ligne est marquée `en_attente` et conservée dans `localStorage`.
- Le badge de la barre supérieure affiche le nombre de fiches en file d'attente.
- Au retour de la connexion, la file se vide automatiquement.

## Structure

```
src/
  app/                    routes App Router
  components/
    ui/                   Button, Card, Badge, Modal, champs de formulaire, ThemeToggle
    landing/              sections de la page publique
    auth/                 formulaires d'inscription et de connexion
    dashboard/            espace soignant + stepper de déclaration
    admin/                cockpit, table d'incidents, grille ALARM, module CREX
    providers/            thème et état applicatif
  lib/
    mock-data.ts          hôpitaux, services, rôles, incidents, actions, CREX
    storage.ts            accès localStorage tolérant aux erreurs
    external-store.ts     lecture des états externes (stockage, réseau, horloge)
    motion.ts             variants Framer Motion partagés
    utils.ts              helpers de formatage
  types/                  modèle de domaine
```

## Design system

Les tokens sont déclarés en CSS-first dans `src/app/globals.css` via `@theme` — Tailwind 4 n'utilise plus de `tailwind.config.ts`.

| Token | Clair | Usage |
|---|---|---|
| `ink` | `#0A2540` | Bleu nuit : sidebar, boutons pilule |
| `hospital` | `#0F4C81` | Bleu hospitalier, couleur primaire |
| `softblue` | `#2A85C8` | Bleu doux, secondaire |
| `vivid` | `#1B4DE4` | Bleu électrique, accents et dégradés |
| `alert` | `#E53E3E` | Rouge alerte : déclaration, gravité critique |
| `muted` | `#F8FAFC` | Gris clair, fonds de section |

Typographie : **Archivo** (titres, graisse 800, letter-spacing neutre) et **Plus Jakarta Sans** (corps).

Le **mode sombre** est manuel : la variante est définie par `@custom-variant dark (&:where(.dark, .dark *))`, la classe `dark` est posée sur `<html>` et la préférence est mémorisée. Un script inline évite le flash de thème clair au chargement.

## Notes d'implémentation

- **Hydratation.** Le réseau, l'horloge et `localStorage` n'existent pas au rendu serveur. Ils sont lus via `useSyncExternalStore`, dont le snapshot serveur distinct évite tout mismatch sans recourir à un `useEffect` d'initialisation.
- **`localStorage` peut lever** (navigation privée, stockage bloqué) : chaque accès est encapsulé et l'application reste utilisable sans persistance.
- **Frontière client/serveur.** Les pages restent des Server Components et importent des composants clients ; seuls les fichiers utilisant `motion`, des hooks ou des événements portent `"use client"` — `framer-motion` n'embarque pas cette directive.
- **Accessibilité.** `prefers-reduced-motion` est respecté sur les animations décoratives ; les cibles tactiles de l'espace soignant sont dimensionnées pour un usage au lit du patient.
- `AGENTS.md` est généré et régénéré par Next.js à chaque `next dev`.

## Réinitialiser la démonstration

*Paramètres → Réinitialiser la démonstration* efface les données locales et restaure le jeu de données fictives.
