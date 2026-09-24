"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ActionList } from "@/components/actions/ActionList";
import { useAppState } from "@/components/providers/AppStateProvider";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Actions correctives du soignant connecté.
 *
 * Seules celles que la direction lui a nominativement attribuées s'affichent :
 * le rattachement se fait par l'identifiant d'annuaire créé à l'inscription.
 */
export function ActionsTab() {
  const { actions, profile } = useAppState();

  const mine = useMemo(
    () =>
      actions.filter((action) =>
        profile.personId
          ? (action.assigneeIds ?? []).includes(profile.personId)
          : false,
      ),
    [actions, profile.personId],
  );

  return (
    <motion.div
      variants={stagger(0, 0.06)}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-display px-1 text-xl font-extrabold text-fg">
          Mes actions
        </h2>
        <p className="mt-1 px-1 text-sm text-fg-muted">
          Les actions correctives qui vous sont attribuées. Touchez un état pour
          le mettre à jour.
        </p>
      </motion.div>

      <ActionList
        actions={mine}
        emptyLabel="Aucune action ne vous est attribuée"
      />
    </motion.div>
  );
}
