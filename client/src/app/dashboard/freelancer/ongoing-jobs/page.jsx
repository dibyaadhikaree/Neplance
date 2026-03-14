import { FreelancerOngoingJobsSection } from "@/features/dashboard/sections/FreelancerOngoingJobsSection";
import { requireSession } from "@/lib/server/auth";
import { getFreelancerOngoingJobsServer } from "@/lib/server/dashboard";

export default async function FreelancerOngoingJobsPage() {
  const { user } = await requireSession();
  const ongoingJobs = await getFreelancerOngoingJobsServer();

  return (
    <FreelancerOngoingJobsSection
      initialJobs={ongoingJobs}
      initialUser={user}
    />
  );
}
