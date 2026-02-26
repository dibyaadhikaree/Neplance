import { useCallback, useEffect, useState } from "react";
import { apiCall } from "@/services/api";
import { JOB_STATUS, PROPOSAL_STATUS } from "@/shared/constants/statuses";

export const useProfileData = ({ user, currentRole }) => {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const isFreelancer = (currentRole || user.role?.[0]) === "freelancer";
      let completed = [];

      if (isFreelancer) {
        const proposalsData = await apiCall("/api/proposals/myProposals");
        if (proposalsData.status === "success") {
          completed = proposalsData.data
            .filter(
              (p) =>
                p.status === PROPOSAL_STATUS.ACCEPTED &&
                p.job &&
                p.job.status === JOB_STATUS.COMPLETED,
            )
            .map((p) => ({ ...p.job, status: p.job.status, review: null }));
        }
      } else {
        const jobsData = await apiCall("/api/jobs/myJobs");
        if (jobsData.status === "success") {
          completed = jobsData.data
            .filter((job) => job.status === JOB_STATUS.COMPLETED)
            .map((job) => ({ ...job, review: null }));
        }
      }
      setCompletedJobs(completed);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, currentRole]);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user, fetchProfileData]);

  return {
    completedJobs,
    loading,
    refresh: fetchProfileData,
  };
};
