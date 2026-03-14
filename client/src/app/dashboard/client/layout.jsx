import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/auth";

export default async function ClientDashboardLayout({ children }) {
  const { activeRole } = await requireSession();

  if (activeRole !== "client") {
    redirect("/dashboard/freelancer/active-proposals");
  }

  return children;
}
