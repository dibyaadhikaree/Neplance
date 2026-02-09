const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getTotalValue = (milestones) => {
  if (!Array.isArray(milestones) || milestones.length === 0) return null;
  return milestones.reduce((total, milestone) => {
    const value = Number(milestone?.value ?? 0);
    return total + (Number.isNaN(value) ? 0 : value);
  }, 0);
};

export const JobCard = ({
  job,
  variant = "default",
  onSubmitProposal,
  onMarkComplete,
  onViewDetails,
}) => {
  const { title, description, milestones, status, creatorAddress } = job;
  const totalValue = getTotalValue(milestones);
  const creatorLabel =
    creatorAddress?.name ||
    creatorAddress?.email ||
    creatorAddress ||
    "Unknown Creator";

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-card-avatar">
          {creatorLabel.charAt(0).toUpperCase()}
        </div>
        <div className="job-card-meta">
          <span className="job-card-client">{creatorLabel}</span>
        </div>
        <span className={`status-badge status-${status?.toLowerCase()}`}>
          {formatStatus(status)}
        </span>
      </div>

      <div className="job-card-content">
        <h3 className="job-card-title">{title}</h3>
        {description && (
          <p className="job-card-description">
            {description.length > 120
              ? `${description.slice(0, 120)}...`
              : description}
          </p>
        )}
      </div>

      <div className="job-card-footer">
        <div className="job-card-budget-wrapper">
          <span className="job-card-budget-label">Total Value</span>
          <span className="job-card-budget">
            {totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "N/A"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="job-card-btn job-card-btn-secondary"
            onClick={() => onViewDetails?.(job)}
          >
            View Details
          </button>

          {variant === "find" && (
            <button
              type="button"
              className="job-card-btn job-card-btn-primary"
              onClick={() => onSubmitProposal?.(job)}
            >
              Submit Proposal
            </button>
          )}

          {variant === "current" && status === "ACTIVE" && onMarkComplete && (
            <button
              type="button"
              className="job-card-btn job-card-btn-secondary"
              onClick={() => onMarkComplete?.(job)}
            >
              Mark Milestone Complete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProposalCard = ({ proposal, onViewDetails }) => {
  const { job, amount, status } = proposal;
  const jobTitle = job?.title || "Unknown Contract";
  const creatorLabel =
    job?.creatorAddress?.name ||
    job?.creatorAddress?.email ||
    job?.creatorAddress ||
    "Unknown Creator";
  const totalValue = getTotalValue(job?.milestones);

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-card-avatar">
          {creatorLabel.charAt(0).toUpperCase()}
        </div>
        <div className="job-card-meta">
          <span className="job-card-client">{creatorLabel}</span>
        </div>
        <span className={`status-badge status-${status?.toLowerCase()}`}>
          {formatStatus(status)}
        </span>
      </div>

      <div className="job-card-content">
        <h3 className="job-card-title">{jobTitle}</h3>
        <div className="job-card-proposal-info">
          <span className="job-card-proposal-label">Your Proposal</span>
          <span className="job-card-proposal-amount">
            NPR {amount?.toLocaleString() || "N/A"}
          </span>
        </div>
        {job?.description && (
          <p className="job-card-description">
            {job.description.length > 100
              ? `${job.description.slice(0, 100)}...`
              : job.description}
          </p>
        )}
      </div>

      <div className="job-card-footer">
        <div className="job-card-budget-wrapper">
          <span className="job-card-budget-label">Contract Value</span>
          <span className="job-card-budget">
            {totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "N/A"}
          </span>
        </div>
        {/* Always show View Details for consistency, or keep logic */}
        <button
          type="button"
          className="job-card-btn job-card-btn-secondary"
          onClick={() => onViewDetails?.(job)}
        >
          View Details
        </button>
        {status === "accepted" && (
          <span className="job-card-status-label status-accepted-label">
            Accepted
          </span>
        )}
      </div>
    </article>
  );
};
