import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { requireSession } from "@/lib/server/auth";

export default async function DashboardLayout({ children }) {
  const { activeRole, user } = await requireSession();

  return (
    <DashboardShell activeRole={activeRole} user={user}>
      {children}
    </DashboardShell>
  );
}
