import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Portail administrateur",
};

export default function AdminLoginPage() {
  return (
    <RedirectIfAuthenticated space="admin">
      <LoginForm variant="admin" />
    </RedirectIfAuthenticated>
  );
}
