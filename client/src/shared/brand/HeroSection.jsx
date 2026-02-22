export const HeroSection = () => (
  <div className="hero">
    <div className="container">
      <h1 className="hero-title">
        How the world <span className="text-primary">works</span>
      </h1>
      <p className="hero-subtitle">
        Connect with world-class talent or find your next opportunity on the
        leading work marketplace
      </p>
      <div className="hero-cta">
        <a href="#hire-talent" className="btn btn-primary btn-lg">
          Hire a Freelancer
        </a>
        <a href="#find-opportunities" className="btn btn-secondary btn-lg">
          Find Work
        </a>
      </div>
      <div
        style={{
          marginTop: "var(--space-10)",
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-12)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-primary)",
            }}
          >
            10K+
          </div>
          <div className="text-light">Active Freelancers</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-primary)",
            }}
          >
            5K+
          </div>
          <div className="text-light">Projects Completed</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-primary)",
            }}
          >
            98%
          </div>
          <div className="text-light">Client Satisfaction</div>
        </div>
      </div>
    </div>
  </div>
);

// How It Works Section
export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Post your job",
      description: "Tell us what you need. It's free and takes just minutes",
    },
    {
      number: "2",
      title: "Review proposals",
      description:
        "Get qualified proposals within 24 hours from talented freelancers",
    },
    {
      number: "3",
      title: "Start working",
      description: "Hire the best fit and collaborate on our secure platform",
    },
  ];

  return (
    <section className="section" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ marginBottom: "var(--space-4)" }}>How Neplance works</h2>
          <p
            className="text-light"
            style={{
              fontSize: "var(--text-lg)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Getting started is simple and only takes a few minutes
          </p>
        </div>
        <div className="grid grid-cols-3" style={{ gap: "var(--space-8)" }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{ textAlign: "center", position: "relative" }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-lightest)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-3xl)",
                  fontWeight: "var(--font-weight-bold)",
                  margin: "0 auto var(--space-4)",
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  marginBottom: "var(--space-3)",
                  fontSize: "var(--text-xl)",
                }}
              >
                {step.title}
              </h3>
              <p className="text-light">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content:
        "Neplance helped us find the perfect developer for our project. The quality of talent is exceptional.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      company: "Independent",
      content:
        "I've been able to grow my freelance business significantly through Neplance. Great clients, fair payments.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "CEO",
      company: "StartupXYZ",
      content:
        "The platform makes it easy to manage projects and communicate with freelancers. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <section
      className="section"
      style={{ backgroundColor: "var(--color-bg-light)" }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ marginBottom: "var(--space-4)" }}>
            Trusted by thousands worldwide
          </h2>
          <p className="text-light" style={{ fontSize: "var(--text-lg)" }}>
            See what our community has to say
          </p>
        </div>
        <div className="grid grid-cols-3" style={{ gap: "var(--space-6)" }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card" style={{ height: "100%" }}>
              <div
                style={{
                  marginBottom: "var(--space-4)",
                  color: "var(--color-warning)",
                }}
              >
                {"★".repeat(testimonial.rating)}
              </div>
              <p
                className="text-light"
                style={{ marginBottom: "var(--space-4)", fontStyle: "italic" }}
              >
                "{testimonial.content}"
              </p>
              <div
                style={{
                  paddingTop: "var(--space-4)",
                  borderTop: "1px solid var(--color-border-light)",
                }}
              >
                <div
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {testimonial.name}
                </div>
                <div
                  className="text-light"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
export const CategoriesSection = () => {
  const categories = [
    { name: "Web Development", icon: "</>", count: "2,500+" },
    { name: "Mobile Development", icon: "📲", count: "1,800+" },
    { name: "Design & Creative", icon: "✏", count: "3,200+" },
    { name: "Writing & Translation", icon: "✎", count: "1,500+" },
    { name: "Marketing & Sales", icon: "▣", count: "1,200+" },
    { name: "Admin & Support", icon: "☐", count: "900+" },
    { name: "Data Science", icon: "▲", count: "1,100+" },
    { name: "Engineering", icon: "⚙", count: "800+" },
  ];

  return (
    <section className="section" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ marginBottom: "var(--space-4)" }}>
            Explore talent by category
          </h2>
          <p className="text-light" style={{ fontSize: "var(--text-lg)" }}>
            Find the perfect professional for any job
          </p>
        </div>
        <div className="grid grid-cols-4" style={{ gap: "var(--space-4)" }}>
          {categories.map((category, index) => (
            <div
              key={index}
              className="card"
              style={{
                textAlign: "center",
                cursor: "pointer",
                transition: "all var(--transition-base)",
              }}
            >
              <div
                style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}
              >
                {category.icon}
              </div>
              <h4
                style={{
                  marginBottom: "var(--space-2)",
                  fontSize: "var(--text-lg)",
                }}
              >
                {category.name}
              </h4>
              <div
                className="text-light"
                style={{ fontSize: "var(--text-sm)" }}
              >
                {category.count} professionals
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
