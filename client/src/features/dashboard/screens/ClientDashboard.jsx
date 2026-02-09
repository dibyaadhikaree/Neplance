"use client";

import { useEffect, useState } from "react";
import { Header } from "@/features/dashboard/components/Header";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { apiCall } from "@/services/api";
import { Button, Input } from "@/shared/ui/UI";

export const ClientDashboard = ({ user, onLogout, onRoleSwitch }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    milestones: [{ title: "", description: "", value: "", dueDate: "" }],
  });

  const formatDateValue = (value) => {
    if (!value) return null;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const jobsData = await apiCall("/jobs/myJobs");
      if (jobsData.status === "success") {
        setContracts(jobsData.data);
      }
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async (jobId) => {
    try {
      const proposalsData = await apiCall(`/proposals/job/${jobId}`);
      if (proposalsData.status === "success") {
        setProposals(proposalsData.data);
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setProposals([]);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleSelectContract = async (jobId) => {
    setSelectedContractId(jobId);
    await fetchProposals(jobId);
    setActiveTab("proposals");
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiCall(`/proposals/${proposalId}/accept`, {
        method: "PATCH",
      });
      if (selectedContractId) {
        await fetchProposals(selectedContractId);
      }
      await fetchContracts();
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

    const validMilestones = formState.milestones
      .map((milestone, index) => {
        const entryErrors = [];
        if (!milestone.title.trim()) {
          entryErrors.push("Title is required.");
        }
        if (!milestone.value || Number(milestone.value) <= 0) {
          entryErrors.push("Value must be greater than 0.");
        }
        if (entryErrors.length > 0) {
          validationErrors[index] = entryErrors;
        }
        return milestone.title.trim();
      })
      .filter(Boolean);

    if (validMilestones.length === 0) {
      errors.push("Add at least one milestone with a title and value.");
    }

    setFormErrors(errors);
    setMilestoneErrors(validationErrors);

    if (errors.length > 0 || Object.keys(validationErrors).length > 0) {
      return;
    }

    const milestones = formState.milestones
      .filter((milestone) => milestone.title.trim())
      .map((milestone) => ({
        title: milestone.title.trim(),
        description: milestone.description.trim(),
        value: Number(milestone.value) || 0,
        dueDate: formatDateValue(milestone.dueDate),
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
    const freelancerRole = Array.isArray(proposal.freelancer?.role)
      ? proposal.freelancer.role.join(", ")
      : proposal.freelancer?.role;

    return (
      <article className="job-card">
        <div className="job-card-header">
          <div className="job-card-avatar">
            {freelancerLabel.charAt(0).toUpperCase()}
          </div>
          <div className="job-card-meta">
            <span className="job-card-client">{freelancerLabel}</span>
          </div>
          <span className={`status-badge status-${proposal.status?.toLowerCase()}`}>
            {proposal.status || "Unknown"}
          </span>
        </div>
        <div className="job-card-content">
          <h3 className="job-card-title">Proposal</h3>
          <p className="job-card-description">
            {freelancerEmail ? `Email: ${freelancerEmail}` : "Email not shared"}
          </p>
          {freelancerRole && (
            <p className="job-card-description">Role: {freelancerRole}</p>
          )}
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
              className="job-card-btn job-card-btn-primary"
              onClick={() => handleAcceptProposal(proposal._id)}
            >
              Accept Proposal
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
      <main className="dashboard-split">
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
            <h2 className="panel-title">Client Dashboard</h2>
          </div>
          <div className="panel-content">
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
                disabled={!selectedContractId}
              >
                Proposals
              </button>
            </nav>

            {activeTab === "create" && (
              <form className="card" onSubmit={handleCreateContract}>
                {formErrors.length > 0 && (
                  <div className="card card-error" style={{ marginBottom: "1rem" }}>
                    {formErrors.map((error) => (
                      <p key={error}>{error}</p>
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
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Describe the work scope"
                  disabled={submitting}
                />

                <div style={{ marginTop: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Milestones</strong>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addMilestone}
                    >
                      + Add milestone
                    </Button>
                  </div>
                  {formState.milestones.map((milestone, index) => (
                    <div key={`milestone-${index}`} className="card card-sm">
                      {milestoneErrors[index] && (
                        <div className="card card-error" style={{ marginBottom: "0.5rem" }}>
                          {milestoneErrors[index].map((error) => (
                            <p key={`${index}-${error}`}>{error}</p>
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
                            e.target.value
                          )
                        }
                        disabled={submitting}
                      />
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <Input
                          label="Value (NPR)"
                          type="number"
                          value={milestone.value}
                          onChange={(e) =>
                            handleMilestoneChange(
                              index,
                              "value",
                              e.target.value
                            )
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
                              e.target.value
                            )
                          }
                          disabled={submitting}
                        />
                      </div>
                      {formState.milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeMilestone(index)}
                          style={{ marginTop: "0.5rem" }}
                        >
                          Remove milestone
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "contracts" && (
              <div>
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading contracts...
                  </div>
                ) : contracts.length > 0 ? (
                  contracts.map((job) => (
                    <div key={job._id} style={{ marginBottom: "1rem" }}>
                      <JobCard
                        job={job}
                        variant="default"
                        onViewDetails={handleViewDetails}
                      />
                      <div style={{ marginTop: "0.5rem" }}>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleSelectContract(job._id)}
                        >
                          View Proposals
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No Contracts Yet"
                    description="Create a contract to start receiving proposals."
                  />
                )}
              </div>
            )}

            {activeTab === "proposals" && (
              <div>
                {selectedContractId ? (
                  proposals.length > 0 ? (
                    proposals.map((proposal) => (
                      <ProposalItem key={proposal._id} proposal={proposal} />
                    ))
                  ) : (
                    <EmptyState
                      title="No Proposals Yet"
                      description="Freelancers will appear here once they submit proposals."
                    />
                  )
                ) : (
                  <EmptyState
                    title="Select a Contract"
                    description="Choose a contract to view proposals."
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          mode="view"
          onClose={handleCloseModal}
          onApproveMilestone={handleApproveMilestone}
          userRole={user?.role?.[0]}
        />
      )}
    </div>
  );
};
