import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/auth";

export default async function FreelancerDashboardLayout({ children }) {
  const { activeRole } = await requireSession();

  if (activeRole !== "freelancer") {
    redirect("/dashboard/client/post-job");
  }

  return children;
}
