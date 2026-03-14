"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { Navbar } from "@/shared/components/Navbar";

const toCsv = (value = []) => (Array.isArray(value) ? value.join(", ") : "");

const createPortfolioItemId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
        id: item?._id || item?.id || createPortfolioItemId(),
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

const INITIAL_ACTION_STATE = {
  message: "",
  errors: {},
};

export function EditProfilePageClient({ initialUser }) {
  const router = useRouter();
  const user = initialUser;
  const activeRole = user?.role?.[0] || "freelancer";
  const [formData, setFormData] = useState(makeInitialForm(initialUser));
  const [actionState, formAction, isPending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );

  const roleLabel = activeRole || user?.role?.[0] || "freelancer";
  const isFreelancerProfile = roleLabel === "freelancer";
  const actionErrors = actionState?.errors || {};

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handlePortfolioChange = (index, field, value) => {
    setFormData((previous) => {
      const nextPortfolio = [...previous.portfolio];
      nextPortfolio[index] = { ...nextPortfolio[index], [field]: value };
      return { ...previous, portfolio: nextPortfolio };
    });
  };

  const addPortfolioItem = () => {
    setFormData((previous) => ({
      ...previous,
      portfolio: [
        ...previous.portfolio,
        {
          id: createPortfolioItemId(),
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
    setFormData((previous) => ({
      ...previous,
      portfolio: previous.portfolio.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const serializedPayload = JSON.stringify(formData);

  return (
    <>
      <Navbar user={user} />
      <div className="dashboard">
        <div className="container section-sm">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="btn btn-ghost"
            style={{ marginBottom: "var(--space-4)", padding: 0 }}
          >
            Back to Profile
          </button>

          <div className="card">
            <h1 style={{ marginBottom: "var(--space-6)" }}>Edit Profile</h1>
            {actionState?.message && (
              <div
                className="card-error"
                style={{ marginBottom: "var(--space-4)" }}
              >
                {actionState.message}
              </div>
            )}
            <form id="profile-edit-form" action={formAction}>
              <input type="hidden" name="payload" value={serializedPayload} />
              <div
                className="grid grid-cols-2"
                style={{ gap: "var(--space-4)" }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">
                    Name
                  </label>
                  <input
                    id="profile-name"
                    className={`form-input ${actionErrors.name ? "form-input-error" : ""}`}
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">
                    Phone
                  </label>
                  <input
                    id="profile-phone"
                    className={`form-input ${actionErrors.phone ? "form-input-error" : ""}`}
                    value={formData.phone}
                    onChange={handleChange("phone")}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-avatar">
                  Avatar URL
                </label>
                <input
                  id="profile-avatar"
                  className={`form-input ${actionErrors.avatar ? "form-input-error" : ""}`}
                  value={formData.avatar}
                  onChange={handleChange("avatar")}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  className={`form-input ${actionErrors.bio ? "form-input-error" : ""}`}
                  rows={4}
                  maxLength={1000}
                  value={formData.bio}
                  onChange={handleChange("bio")}
                />
              </div>

              <h3 style={{ marginBottom: "var(--space-4)" }}>Location</h3>
              <div
                className="grid grid-cols-2"
                style={{ gap: "var(--space-4)" }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-address">
                    Address
                  </label>
                  <input
                    id="profile-address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange("address")}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-city">
                    City
                  </label>
                  <input
                    id="profile-city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange("city")}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-district">
                    District
                  </label>
                  <input
                    id="profile-district"
                    className="form-input"
                    value={formData.district}
                    onChange={handleChange("district")}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-province">
                    Province
                  </label>
                  <input
                    id="profile-province"
                    className="form-input"
                    value={formData.province}
                    onChange={handleChange("province")}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-lat">
                    Latitude
                  </label>
                  <input
                    id="profile-lat"
                    type="number"
                    step="any"
                    className="form-input"
                    value={formData.lat}
                    onChange={handleChange("lat")}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-lng">
                    Longitude
                  </label>
                  <input
                    id="profile-lng"
                    type="number"
                    step="any"
                    className="form-input"
                    value={formData.lng}
                    onChange={handleChange("lng")}
                  />
                </div>
              </div>

              {isFreelancerProfile && (
                <>
                  <h3 style={{ marginBottom: "var(--space-4)" }}>
                    Professional Details
                  </h3>
                  <div
                    className="grid grid-cols-2"
                    style={{ gap: "var(--space-4)" }}
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-skills">
                        Skills (comma separated)
                      </label>
                      <input
                        id="profile-skills"
                        className="form-input"
                        value={formData.skills}
                        onChange={handleChange("skills")}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-languages">
                        Languages (comma separated)
                      </label>
                      <input
                        id="profile-languages"
                        className="form-input"
                        value={formData.languages}
                        onChange={handleChange("languages")}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="profile-hourly-rate"
                      >
                        Hourly Rate (NPR)
                      </label>
                      <input
                        id="profile-hourly-rate"
                        type="number"
                        min="0"
                        className="form-input"
                        value={formData.hourlyRate}
                        onChange={handleChange("hourlyRate")}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="profile-experience"
                      >
                        Experience Level
                      </label>
                      <select
                        id="profile-experience"
                        className="form-select"
                        value={formData.experienceLevel}
                        onChange={handleChange("experienceLevel")}
                      >
                        <option value="entry">Entry</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-job-type">
                        Job Type Preference
                      </label>
                      <select
                        id="profile-job-type"
                        className="form-select"
                        value={formData.jobTypePreference}
                        onChange={handleChange("jobTypePreference")}
                      >
                        <option value="digital">Digital</option>
                        <option value="physical">Physical</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="profile-availability"
                      >
                        Availability Status
                      </label>
                      <select
                        id="profile-availability"
                        className="form-select"
                        value={formData.availabilityStatus}
                        onChange={handleChange("availabilityStatus")}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--space-4)",
                      marginTop: "var(--space-6)",
                    }}
                  >
                    <h3 style={{ marginBottom: 0 }}>Portfolio</h3>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={addPortfolioItem}
                    >
                      Add Project
                    </button>
                  </div>
                  {formData.portfolio.length === 0 && (
                    <p
                      className="text-light"
                      style={{ marginBottom: "var(--space-6)" }}
                    >
                      No portfolio projects yet.
                    </p>
                  )}

                  {formData.portfolio.map((item, index) => (
                    <div
                      key={item.id}
                      className="card-sm"
                      style={{ marginBottom: "var(--space-4)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "var(--space-3)",
                        }}
                      >
                        <strong>Project {index + 1}</strong>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => removePortfolioItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ gap: "var(--space-4)" }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor={`portfolio-title-${index}`}
                          >
                            Title
                          </label>
                          <input
                            id={`portfolio-title-${index}`}
                            className="form-input"
                            value={item.title}
                            onChange={(event) =>
                              handlePortfolioChange(
                                index,
                                "title",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor={`portfolio-url-${index}`}
                          >
                            Project URL
                          </label>
                          <input
                            id={`portfolio-url-${index}`}
                            className="form-input"
                            value={item.projectUrl}
                            onChange={(event) =>
                              handlePortfolioChange(
                                index,
                                "projectUrl",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor={`portfolio-desc-${index}`}
                        >
                          Description
                        </label>
                        <textarea
                          id={`portfolio-desc-${index}`}
                          className="form-input"
                          rows={3}
                          value={item.description}
                          onChange={(event) =>
                            handlePortfolioChange(
                              index,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div
                        className="grid grid-cols-2"
                        style={{ gap: "var(--space-4)" }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor={`portfolio-images-${index}`}
                          >
                            Image URLs (comma separated)
                          </label>
                          <input
                            id={`portfolio-images-${index}`}
                            className="form-input"
                            value={item.imageUrls}
                            onChange={(event) =>
                              handlePortfolioChange(
                                index,
                                "imageUrls",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor={`portfolio-skills-${index}`}
                          >
                            Skills (comma separated)
                          </label>
                          <input
                            id={`portfolio-skills-${index}`}
                            className="form-input"
                            value={item.skills}
                            onChange={(event) =>
                              handlePortfolioChange(
                                index,
                                "skills",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label
                          className="form-label"
                          htmlFor={`portfolio-date-${index}`}
                        >
                          Completed At
                        </label>
                        <input
                          id={`portfolio-date-${index}`}
                          type="date"
                          className="form-input"
                          value={item.completedAt}
                          onChange={(event) =>
                            handlePortfolioChange(
                              index,
                              "completedAt",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-8)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push("/profile")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="profile-edit-form"
                  className="btn btn-primary"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
