"use client";

import { useState } from "react";
import { apiCall } from "../../../lib/api";
import { getAuthToken } from "../../../lib/auth-cookies";
import { useFreelancerDashboard } from "../../../lib/useFreelancerDashboard";
import { EmptyState } from "../../dashboard/EmptyState";
import { Header, MobileMenu } from "../../dashboard/Header";
import { JobCard, ProposalCard } from "../../dashboard/JobCard";
import { ProposalModal } from "../../dashboard/ProposalModal";
import {
  AvailableIcon,
  OngoingIcon,
  ProposedIcon,
  TabNav,
} from "../../dashboard/TabNav";

export const FreelancerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const token = getAuthToken();
  const {
    availableJobs,
    proposedJobs,
    ongoingJobs,
    loading,
    error,
    EMPTY_STATES,
    refetch,
  } = useFreelancerDashboard(token);

  if (loading) {
    return (
      <div className="dashboard">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-[calc(100vh-65px)]">
          <div className="text-xl font-bold text-primary">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-[calc(100vh-65px)]">
          <div className="text-red-500 font-bold">{error}</div>
        </div>
      </div>
    );
  }

  const handleOpenProposalModal = (job) => {
    setSelectedJob(job);
  };

  const handleCloseProposalModal = () => {
    setSelectedJob(null);
  };

  const handleSubmitProposal = async (proposalData) => {
    setSubmitting(true);
    try {
      await apiCall("/proposals", token, {
        method: "POST",
        body: JSON.stringify(proposalData),
      });
      setSelectedJob(null);
      refetch?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (job) => {
    try {
      await apiCall(`/jobs/${job._id}/markCompleted`, token, {
        method: "PATCH",
      });
      refetch?.();
    } catch (err) {
      console.error("Failed to mark job complete:", err);
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
          onMarkComplete={handleMarkComplete}
        />
      ))
    ) : (
      <EmptyState {...getEmptyState()} />
    );

  const renderProposalCards = (proposals) =>
    proposals.length > 0 ? (
      proposals.map((proposal) => (
        <ProposalCard key={proposal._id} proposal={proposal} />
      ))
    ) : (
      <EmptyState {...getEmptyState()} />
    );

  const getEmptyState = () => {
    switch (activeTab) {
      case "available":
        return EMPTY_STATES.available;
      case "proposed":
        return EMPTY_STATES.proposed;
      case "ongoing":
        return EMPTY_STATES.ongoing;
      default:
        return {};
    }
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />

      {/* Mobile Menu - Only visible on mobile */}
      <div className="mobile-menu-container">
        <MobileMenu activeTab={activeTab} onTabChange={setActiveTab} />
        <span className="mobile-menu-label">
          {activeTab === "available" ? (
            <AvailableIcon />
          ) : activeTab === "proposed" ? (
            <ProposedIcon />
          ) : (
            <OngoingIcon />
          )}
          {activeTab === "available"
            ? "Available Jobs"
            : activeTab === "proposed"
              ? "Proposed"
              : "Ongoing"}
        </span>
      </div>

      <main className="dashboard-split">
        {/* Left Panel - Available Jobs */}
        <section className="panel panel-left">
          <div className="panel-header">
            <svg
              className="panel-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h2 className="panel-title">Available Jobs</h2>
          </div>
          <div className="panel-content">
            {renderJobCards(availableJobs, "find")}
          </div>
        </section>

        {/* Right Panel - Proposed & Ongoing (hidden on mobile) */}
        <section className="panel panel-right">
          <TabNav
            activeTab={activeTab === "available" ? "proposed" : activeTab}
            onTabChange={setActiveTab}
          />
          <div className="panel-content">
            {(activeTab === "proposed" || activeTab === "available") &&
              renderProposalCards(proposedJobs)}
            {activeTab === "ongoing" && renderJobCards(ongoingJobs, "current")}
          </div>
        </section>
      </main>

      {/* Mobile Content - Only visible on mobile */}
      <div className="mobile-content">
        {activeTab === "available" && renderJobCards(availableJobs, "find")}
        {activeTab === "proposed" && renderProposalCards(proposedJobs)}
        {activeTab === "ongoing" && renderJobCards(ongoingJobs, "current")}
      </div>

      {/* Proposal Modal */}
      {selectedJob && (
        <ProposalModal
          job={selectedJob}
          onSubmit={handleSubmitProposal}
          onClose={handleCloseProposalModal}
          loading={submitting}
        />
      )}
    </div>
  );
};
