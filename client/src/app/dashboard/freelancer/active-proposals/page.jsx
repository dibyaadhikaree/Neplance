import { FreelancerProposalsSection } from "@/features/dashboard/sections/FreelancerProposalsSection";
import { getFreelancerActiveProposalsServer } from "@/lib/server/dashboard";

export default async function FreelancerActiveProposalsPage() {
  const proposals = await getFreelancerActiveProposalsServer();

  return <FreelancerProposalsSection initialProposals={proposals} />;
}
