import { ClientProposalsSection } from "@/features/dashboard/sections/ClientProposalsSection";
import { getClientProposalsByContractServer } from "@/lib/server/dashboard";

export default async function ClientProposalsPage() {
  const { contracts, proposalsByContract } =
    await getClientProposalsByContractServer();

  return (
    <ClientProposalsSection
      initialContracts={contracts}
      initialProposalsByContract={proposalsByContract}
    />
  );
}
