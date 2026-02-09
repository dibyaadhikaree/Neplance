"use client";

export const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-nav">
      <button
        type="button"
        onClick={() => onTabChange("login")}
        className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
        aria-current={activeTab === "login" ? "page" : undefined}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
        aria-current={activeTab === "signup" ? "page" : undefined}
      >
        Sign Up
      </button>
    </div>
  );
};
