import { cn } from "@/lib/utils";
import type { ActionStatus, IncidentStatus, Severity } from "@/types";

type Tone = "neutral" | "info" | "success" | "warn" | "alert";

const TONES: Record<Tone, string> = {
  neutral: "bg-fg/8 text-fg-muted",
  info: "bg-hospital/12 text-hospital",
  success: "bg-success/15 text-success",
  warn: "bg-warn/15 text-warn",
  alert: "bg-alert/12 text-alert",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const SEVERITY_TONE: Record<Severity, Tone> = {
  mineur: "neutral",
  modere: "info",
  grave: "warn",
  critique: "alert",
};

export const INCIDENT_STATUS_TONE: Record<IncidentStatus, Tone> = {
  nouveau: "alert",
  en_analyse: "warn",
  action_en_cours: "info",
  cloture: "success",
};

export const ACTION_STATUS_TONE: Record<ActionStatus, Tone> = {
  a_faire: "alert",
  en_cours: "warn",
  termine: "success",
};
