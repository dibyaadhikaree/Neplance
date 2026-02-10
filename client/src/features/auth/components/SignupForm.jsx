"use client";

import { useState } from "react";
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
  });
  const [selectedRoles, setSelectedRoles] = useState(new Set());

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
    onSubmit({ ...formData, roles: Array.from(selectedRoles) });
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
        required
        autoComplete="new-password"
        disabled={loading}
      />

      <div className="form-group">
        <label className="form-label">I want to:</label>
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
      </div>

      <Button type="submit" disabled={loading || !isValid}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};
