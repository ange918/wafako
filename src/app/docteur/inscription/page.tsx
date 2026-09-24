import type { Metadata } from "next";
import { DoctorRegisterForm } from "@/components/auth/DoctorRegisterForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Inscription docteur",
};

export default function DoctorRegisterPage() {
  return (
    <RedirectIfAuthenticated space="docteur">
      <DoctorRegisterForm />
    </RedirectIfAuthenticated>
  );
}
