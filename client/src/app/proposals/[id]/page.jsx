"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/shared/navigation/Navbar";
import { Button } from "@/shared/ui/UI";
import { apiCall } from "@/services/api";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { formatStatus } from "@/shared/utils/job";

export default function ProposalDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout, switchRole } = useAuthGate({ mode: "none" });

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await apiCall(`/api/proposals/${id}`);
        setProposal(response.data);
      } catch (err) {
        setError(err.message || "Failed to load proposal");
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={logout} onRoleSwitch={switchRole} />
        <div className="dashboard">
          <div className="dashboard-content" style={{ textAlign: "center", padding: "var(--space-16)" }}>
            <div>Loading...</div>
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
          <div className="dashboard-content" style={{ textAlign: "center", padding: "var(--space-16)" }}>
            <div style={{ color: "var(--color-error)" }}>{error}</div>
            <Button variant="secondary" onClick={() => router.back()} style={{ marginTop: "var(--space-4)" }}>
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "accepted") return "badge-success";
    if (statusLower === "pending") return "badge-warning";
    if (statusLower === "rejected") return "badge-error";
    return "";
  };

  return (
    <>
      <Navbar user={user} onLogout={logout} onRoleSwitch={switchRole} />
      <div className="dashboard">
        <div className="dashboard-content">
          <div style={{ marginBottom: "var(--space-4)" }}>
            <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-semibold)", margin: 0 }}>
                Proposal
              </h1>
              <span className={`badge ${getStatusBadgeClass(proposal.status)}`}>
                {formatStatus(proposal.status)}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>Amount</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
                  NPR {proposal.amount?.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>Delivery</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)" }}>
                  {proposal.deliveryDays} days
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-1)" }}>Revisions</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-semibold)" }}>
                  {proposal.revisionsIncluded || 0}
                </div>
              </div>
            </div>

            {proposal.freelancer && (
              <div style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-2)" }}>Freelancer</div>
                <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-primary-lightest)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--font-weight-semibold)" }}>
                    {(proposal.freelancer.name || proposal.freelancer.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "var(--font-weight-medium)" }}>{proposal.freelancer.name || "Unknown"}</div>
                    {proposal.freelancer.email && <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)" }}>{proposal.freelancer.email}</div>}
                  </div>
                </div>
              </div>
            )}

            {proposal.coverLetter && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-2)" }}>Cover Letter</div>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", background: "var(--color-bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius)" }}>
                  {proposal.coverLetter}
                </p>
              </div>
            )}

            {proposal.attachments?.length > 0 && (
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--space-2)" }}>Attachments</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {proposal.attachments.map((attachment, index) => (
                    <a key={attachment || index} href={attachment} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", textDecoration: "none" }}>
                      📎 Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
