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
  const parts = [location.city, location.district].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
};

export const JobCard = ({
  job,
  variant = "default",
  onSubmitProposal,
  onMarkComplete,
  onViewDetails,
  onPostJob,
  onDeleteJob,
}) => {
  const {
    title,
    description,
    milestones,
    status,
    creatorAddress,
    jobType,
    category,
    tags,
    budget,
    budgetType,
    experienceLevel,
    location,
    deadline,
    isUrgent,
    proposalCount,
  } = job;
  const totalValue = hasMilestones(milestones)
    ? getMilestoneTotal(milestones)
    : null;
  const creatorLabel = getCreatorLabel(creatorAddress);
  const locationText = formatLocation(location);
  const budgetDisplay = budget ? formatBudget(budget, budgetType) : (totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "Negotiable");
  const isDraft = status === "DRAFT";

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'draft') return 'badge-warning';
    if (statusLower === 'open') return 'badge-success';
    if (statusLower === 'active') return 'badge-primary';
    if (statusLower === 'completed') return 'badge-info';
    if (statusLower === 'cancelled') return 'badge-error';
    return '';
  };

  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <div 
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              backgroundColor: "var(--color-primary-lightest)", 
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--text-lg)"
            }}
          >
            {creatorLabel.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text)" }}>
              {creatorLabel}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {isUrgent && (
            <span className="badge badge-error">Urgent</span>
          )}
          <span className={`badge ${getStatusBadgeClass(status)}`}>
            {formatStatus(status)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--space-2)" }}>
          {title}
        </h3>
        {description && (
          <p className="text-light">
            {description.length > 150
              ? `${description.slice(0, 150)}...`
              : description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        {category && (
          <span className="badge" style={{ background: "var(--color-primary-lightest)", color: "var(--color-primary)" }}>
            {category}
          </span>
        )}
        {jobType && (
          <span className="badge" style={{ background: "var(--color-secondary-lightest)", color: "var(--color-secondary)" }}>
            {jobType}
          </span>
        )}
        {experienceLevel && (
          <span className="badge" style={{ background: "var(--color-warning-lightest)", color: "var(--color-warning-dark)" }}>
            {experienceLevel}
          </span>
        )}
        {tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="badge" style={{ background: "var(--color-border-light)" }}>
            {tag}
          </span>
        ))}
      </div>

      {locationText && (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-3)" }}>
          📍 {locationText}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border-light)" }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>
            Budget
          </div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text)" }}>
            {budgetDisplay}
          </div>
          {proposalCount > 0 && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>
              {proposalCount} proposals
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onViewDetails?.(job)}
          >
            View Details
          </button>

          {isDraft && onPostJob && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onPostJob?.(job)}
            >
              Post
            </button>
          )}

          {isDraft && onDeleteJob && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--color-error)" }}
              onClick={() => onDeleteJob?.(job)}
            >
              Delete
            </button>
          )}

          {variant === "find" && !isDraft && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSubmitProposal?.(job)}
            >
              Apply Now
            </button>
          )}

          {variant === "current" && status === "ACTIVE" && onMarkComplete && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onMarkComplete?.(job)}
            >
              Complete
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
  const creatorLabel = getCreatorLabel(job?.creatorAddress);
  const totalValue = hasMilestones(job?.milestones)
    ? getMilestoneTotal(job?.milestones)
    : null;
  const budgetDisplay = job?.budget
    ? formatBudget(job.budget, job.budgetType)
    : (totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "N/A");

  const getProposalStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'accepted') return 'badge-success';
    if (statusLower === 'pending') return 'badge-warning';
    if (statusLower === 'rejected') return 'badge-error';
    return '';
  };

  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <div 
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              backgroundColor: "var(--color-primary-lightest)", 
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--text-lg)"
            }}
          >
            {creatorLabel.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text)" }}>
              {creatorLabel}
            </div>
          </div>
        </div>
        <span className={`badge ${getProposalStatusBadgeClass(status)}`}>
          {formatStatus(status)}
        </span>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--space-2)" }}>
          {jobTitle}
        </h3>
        <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-3)" }}>
          <div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)" }}>Your Proposal: </span>
            <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
              NPR {amount?.toLocaleString() || "N/A"}
            </span>
          </div>
        </div>
        {job?.description && (
          <p className="text-light">
            {job.description.length > 120
              ? `${job.description.slice(0, 120)}...`
              : job.description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border-light)" }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>
            Contract Value
          </div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text)" }}>
            {budgetDisplay}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onViewDetails?.(job)}
        >
          View Details
        </button>
      </div>
    </article>
  );
};
