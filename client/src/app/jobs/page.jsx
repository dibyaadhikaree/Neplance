import { JobsPageClient } from "@/features/jobs/components/JobsPageClient";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function JobsPage() {
  const user = await requireCurrentUser();

  return <JobsPageClient initialUser={user} />;
}
