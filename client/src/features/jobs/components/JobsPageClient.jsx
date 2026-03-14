"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import {
  approveMilestoneAction,
  submitMilestoneAction,
} from "@/lib/actions/jobs";
import { createProposalMutationAction } from "@/lib/actions/proposals";
import { listOpenJobs } from "@/lib/client/jobs";
import { Navbar } from "@/shared/components/Navbar";
import {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
} from "@/shared/constants/jobCategories";

export function JobsPageClient({ initialUser }) {
  const user = initialUser;
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    category: "",
    jobType: "",
    experienceLevel: "",
    search: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmittingProposal, startProposalTransition] = useTransition();
  const [isSubmittingMilestone, startMilestoneSubmitTransition] =
    useTransition();
  const [isApprovingMilestone, startMilestoneApproveTransition] =
    useTransition();
  const router = useRouter();

  const fetchJobs = useCallback(async (params = "") => {
    setLoading(true);
    try {
      const response = await listOpenJobs(params);
      if (response.status === "success") {
        setJobs(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenProposalModal = (job) => {
    if (!user) {
      router.push("/");
      return;
    }
    setModalMode("proposal");
    setSelectedJob(job);
  };

  const handleViewJobDetails = (job) => {
    setModalMode("view");
    setSelectedJob(job);
  };

  const handleCloseModal = () => setSelectedJob(null);

  const handleSubmitProposal = async (proposalData) => {
    startProposalTransition(async () => {
      await createProposalMutationAction(proposalData);
      setSelectedJob(null);
    });
  };

  const handleSubmitMilestone = async (jobId, index, evidence) => {
    startMilestoneSubmitTransition(async () => {
      const updatedJob = await submitMilestoneAction(jobId, index, evidence);
      setSelectedJob(updatedJob);
    });
  };

  const handleApproveMilestone = async (jobId, index) => {
    startMilestoneApproveTransition(async () => {
      const updatedJob = await approveMilestoneAction(jobId, index);
      setSelectedJob(updatedJob);
    });
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.category) {
      params.append("category", searchFilters.category);
    }
    if (searchFilters.jobType) {
      params.append("jobType", searchFilters.jobType);
    }
    if (searchFilters.experienceLevel) {
      params.append("experienceLevel", searchFilters.experienceLevel);
    }
    if (searchFilters.search) {
      params.append("search", searchFilters.search);
    }

    setIsSearching(true);
    fetchJobs(params.toString()).finally(() => setIsSearching(false));
  };

  const clearFilters = () => {
    setSearchFilters({
      category: "",
      jobType: "",
      experienceLevel: "",
      search: "",
    });
    fetchJobs();
  };

  return (
    <>
      <Navbar user={user} />

      <div className="dashboard">
        <section
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid var(--color-border-light)",
            padding: "var(--space-12) 0",
          }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "var(--text-5xl)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-4)",
              }}
            >
              Find Your Next{" "}
              <span style={{ color: "var(--color-primary)" }}>Opportunity</span>
            </h1>
            <p
              className="text-light"
              style={{
                fontSize: "var(--text-xl)",
                maxWidth: "700px",
                margin: "0 auto var(--space-8)",
              }}
            >
              Browse thousands of projects and connect with clients looking for
              your skills
            </p>

            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchFilters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--text-base)",
                    }}
                  />
                </div>
                <div style={{ flex: "1 1 180px", minWidth: "180px" }}>
                  <select
                    value={searchFilters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--text-base)",
                    }}
                  >
                    <option value="">All Categories</option>
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                  <select
                    value={searchFilters.jobType}
                    onChange={(e) =>
                      handleFilterChange("jobType", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--text-base)",
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                  <select
                    value={searchFilters.experienceLevel}
                    onChange={(e) =>
                      handleFilterChange("experienceLevel", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      fontSize: "var(--text-base)",
                    }}
                  >
                    <option value="">All Levels</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={clearFilters}
                  disabled={isSearching}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="container section-sm">
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-16)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-primary)",
                }}
              >
                Loading jobs...
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="cards-list">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  variant="find"
                  onSubmitProposal={handleOpenProposalModal}
                  onViewDetails={handleViewJobDetails}
                />
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "var(--space-8)",
              }}
            >
              <h3 style={{ marginBottom: "var(--space-3)" }}>No jobs found</h3>
              <p className="text-light">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          mode={modalMode}
          onSubmit={handleSubmitProposal}
          onSubmitMilestone={handleSubmitMilestone}
          onApproveMilestone={handleApproveMilestone}
          onClose={handleCloseModal}
          loading={
            isSubmittingProposal ||
            isSubmittingMilestone ||
            isApprovingMilestone
          }
          userRole={user?.role?.[0]}
          currentUser={user}
        />
      )}
    </>
  );
}
