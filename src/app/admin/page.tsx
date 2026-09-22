import { redirect } from "next/navigation";

/**
 * Le tableau de bord porte lui-même le garde par mot de passe : toutes les
 * entrées de l'espace admin y mènent directement.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
