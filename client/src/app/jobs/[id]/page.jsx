"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { apiCall } from "@/services/api";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { Navbar } from "@/shared/navigation/Navbar";
import { Button, Input } from "@/shared/ui/UI";
import {
  formatStatus,
  getCreatorLabel,
  getMilestoneTotal,
  hasMilestones,
} from "@/shared/utils/job";

const formatBudget = (budget, budgetType) => {
  if (!budget?.min) return "Negotiable";
  const currency = budget.currency || "NPR";
  if (budgetType === "hourly") {
    return `${currency} ${budget.min.toLocaleString()}-${budget.max?.toLocaleString() || "N/A"}/hr`;
  }
  if (budget.max) {
    return `${currency} ${budget.min.toLocaleString()}-${budget.max.toLocaleString()}`;
  }
  return `${currency} ${budget.min.toLocaleString()}`;
};

const formatLocation = (location) => {
  if (!location) return null;
  if (location.isRemote) return "Remote";
  const parts = [
    location.address,
    location.city,
    location.district,
    location.province,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [amount, setAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [revisionsIncluded, setRevisionsIncluded] = useState("0");
  const [attachments, setAttachments] = useState("");

  const { user, isHydrated, logout, switchRole } = useAuthGate({ mode: "none" });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiCall(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        setError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    if (!amount || Number(amount) <= 0) {
      setSubmitError("Please enter a valid amount");
      setSubmitting(false);
      return;
    }
    if (!coverLetter || coverLetter.trim().length === 0) {
      setSubmitError("Please enter a cover letter");
      setSubmitting(false);
      return;
    }
    if (!deliveryDays || Number(deliveryDays) <= 0) {
      setSubmitError("Please enter valid delivery days");
      setSubmitting(false);
      return;
    }

    try {
      await apiCall("/api/proposals", {
        method: "POST",
        body: JSON.stringify({
          job: job._id,
          amount: Number(amount),
          coverLetter: coverLetter.trim(),
          deliveryDays: Number(deliveryDays),
          revisionsIncluded: Number(revisionsIncluded) || 0,
          attachments: attachments
            ? attachments
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],
        }),
      });
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(err.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isHydrated || !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={logout} onRoleSwitch={switchRole} />
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
        <Navbar user={user} onLogout={logout} onRoleSwitch={switchRole} />
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
            <Button
              variant="secondary"
              onClick={() => router.back()}
              style={{ marginTop: "var(--space-4)" }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  const milestones = Array.isArray(job.milestones) ? job.milestones : [];
  const totalValue = getMilestoneTotal(milestones);
  const completedCount = milestones.filter(
    (milestone) => milestone?.status === "COMPLETED",
  ).length;
  const creatorLabel = getCreatorLabel(job.creatorAddress);
  const budgetDisplay = job.budget
    ? formatBudget(job.budget, job.budgetType)
    : hasMilestones(milestones)
      ? `NPR ${totalValue.toLocaleString()}`
      : "Negotiable";
  const locationText = formatLocation(job.location);
  const deadlineText = formatDate(job.deadline);

  return (
    <>
      <Navbar user={user} onLogout={logout} onRoleSwitch={switchRole} />
      <div className="dashboard">
        <div className="dashboard-content">
          <div style={{ marginBottom: "var(--space-6)" }}>
            <Button variant="ghost" onClick={() => router.back()}>
              ← Back
            </Button>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h1
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: "var(--font-weight-semibold)",
                  margin: 0,
                }}
              >
                {job.title}
              </h1>
              <span
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: "var(--font-weight-semibold)",
                  whiteSpace: "nowrap",
                }}
              >
                {budgetDisplay}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                margin: "1rem 0",
                alignItems: "center",
              }}
            >
              <span
                className={`status-badge status-${job.status?.toLowerCase()}`}
              >
                {formatStatus(job.status)}
              </span>
              {job.jobType && (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-secondary-lightest)",
                    color: "var(--color-secondary)",
                  }}
                >
                  {job.jobType}
                </span>
              )}
              {job.category && (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-primary-lightest)",
                    color: "var(--color-primary)",
                  }}
                >
                  {job.category}
                </span>
              )}
              {job.experienceLevel && (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-warning-lightest)",
                    color: "var(--color-warning-dark)",
                  }}
                >
                  {job.experienceLevel}
                </span>
              )}
              {job.isUrgent && (
                <span className="badge badge-error">Urgent</span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                margin: "1rem 0",
                padding: "1rem",
                background: "rgba(0,0,0,0.03)",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {creatorLabel && (
                <span style={{ fontSize: "0.875rem" }}>
                  Posted by:{" "}
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {creatorLabel}
                  </span>
                </span>
              )}
              {locationText && (
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-light)",
                  }}
                >
                  📍 {locationText}
                </span>
              )}
              {deadlineText && (
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-light)",
                  }}
                >
                  📅 Due: {deadlineText}
                </span>
              )}
              {hasMilestones(milestones) && (
                <span style={{ fontSize: "0.875rem" }}>
                  Milestones:{" "}
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {completedCount}/{milestones.length}
                  </span>
                </span>
              )}
            </div>

            {job.description && (
              <div style={{ marginTop: "var(--space-6)" }}>
                <h2
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Description
                </h2>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {job.description}
                </p>
              </div>
            )}

            {job.requiredSkills?.length > 0 && (
              <div style={{ marginTop: "var(--space-6)" }}>
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Required Skills
                </h3>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="badge"
                      style={{ background: "var(--color-border-light)" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.tags?.length > 0 && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Tags
                </h3>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge"
                      style={{ background: "var(--color-border-light)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {milestones.length > 0 ? (
              <div style={{ marginTop: "var(--space-6)" }}>
                <h2
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Milestones
                </h2>
                <ul style={{ paddingLeft: "1.25rem" }}>
                  {milestones.map((milestone, index) => (
                    <li
                      key={`${milestone?.title || "milestone"}-${index}`}
                      style={{ marginBottom: "var(--space-3)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ fontWeight: "var(--font-weight-medium)" }}
                        >
                          {milestone?.title || "Untitled"}
                        </span>
                        <span
                          style={{
                            color: "var(--color-primary)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          NPR {Number(milestone?.value || 0).toLocaleString()}
                        </span>
                      </div>
                      {milestone?.description && (
                        <p
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-light)",
                            margin: "var(--space-1) 0",
                          }}
                        >
                          {milestone.description}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-light)",
                        }}
                      >
                        Status: {formatStatus(milestone?.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {job.status === "OPEN" && (
            <div className="card" style={{ marginTop: "var(--space-6)" }}>
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "var(--space-4)",
                }}
              >
                Submit Proposal
              </h2>
              <form onSubmit={handleSubmitProposal}>
                <Input
                  type="number"
                  label="Your Amount (NPR)"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                  disabled={submitting}
                />

                <div style={{ marginTop: "1rem" }}>
                  <label
                    htmlFor="coverLetter"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Cover Letter *
                  </label>
                  <textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe why you're the best fit for this job..."
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid var(--color-border)",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      resize: "vertical",
                    }}
                    maxLength={5000}
                    required
                    disabled={submitting}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-light)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {coverLetter.length}/5000 characters
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <Input
                    type="number"
                    label="Delivery Days *"
                    placeholder="e.g., 7"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    min="1"
                    required
                    disabled={submitting}
                  />
                  <Input
                    type="number"
                    label="Revisions Included"
                    placeholder="e.g., 2"
                    value={revisionsIncluded}
                    onChange={(e) => setRevisionsIncluded(e.target.value)}
                    min="0"
                    disabled={submitting}
                  />
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Input
                    type="text"
                    label="Attachments (comma-separated URLs)"
                    placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
                    value={attachments}
                    onChange={(e) => setAttachments(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {submitError && (
                  <p className="card-error" style={{ marginTop: "1rem" }}>
                    {submitError}
                  </p>
                )}

                <div
                  style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}
                >
                  <Button
                    type="submit"
                    disabled={
                      submitting || !amount || !coverLetter || !deliveryDays
                    }
                  >
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
