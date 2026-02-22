import { useCallback, useEffect, useState } from "react";
import { apiCall } from "@/services/api";

export const useClientDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [proposalsByContract, setProposalsByContract] = useState({});
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      const jobsData = await apiCall("/api/jobs/myJobs");
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
          try {
            const proposalsData = await apiCall(
              `/api/proposals/job/${contract._id}`,
            );
            if (proposalsData.status === "success") {
              const pendingOnly = (proposalsData.data || []).filter(
                (proposal) => proposal.status === "pending",
              );
              return [contract._id, pendingOnly];
            }
          } catch (err) {
            console.error("Failed to fetch proposals:", err);
          }
          return [contract._id, []];
        }),
      );

      setProposalsByContract(Object.fromEntries(results));
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

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
