"use client";

export const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--color-bg-secondary)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-1)",
        marginBottom: "var(--space-6)",
      }}
    >
      <button
        type="button"
        onClick={() => onTabChange("login")}
        style={{
          flex: 1,
          padding: "var(--space-3) var(--space-4)",
          fontSize: "var(--text-base)",
          fontWeight: activeTab === "login" 
            ? "var(--font-weight-semibold)" 
            : "var(--font-weight-medium)",
          color: activeTab === "login" ? "var(--color-primary)" : "var(--color-text-secondary)",
          backgroundColor: activeTab === "login" ? "var(--color-bg)" : "transparent",
          border: "none",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          boxShadow: activeTab === "login" ? "var(--shadow-sm)" : "none",
        }}
        aria-current={activeTab === "login" ? "page" : undefined}
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        style={{
          flex: 1,
          padding: "var(--space-3) var(--space-4)",
          fontSize: "var(--text-base)",
          fontWeight: activeTab === "signup" 
            ? "var(--font-weight-semibold)" 
            : "var(--font-weight-medium)",
          color: activeTab === "signup" ? "var(--color-primary)" : "var(--color-text-secondary)",
          backgroundColor: activeTab === "signup" ? "var(--color-bg)" : "transparent",
          border: "none",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          boxShadow: activeTab === "signup" ? "var(--shadow-sm)" : "none",
        }}
        aria-current={activeTab === "signup" ? "page" : undefined}
      >
        Sign Up
      </button>
    </div>
  );
};
