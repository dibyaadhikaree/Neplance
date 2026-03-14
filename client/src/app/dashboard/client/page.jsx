import { redirect } from "next/navigation";

export default function ClientDashboardIndexPage() {
  redirect("/dashboard/client/post-job");
}
