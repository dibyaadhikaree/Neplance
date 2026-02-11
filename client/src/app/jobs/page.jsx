"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { useFreelancerDashboard } from "@/features/dashboard/hooks/useFreelancerDashboard";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { apiCall } from "@/services/api";
import { useAuthGate } from "@/shared/hooks/useAuthGate";

export default function JobsPage() {
  const { user, isHydrated, logout, switchRole } = useAuthGate({ mode: "none" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  const { availableJobs, loading, error, refetch } = useFreelancerDashboard();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleRoleSwitch = (updatedUser) => {
    switchRole(updatedUser);
    // If switching to client, redirect to talent page
    if (updatedUser?.role?.[0] === "client") {
      router.push("/talent");
    }
  };

  const handleOpenProposalModal = (job) => {
    if (!user) {
      router.push("/");
      return;
    }
    setModalMode("proposal");
    setSelectedJob(job);
  };

  const handleViewJobDetails = (job) => {
    setModalMode("view");
    setSelectedJob(job);
  };

  const handleCloseModal = () => setSelectedJob(null);

  const handleSubmitProposal = async (proposalData) => {
    setSubmitting(true);
    try {
      await apiCall("/proposals", {
        method: "POST",
        body: JSON.stringify(proposalData),
      });
      setSelectedJob(null);
      refetch?.();
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedQuery = searchQuery.toLowerCase();
  const filteredJobs = availableJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.description?.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      categoryFilter === "all" || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isHydrated) return null;

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />

      <div className="dashboard">
        {/* Hero */}
        <section
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid var(--color-border-light)",
            padding: "var(--space-12) 0",
          }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "var(--text-5xl)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-4)",
              }}
            >
              Find Your Next{" "}
              <span style={{ color: "var(--color-primary)" }}>Opportunity</span>
            </h1>
            <p
              className="text-light"
              style={{
                fontSize: "var(--text-xl)",
                maxWidth: "700px",
                margin: "0 auto var(--space-8)",
              }}
            >
              Browse thousands of projects and connect with clients looking for
              your skills
            </p>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <input
                  type="text"
                  placeholder="Search for jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary">Search</button>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <div className="container section-sm">
          <div style={{ display: "flex", gap: "var(--space-8)" }}>
            {/* Filters Sidebar */}
            <aside style={{ width: "250px", flexShrink: 0 }}>
              <div className="card">
                <h3 style={{ marginBottom: "var(--space-4)" }}>Filters</h3>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="web-dev">Web Development</option>
                    <option value="mobile-dev">Mobile Development</option>
                    <option value="design">Design & Creative</option>
                    <option value="writing">Writing & Translation</option>
                    <option value="marketing">Marketing & Sales</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Jobs Grid */}
            <div style={{ flex: 1 }}>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-16)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--text-xl)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-primary)",
                    }}
                  >
                    Loading jobs...
                  </div>
                </div>
              ) : error ? (
                <div
                  className="card"
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                  }}
                >
                  <div
                    style={{
                      color: "var(--color-error)",
                      fontWeight: "var(--font-weight-semibold)",
                    }}
                  >
                    {error}
                  </div>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="cards-list">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      variant="find"
                      onSubmitProposal={handleOpenProposalModal}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                  }}
                >
                  <h3 style={{ marginBottom: "var(--space-3)" }}>
                    No jobs found
                  </h3>
                  <p className="text-light">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          mode={modalMode}
          onSubmit={handleSubmitProposal}
          onClose={handleCloseModal}
          loading={submitting}
          userRole={user?.role?.[0]}
        />
      )}
    </>
  );
}
