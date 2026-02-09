"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { Header } from "@/features/dashboard/components/Header";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { apiCall } from "@/services/api";
import "../../styles/dashboard.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedJob, setSelectedJob] = useState(null);

  const router = useRouter();

  // Load user from server initially
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiCall("/auth/me");
        if (data.data?.user) {
          setUser(data.data.user);
        } else {
          router.push("/");
        }
      } catch (_error) {
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check active role (first in array)
      const isFreelancer = user.role?.[0] === "freelancer";
      let completed = [];

      if (isFreelancer) {
        // Token is handled by HttpOnly cookie
        const proposalsData = await apiCall("/proposals/myProposals");
        if (proposalsData.status === "success") {
          completed = proposalsData.data
            .filter(
              (p) =>
                p.status === "accepted" &&
                p.job &&
                p.job.status === "COMPLETED",
            )
            .map((p) => ({
              ...p.job,
              status: p.job.status,
              // Since we don't have a review API, we'll attach a null review property
              // which can be populated later if API allows
              review: null,
            }));
        }
      } else {
        const jobsData = await apiCall("/jobs/myJobs");
        if (jobsData.status === "success") {
          completed = jobsData.data
            .filter((job) => job.status === "COMPLETED")
            .map((job) => ({
              ...job,
              review: null,
            }));
        }
      }

      setCompletedJobs(completed);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  const handleLogout = async () => {
    try {
      await apiCall("/auth/logout");
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/");
    }
  };

  const handleRoleSwitch = (updatedUser) => {
    setUser(updatedUser);
    fetchProfileData();
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  if (!user) return null;

  // Calculate generic stats
  // Note: Rating is mocked as 0 until backend supports it
  const averageRating = 0.0;
  const currentRole = user.role?.[0] || "freelancer";

  return (
    <div className="dashboard">
      <Header
        user={user}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
      />

      <main className="profile-container">
        {/* Top Section: Profile Header */}
        <section className="profile-header-section">
          {/* 1. Big Profile Picture */}
          <div className="profile-header-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* 2. Horizontal Axis Info */}
          <div className="profile-header-info">
            <div className="profile-info-item">
              <span className="profile-info-label">Name</span>
              <span className="profile-info-value">{user.name}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value" style={{ fontSize: "1rem" }}>
                {user.email}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Current Role</span>
              <span className="profile-role-badge">{currentRole}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Completed Works</span>
              <span className="profile-info-value">{completedJobs.length}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Rating</span>
              <span className="profile-info-value">
                {averageRating > 0 ? averageRating : "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Lower Half: Completed Contracts */}
        <section className="completed-jobs-section">
          <h2 className="section-title">Completed Contracts</h2>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading profile data...
            </div>
          ) : completedJobs.length > 0 ? (
            completedJobs.map((job) => (
              <div key={job._id} className="job-review-row">
                {/* Left Side: Job Card */}
                <div className="job-column">
                  <JobCard
                    job={job}
                    variant="default"
                    onViewDetails={handleViewDetails}
                  />
                </div>

                {/* Right Side: Rating & Review */}
                <div className="review-column">
                  <div className="review-card">
                    {job.review ? (
                      <div className="review-content">
                        <div className="review-header">
                          <span className="profile-info-label">
                            Client Review
                          </span>
                          <div className="review-rating">
                            {"★".repeat(job.review.rating)}
                            <span style={{ color: "var(--color-border)" }}>
                              {"★".repeat(5 - job.review.rating)}
                            </span>
                          </div>
                        </div>
                        <p className="review-comment">"{job.review.comment}"</p>
                      </div>
                    ) : (
                      <div className="review-placeholder">
                        No review available for this job
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Completed Contracts"
              description="Contracts you have successfully completed will appear here along with their reviews."
            />
          )}
        </section>
      </main>

      {/* Contract Details Modal for Profile */}
      {selectedJob && (
        <JobModal job={selectedJob} mode="view" onClose={handleCloseModal} />
      )}
    </div>
  );
}
