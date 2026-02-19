"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/shared/navigation/Navbar";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobModal } from "@/features/dashboard/components/JobModal";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useAuthGate } from "@/shared/hooks/useAuthGate";
import { useProfileData } from "@/features/dashboard/hooks/useProfileData";
import { apiCall } from "@/services/api";

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toCsv = (value = []) => (Array.isArray(value) ? value.join(", ") : "");

const makeInitialForm = (user) => ({
  name: user?.name || "",
  phone: user?.phone || "",
  avatar: user?.avatar || "",
  bio: user?.bio || "",
  address: user?.location?.address || "",
  city: user?.location?.city || "",
  district: user?.location?.district || "",
  province: user?.location?.province || "",
  lat: user?.location?.coordinates?.lat ?? "",
  lng: user?.location?.coordinates?.lng ?? "",
  skills: toCsv(user?.skills),
  hourlyRate: user?.hourlyRate ?? 0,
  experienceLevel: user?.experienceLevel || "entry",
  jobTypePreference: user?.jobTypePreference || "digital",
  availabilityStatus: user?.availabilityStatus || "available",
  languages: toCsv(user?.languages),
  portfolio: Array.isArray(user?.portfolio)
    ? user.portfolio.map((item) => ({
      title: item?.title || "",
      description: item?.description || "",
      imageUrls: toCsv(item?.imageUrls),
      projectUrl: item?.projectUrl || "",
      skills: toCsv(item?.skills),
      completedAt: item?.completedAt
        ? new Date(item.completedAt).toISOString().slice(0, 10)
        : "",
    }))
    : [],
});

