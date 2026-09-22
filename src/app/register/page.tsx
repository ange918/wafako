import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Inscription soignant",
};

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated space="agent">
      <RegisterForm />
    </RedirectIfAuthenticated>
  );
}
