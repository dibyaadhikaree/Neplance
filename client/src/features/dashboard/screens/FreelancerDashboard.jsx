"use client";

import { useState } from "react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { JobCard, ProposalCard } from "@/features/dashboard/components/JobCard";
import { useFreelancerDashboard } from "@/features/dashboard/hooks/useFreelancerDashboard";
import { apiCall } from "@/services/api";
import { Navbar } from "@/shared/navigation/Navbar";

export const FreelancerDashboard = ({ user, onRoleSwitch, onLogout }) => {
  const [activeTab, setActiveTab] = useState("proposals");

  const { proposedJobs, ongoingJobs, loading, error, EMPTY_STATES, refetch } =
    useFreelancerDashboard();

  const handleWithdrawProposal = async (proposal) => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;

    try {
      await apiCall(`/api/proposals/${proposal._id}/withdraw`, {
        method: "PATCH",
      });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to withdraw proposal");
    }
  };

  const handleRequestCancellation = async (job, reason) => {
    await apiCall(`/api/jobs/${job._id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason: reason?.trim() || undefined }),
    });
    refetch();
  };

  const handleRespondCancellation = async (job, action) => {
    await apiCall(`/api/jobs/${job._id}/cancel/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    refetch();
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
        <div className="dashboard">
          <div
            className="dashboard-content"
            style={{ textAlign: "center", padding: "var(--space-16)" }}
          >
            <div
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-primary)",
              }}
            >
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
          <div
            className="dashboard-content"
            style={{ textAlign: "center", padding: "var(--space-16)" }}
          >
            <div
              style={{
                color: "var(--color-error)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {error}
            </div>
          </div>
        </div>
      </>
    );
  }

  const getEmptyState = () => {
    switch (activeTab) {
      case "proposals":
        return EMPTY_STATES.proposed;
      case "ongoing":
        return EMPTY_STATES.ongoing;
      default:
        return {};
    }
  };

  const renderJobCards = (jobs, variant = "current") =>
    jobs.length > 0 ? (
      jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          variant={variant}
          currentUser={user}
          onRequestCancellation={handleRequestCancellation}
          onRespondCancellation={handleRespondCancellation}
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
          onWithdraw={handleWithdrawProposal}
        />
      ))
    ) : (
      <EmptyState {...getEmptyState()} />
    );

  const tabs = [
    { key: "proposals", label: "My Proposals" },
    { key: "ongoing", label: "Active Contracts" },
  ];

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />

      <div className="dashboard">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Freelancer Dashboard</h2>
            <p className="dashboard-subtitle">
              Manage your proposals and active contracts
            </p>
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
            {activeTab === "proposals" && renderProposalCards(proposedJobs)}
            {activeTab === "ongoing" && renderJobCards(ongoingJobs, "current")}
          </div>
        </div>
      </div>
    </>
  );
};