export default function ProfilePage() {
  const { user, currentRole, isHydrated, logout, switchRole, updateUser } = useAuthGate({
    mode: "require-auth",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] = useState(makeInitialForm(null));
  const router = useRouter();

  const { completedJobs, loading } = useProfileData({ user, currentRole });

  useEffect(() => {
    if (user) {
      setFormData(makeInitialForm(user));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleRoleSwitch = (updatedUser) => {
    switchRole(updatedUser);
  };

  const handleViewDetails = (job) => setSelectedJob(job);
  const handleCloseModal = () => setSelectedJob(null);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePortfolioChange = (index, field, value) => {
    setFormData((prev) => {
      const nextPortfolio = [...prev.portfolio];
      nextPortfolio[index] = { ...nextPortfolio[index], [field]: value };
      return { ...prev, portfolio: nextPortfolio };
    });
  };

  const addPortfolioItem = () => {
    setFormData((prev) => ({
      ...prev,
      portfolio: [
        ...prev.portfolio,
        {
          title: "",
          description: "",
          imageUrls: "",
          projectUrl: "",
          skills: "",
          completedAt: "",
        },
      ],
    }));
  };

  const removePortfolioItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

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

  const handleCancel = () => {
    setFormData(makeInitialForm(user));
    setFormError("");
    setFormSuccess("");
    setIsEditing(false);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSaving(true);

    try {
      const location = {
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        province: formData.province.trim(),
      };

      const hasCoordinates = formData.lat !== "" || formData.lng !== "";
      if (hasCoordinates) {
        location.coordinates = {
          lat: formData.lat === "" ? undefined : Number(formData.lat),
          lng: formData.lng === "" ? undefined : Number(formData.lng),
        };
      }

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        avatar: formData.avatar.trim() || null,
        bio: formData.bio.trim(),
        location,
      };

      if (isFreelancerProfile) {
        payload.skills = parseCsv(formData.skills);
        payload.hourlyRate = Number(formData.hourlyRate) || 0;
        payload.experienceLevel = formData.experienceLevel;
        payload.jobTypePreference = formData.jobTypePreference;
        payload.availabilityStatus = formData.availabilityStatus;
        payload.languages = parseCsv(formData.languages);
        payload.portfolio = formData.portfolio.map((item) => ({
          title: item.title?.trim(),
          description: item.description?.trim(),
          imageUrls: parseCsv(item.imageUrls || ""),
          projectUrl: item.projectUrl?.trim(),
          skills: parseCsv(item.skills || ""),
          completedAt: item.completedAt || undefined,
        }));
      }

      const response = await apiCall("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updated = response?.data?.user;
      if (updated) {
        updateUser(updated);
      }

      setFormSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      setFormError(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || !user) return null;

  const averageRating = 0.0;
  const roleLabel = currentRole || user.role?.[0] || "freelancer";
  const isFreelancerProfile = roleLabel === "freelancer";

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
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
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

                <p className="text-light" style={{ marginBottom: "var(--space-6)" }}>
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

                <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "var(--space-3)" }}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="profile-edit-form"
                        className="btn btn-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Profile"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setFormError("");
                        setFormSuccess("");
                        setIsEditing(true);
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isFreelancerProfile && (
            <>
              <div className="card" style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{ marginBottom: "var(--space-4)" }}>Skills & Languages</h2>
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div style={{ marginBottom: "var(--space-2)", fontWeight: "var(--font-weight-medium)" }}>Skills</div>
                  {Array.isArray(user.skills) && user.skills.length > 0 ? (
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      {user.skills.map((skill) => (
                        <span key={skill} className="badge badge-success">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light">No skills added.</p>
                  )}
                </div>
                <div>
                  <div style={{ marginBottom: "var(--space-2)", fontWeight: "var(--font-weight-medium)" }}>Languages</div>
                  {Array.isArray(user.languages) && user.languages.length > 0 ? (
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      {user.languages.map((language) => (
                        <span key={language} className="badge badge-info">{language}</span>
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
                      <article key={`${item.title || "portfolio"}-${index}`} className="card-sm">
                        <h3 style={{ marginBottom: "var(--space-2)" }}>{item.title || "Untitled Project"}</h3>
                        <p className="text-light" style={{ marginBottom: "var(--space-3)" }}>
                          {item.description || "No description."}
                        </p>
                        {Array.isArray(item.skills) && item.skills.length > 0 && (
                          <div style={{ marginBottom: "var(--space-3)", display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                            {item.skills.map((skill) => (
                              <span className="badge badge-success" key={`${item.title}-${skill}`}>{skill}</span>
                            ))}
                          </div>
                        )}
                        {item.projectUrl && (
                          <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-primary">
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

          {isEditing && (
            <div className="card" style={{ marginBottom: "var(--space-8)" }}>
              <h2 style={{ marginBottom: "var(--space-6)" }}>Edit Profile</h2>

              {formError && <div className="card-error" style={{ marginBottom: "var(--space-4)" }}>{formError}</div>}
              {formSuccess && (
                <div
                  style={{
                    marginBottom: "var(--space-4)",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-primary-lightest)",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  {formSuccess}
                </div>
              )}

              <form id="profile-edit-form" onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-2" style={{ gap: "var(--space-4)" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-name">Name</label>
                    <input id="profile-name" className="form-input" value={formData.name} onChange={handleChange("name")} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">Phone</label>
                    <input id="profile-phone" className="form-input" value={formData.phone} onChange={handleChange("phone")} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-avatar">Avatar URL</label>
                  <input id="profile-avatar" className="form-input" value={formData.avatar} onChange={handleChange("avatar")} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-bio">Bio</label>
                  <textarea
                    id="profile-bio"
                    className="form-input"
                    rows={4}
                    maxLength={1000}
                    value={formData.bio}
                    onChange={handleChange("bio")}
                  />
                </div>

                <h3 style={{ marginBottom: "var(--space-4)" }}>Location</h3>
                <div className="grid grid-cols-2" style={{ gap: "var(--space-4)" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-address">Address</label>
                    <input id="profile-address" className="form-input" value={formData.address} onChange={handleChange("address")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-city">City</label>
                    <input id="profile-city" className="form-input" value={formData.city} onChange={handleChange("city")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-district">District</label>
                    <input id="profile-district" className="form-input" value={formData.district} onChange={handleChange("district")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-province">Province</label>
                    <input id="profile-province" className="form-input" value={formData.province} onChange={handleChange("province")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-lat">Latitude</label>
                    <input id="profile-lat" type="number" step="any" className="form-input" value={formData.lat} onChange={handleChange("lat")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-lng">Longitude</label>
                    <input id="profile-lng" type="number" step="any" className="form-input" value={formData.lng} onChange={handleChange("lng")} />
                  </div>
                </div>

                {isFreelancerProfile && (
                  <>
                    <h3 style={{ marginBottom: "var(--space-4)" }}>Professional Details</h3>
                    <div className="grid grid-cols-2" style={{ gap: "var(--space-4)" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-skills">Skills (comma separated)</label>
                        <input id="profile-skills" className="form-input" value={formData.skills} onChange={handleChange("skills")} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-languages">Languages (comma separated)</label>
                        <input id="profile-languages" className="form-input" value={formData.languages} onChange={handleChange("languages")} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-hourly-rate">Hourly Rate (NPR)</label>
                        <input id="profile-hourly-rate" type="number" min="0" className="form-input" value={formData.hourlyRate} onChange={handleChange("hourlyRate")} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-experience">Experience Level</label>
                        <select id="profile-experience" className="form-select" value={formData.experienceLevel} onChange={handleChange("experienceLevel")}>
                          <option value="entry">Entry</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-job-type">Job Type Preference</label>
                        <select id="profile-job-type" className="form-select" value={formData.jobTypePreference} onChange={handleChange("jobTypePreference")}>
                          <option value="digital">Digital</option>
                          <option value="physical">Physical</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="profile-availability">Availability Status</label>
                        <select id="profile-availability" className="form-select" value={formData.availabilityStatus} onChange={handleChange("availabilityStatus")}>
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                      <h3 style={{ marginBottom: 0 }}>Portfolio</h3>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addPortfolioItem}>
                        Add Project
                      </button>
                    </div>

                    {formData.portfolio.length === 0 && (
                      <p className="text-light" style={{ marginBottom: "var(--space-6)" }}>
                        No portfolio projects yet.
                      </p>
                    )}

                    {formData.portfolio.map((item, index) => (
                      <div key={`edit-portfolio-${index}`} className="card-sm" style={{ marginBottom: "var(--space-4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                          <strong>Project {index + 1}</strong>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removePortfolioItem(index)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2" style={{ gap: "var(--space-4)" }}>
                          <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                              className="form-input"
                              value={item.title}
                              onChange={(event) => handlePortfolioChange(index, "title", event.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Project URL</label>
                            <input
                              className="form-input"
                              value={item.projectUrl}
                              onChange={(event) => handlePortfolioChange(index, "projectUrl", event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={item.description}
                            onChange={(event) => handlePortfolioChange(index, "description", event.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2" style={{ gap: "var(--space-4)" }}>
                          <div className="form-group">
                            <label className="form-label">Image URLs (comma separated)</label>
                            <input
                              className="form-input"
                              value={item.imageUrls}
                              onChange={(event) => handlePortfolioChange(index, "imageUrls", event.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Skills (comma separated)</label>
                            <input
                              className="form-input"
                              value={item.skills}
                              onChange={(event) => handlePortfolioChange(index, "skills", event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Completed At</label>
                          <input
                            type="date"
                            className="form-input"
                            value={item.completedAt}
                            onChange={(event) => handlePortfolioChange(index, "completedAt", event.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </form>
            </div>
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
        </div>
      </div>

      {selectedJob && (
        <JobModal job={selectedJob} mode="view" onClose={handleCloseModal} />
      )}
    </>
  );
}