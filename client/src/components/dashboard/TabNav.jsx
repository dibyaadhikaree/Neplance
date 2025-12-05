// SVG Icons
export const ProposedIcon = () => (
  <svg
    className="panel-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const OngoingIcon = () => (
  <svg
    className="panel-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const AvailableIcon = () => (
  <svg
    className="panel-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export const TabNav = ({ activeTab, onTabChange }) => (
  <nav className="panel-tabs">
    <button
      type="button"
      role="tab"
      onClick={() => onTabChange("proposed")}
      className={`panel-tab ${activeTab === "proposed" ? "active" : ""}`}
      aria-selected={activeTab === "proposed"}
    >
      <ProposedIcon />
      <span>Proposed</span>
    </button>
    <button
      type="button"
      role="tab"
      onClick={() => onTabChange("ongoing")}
      className={`panel-tab ${activeTab === "ongoing" ? "active" : ""}`}
      aria-selected={activeTab === "ongoing"}
    >
      <OngoingIcon />
      <span>Ongoing</span>
    </button>
  </nav>
);
