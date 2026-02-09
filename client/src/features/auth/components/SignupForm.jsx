"use client";

import { useState } from "react";
import { Button, Input } from "@/shared/ui/UI";

const ROLES = ["freelancer", "client"];

const RoleButton = ({ role, selected, disabled, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(role)}
    disabled={disabled}
    className={`btn border border-solid ${
      selected ? "btn-primary border-primary" : "btn-secondary border-border"
    }`}
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Full name"
        value={formData.name}
        onChange={updateField("name")}
        required
        autoComplete="name"
        disabled={loading}
      />
      <Input
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={updateField("email")}
        required
        autoComplete="email"
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={updateField("password")}
        required
        autoComplete="new-password"
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Confirm password"
        value={formData.passwordConfirm}
        onChange={updateField("passwordConfirm")}
        required
        autoComplete="new-password"
        disabled={loading}
      />

      <div className="space-y-3">
        <div className="input-label">Select your role</div>
        <div className="grid grid-cols-2 gap-3">
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
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
