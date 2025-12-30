"use client";

import { useState } from "react";
import { Button, Input } from "../UI";

export const JobModal = ({
  job,
  mode = "view",
  onSubmit,
  onClose,
  loading = false,
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

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
            {isProposalMode ? "Submit Proposal" : "Job Details"}
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
              NPR {job.budget?.toLocaleString()}
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
            <span className={`status-badge status-${job.status}`}>
              {job.status?.replace("-", " ")}
            </span>
            {job.client?.name && (
              <span
                className="profile-role-badge"
                style={{ background: "transparent", padding: 0 }}
              >
                Client:{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  {job.client.name}
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
