"use client";

import { useState } from "react";
import { Button, Input } from "@/shared/ui/UI";
import {
  loginSchema,
  validateForm,
  getFieldError,
} from "@/shared/lib/validation";

export const LoginForm = ({ onSubmit, loading = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, data } = validateForm(loginSchema, {
      email,
      password,
    });

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={getFieldError(errors, "email")}
        required
        autoComplete="email"
        disabled={loading}
      />
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={getFieldError(errors, "password")}
        required
        autoComplete="current-password"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !email || !password}>
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
};
