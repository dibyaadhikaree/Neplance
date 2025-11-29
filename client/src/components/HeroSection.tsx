import { EverestLogo } from "./EverestLogo";

export const HeroSection = () => (
  <div className="hero-section">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <EverestLogo />
        <h1 className="heading-1">Neplance</h1>
      </div>

      {/* Title */}
      <div className="space-y-4">
        <h2 className="heading-1 leading-tight">
          The Future of
          <br />
          <span className="gradient-text">Freelance Work</span>
        </h2>
        <p className="text-secondary text-lg max-w-md">
          Connect with world-class talent. Build remarkable projects. Scale your
          business.
        </p>
      </div>

      {/* Mission */}
      <div
        style={{
          borderLeft: "2px solid var(--color-primary)",
          paddingLeft: "1.5rem",
        }}
      >
        <p className="input-label mb-3">Our Mission</p>
        <p className="text-primary">
          We're reshaping how work gets done. By removing intermediaries and
          enabling direct collaboration, we empower creators to achieve more and
          businesses to access unparalleled talent.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { title: "Verified", desc: "All profiles thoroughly vetted" },
          { title: "Global", desc: "Work with talent worldwide" },
          { title: "Secure", desc: "Based on blockchain technology" },
        ].map((f) => (
          <div key={f.title} className="card-sm card-hover">
            <div className="text-sm font-bold uppercase tracking-wide text-primary">
              {f.title}
            </div>
            <p className="text-muted mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
