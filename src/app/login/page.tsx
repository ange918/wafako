import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated space="agent">
      <LoginForm />
    </RedirectIfAuthenticated>
  );
}
