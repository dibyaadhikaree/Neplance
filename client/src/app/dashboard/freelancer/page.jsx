import { redirect } from "next/navigation";

export default function FreelancerDashboardIndexPage() {
  redirect("/dashboard/freelancer/active-proposals");
}
