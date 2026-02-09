"use client";

import { useState } from "react";
import { Button, Input } from "@/shared/ui/UI";

export const JobModal = ({
  job,
  mode = "view",
  onSubmit,
  onSubmitMilestone,
  onApproveMilestone,
  onClose,
  loading = false,
  userRole,
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [evidenceInputs, setEvidenceInputs] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await onSubmit({
        job: job._id,
        amount: Number(amount),
      });
    } catch (err) {
      setError(err.message || "Failed to submit proposal");
    }
  };

  const isProposalMode = mode === "proposal";
  const milestones = Array.isArray(job.milestones) ? job.milestones : [];
  const totalValue = milestones.reduce((total, milestone) => {
    const value = Number(milestone?.value ?? 0);
    return total + (Number.isNaN(value) ? 0 : value);
  }, 0);
  const completedCount = milestones.filter(
    (milestone) => milestone?.status === "COMPLETED"
  ).length;
    const canSubmitMilestone =
      userRole === "freelancer" && job.status === "ACTIVE";
    const canApproveMilestone = userRole === "client";
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const creatorLabel =
    job.creatorAddress?.name ||
    job.creatorAddress?.email ||
    job.creatorAddress ||
    "Unknown Creator";

  const handleEvidenceChange = (index, value) => {
    setEvidenceInputs((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmitMilestoneClick = async (jobId, index) => {
    const evidence = evidenceInputs[index];
    await onSubmitMilestone?.(jobId, index, evidence);
    setEvidenceInputs((prev) => ({
      ...prev,
      [index]: "",
    }));
  };

  return (
    <div className="proposal-modal-overlay">
      <div
        className="proposal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="proposal-modal-header">
          <h2 id="modal-title" className="proposal-modal-title">
            {isProposalMode ? "Submit Proposal" : "Contract Details"}
          </h2>
        </div>

        <div className="proposal-modal-job-info">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <h3
              className="proposal-modal-job-title"
              style={{ margin: 0, textAlign: "left" }}
            >
              {job.title}
            </h3>
            <span
              className="job-card-budget"
              style={{ fontSize: "1.1rem", whiteSpace: "nowrap" }}
            >
              {milestones.length > 0
                ? `NPR ${totalValue.toLocaleString()}`
                : "N/A"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              margin: "1rem 0",
              padding: "0.75rem",
              background: "rgba(0,0,0,0.03)",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
              alignItems: "center",
            }}
          >
            <span className={`status-badge status-${job.status?.toLowerCase()}`}>
              {formatStatus(job.status)}
            </span>
            {creatorLabel && (
              <span
                className="profile-role-badge"
                style={{ background: "transparent", padding: 0 }}
              >
                Creator:{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  {creatorLabel}
                </span>
              </span>
            )}
            {milestones.length > 0 && (
              <span
                className="profile-role-badge"
                style={{ background: "transparent", padding: 0 }}
              >
                Milestones:{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  {completedCount}/{milestones.length}
                </span>
              </span>
            )}
          </div>

          {job.description && (
            <p
              className="proposal-modal-job-description"
              style={{ textAlign: "left" }}
            >
              {job.description}
            </p>
          )}

          {milestones.length > 0 ? (
            <div className="proposal-modal-job-description">
              <strong>Milestones</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                {milestones.map((milestone, index) => (
                  <li key={`${milestone?.title || "milestone"}-${index}`}>
                    {milestone?.title || "Untitled"} -{" "}
                    {milestone?.value
                      ? `NPR ${Number(milestone.value).toLocaleString()}`
                      : "N/A"}
                    {" "}({formatStatus(milestone?.status)})
                    {milestone?.evidence && (
                      <span style={{ marginLeft: "0.5rem" }}>
                        Evidence: {milestone.evidence}
                      </span>
                    )}
                    {canSubmitMilestone &&
                      milestone?.status === "ACTIVE" &&
                      onSubmitMilestone && (
                        <span style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <Input
                            type="text"
                            label="Evidence"
                            placeholder="Paste link or notes"
                            value={evidenceInputs[index] || ""}
                            onChange={(e) =>
                              handleEvidenceChange(index, e.target.value)
                            }
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              handleSubmitMilestoneClick(job._id, index)
                            }
                            className="modal-close-btn"
                          >
                            Submit
                          </Button>
                        </span>
                      )}
                    {canApproveMilestone &&
                      milestone?.status === "SUBMITTED" &&
                      onApproveMilestone && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onApproveMilestone(job._id, index)}
                          className="modal-close-btn"
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Approve
                        </Button>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="proposal-modal-job-description">
              No milestones defined yet.
            </p>
          )}
        </div>

        {isProposalMode ? (
          <form onSubmit={handleSubmit} className="proposal-modal-form">
            <Input
              type="number"
              label="Your Amount (NPR)"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              disabled={loading}
            />

            {error && <p className="proposal-modal-error">{error}</p>}

            <div className="proposal-modal-actions">
              <Button type="submit" disabled={loading || !amount}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="modal-close-btn"
                style={{ border: "1px solid var(--color-primary)" }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="proposal-modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="modal-close-btn"
              style={{ border: "1px solid var(--color-primary)" }}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
