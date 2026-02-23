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
          const proposalsData = await apiCall(`/api/proposals/job/${contract._id}`);
          return [contract._id, proposalsData.data || []];
        })
      );

      setProposalsByContract(Object.fromEntries(results));
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
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
