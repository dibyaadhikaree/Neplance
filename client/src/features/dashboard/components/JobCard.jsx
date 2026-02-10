import {
  formatStatus,
  getCreatorLabel,
  getMilestoneTotal,
  hasMilestones,
} from "@/shared/utils/job";

export const JobCard = ({
  job,
  variant = "default",
  onSubmitProposal,
  onMarkComplete,
  onViewDetails,
}) => {
  const { title, description, milestones, status, creatorAddress } = job;
  const totalValue = hasMilestones(milestones)
    ? getMilestoneTotal(milestones)
    : null;
  const creatorLabel = getCreatorLabel(creatorAddress);

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'draft' || statusLower === 'open') return 'badge-success';
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
        <span className={`badge ${getStatusBadgeClass(status)}`}>
          {formatStatus(status)}
        </span>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border-light)" }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>
            Budget
          </div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text)" }}>
            {totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "N/A"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onViewDetails?.(job)}
          >
            View Details
          </button>

          {variant === "find" && (
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
            {totalValue !== null ? `NPR ${totalValue.toLocaleString()}` : "N/A"}
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
