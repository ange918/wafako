import type { Metadata } from "next";
import { QualityShell } from "@/components/quality/QualityShell";
import { RequireAuth } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Cellule qualité",
};

export default function QualityPage() {
  return (
    <RequireAuth space="quality">
      <QualityShell />
    </RequireAuth>
  );
}
