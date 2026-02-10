"use client";

import { useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { JobCard, ProposalCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { useFreelancerDashboard } from "@/features/dashboard/hooks/useFreelancerDashboard";
import { apiCall } from "@/services/api";

export const FreelancerDashboard = ({ user, onRoleSwitch, onLogout }) => {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [submitting, setSubmitting] = useState(false);

  const {
    availableJobs,
    proposedJobs,
    ongoingJobs,
    loading,
    error,
    EMPTY_STATES,
    refetch,
  } = useFreelancerDashboard();

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
        <div className="dashboard">
          <div className="dashboard-content" style={{ textAlign: "center", padding: "var(--space-16)" }}>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
              Loading...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
        <div className="dashboard">
          <div className="dashboard-content" style={{ textAlign: "center", padding: "var(--space-16)" }}>
            <div style={{ color: "var(--color-error)", fontWeight: "var(--font-weight-semibold)" }}>{error}</div>
          </div>
        </div>
      </>
    );
  }

  const handleOpenProposalModal = (job) => {
    setModalMode("proposal");
    setSelectedJob(job);
  };

  const handleViewJobDetails = (job) => {
    setModalMode("view");
    setSelectedJob(job);
  };

  const handleCloseModal = () => setSelectedJob(null);

  const handleSubmitProposal = async (proposalData) => {
    setSubmitting(true);
    try {
      await apiCall("/proposals", {
        method: "POST",
        body: JSON.stringify(proposalData),
      });
      setSelectedJob(null);
      refetch?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMilestone = async (jobId, milestoneIndex, evidence) => {
    try {
      await apiCall(`/jobs/${jobId}/milestones/${milestoneIndex}/submit`, {
        method: "PATCH",
        body: JSON.stringify({ evidence }),
      });
      refetch?.();
    } catch (err) {
      console.error("Failed to submit milestone:", err);
    }
  };

  const getEmptyState = () => {
    switch (activeTab) {
      case "available": return EMPTY_STATES.available;
      case "proposed": return EMPTY_STATES.proposed;
      case "ongoing": return EMPTY_STATES.ongoing;
      default: return {};
    }
  };

  const renderJobCards = (jobs, variant = "find") =>
    jobs.length > 0 ? (
      jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          variant={variant}
          onSubmitProposal={handleOpenProposalModal}
          onViewDetails={handleViewJobDetails}
        />
      ))
    ) : (
      <EmptyState {...getEmptyState()} />
    );

  const renderProposalCards = (proposals) =>
    proposals.length > 0 ? (
      proposals.map((proposal) => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          onViewDetails={handleViewJobDetails}
        />
      ))
    ) : (
      <EmptyState {...getEmptyState()} />
    );

  const tabs = [
    { key: "available", label: "Find Work" },
    { key: "proposed", label: "My Proposals" },
    { key: "ongoing", label: "Active Contracts" },
  ];

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />

      <div className="dashboard">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2 className="dashboard-title">My Jobs</h2>
            <p className="dashboard-subtitle">Find work and manage your proposals</p>
          </div>

          <nav className="tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="cards-list">
            {activeTab === "available" && renderJobCards(availableJobs, "find")}
            {activeTab === "proposed" && renderProposalCards(proposedJobs)}
            {activeTab === "ongoing" && renderJobCards(ongoingJobs, "current")}
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          mode={modalMode}
          onSubmit={handleSubmitProposal}
          onSubmitMilestone={handleSubmitMilestone}
          onClose={handleCloseModal}
          loading={submitting}
          userRole={user?.role?.[0]}
        />
      )}
    </>
  );
};


