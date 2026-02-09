/**
 * Custom hook for freelancer dashboard data fetching
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { apiCall } from "@/services/api";

const EMPTY_STATES = {
  available: {
    title: "No Contracts Available",
    description: "Check back later for new opportunities.",
  },
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
  const [availableJobs, setAvailableJobs] = useState([]);
  const [proposedJobs, setProposedJobs] = useState([]);
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFunctionRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch available contracts
      const jobsData = await apiCall("/jobs");
      if (jobsData.status === "success") {
        setAvailableJobs(jobsData.data.filter((job) => job.status === "DRAFT"));
      }

      // Fetch my proposals
      const proposalsData = await apiCall("/proposals/myProposals");
      if (proposalsData.status === "success") {
        const proposals = proposalsData.data;

        // Filter pending proposals
        setProposedJobs(proposals.filter((p) => p.status === "pending"));

        // Filter and map accepted proposals (ongoing contracts)
        const ongoing = proposals
          .filter(
            (p) =>
              p.status === "accepted" &&
              p.job &&
              p.job.status === "ACTIVE",
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

  // Store the fetch function in a ref so refetch can call it
  useEffect(() => {
    fetchFunctionRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchFunctionRef.current?.();
  }, []);

  return {
    availableJobs,
    proposedJobs,
    ongoingJobs,
    loading,
    error,
    EMPTY_STATES,
    refetch,
  };
}
