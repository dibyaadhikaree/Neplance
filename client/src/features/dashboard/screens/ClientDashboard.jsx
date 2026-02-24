"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/shared/navigation/Navbar";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { apiCall } from "@/services/api";
import { Input } from "@/shared/ui/UI";
import { useClientDashboard } from "@/features/dashboard/hooks/useClientDashboard";
import {
  JOB_CATEGORIES,
  NEPAL_PROVINCES,
} from "@/shared/constants/jobCategories";
import {
  jobCreateSchema,
  validateForm as validateFormSchema,
} from "@/shared/lib/validation";

export const ClientDashboard = ({ user, onLogout, onRoleSwitch }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    jobType: "digital",
    category: "",
    subcategory: "",
    tags: "",
    requiredSkills: "",
    experienceLevel: "",
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    isUrgent: false,
    locationCity: "",
    locationDistrict: "",
    locationProvince: "",
    milestones: [
      { id: Date.now(), title: "", description: "", value: "", dueDate: "" },
    ],
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

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiCall(`/api/proposals/${proposalId}/accept`, { method: "PATCH" });
      await fetchContracts();
      if (activeTab === "proposals") {
        await fetchProposalsForContracts(contracts);
      }
    } catch (err) {
      console.error("Failed to accept proposal:", err);
    }
  };

  const handlePostDraftJob = async (job) => {
    if (!confirm("Are you sure you want to post this job?")) return;
    try {
      await apiCall(`/api/jobs/${job._id}/publish`, { method: "PATCH" });
      await fetchContracts();
    } catch (err) {
      console.error("Failed to post job:", err);
      alert(err?.message || "Failed to post job");
    }
  };

  const handleDeleteJob = async (job) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await apiCall(`/api/jobs/${job._id}`, { method: "DELETE" });
      await fetchContracts();
    } catch (err) {
      console.error("Failed to delete job:", err);
      alert(err?.message || "Failed to delete job");
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
        { id: Date.now(), title: "", description: "", value: "", dueDate: "" },
      ],
    }));
  };

  const removeMilestone = (index) => {
    setFormState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, idx) => idx !== index),
    }));
  };

  const buildJobPayload = (status) => {
    const tags = formState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const requiredSkills = formState.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const location =
      formState.jobType === "physical"
        ? {
            city: formState.locationCity.trim() || undefined,
            district: formState.locationDistrict.trim() || undefined,
            province: formState.locationProvince.trim() || undefined,
          }
        : undefined;

    const milestones = formState.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        value: Number(m.value) || 0,
        dueDate: formatDateValue(m.dueDate),
      }));

    return {
      title: formState.title.trim(),
      description: formState.description.trim(),
      jobType: formState.jobType,
      category: formState.category.trim(),
      subcategory: formState.subcategory.trim() || undefined,
      tags,
      requiredSkills,
      experienceLevel: formState.experienceLevel || undefined,
      budgetType: formState.budgetType,
      budget: {
        min: Number(formState.budgetMin),
        max: formState.budgetMax ? Number(formState.budgetMax) : undefined,
        currency: "NPR",
      },
      deadline: formState.deadline || undefined,
      isUrgent: formState.isUrgent,
      location,
      milestones,
      status,
    };
  };

  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      jobType: "digital",
      category: "",
      subcategory: "",
      tags: "",
      requiredSkills: "",
      experienceLevel: "",
      budgetType: "fixed",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      isUrgent: false,
      locationCity: "",
      locationDistrict: "",
      locationProvince: "",
      milestones: [
        { id: Date.now(), title: "", description: "", value: "", dueDate: "" },
      ],
    });
    setFormErrors([]);
    setMilestoneErrors({});
  };

  const validateForm = (requireMilestones = true) => {
    const tags = formState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const requiredSkills = formState.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const milestones = formState.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        value: Number(m.value) || 0,
        dueDate: formatDateValue(m.dueDate),
      }));

    const location =
      formState.jobType === "physical"
        ? {
            city: formState.locationCity.trim() || undefined,
            district: formState.locationDistrict.trim() || undefined,
            province: formState.locationProvince.trim() || undefined,
          }
        : undefined;

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      jobType: formState.jobType,
      category: formState.category.trim(),
      subcategory: formState.subcategory.trim() || undefined,
      tags,
      requiredSkills,
      experienceLevel: formState.experienceLevel || undefined,
      budgetType: formState.budgetType,
      budget: {
        min: Number(formState.budgetMin) || 0,
        max: formState.budgetMax ? Number(formState.budgetMax) : undefined,
        currency: "NPR",
      },
      deadline: formState.deadline || undefined,
      isUrgent: formState.isUrgent,
      location,
      milestones: requireMilestones ? milestones : [],
      isPublic: true,
    };

    const { errors: validationErrors, data } = validateFormSchema(
      jobCreateSchema,
      payload,
    );

    if (validationErrors) {
      const flatErrors = [];
      const milestoneErrorsObj = {};

      Object.entries(validationErrors).forEach(([key, value]) => {
        if (key.startsWith("milestones.")) {
          const match = key.match(/milestones\.(\d+)\.(.+)/);
          if (match) {
            const idx = parseInt(match[1], 10);
            if (!milestoneErrorsObj[idx]) milestoneErrorsObj[idx] = [];
            milestoneErrorsObj[idx].push(value);
          }
        } else {
          flatErrors.push(value);
        }
      });

      if (
        requireMilestones &&
        (!data.milestones || data.milestones.length === 0)
      ) {
        flatErrors.push("Add at least one milestone with a title and value.");
      }

      setFormErrors(flatErrors);
      setMilestoneErrors(milestoneErrorsObj);
      return false;
    }

    setFormErrors([]);
    setMilestoneErrors({});
    return true;
  };

  const handleSaveDraft = async () => {
    if (!formState.title.trim()) {
      setFormErrors(["Job title is required to save as draft."]);
      return;
    }

    const tags = formState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const requiredSkills = formState.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const location =
      formState.jobType === "physical"
        ? {
            city: formState.locationCity.trim() || undefined,
            district: formState.locationDistrict.trim() || undefined,
            province: formState.locationProvince.trim() || undefined,
          }
        : undefined;

    const milestones = formState.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        value: Number(m.value) || 0,
        dueDate: formatDateValue(m.dueDate),
      }));

    setSubmitting(true);
    try {
      setFormErrors([]);
      await apiCall("/api/jobs", {
        method: "POST",
        body: JSON.stringify(buildJobPayload("DRAFT")),
      });
      resetForm();
      await fetchContracts();
      setActiveTab("contracts");
    } catch (err) {
      console.error("Failed to save draft:", err);
      setFormErrors([
        err?.message || "Failed to save draft. Please try again.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setSubmitting(true);
    try {
      setFormErrors([]);
      await apiCall("/api/jobs", {
        method: "POST",
        body: JSON.stringify(buildJobPayload("OPEN")),
      });
      resetForm();
      await fetchContracts();
      setActiveTab("contracts");
    } catch (err) {
      console.error("Failed to post job:", err);
      setFormErrors([err?.message || "Failed to post job. Please try again."]);
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
            {freelancerEmail ? `Email: ${freelancerEmail}` : "Email not shared"}
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
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link
              href={`/proposals/${proposal._id}`}
              className="btn btn-ghost btn-sm"
            >
              View Details
            </Link>
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
        </div>
      </article>
    );
  };

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
              Post Job
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
            <form className="card" onSubmit={handlePostJob}>
              {formErrors.length > 0 && (
                <div
                  className="card-error"
                  style={{ marginBottom: "var(--space-4)" }}
                >
                  {formErrors.map((error) => (
                    <p key={error} style={{ margin: 0 }}>
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <Input
                    label="Contract Title"
                    value={formState.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="e.g. Landing page redesign"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <Input
                label="Description"
                value={formState.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Describe the work scope"
                disabled={submitting}
              />

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    htmlFor="jobType"
                    style={{
                      display: "block",
                      marginBottom: "var(--space-1)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    value={formState.jobType}
                    onChange={(e) =>
                      handleFormChange("jobType", e.target.value)
                    }
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                <div style={{ flex: "2", minWidth: "200px" }}>
                  <label
                    htmlFor="category"
                    style={{
                      display: "block",
                      marginBottom: "var(--space-1)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Category{" "}
                    <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  <select
                    id="category"
                    value={formState.category}
                    onChange={(e) =>
                      handleFormChange("category", e.target.value)
                    }
                    disabled={submitting}
                    required
                    style={{
                      width: "100%",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="">Select Category</option>
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="Subcategory"
                    value={formState.subcategory}
                    onChange={(e) =>
                      handleFormChange("subcategory", e.target.value)
                    }
                    placeholder="e.g. Frontend"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <Input
                    label="Tags (comma separated)"
                    value={formState.tags}
                    onChange={(e) => handleFormChange("tags", e.target.value)}
                    placeholder="e.g. React, Node.js, MongoDB"
                    disabled={submitting}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <Input
                    label="Required Skills (comma separated)"
                    value={formState.requiredSkills}
                    onChange={(e) =>
                      handleFormChange("requiredSkills", e.target.value)
                    }
                    placeholder="e.g. JavaScript, CSS"
                    disabled={submitting}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    htmlFor="experienceLevel"
                    style={{
                      display: "block",
                      marginBottom: "var(--space-1)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={formState.experienceLevel}
                    onChange={(e) =>
                      handleFormChange("experienceLevel", e.target.value)
                    }
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="">Any</option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: "1", minWidth: "120px" }}>
                  <label
                    htmlFor="budgetType"
                    style={{
                      display: "block",
                      marginBottom: "var(--space-1)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Budget Type
                  </label>
                  <select
                    id="budgetType"
                    value={formState.budgetType}
                    onChange={(e) =>
                      handleFormChange("budgetType", e.target.value)
                    }
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="Budget Min (NPR)"
                    type="number"
                    value={formState.budgetMin}
                    onChange={(e) =>
                      handleFormChange("budgetMin", e.target.value)
                    }
                    placeholder="5000"
                    required
                    disabled={submitting}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="Budget Max (NPR)"
                    type="number"
                    value={formState.budgetMax}
                    onChange={(e) =>
                      handleFormChange("budgetMax", e.target.value)
                    }
                    placeholder="10000"
                    disabled={submitting}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="Deadline"
                    type="date"
                    value={formState.deadline}
                    onChange={(e) =>
                      handleFormChange("deadline", e.target.value)
                    }
                    disabled={submitting}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  <input
                    type="checkbox"
                    id="isUrgent"
                    checked={formState.isUrgent}
                    onChange={(e) =>
                      handleFormChange("isUrgent", e.target.checked)
                    }
                    disabled={submitting}
                  />
                  <label htmlFor="isUrgent" style={{ cursor: "pointer" }}>
                    Urgent
                  </label>
                </div>
              </div>

              {formState.jobType === "physical" && (
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    flexWrap: "wrap",
                    padding: "var(--space-3)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div style={{ flex: "1", minWidth: "150px" }}>
                    <Input
                      label="City"
                      value={formState.locationCity}
                      onChange={(e) =>
                        handleFormChange("locationCity", e.target.value)
                      }
                      placeholder="Kathmandu"
                      disabled={submitting}
                    />
                  </div>
                  <div style={{ flex: "1", minWidth: "150px" }}>
                    <Input
                      label="District"
                      value={formState.locationDistrict}
                      onChange={(e) =>
                        handleFormChange("locationDistrict", e.target.value)
                      }
                      placeholder="Kathmandu"
                      disabled={submitting}
                    />
                  </div>
                  <div style={{ flex: "1", minWidth: "150px" }}>
                    <label
                      htmlFor="locationProvince"
                      style={{
                        display: "block",
                        marginBottom: "var(--space-1)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      Province
                    </label>
                    <select
                      id="locationProvince"
                      value={formState.locationProvince}
                      onChange={(e) =>
                        handleFormChange("locationProvince", e.target.value)
                      }
                      disabled={submitting}
                      style={{
                        width: "100%",
                        padding: "var(--space-2)",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <option value="">Select Province</option>
                      {NEPAL_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
                  <div key={milestone.id} className="card-sm">
                    {milestoneErrors[index] && (
                      <div
                        className="card-error"
                        style={{ marginBottom: "var(--space-3)" }}
                      >
                        {milestoneErrors[index].map((error) => (
                          <p key={error} style={{ margin: 0 }}>
                            {error}
                          </p>
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

              <div
                style={{
                  marginTop: "var(--space-4)",
                  display: "flex",
                  gap: "var(--space-3)",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          )}

          {/* My Contracts tab */}
          {activeTab === "contracts" && (
            <div className="cards-list">
              {loadingContracts ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    color: "var(--color-text-light)",
                  }}
                >
                  Loading contracts...
                </div>
              ) : contracts.length > 0 ? (
                contracts.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    variant="default"
                    onPostJob={handlePostDraftJob}
                    onDeleteJob={handleDeleteJob}
                  />
                ))
              ) : (
                <EmptyState
                  title="No Jobs Yet"
                  description="Post a job to start receiving proposals."
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
    </>
  );
};
