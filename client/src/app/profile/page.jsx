"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { useProfileData } from "@/features/dashboard/hooks/useProfileData";
import { apiCall } from "@/services/api";

export default function ProfilePage() {
  const { user, currentRole, isHydrated, logout, switchRole } =
    useAuthGate({
      mode: "require-auth",
    });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");
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

  const profileLocation = useMemo(() => {
    if (!user?.location) return "N/A";
    const values = [
      user.location.address,
      user.location.city,
      user.location.district,
      user.location.province,
    ].filter(Boolean);
    return values.length ? values.join(", ") : "N/A";
  }, [user]);

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      await apiCall("/api/users/me", { method: "DELETE" });
      await logout();
      router.push("/");
    } catch (error) {
      setDeactivateError(error.message || "Failed to deactivate account.");
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  if (!isHydrated || !user) return null;

  const averageRating = 0.0;
  const roleLabel = currentRole || user.role?.[0] || "freelancer";
  const isFreelancerProfile = roleLabel === "freelancer";

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
      />

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
                  backgroundColor: user.avatar
                    ? "transparent"
                    : "var(--color-primary-lightest)",
                  color: "var(--color-primary)",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--text-5xl)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ marginBottom: "var(--space-2)" }}>{user.name}</h1>
                <p
                  className="text-light"
                  style={{ marginBottom: "var(--space-6)" }}
                >
                  {user.email}
                </p>

                <p
                  className="text-light"
                  style={{ marginBottom: "var(--space-6)" }}
                >
                  {user.bio || "No bio added yet."}
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
                      Phone
                    </div>
                    <div>{user.phone || "N/A"}</div>
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
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-light)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Location
                    </div>
                    <div>{profileLocation}</div>
                  </div>
                  {isFreelancerProfile && (
                    <>
                      <div>
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-light)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          Hourly Rate
                        </div>
                        <div>NPR {user.hourlyRate || 0}</div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-light)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          Experience
                        </div>
                        <div>{user.experienceLevel || "entry"}</div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-light)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          Job Type
                        </div>
                        <div>{user.jobTypePreference || "digital"}</div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-light)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          Availability
                        </div>
                        <span className="badge badge-primary">
                          {user.availabilityStatus || "available"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "var(--space-6)",
                    display: "flex",
                    gap: "var(--space-3)",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => router.push("/profile/edit")}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isFreelancerProfile && (
            <>
              <div className="card" style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{ marginBottom: "var(--space-4)" }}>
                  Skills & Languages
                </h2>
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div
                    style={{
                      marginBottom: "var(--space-2)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Skills
                  </div>
                  {Array.isArray(user.skills) && user.skills.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-2)",
                        flexWrap: "wrap",
                      }}
                    >
                      {user.skills.map((skill) => (
                        <span key={skill} className="badge badge-success">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light">No skills added.</p>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      marginBottom: "var(--space-2)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Languages
                  </div>
                  {Array.isArray(user.languages) &&
                  user.languages.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-2)",
                        flexWrap: "wrap",
                      }}
                    >
                      {user.languages.map((language) => (
                        <span key={language} className="badge badge-info">
                          {language}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light">No languages added.</p>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{ marginBottom: "var(--space-4)" }}>Portfolio</h2>
                {Array.isArray(user.portfolio) && user.portfolio.length > 0 ? (
                  <div style={{ display: "grid", gap: "var(--space-4)" }}>
                    {user.portfolio.map((item, index) => (
                      <article
                        key={`${item.title || "portfolio"}-${index}`}
                        className="card-sm"
                      >
                        <h3 style={{ marginBottom: "var(--space-2)" }}>
                          {item.title || "Untitled Project"}
                        </h3>
                        <p
                          className="text-light"
                          style={{ marginBottom: "var(--space-3)" }}
                        >
                          {item.description || "No description."}
                        </p>
                        {Array.isArray(item.skills) &&
                          item.skills.length > 0 && (
                            <div
                              style={{
                                marginBottom: "var(--space-3)",
                                display: "flex",
                                gap: "var(--space-2)",
                                flexWrap: "wrap",
                              }}
                            >
                              {item.skills.map((skill) => (
                                <span
                                  className="badge badge-success"
                                  key={`${item.title}-${skill}`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary"
                          >
                            Visit Project
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-light">No portfolio projects added.</p>
                )}
              </div>
            </>
          )}

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

          {/* Account Danger Zone */}
          <div style={{ marginTop: "var(--space-12)" }}>
            <div
              className="card"
              style={{
                border: "1px solid var(--color-error)",
              }}
            >
              <h3
                style={{
                  marginBottom: "var(--space-2)",
                  color: "var(--color-error)",
                }}
              >
                Danger Zone
              </h3>
              <p className="text-light" style={{ marginBottom: "var(--space-4)" }}>
                Once you deactivate your account, you will not be able to log in
                or access your profile. Your data will be soft-deleted and hidden
                from other users.
              </p>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: "var(--color-error)",
                  color: "white",
                }}
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobModal job={selectedJob} mode="view" onClose={handleCloseModal} />
      )}

      {showDeactivateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !isDeactivating && setShowDeactivateModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "var(--space-4)" }}>
              Deactivate Account?
            </h3>
            <p className="text-light" style={{ marginBottom: "var(--space-6)" }}>
              Are you sure you want to deactivate your account? This action cannot
              be undone. You will be logged out immediately.
            </p>
            {deactivateError && (
              <div className="card-error" style={{ marginBottom: "var(--space-4)" }}>
                {deactivateError}
              </div>
            )}
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: "var(--color-error)",
                  color: "white",
                }}
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
              >
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
