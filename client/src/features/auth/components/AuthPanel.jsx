"use client";

import { useState } from "react";
import { APIError, apiAuthCall } from "@/services/api";
import { AuthTabs } from "./AuthTabs";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export const AuthPanel = ({ initialTab = "login", onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (endpoint, body) => {
    setError("");
    setLoading(true);

    try {
      const data = await apiAuthCall(`/auth/${endpoint}`, body);
      const user = data.data?.user || data.user;

      if (user && onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (email, password) =>
    handleAuth("login", { email, password });

  const handleSignup = ({ name, email, password, passwordConfirm, roles }) =>
    handleAuth("register", {
      name,
      email,
      password,
      passwordConfirm,
      role: roles,
    });

  const isLogin = activeTab === "login";

  return (
    <div className="card" style={{ maxWidth: "480px", width: "100%" }}>
      {/* Header */}
      <div className="mb-6">
        <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--space-2)" }}>
          {isLogin ? "Log in to Neplance" : "Sign up for Neplance"}
        </h2>
        <p className="text-light">
          {isLogin
            ? "Welcome back! Please enter your details."
            : "Join the world's work marketplace"}
        </p>
      </div>

      {error && (
        <div 
          className="mb-6" 
          style={{ 
            padding: "var(--space-3) var(--space-4)", 
            backgroundColor: "#ffebee", 
            color: "var(--color-error)", 
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)"
          }}
        >
          {error}
        </div>
      )}

      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <SignupForm onSubmit={handleSignup} loading={loading} />
        )}
      </div>

      <div className="text-center text-light" style={{ marginTop: "var(--space-6)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--color-border-light)" }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setActiveTab(isLogin ? "signup" : "login")}
          className="text-primary font-medium"
          style={{
            textDecoration: "underline",
            backgroundColor: "transparent",
            border: "none",
            padding: 0,
          }}
          disabled={loading}
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>
    </div>
  );
};
