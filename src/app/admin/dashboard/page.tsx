import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { RequireAuth } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Cockpit Direction",
};

export default function AdminDashboardPage() {
  return (
    <RequireAuth space="admin">
      <AdminShell />
    </RequireAuth>
  );
}
