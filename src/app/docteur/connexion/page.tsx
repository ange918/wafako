import type { Metadata } from "next";
import { DoctorLoginForm } from "@/components/auth/DoctorLoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Connexion docteur",
};

export default function DoctorLoginPage() {
  return (
    <RedirectIfAuthenticated space="docteur">
      <DoctorLoginForm />
    </RedirectIfAuthenticated>
  );
}
