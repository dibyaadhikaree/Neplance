"use client";

export const AuthTabs = ({ activeTab, onTabChange }) => {
  const tabStyle = (isActive) => ({
    flex: 1,
    padding: "var(--space-3) var(--space-4)",
    fontSize: "var(--text-base)",
    fontWeight: isActive
      ? "var(--font-weight-semibold)"
      : "var(--font-weight-medium)",
    color: isActive ? "var(--color-primary)" : "var(--color-text-light)",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: isActive
      ? "2px solid var(--color-primary)"
      : "2px solid var(--color-border-light)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  });

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "var(--space-6)",
        borderBottom: "1px solid var(--color-border-light)",
      }}
    >
      <button
        type="button"
        onClick={() => onTabChange("login")}
        style={tabStyle(activeTab === "login")}
        aria-current={activeTab === "login" ? "page" : undefined}
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        style={tabStyle(activeTab === "signup")}
        aria-current={activeTab === "signup" ? "page" : undefined}
      >
        Sign Up
      </button>
    </div>
  );
};
