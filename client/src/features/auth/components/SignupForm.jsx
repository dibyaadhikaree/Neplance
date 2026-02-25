"use client";

import { useState } from "react";
import {
  getFieldError,
  signupSchema,
  validateForm,
} from "@/shared/lib/validation";
import { Button, Input } from "@/shared/ui/UI";

const ROLES = ["freelancer", "client"];

const RoleButton = ({ role, selected, disabled, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(role)}
    disabled={disabled}
    className={selected ? "btn btn-primary" : "btn btn-secondary"}
    style={{ width: "100%" }}
    aria-pressed={selected}
  >
    {role.charAt(0).toUpperCase() + role.slice(1)}
  </button>
);

export const SignupForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    bio: "",
    city: "",
    district: "",
    province: "",
    skills: "",
    languages: "",
    hourlyRate: "0",
    experienceLevel: "entry",
    jobTypePreference: "digital",
    availabilityStatus: "available",
  });
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [errors, setErrors] = useState({});
  const isFreelancerSelected = selectedRoles.has("freelancer");

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parseCsv = (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const location = {
      city: formData.city.trim(),
      district: formData.district.trim(),
      province: formData.province.trim(),
    };

    const hasLocation = Object.values(location).some(Boolean);

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      phone: formData.phone.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      city: location.city || undefined,
      district: location.district || undefined,
      province: location.province || undefined,
      skills: isFreelancerSelected ? parseCsv(formData.skills) : undefined,
      languages: isFreelancerSelected
        ? parseCsv(formData.languages)
        : undefined,
      hourlyRate: isFreelancerSelected ? formData.hourlyRate : undefined,
      experienceLevel: isFreelancerSelected
        ? formData.experienceLevel
        : undefined,
      jobTypePreference: isFreelancerSelected
        ? formData.jobTypePreference
        : undefined,
      availabilityStatus: isFreelancerSelected
        ? formData.availabilityStatus
        : undefined,
      roles: Array.from(selectedRoles),
    };

    const { errors: validationErrors, data } = validateForm(
      signupSchema,
      submitData,
    );

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    const finalPayload = {
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      phone: data.phone,
      bio: data.bio,
      location: hasLocation ? location : undefined,
      skills: isFreelancerSelected ? parseCsv(formData.skills) : undefined,
      languages: isFreelancerSelected
        ? parseCsv(formData.languages)
        : undefined,
      hourlyRate: isFreelancerSelected
        ? Number(formData.hourlyRate) || 0
        : undefined,
      experienceLevel: isFreelancerSelected ? data.experienceLevel : undefined,
      jobTypePreference: isFreelancerSelected
        ? data.jobTypePreference
        : undefined,
      availabilityStatus: isFreelancerSelected
        ? data.availabilityStatus
        : undefined,
      roles: data.roles,
    };

    setErrors({});
    onSubmit(finalPayload);
  };

  const isValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.passwordConfirm &&
    selectedRoles.size > 0;

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={updateField("name")}
        error={getFieldError(errors, "name")}
        required
        autoComplete="name"
        disabled={loading}
      />
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={updateField("email")}
        error={getFieldError(errors, "email")}
        required
        autoComplete="email"
        disabled={loading}
      />
      <Input
        type="password"
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChange={updateField("password")}
        error={getFieldError(errors, "password")}
        required
        autoComplete="new-password"
        disabled={loading}
      />
      <Input
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.passwordConfirm}
        onChange={updateField("passwordConfirm")}
        error={getFieldError(errors, "passwordConfirm")}
        required
        autoComplete="new-password"
        disabled={loading}
      />

      <Input
        type="tel"
        label="Phone (optional)"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={updateField("phone")}
        error={getFieldError(errors, "phone")}
        autoComplete="tel"
        disabled={loading}
      />

      <div className="form-group">
        <label className="form-label" htmlFor="signup-bio">
          Bio (optional)
        </label>
        <textarea
          id="signup-bio"
          className="form-input"
          rows={3}
          placeholder="Tell clients about your background"
          value={formData.bio}
          onChange={updateField("bio")}
          maxLength={1000}
          disabled={loading}
        />
        {getFieldError(errors, "bio") && (
          <p
            className="form-error"
            style={{
              color: "var(--color-error)",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            {getFieldError(errors, "bio")}
          </p>
        )}
      </div>

      <Input
        type="text"
        label="City (optional)"
        placeholder="Your city"
        value={formData.city}
        onChange={updateField("city")}
        disabled={loading}
      />

      <Input
        type="text"
        label="District (optional)"
        placeholder="Your district"
        value={formData.district}
        onChange={updateField("district")}
        disabled={loading}
      />

      <Input
        type="text"
        label="Province (optional)"
        placeholder="Your province"
        value={formData.province}
        onChange={updateField("province")}
        disabled={loading}
      />

      {isFreelancerSelected && (
        <>
          <Input
            type="text"
            label="Skills (optional)"
            placeholder="React, Node.js, UI Design"
            value={formData.skills}
            onChange={updateField("skills")}
            disabled={loading}
          />

          <Input
            type="text"
            label="Languages (optional)"
            placeholder="English, Nepali, Hindi"
            value={formData.languages}
            onChange={updateField("languages")}
            disabled={loading}
          />

          <Input
            type="number"
            min="0"
            label="Hourly Rate in NPR (optional)"
            placeholder="0"
            value={formData.hourlyRate}
            onChange={updateField("hourlyRate")}
            disabled={loading}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="experience-level">
              Experience Level
            </label>
            <select
              id="experience-level"
              className="form-select"
              value={formData.experienceLevel}
              onChange={updateField("experienceLevel")}
              disabled={loading}
            >
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-type-preference">
              Job Type Preference
            </label>
            <select
              id="job-type-preference"
              className="form-select"
              value={formData.jobTypePreference}
              onChange={updateField("jobTypePreference")}
              disabled={loading}
            >
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="availability-status">
              Availability
            </label>
            <select
              id="availability-status"
              className="form-select"
              value={formData.availabilityStatus}
              onChange={updateField("availabilityStatus")}
              disabled={loading}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </>
      )}

      <fieldset className="form-group">
        <legend className="form-label" style={{ marginBottom: "0.5rem" }}>
          I want to:
        </legend>
        <div className="grid grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <RoleButton
              key={role}
              role={role}
              selected={selectedRoles.has(role)}
              disabled={loading}
              onClick={toggleRole}
            />
          ))}
        </div>
        {getFieldError(errors, "roles") && (
          <p
            className="form-error"
            style={{
              color: "var(--color-error)",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            {getFieldError(errors, "roles")}
          </p>
        )}
      </fieldset>

      <Button type="submit" disabled={loading || !isValid}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};
