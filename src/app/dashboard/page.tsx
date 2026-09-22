import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RequireAuth } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Espace soignant",
};

export default function DashboardPage() {
  return (
    <RequireAuth space="agent">
      <DashboardShell />
    </RequireAuth>
  );
}
