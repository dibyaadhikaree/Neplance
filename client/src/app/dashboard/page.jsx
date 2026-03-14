import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/auth";

export default async function DashboardPage() {
  const { activeRole } = await requireSession();

  redirect(
    activeRole === "client"
      ? "/dashboard/client/post-job"
      : "/dashboard/freelancer/active-proposals",
  );
}
