"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

type Variant = "primary" | "ink" | "alert" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  // Bouton pilule bleu nuit, repris du visuel de référence.
  ink: "bg-ink text-on-ink hover:brightness-125",
  primary: "bg-primary text-primary-fg hover:brightness-110",
  alert: "bg-alert text-white hover:brightness-110",
  outline: "border border-line bg-surface text-fg hover:border-hospital",
  ghost: "text-fg-muted hover:bg-muted hover:text-fg",
  soft: "bg-hospital/10 text-hospital hover:bg-hospital/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  // Zones tactiles généreuses pour l'usage smartphone sur le terrain.
  lg: "h-13 px-7 text-base",
  xl: "h-16 px-8 text-lg",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[filter,background-color,border-color] outline-none " +
  "focus-visible:ring-2 focus-visible:ring-hospital focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const HOVER = { scale: 1.02 };
const TAP = { scale: 0.97 };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: StyleProps & Omit<HTMLMotionProps<"button">, "children" | "className">) {
  return (
    <motion.button
      {...rest}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      whileHover={HOVER}
      whileTap={TAP}
      transition={EASE_OUT}
    >
      {children}
    </motion.button>
  );
}

/**
 * Même apparence que `Button`, rendu en lien.
 *
 * Le wrapper `motion.span` anime l'enveloppe plutôt que le `<a>` lui-même, ce
 * qui laisse next/link gérer navigation et préchargement.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  external = false,
}: StyleProps & { href: string; external?: boolean }) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  return (
    <motion.span
      className="inline-flex"
      whileHover={HOVER}
      whileTap={TAP}
      transition={EASE_OUT}
    >
      {external ? (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )}
    </motion.span>
  );
}
