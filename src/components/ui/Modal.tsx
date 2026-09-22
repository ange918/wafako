"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { backdrop, modalPanel } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Plein écran sur mobile : adapté au stepper de déclaration. */
  fullScreenOnMobile?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  fullScreenOnMobile = false,
  className,
}: ModalProps) {
  // Fermeture au clavier + verrouillage du défilement de l'arrière-plan.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden bg-surface shadow-lift",
              fullScreenOnMobile
                ? "h-[92dvh] rounded-t-3xl sm:h-auto sm:max-h-[88vh] sm:max-w-2xl sm:rounded-3xl"
                : "max-h-[88vh] rounded-t-3xl sm:max-w-lg sm:rounded-3xl",
              className,
            )}
          >
            {title ? (
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <h2 className="font-display text-lg font-extrabold text-fg">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="rounded-full p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
                >
                  <X className="size-5" />
                </button>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
