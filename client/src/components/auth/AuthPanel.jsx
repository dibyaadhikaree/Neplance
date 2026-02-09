"use client";

import { useState } from "react";
import { APIError, apiAuthCall } from "@/services/api";
import { EverestLogo } from "../EverestLogo";
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
    <div className="card w-full lg:w-[400px]">
      {/* Mobile Logo */}
      <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
        <EverestLogo className="h-10 w-10" />
        <span className="heading-2">Neplance</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="heading-2">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-muted mt-4">
          {isLogin
            ? "Enter your credentials to continue"
            : "Start your freelancing journey"}
        </p>
      </div>

      {error && <div className="card-error mb-6 text-sm">{error}</div>}

      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mb-8">
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <SignupForm onSubmit={handleSignup} loading={loading} />
        )}
      </div>

      <p className="text-center text-muted text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setActiveTab(isLogin ? "signup" : "login")}
          className="text-primary font-medium hover:underline"
          disabled={loading}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
};
