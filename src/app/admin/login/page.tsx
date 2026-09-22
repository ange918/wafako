import { redirect } from "next/navigation";

/** Conservée pour ne pas casser les liens existants vers l'ancien portail. */
export default function AdminLoginPage() {
  redirect("/admin/dashboard");
}
