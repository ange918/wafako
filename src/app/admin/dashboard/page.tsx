import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Cockpit Direction",
};

export default function AdminDashboardPage() {
  return <AdminShell />;
}
