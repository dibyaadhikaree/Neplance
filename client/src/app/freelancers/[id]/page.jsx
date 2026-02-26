"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/services/api";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { Navbar } from "@/shared/navigation/Navbar";

export default function FreelancerProfilePage() {
  const params = useParams();
  const { user, isHydrated, logout, switchRole } = useAuthGate({
    mode: "require-auth",
    redirectTo: "/",
  });
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/users/freelancers/${params.id}`);
        if (data.status === "success") {
          setFreelancer(data.data);
        } else {
          setError(data.message || "Freelancer not found");
        }
      } catch (_err) {
        setError("Failed to load freelancer profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchFreelancer();
    }
  }, [params.id]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleRoleSwitch = (updatedUser) => {
    switchRole(updatedUser);
    if (updatedUser?.role?.[0] === "freelancer") {
      router.push("/jobs");
    }
  };

  const profileLocation = (() => {
    if (!freelancer?.location) return "N/A";
    const values = [
      freelancer.location.address,
      freelancer.location.city,
      freelancer.location.district,
      freelancer.location.province,
    ].filter(Boolean);
    return values.length ? values.join(", ") : "N/A";
  })();

  if (!isHydrated) return null;

  if (loading) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleSwitch}
        />
        <div className="dashboard">
          <div
            className="container section-sm"
            style={{ textAlign: "center", padding: "var(--space-16)" }}
          >
            <div
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-primary)",
              }}
            >
              Loading profile...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !freelancer) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleSwitch}
        />
        <div className="dashboard">
          <div
            className="container section-sm"
            style={{ textAlign: "center", padding: "var(--space-16)" }}
          >
            <h2 style={{ marginBottom: "var(--space-4)" }}>
              Freelancer Not Found
            </h2>
            <p
              className="text-light"
              style={{ marginBottom: "var(--space-6)" }}
            >
              {error || "This profile may not exist or has been deactivated."}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push("/talent")}
            >
              Browse Freelancers
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
      />

      <div className="dashboard">
        <div className="container section-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost"
            style={{ marginBottom: "var(--space-4)", padding: 0 }}
          >
            ← Back
          </button>

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
                  backgroundColor: freelancer.avatar
                    ? "transparent"
                    : "var(--color-primary-lightest)",
                  color: "var(--color-primary)",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {freelancer.avatar ? (
                  <Image
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    width={120}
                    height={120}
                    unoptimized
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
                    {freelancer.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h1 style={{ marginBottom: "var(--space-2)" }}>
                      {freelancer.name}
                    </h1>
                    <p
                      className="text-light"
                      style={{ marginBottom: "var(--space-4)" }}
                    >
                      {freelancer.email}
                    </p>
                  </div>
                  <span className="badge badge-success">
                    {freelancer.availabilityStatus || "available"}
                  </span>
                </div>

                <p
                  className="text-light"
                  style={{ marginBottom: "var(--space-6)" }}
                >
                  {freelancer.bio || "No bio added yet."}
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
                      Hourly Rate
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xl)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      NPR {freelancer.hourlyRate || 0}
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
                      Experience
                    </div>
                    <div style={{ textTransform: "capitalize" }}>
                      {freelancer.experienceLevel || "entry"}
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
                      Job Type
                    </div>
                    <div style={{ textTransform: "capitalize" }}>
                      {freelancer.jobTypePreference || "digital"}
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
                </div>
              </div>
            </div>
          </div>

          {freelancer.skills?.length > 0 && (
            <div className="card" style={{ marginBottom: "var(--space-8)" }}>
              <h2 style={{ marginBottom: "var(--space-4)" }}>Skills</h2>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                {freelancer.skills.map((skill) => (
                  <span key={skill} className="badge badge-success">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {freelancer.languages?.length > 0 && (
            <div className="card" style={{ marginBottom: "var(--space-8)" }}>
              <h2 style={{ marginBottom: "var(--space-4)" }}>Languages</h2>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                {freelancer.languages.map((language) => (
                  <span key={language} className="badge badge-info">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {freelancer.portfolio?.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: "var(--space-4)" }}>Portfolio</h2>
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                {freelancer.portfolio.map((item, index) => (
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
                    {item.skills?.length > 0 && (
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
