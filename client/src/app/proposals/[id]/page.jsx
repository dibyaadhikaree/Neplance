import { notFound } from "next/navigation";
import { ProposalDetailPageClient } from "@/features/proposals/components/ProposalDetailPageClient";
import { requireSession } from "@/lib/server/auth";
import { getProposalByIdServer } from "@/lib/server/proposals";

export default async function ProposalDetailPage({ params }) {
  const { user } = await requireSession();
  const { id } = await params;
  const proposal = await getProposalByIdServer(id);

  if (!proposal) {
    notFound();
  }

  return (
    <ProposalDetailPageClient initialProposal={proposal} initialUser={user} />
  );
}
