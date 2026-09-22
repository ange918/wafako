"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Tuile de KPI du cockpit administrateur. */
export function Stat({
  label,
  value,
  delta,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "alert" | "success";
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            tone === "alert" && "bg-alert/12 text-alert",
            tone === "success" && "bg-success/15 text-success",
            tone === "neutral" && "bg-hospital/12 text-hospital",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-fg">
        {value}
      </p>
      {delta ? <p className="mt-1 text-xs text-fg-muted">{delta}</p> : null}
    </motion.div>
  );
}
