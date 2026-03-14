/**
 * Custom hook for freelancer dashboard data fetching
 */

import { useCallback, useState } from "react";
import { getMyProposals } from "@/lib/client/proposals";
import { JOB_STATUS, PROPOSAL_STATUS } from "@/shared/constants/statuses";

const EMPTY_STATES = {
  proposed: {
    title: "No Proposals",
    description: "Submit proposals on available contracts to see them here.",
  },
  ongoing: {
    title: "No Ongoing Contracts",
    description: "Contracts you're currently working on will appear here.",
  },
};

export function useFreelancerDashboard({
  initialProposedJobs = [],
  initialOngoingJobs = [],
} = {}) {
  const [proposedJobs, setProposedJobs] = useState(initialProposedJobs);
  const [ongoingJobs, setOngoingJobs] = useState(initialOngoingJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const proposalsData = await getMyProposals();
      if (proposalsData.status === "success") {
        const proposals = proposalsData.data;

        setProposedJobs(
          proposals.filter((p) =>
            [PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.REJECTED].includes(
              p.status,
            ),
          ),
        );

        const ongoing = proposals
          .filter(
            (p) =>
              p.status === PROPOSAL_STATUS.ACCEPTED &&
              p.job &&
              p.job.status === JOB_STATUS.IN_PROGRESS,
          )
          .map((p) => ({
            ...p.job,
            status: p.job.status,
          }));

        setOngoingJobs(ongoing);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    proposedJobs,
    ongoingJobs,
    loading,
    error,
    EMPTY_STATES,
    refetch: fetchDashboardData,
  };
}
