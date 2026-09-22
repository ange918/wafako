"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  ImagePlus,
  Paperclip,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORIES, SEVERITY_LABELS, SEVERITY_ORDER } from "@/lib/mock-data";
import { stepSlide } from "@/lib/motion";
import { cn, formatDateTime } from "@/lib/utils";
import { CATEGORY_ICONS } from "./categoryIcons";
import type { CategoryId, DeclarationDraft, Severity } from "@/types";

const STEP_TITLES = [
  "Que s'est-il passé ?",
  "Décrire l'événement",
  "Vérifier et valider",
];

function emptyDraft(): DeclarationDraft {
  return {
    category: null,
    severity: "modere",
    description: "",
    attachmentName: undefined,
    // Horodatage automatique à l'ouverture du stepper.
    occurredAt: new Date().toISOString(),
  };
}

/**
 * Le stepper ne conserve aucun état entre deux ouvertures : `Modal` ne monte
 * ses enfants que lorsqu'il est ouvert, donc `StepperFlow` repart d'un
 * brouillon neuf — horodatage compris — à chaque affichage.
 */
export function DeclarationStepper({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} fullScreenOnMobile>
      <StepperFlow onClose={onClose} />
    </Modal>
  );
}

function StepperFlow({ onClose }: { onClose: () => void }) {
  const { addIncident, isOnline } = useAppState();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<DeclarationDraft>(emptyDraft);
  const [result, setResult] = useState<{
    reference: string;
    offline: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) return draft.category !== null;
    if (step === 1) return draft.description.trim().length >= 10;
    return true;
  }, [step, draft]);

  const goTo = useCallback((next: number) => {
    setDirection(next > 0 ? 1 : -1);
    setStep((current) => Math.min(2, Math.max(0, current + next)));
  }, []);

  const submit = () => {
    const incident = addIncident(draft);
    setResult({
      reference: incident.reference,
      offline: incident.sync === "en_attente",
    });
  };

  const selectedCategory = CATEGORIES.find(
    (item) => item.id === draft.category,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
        <h2 className="font-display text-lg font-extrabold text-fg">
          {result ? "Déclaration enregistrée" : STEP_TITLES[step]}
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

      {result ? (
        <ConfirmationPanel
          reference={result.reference}
          offline={result.offline}
          onClose={onClose}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <StepIndicator step={step} />

          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {step === 0 ? (
                  <StepCategory draft={draft} setDraft={setDraft} />
                ) : step === 1 ? (
                  <StepDescription
                    draft={draft}
                    setDraft={setDraft}
                    dragging={dragging}
                    setDragging={setDragging}
                  />
                ) : (
                  <StepRecap
                    draft={draft}
                    categoryLabel={selectedCategory?.label ?? "—"}
                    isOnline={isOnline}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 border-t border-line bg-surface px-5 py-4">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => goTo(-1)}
              >
                <ArrowLeft className="size-4.5" />
                Retour
              </Button>
            ) : null}

            {step < 2 ? (
              <Button
                type="button"
                variant="ink"
                size="lg"
                className="flex-1"
                disabled={!canContinue}
                onClick={() => goTo(1)}
              >
                Continuer
                <ArrowRight className="size-4.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="alert"
                size="lg"
                className="flex-1"
                onClick={submit}
              >
                <Send className="size-4.5" />
                Valider la déclaration
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 px-5 pt-4 pb-5">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-colors",
              index < step
                ? "bg-success text-white"
                : index === step
                  ? "bg-hospital text-white"
                  : "bg-muted text-fg-muted",
            )}
          >
            {index < step ? <Check className="size-3.5" /> : index + 1}
          </span>
          {index < 2 ? (
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-hospital"
                initial={false}
                animate={{ width: index < step ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StepCategory({
  draft,
  setDraft,
}: {
  draft: DeclarationDraft;
  setDraft: React.Dispatch<React.SetStateAction<DeclarationDraft>>;
}) {
  return (
    <div>
      <p className="mb-4 flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-xs font-semibold text-fg-muted">
        <Clock className="size-4 shrink-0 text-hospital" />
        Horodatage automatique : {formatDateTime(draft.occurredAt)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const selected = draft.category === category.id;
          return (
            <motion.button
              key={category.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  category: category.id as CategoryId,
                }))
              }
              className={cn(
                // Cibles tactiles généreuses pour un usage au lit du patient.
                "flex min-h-32 flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                selected
                  ? "border-hospital bg-hospital/10"
                  : "border-line bg-surface hover:border-hospital/40",
              )}
            >
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-xl transition-colors",
                  selected
                    ? "bg-hospital text-white"
                    : "bg-muted text-hospital",
                )}
              >
                <Icon className="size-5.5" />
              </span>
              <span className="text-sm font-bold leading-tight text-fg">
                {category.label}
              </span>
              <span className="text-[11px] leading-snug text-fg-muted">
                {category.hint}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-bold text-fg">Gravité estimée</p>
        <div className="grid grid-cols-4 gap-2">
          {SEVERITY_ORDER.map((severity) => (
            <motion.button
              key={severity}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  severity: severity as Severity,
                }))
              }
              className={cn(
                "min-h-12 rounded-2xl border px-2 text-xs font-bold transition-colors",
                draft.severity === severity
                  ? "border-transparent bg-ink text-on-ink"
                  : "border-line bg-surface text-fg-muted hover:border-hospital/40",
              )}
            >
              {SEVERITY_LABELS[severity]}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepDescription({
  draft,
  setDraft,
  dragging,
  setDragging,
}: {
  draft: DeclarationDraft;
  setDraft: React.Dispatch<React.SetStateAction<DeclarationDraft>>;
  dragging: boolean;
  setDragging: (value: boolean) => void;
}) {
  const attach = (fileName: string) =>
    setDraft((current) => ({ ...current, attachmentName: fileName }));

  return (
    <div className="space-y-5">
      <Textarea
        name="description"
        label="Description des faits"
        hint="10 caractères minimum"
        value={draft.description}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            description: event.target.value,
          }))
        }
        placeholder="Décrivez ce qui s'est passé, sans nommer le patient ni les personnes impliquées."
      />

      <p className="rounded-2xl bg-hospital/8 px-4 py-3 text-xs leading-relaxed text-fg-muted">
        Restez factuel. La déclaration sert à comprendre les causes, pas à
        désigner un responsable.
      </p>

      <div>
        <p className="mb-2 text-sm font-bold text-fg">Photo ou pièce jointe</p>

        {draft.attachmentName ? (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-muted px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-hospital/12 text-hospital">
              <Paperclip className="size-5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
              {draft.attachmentName}
            </span>
            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  attachmentName: undefined,
                }))
              }
              aria-label="Retirer la pièce jointe"
              className="rounded-full p-2 text-fg-muted transition-colors hover:bg-surface hover:text-alert"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              // Seul le nom est conservé : aucun binaire n'est stocké.
              if (file) attach(file.name);
            }}
            className={cn(
              "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors",
              dragging
                ? "border-hospital bg-hospital/8"
                : "border-line bg-muted hover:border-hospital/50",
            )}
          >
            <ImagePlus className="size-7 text-hospital" />
            <span className="text-sm font-bold text-fg">
              Déposer une photo ou parcourir
            </span>
            <span className="text-xs text-fg-muted">
              JPG ou PNG — le fichier n&apos;est pas envoyé en démonstration
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) attach(file.name);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function StepRecap({
  draft,
  categoryLabel,
  isOnline,
}: {
  draft: DeclarationDraft;
  categoryLabel: string;
  isOnline: boolean;
}) {
  const rows = [
    { label: "Catégorie", value: categoryLabel },
    { label: "Gravité", value: SEVERITY_LABELS[draft.severity] },
    { label: "Survenu le", value: formatDateTime(draft.occurredAt) },
    { label: "Pièce jointe", value: draft.attachmentName ?? "Aucune" },
  ];

  return (
    <div className="space-y-4">
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 bg-surface px-4 py-3"
          >
            <span className="text-sm text-fg-muted">{row.label}</span>
            <span className="text-right text-sm font-bold text-fg">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface px-4 py-3">
        <p className="text-sm text-fg-muted">Description</p>
        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-fg">
          {draft.description}
        </p>
      </div>

      {!isOnline ? (
        <p className="flex items-start gap-2.5 rounded-2xl bg-warn/12 px-4 py-3 text-sm font-semibold text-warn">
          <TriangleAlert className="mt-0.5 size-4.5 shrink-0" />
          Vous êtes hors-ligne : la fiche sera sauvegardée sur l&apos;appareil
          et transmise automatiquement au retour du réseau.
        </p>
      ) : null}
    </div>
  );
}

function ConfirmationPanel({
  reference,
  offline,
  onClose,
}: {
  reference: string;
  offline: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={cn(
          "grid size-20 place-items-center rounded-full",
          offline ? "bg-warn/15 text-warn" : "bg-success/15 text-success",
        )}
      >
        <CircleCheck className="size-10" />
      </motion.span>

      <h3 className="font-display mt-6 text-2xl font-extrabold text-fg">
        {offline ? "Sauvegardé localement" : "Déclaration transmise"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">
        {offline
          ? "Aucun réseau détecté. La fiche est conservée sur l'appareil et partira automatiquement dès la reconnexion."
          : "Le référent qualité de votre service a été notifié et prendra en charge l'analyse."}
      </p>

      <p className="mt-5 rounded-full bg-muted px-4 py-2 font-display text-sm font-extrabold text-fg">
        {reference}
      </p>

      <Button variant="ink" size="lg" className="mt-8 w-full" onClick={onClose}>
        Terminer
      </Button>
    </div>
  );
}
