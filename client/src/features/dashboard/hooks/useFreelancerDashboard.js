/**
 * Custom hook for freelancer dashboard data fetching
 */

import { useCallback, useEffect, useState } from "react";
import { apiCall } from "@/services/api";

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

export function useFreelancerDashboard() {
  const [proposedJobs, setProposedJobs] = useState([]);
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const proposalsData = await apiCall("/api/proposals/myProposals");
      if (proposalsData.status === "success") {
        const proposals = proposalsData.data;

        setProposedJobs(proposals.filter((p) => p.status === "pending"));

        const ongoing = proposals
          .filter(
            (p) =>
              p.status === "accepted" &&
              p.job &&
              p.job.status === "IN_PROGRESS",
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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    proposedJobs,
    ongoingJobs,
    loading,
    error,
    EMPTY_STATES,
    refetch: fetchDashboardData,
  };
}
