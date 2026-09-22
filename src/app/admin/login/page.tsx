import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Portail administrateur",
};

export default function AdminLoginPage() {
  return <LoginForm variant="admin" />;
}
