"use client";

interface AuthTabsProps {
  activeTab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
}

export const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
  return (
    <div className="tab-nav">
      <button
        type="button"
        onClick={() => onTabChange("login")}
        className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
        aria-selected={activeTab === "login"}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
        aria-selected={activeTab === "signup"}
      >
        Sign Up
      </button>
    </div>
  );
};
