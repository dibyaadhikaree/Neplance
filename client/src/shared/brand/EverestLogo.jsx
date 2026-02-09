export const EverestLogo = ({ className = "h-16 w-16" }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    fill="none"
    role="img"
    aria-label="Neplance Logo"
  >
    <polygon points="100,30 60,140 140,140" fill="var(--color-primary)" />
    <polygon points="60,140 40,140 70,90" fill="var(--color-secondary)" />
    <polygon points="140,140 160,140 130,90" fill="var(--color-tertiary)" />
  </svg>
);
