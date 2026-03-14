import { useCallback, useState } from "react";
import { getMyJobs } from "@/lib/client/jobs";
import { getJobProposals } from "@/lib/client/proposals";

export const useClientDashboard = (
  initialContracts = [],
  initialProposalsByContract = {},
) => {
  const [contracts, setContracts] = useState(initialContracts);
  const [proposalsByContract, setProposalsByContract] = useState(
    initialProposalsByContract,
  );
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      const jobsData = await getMyJobs();
      if (jobsData.status === "success") {
        setContracts(jobsData.data);
      }
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  const fetchProposalsForContracts = useCallback(async (contractList) => {
    if (!contractList.length) {
      setProposalsByContract({});
      return;
    }

    setLoadingProposals(true);

    try {
      const results = await Promise.all(
        contractList.map(async (contract) => {
          const proposalsData = await getJobProposals(contract._id);
          return [contract._id, proposalsData.data || []];
        }),
      );

      setProposalsByContract(Object.fromEntries(results));
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  const resetProposals = useCallback(() => {
    setProposalsByContract({});
  }, []);

  return {
    contracts,
    proposalsByContract,
    loadingContracts,
    loadingProposals,
    fetchContracts,
    fetchProposalsForContracts,
    resetProposals,
  };
};
