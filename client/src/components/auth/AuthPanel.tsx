"use client";

import { useState } from "react";
import { EverestLogo } from "../EverestLogo";
import { AuthTabs } from "./AuthTabs";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string[];
}

interface AuthResponse {
  user?: User;
  data?: User;
  token: string;
}

interface AuthError {
  message?: string;
}

interface AuthPanelProps {
  initialTab?: "login" | "signup";
  onAuthSuccess?: (user: User, token: string) => void;
}

export const AuthPanel = ({
  initialTab = "login",
  onAuthSuccess,
}: AuthPanelProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data: AuthResponse = await response.json();

      if (response.ok) {
        const user = data.data || data.user;
        if (user && onAuthSuccess) {
          onAuthSuccess(user, data.token);
        }
      } else {
        const errorData = data as AuthError;
        setError(errorData.message || "Login failed. Please try again.");
      }
    } catch (_err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (formData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    roles: string[];
  }) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm,
            role: formData.roles,
          }),
        },
      );

      const data: AuthResponse = await response.json();

      if (response.ok) {
        const user = data.data || data.user;
        if (user && onAuthSuccess) {
          onAuthSuccess(user, data.token);
        }
      } else {
        const errorData = data as AuthError;
        setError(errorData.message || "Registration failed. Please try again.");
      }
    } catch (_err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full lg:w-[400px]">
      {/* Mobile Logo */}
      <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
        <EverestLogo className="h-10 w-10" />
        <span className="heading-2">Neplance</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="heading-2">
          {activeTab === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-muted mt-4">
          {activeTab === "login"
            ? "Enter your credentials to continue"
            : "Start your freelancing journey"}
        </p>
      </div>

      {/* Error Message */}
      {error && <div className="card-error mb-6 text-sm">{error}</div>}

      {/* Tabs */}
      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Forms */}
      <div className="mb-8">
        {activeTab === "login" ? (
          <LoginForm onSubmit={handleLoginSubmit} loading={loading} />
        ) : (
          <SignupForm onSubmit={handleSignupSubmit} loading={loading} />
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-muted text-sm">
        {activeTab === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          type="button"
          onClick={() =>
            setActiveTab(activeTab === "login" ? "signup" : "login")
          }
          className="text-primary font-medium hover:underline"
          disabled={loading}
        >
          {activeTab === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
};
