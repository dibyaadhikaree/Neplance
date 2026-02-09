export const JobCard = ({
  job,
  variant = "default",
  onSubmitProposal,
  onMarkComplete,
  onViewDetails,
}) => {
  const { title, description, budget, status, client } = job;
  const clientName = client?.name || "Unknown Client";

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-card-avatar">
          {clientName.charAt(0).toUpperCase()}
        </div>
        <div className="job-card-meta">
          <span className="job-card-client">{clientName}</span>
        </div>
        <span className={`status-badge status-${status}`}>
          {status?.replace("-", " ") || "Unknown"}
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
          <span className="job-card-budget-label">Budget</span>
          <span className="job-card-budget">
            NPR {budget?.toLocaleString() || "N/A"}
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

          {variant === "current" && status === "in-progress" && (
            <button
              type="button"
              className="job-card-btn job-card-btn-secondary"
              onClick={() => onMarkComplete?.(job)}
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProposalCard = ({ proposal, onViewDetails }) => {
  const { job, amount, status } = proposal;
  const jobTitle = job?.title || "Unknown Job";
  const clientName = job?.client?.name || "Unknown Client";

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-card-avatar">
          {clientName.charAt(0).toUpperCase()}
        </div>
        <div className="job-card-meta">
          <span className="job-card-client">{clientName}</span>
        </div>
        <span className={`status-badge status-${status}`}>
          {status || "Unknown"}
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
          <span className="job-card-budget-label">Job Budget</span>
          <span className="job-card-budget">
            NPR {job?.budget?.toLocaleString() || "N/A"}
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
