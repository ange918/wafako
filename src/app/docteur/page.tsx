import type { Metadata } from "next";
import { DoctorShell } from "@/components/doctor/DoctorShell";
import { RequireAuth } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Espace docteur",
};

export default function DoctorPage() {
  return (
    <RequireAuth space="docteur">
      <DoctorShell />
    </RequireAuth>
  );
}
