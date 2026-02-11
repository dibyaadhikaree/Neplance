"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { apiCall } from "@/services/api";
import { Input } from "@/shared/ui/UI";
import { useClientDashboard } from "@/features/dashboard/hooks/useClientDashboard";

export const ClientDashboard = ({ user, onLogout, onRoleSwitch }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    milestones: [{ title: "", description: "", value: "", dueDate: "" }],
  });

  const {
    contracts,
    proposalsByContract,
    loadingContracts,
    loadingProposals,
    fetchContracts,
    fetchProposalsForContracts,
    resetProposals,
  } = useClientDashboard();

  const formatDateValue = (value) => {
    if (!value) return null;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  useEffect(() => {
    if (activeTab !== "proposals") return;
    if (contracts.length === 0) {
      resetProposals();
      return;
    }
    fetchProposalsForContracts(contracts);
  }, [activeTab, contracts, fetchProposalsForContracts, resetProposals]);

  const handleViewDetails = (job) => setSelectedJob(job);
  const handleCloseModal = () => setSelectedJob(null);

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiCall(`/proposals/${proposalId}/accept`, { method: "PATCH" });
      await fetchContracts();
      if (activeTab === "proposals") {
        await fetchProposalsForContracts(contracts);
      }
    } catch (err) {
      console.error("Failed to accept proposal:", err);
    }
  };

  const handleApproveMilestone = async (jobId, milestoneIndex) => {
    try {
      await apiCall(`/jobs/${jobId}/milestones/${milestoneIndex}/approve`, {
        method: "PATCH",
      });
      await fetchContracts();
    } catch (err) {
      console.error("Failed to approve milestone:", err);
    }
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleMilestoneChange = (index, field, value) => {
    setFormState((prev) => {
      const updated = [...prev.milestones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, milestones: updated };
    });
  };

  const addMilestone = () => {
    setFormState((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: "", description: "", value: "", dueDate: "" },
      ],
    }));
  };

  const removeMilestone = (index) => {
    setFormState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, idx) => idx !== index),
    }));
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();

    const errors = [];
    const validationErrors = {};

    if (!formState.title.trim()) {
      errors.push("Contract title is required.");
    }

    formState.milestones.forEach((milestone, index) => {
      const entryErrors = [];
      if (!milestone.title.trim()) entryErrors.push("Title is required.");
      if (!milestone.value || Number(milestone.value) <= 0)
        entryErrors.push("Value must be greater than 0.");
      if (entryErrors.length > 0) validationErrors[index] = entryErrors;
    });

    const validMilestones = formState.milestones.filter((m) => m.title.trim());
    if (validMilestones.length === 0) {
      errors.push("Add at least one milestone with a title and value.");
    }

    setFormErrors(errors);
    setMilestoneErrors(validationErrors);
    if (errors.length > 0 || Object.keys(validationErrors).length > 0) return;

    const milestones = validMilestones.map((m) => ({
      title: m.title.trim(),
      description: m.description.trim(),
      value: Number(m.value) || 0,
      dueDate: formatDateValue(m.dueDate),
    }));

    setSubmitting(true);
    try {
      setFormErrors([]);
      await apiCall("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: formState.title.trim(),
          description: formState.description.trim(),
          milestones,
        }),
      });
      setFormState({
        title: "",
        description: "",
        milestones: [{ title: "", description: "", value: "", dueDate: "" }],
      });
      await fetchContracts();
      setActiveTab("contracts");
    } catch (err) {
      console.error("Failed to create contract:", err);
      setFormErrors([
        err?.message || "Failed to create contract. Please try again.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const ProposalItem = ({ proposal }) => {
    const freelancerLabel =
      proposal.freelancer?.name ||
      proposal.freelancer?.email ||
      "Unknown Freelancer";
    const freelancerEmail = proposal.freelancer?.email;
    const contractTitle =
      proposal.job?.title || proposal._contract?.title || "Untitled Contract";
    const contractDescription =
      proposal.job?.description || proposal._contract?.description || "";

    return (
      <article className="job-card">
        <div className="job-card-header">
          <div className="job-card-avatar">
            {freelancerLabel.charAt(0).toUpperCase()}
          </div>
          <div className="job-card-meta">
            <span className="job-card-client">{freelancerLabel}</span>
          </div>
          <span
            className={`status-badge status-${proposal.status?.toLowerCase()}`}
          >
            {proposal.status || "Unknown"}
          </span>
        </div>
        <div className="job-card-content">
          <h3 className="job-card-title">{contractTitle}</h3>
          {contractDescription && (
            <p className="job-card-description">
              {contractDescription.length > 160
                ? `${contractDescription.slice(0, 160)}...`
                : contractDescription}
            </p>
          )}
          <p className="job-card-description">
            {freelancerEmail
              ? `Email: ${freelancerEmail}`
              : "Email not shared"}
          </p>
          <p className="job-card-description">
            Amount: NPR {proposal.amount?.toLocaleString() || "N/A"}
          </p>
        </div>
        <div className="job-card-footer">
          <div className="job-card-budget-wrapper">
            <span className="job-card-budget-label">Status</span>
            <span className="job-card-budget">
              {proposal.status || "Unknown"}
            </span>
          </div>
          {proposal.status === "pending" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleAcceptProposal(proposal._id)}
            >
              Accept Proposal
            </button>
          )}
        </div>
      </article>
    );
  };

  const contractsWithProposals = contracts.filter(
    (contract) => (proposalsByContract[contract._id] || []).length > 0,
  );
  const pendingProposals = contracts.flatMap((contract) =>
    (proposalsByContract[contract._id] || []).map((proposal) => ({
      ...proposal,
      _contract: contract,
    })),
  );

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />

      <div className="dashboard">
        <div className="dashboard-content">
          {/* Header row */}
          <div className="dashboard-header">
            <div className="dashboard-header-row">
              <div>
                <h2 className="dashboard-title">Client Dashboard</h2>
                <p className="dashboard-subtitle">
                  Manage your contracts and proposals
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="tab-nav">
            <button
              type="button"
              className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              Create Contract
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "contracts" ? "active" : ""}`}
              onClick={() => setActiveTab("contracts")}
            >
              My Contracts
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "proposals" ? "active" : ""}`}
              onClick={() => setActiveTab("proposals")}
            >
              Proposals
            </button>
          </nav>

          {/* Create Contract tab */}
          {activeTab === "create" && (
            <form className="card" onSubmit={handleCreateContract}>
              {formErrors.length > 0 && (
                <div className="card-error" style={{ marginBottom: "var(--space-4)" }}>
                  {formErrors.map((error) => (
                    <p key={error} style={{ margin: 0 }}>{error}</p>
                  ))}
                </div>
              )}
              <Input
                label="Contract Title"
                value={formState.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="e.g. Landing page redesign"
                required
                disabled={submitting}
              />
              <Input
                label="Description"
                value={formState.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Describe the work scope"
                disabled={submitting}
              />

              <div style={{ marginTop: "var(--space-4)" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  <strong>Milestones</strong>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={addMilestone}
                  >
                    + Add milestone
                  </button>
                </div>

                {formState.milestones.map((milestone, index) => (
                  <div key={`milestone-${index}`} className="card-sm">
                    {milestoneErrors[index] && (
                      <div className="card-error" style={{ marginBottom: "var(--space-3)" }}>
                        {milestoneErrors[index].map((error) => (
                          <p key={`${index}-${error}`} style={{ margin: 0 }}>{error}</p>
                        ))}
                      </div>
                    )}
                    <Input
                      label="Title"
                      value={milestone.title}
                      onChange={(e) =>
                        handleMilestoneChange(index, "title", e.target.value)
                      }
                      disabled={submitting}
                    />
                    <Input
                      label="Description"
                      value={milestone.description}
                      onChange={(e) =>
                        handleMilestoneChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      disabled={submitting}
                    />
                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                      <Input
                        label="Value (NPR)"
                        type="number"
                        value={milestone.value}
                        onChange={(e) =>
                          handleMilestoneChange(index, "value", e.target.value)
                        }
                        disabled={submitting}
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) =>
                          handleMilestoneChange(
                            index,
                            "dueDate",
                            e.target.value,
                          )
                        }
                        disabled={submitting}
                      />
                    </div>
                    {formState.milestones.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeMilestone(index)}
                        style={{ marginTop: "var(--space-2)" }}
                      >
                        Remove milestone
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "var(--space-4)" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Contract"}
                </button>
              </div>
            </form>
          )}

          {/* My Contracts tab */}
          {activeTab === "contracts" && (
            <div className="cards-list">
              {loadingContracts ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-light)" }}>
                  Loading contracts...
                </div>
              ) : contracts.length > 0 ? (
                contracts.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    variant="default"
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <EmptyState
                  title="No Contracts Yet"
                  description="Create a contract to start receiving proposals."
                />
              )}
            </div>
          )}

          {/* Proposals tab */}
          {activeTab === "proposals" && (
            <div className="cards-list">
              {loadingProposals ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    color: "var(--color-text-light)",
                  }}
                >
                  Loading proposals...
                </div>
              ) : pendingProposals.length > 0 ? (
                pendingProposals.map((proposal) => (
                  <ProposalItem key={proposal._id} proposal={proposal} />
                ))
              ) : (
                <EmptyState
                  title={
                    contracts.length === 0
                      ? "No Contracts Yet"
                      : "No Proposals Yet"
                  }
                  description={
                    contracts.length === 0
                      ? "Create a contract to start receiving proposals."
                      : "Freelancers will appear here once they submit proposals."
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          mode="view"
          onClose={handleCloseModal}
          onApproveMilestone={handleApproveMilestone}
          userRole={user?.role?.[0]}
        />
      )}
    </>
  );
};
