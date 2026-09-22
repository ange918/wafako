import type { Transition, Variants } from "framer-motion";

/** Variants Framer Motion partagés, pour garder une gestuelle cohérente. */

export const EASE_OUT: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

export const QUICK: Transition = { duration: 0.18, ease: "easeOut" };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

/** Applique un décalage progressif aux enfants animés. */
export const stagger = (
  delayChildren = 0,
  staggerChildren = 0.08,
): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: EASE_OUT },
  exit: { opacity: 0, scale: 0.96, transition: QUICK },
};

/** Entrée/sortie d'une modale plein écran (mobile) ou centrée (desktop). */
export const modalPanel: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: EASE_OUT },
  exit: { opacity: 0, y: 24, scale: 0.98, transition: QUICK },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Étapes du stepper : glissement horizontal dont le sens dépend de la
 * direction de navigation (1 = avance, -1 = retour).
 */
export const stepSlide: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 64 : -64,
  }),
  visible: { opacity: 1, x: 0, transition: EASE_OUT },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -64 : 64,
    transition: QUICK,
  }),
};

/** Interactions communes aux éléments cliquables. */
export const pressable = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: EASE_OUT,
} as const;

export const liftable = {
  whileHover: { y: -6 },
  transition: EASE_OUT,
} as const;
