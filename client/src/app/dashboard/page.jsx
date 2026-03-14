import { ClientDashboard } from "@/features/dashboard/screens/ClientDashboard";
import { FreelancerDashboard } from "@/features/dashboard/screens/FreelancerDashboard";
import { requireSession } from "@/lib/server/auth";
import {
  getClientDashboardDataServer,
  getFreelancerDashboardDataServer,
} from "@/lib/server/dashboard";

export default async function DashboardPage() {
  const { activeRole, user } = await requireSession();

  if (activeRole === "client") {
    const { contracts, proposalsByContract } =
      await getClientDashboardDataServer();

    return (
      <ClientDashboard
        initialContracts={contracts}
        initialProposalsByContract={proposalsByContract}
        initialUser={user}
      />
    );
  }

  const { ongoingJobs, proposedJobs } =
    await getFreelancerDashboardDataServer();

  return (
    <FreelancerDashboard
      initialOngoingJobs={ongoingJobs}
      initialProposedJobs={proposedJobs}
      initialUser={user}
    />
  );
}
