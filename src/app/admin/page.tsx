import { redirect } from "next/navigation";

/** Le lien discret du pied de page mène au portail de connexion admin. */
export default function AdminIndexPage() {
  redirect("/admin/login");
}
