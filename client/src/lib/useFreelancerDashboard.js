/**
 * Custom hook for freelancer dashboard data fetching
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { apiCall } from "./api";

const EMPTY_STATES = {
  available: {
    title: "No Jobs Available",
    description: "Check back later for new opportunities.",
  },
  proposed: {
    title: "No Proposals",
    description: "Submit proposals on available jobs to see them here.",
  },
  ongoing: {
    title: "No Ongoing Jobs",
    description: "Jobs you're currently working on will appear here.",
  },
};

export function useFreelancerDashboard(token) {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [proposedJobs, setProposedJobs] = useState([]);
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFunctionRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setError("Authentication token required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch available jobs
      const jobsData = await apiCall("/jobs", token);
      if (jobsData.status === "success") {
        setAvailableJobs(jobsData.data.filter((job) => job.status === "open"));
      }

      // Fetch my proposals
      const proposalsData = await apiCall("/proposals/myProposals", token);
      if (proposalsData.status === "success") {
        const proposals = proposalsData.data;

        // Filter pending proposals
        setProposedJobs(proposals.filter((p) => p.status === "pending"));

        // Filter and map accepted proposals (ongoing jobs) - exclude completed jobs
        const ongoing = proposals
          .filter(
            (p) =>
              p.status === "accepted" &&
              p.job &&
              p.job.status === "in-progress",
          )
          .map((p) => ({
            ...p.job,
            client: p.job.client,
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
  }, [token]);

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
