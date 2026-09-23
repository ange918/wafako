"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, FileText, Siren } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { backdrop } from "@/lib/motion";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * Cloche de notifications, présente dans les trois espaces.
 *
 * Un rassemblement convoqué par la cellule qualité notifie tous les
 * utilisateurs, quel que soit leur poste. Les rapports de classement, eux,
 * sont adressés à la direction et portent la mention correspondante.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { notifications, unreadCount, markNotificationsRead } = useAppState();
  const [open, setOpen] = useState(false);

  const openPanel = () => {
    setOpen(true);
    markNotificationsRead();
  };

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        className={cn(
          "relative grid size-10 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-colors hover:text-fg",
          className,
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="font-display absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-alert text-[10px] font-extrabold text-white"
          >
            {unreadCount}
          </motion.span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:justify-end sm:px-6">
            <motion.div
              variants={backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-label="Notifications"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="relative z-10 flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-lift"
            >
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-extrabold text-fg">
                  Notifications
                </h2>
              </div>

              {notifications.length === 0 ? (
                <p className="px-5 py-12 text-center text-sm text-fg-muted">
                  Aucune notification pour le moment.
                </p>
              ) : (
                <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
                  {notifications.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-5 py-4"
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl",
                          item.urgent
                            ? "bg-alert/12 text-alert"
                            : "bg-hospital/10 text-hospital",
                        )}
                      >
                        {item.urgent ? (
                          <Siren className="size-4.5" />
                        ) : item.audience === "direction" ? (
                          <FileText className="size-4.5" />
                        ) : (
                          <Bell className="size-4.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-fg">
                          {item.title}
                        </p>
                        {item.audience === "direction" ? (
                          <span className="mt-1 inline-block rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-on-ink uppercase">
                            Direction
                          </span>
                        ) : null}
                        <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
                          {item.body}
                        </p>
                        <p className="mt-1.5 text-[11px] text-fg-muted/80">
                          {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-fg-muted">
                Ces notifications ne circulent que dans ce navigateur : sans
                serveur, elles n&apos;atteignent pas les autres appareils.
              </p>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
