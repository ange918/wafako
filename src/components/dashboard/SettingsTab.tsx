"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  CloudUpload,
  LogOut,
  Moon,
  RotateCcw,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HOSPITALS } from "@/lib/mock-data";
import { fadeUp, stagger } from "@/lib/motion";
import { cn, initials } from "@/lib/utils";

export function SettingsTab() {
  const router = useRouter();
  const {
    profile,
    forcedOffline,
    setForcedOffline,
    pendingCount,
    syncPending,
    resetDemo,
    isOnline,
  } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const hospital = HOSPITALS.find((item) => item.id === profile.hospitalId);

  return (
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-display px-1 text-xl font-extrabold text-fg">
          Paramètres
        </h2>
      </motion.div>

      <motion.section
        variants={fadeUp}
        className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
      >
        <div className="flex items-center gap-4">
          <span className="font-display grid size-14 shrink-0 place-items-center rounded-2xl bg-hospital text-lg font-extrabold text-white">
            {initials(profile.firstName, profile.lastName)}
          </span>
          <div className="min-w-0">
            <p className="font-display truncate text-lg font-extrabold text-fg">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate text-sm text-fg-muted">{profile.role}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 text-sm">
          <Row label="Service" value={profile.service} />
          <Row label="Établissement" value={hospital?.name ?? "—"} />
          <Row label="E-mail" value={profile.email} />
          <Row label="Téléphone" value={profile.phone} />
        </dl>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-soft"
      >
        <Toggle
          icon={<WifiOff className="size-5" />}
          title="Forcer le mode hors-ligne"
          description="Simule une perte de réseau pour tester la file d'attente locale."
          checked={forcedOffline}
          onChange={setForcedOffline}
        />
        <Toggle
          icon={<Bell className="size-5" />}
          title="Notifications CREX"
          description="Rappel avant chaque comité de retour d'expérience."
          checked={notifications}
          onChange={setNotifications}
        />
        <Toggle
          icon={<Moon className="size-5" />}
          title="Thème sombre"
          description="Confort de lecture en garde de nuit."
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
      >
        <h3 className="font-display text-base font-extrabold text-fg">
          Synchronisation
        </h3>
        <p className="mt-1.5 text-sm text-fg-muted">
          {pendingCount > 0
            ? `${pendingCount} fiche${pendingCount > 1 ? "s" : ""} en attente d'envoi.`
            : "Toutes vos fiches sont synchronisées."}
        </p>
        <Button
          variant="soft"
          size="md"
          className="mt-4 w-full"
          disabled={pendingCount === 0 || !isOnline}
          onClick={syncPending}
        >
          <CloudUpload className="size-4.5" />
          Synchroniser maintenant
        </Button>
        {pendingCount > 0 && !isOnline ? (
          <p className="mt-2 text-center text-xs font-semibold text-warn">
            Indisponible hors-ligne.
          </p>
        ) : null}
      </motion.section>

      <motion.section variants={fadeUp} className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={resetDemo}
        >
          <RotateCcw className="size-4.5" />
          Réinitialiser la démonstration
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-alert hover:bg-alert/10 hover:text-alert"
          onClick={() => router.push("/")}
        >
          <LogOut className="size-4.5" />
          Se déconnecter
        </Button>
      </motion.section>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-right font-semibold text-fg">{value}</dd>
    </div>
  );
}

function Toggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-hospital/10 text-hospital">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-fg">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-hospital" : "bg-fg/20",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white shadow",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  );
}
