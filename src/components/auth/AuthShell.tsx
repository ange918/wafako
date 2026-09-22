"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { fadeUp } from "@/lib/motion";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="surface-gradient min-h-dvh">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" />
            Accueil
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full justify-center px-5 pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className={
            wide
              ? "w-full max-w-2xl rounded-3xl border border-line bg-surface p-7 shadow-lift sm:p-9"
              : "w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-lift sm:p-9"
          }
        >
          <h1 className="font-display text-2xl font-extrabold text-fg sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-line pt-5 text-center text-sm text-fg-muted">
              {footer}
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
