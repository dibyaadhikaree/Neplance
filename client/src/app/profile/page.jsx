"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { useProfileData } from "@/features/dashboard/hooks/useProfileData";

export default function ProfilePage() {
  const { user, currentRole, isHydrated, logout, switchRole } = useAuthGate({
    mode: "require-auth",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const router = useRouter();

  const { completedJobs, loading } = useProfileData({ user, currentRole });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleRoleSwitch = (updatedUser) => {
    switchRole(updatedUser);
  };

  const handleViewDetails = (job) => setSelectedJob(job);
  const handleCloseModal = () => setSelectedJob(null);

  if (!isHydrated || !user) return null;

  const averageRating = 0.0;
  const roleLabel = currentRole || user.role?.[0] || "freelancer";

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />

      <div className="dashboard">
        <div className="container section-sm">
          {/* Profile Header */}
          <div className="card" style={{ marginBottom: "var(--space-8)" }}>
            <div
              style={{
                display: "flex",
                gap: "var(--space-8)",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-lightest)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-5xl)",
                  fontWeight: "var(--font-weight-bold)",
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ marginBottom: "var(--space-2)" }}>{user.name}</h1>
                <p
                  className="text-light"
                  style={{ marginBottom: "var(--space-6)" }}
                >
                  {user.email}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-8)",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-light)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Role
                    </div>
                    <span className="badge badge-success">{roleLabel}</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-light)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Completed Projects
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-2xl)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {completedJobs.length}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-light)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Rating
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-2xl)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {averageRating > 0 ? `${averageRating} /5` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Projects */}
          <div>
            <h2 style={{ marginBottom: "var(--space-6)" }}>
              Completed Projects
            </h2>

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
                  Loading...
                </div>
              </div>
            ) : completedJobs.length > 0 ? (
              <div className="cards-list">
                {completedJobs.map((job) => (
                  <div key={job._id}>
                    <JobCard
                      job={job}
                      variant="default"
                      onViewDetails={handleViewDetails}
                    />
                    {job.review && (
                      <div
                        className="card"
                        style={{
                          marginTop: "var(--space-3)",
                          backgroundColor: "var(--color-bg-secondary)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: "var(--font-weight-medium)",
                                marginBottom: "var(--space-2)",
                              }}
                            >
                              Client Review
                            </div>
                            <p className="text-light">
                              &ldquo;{job.review.comment}&rdquo;
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: "var(--text-xl)",
                              color: "var(--color-warning)",
                            }}
                          >
                            {"*".repeat(job.review.rating)}
                            <span style={{ color: "var(--color-border)" }}>
                              {"*".repeat(5 - job.review.rating)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                <EmptyState
                  title="No Completed Projects"
                  description="Projects you complete will appear here with their reviews."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobModal job={selectedJob} mode="view" onClose={handleCloseModal} />
      )}
    </>
  );
}