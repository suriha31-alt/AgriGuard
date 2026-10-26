
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FarmerDashboard.css";

const modules = [
  {
    number: "01",
    icon: "🌱",
    title: "Crop Recommendation",
    description:
      "Discover suitable crops based on your soil, nutrients, and farming conditions.",
    action: "Explore crops",
    path: "/crop-recommendation",
    color: "green",
  },
  {
    number: "02",
    icon: "🔬",
    title: "Disease Detection",
    description:
      "Check crop images for possible diseases and get helpful crop-health insights.",
    action: "Check crop health",
    path: "/disease",
    color: "lavender",
  },
  {
    number: "03",
    icon: "🌦️",
    title: "Weather Updates",
    description:
      "View weather information to help plan your daily farming activities.",
    action: "View weather",
    path: "/weather",
    color: "mint",
  },
  {
    number: "04",
    icon: "🏛️",
    title: "Government Schemes",
    description:
      "Explore agricultural support schemes and benefits available to farmers.",
    action: "Explore schemes",
    path: "/government-schemes",
    color: "purple",
  },
];

function FarmerDashboard({ user, profile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const farmerName =
    profile?.full_name ||
    profile?.name ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Farmer";

  const profileFields = [
    profile?.state,
    profile?.district,
    profile?.land_size,
    profile?.crop_type,
    profile?.farming_type,
  ];

  const completedFields = profileFields.filter(
    (field) =>
      field !== undefined &&
      field !== null &&
      String(field).trim() !== ""
  ).length;

  const profileProgress = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const openProfile = () => {
    navigate("/dashboard?editProfile=true");
  };

  return (
    <main className="agri-dashboard">
      {/* Minimal header */}
      <header className="agri-header">
        <button
          type="button"
          className="agri-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="AgriGuard home"
        >
          <span className="agri-brand-mark" aria-hidden="true">
            🌿
          </span>
          <span className="agri-brand-copy">
            <strong>AgriGuard</strong>
            <small>SMART FARMING</small>
          </span>
        </button>

        <div className="agri-header-right">
          <div className="agri-user">
            <span className="agri-avatar" aria-hidden="true">
              {farmerName.charAt(0).toUpperCase()}
            </span>
            <span className="agri-user-copy">
              <strong>{farmerName}</strong>
              <small>Farmer account</small>
            </span>
          </div>

          <button
            type="button"
            className="agri-profile-button"
            onClick={openProfile}
          >
            My profile
          </button>
        </div>
      </header>

      <div className="agri-main">
        {/* Welcome section */}
        <section className="agri-welcome">
          <div className="agri-welcome-content">
            <span className="agri-eyebrow">
              <span className="agri-eyebrow-dot" />
              YOUR FARMING COMPANION
            </span>

            <h1>
              A better day
              <br />
              <span>starts on your farm.</span>
            </h1>

            <p>
              Welcome back, <strong>{farmerName}</strong>! Make smarter
              farming decisions with practical tools designed to support
              your farm, your crops, and your future.
            </p>

            <button
              type="button"
              className="agri-primary-button"
              onClick={() => navigate("/crop-recommendation")}
            >
              Get started <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="agri-welcome-art" aria-hidden="true">
            <div className="agri-art-orbit agri-art-orbit-one" />
            <div className="agri-art-orbit agri-art-orbit-two" />
            <span className="agri-art-sun">☀</span>
            <span className="agri-art-cloud">☁</span>
            <div className="agri-art-hill agri-art-hill-back" />
            <div className="agri-art-hill agri-art-hill-front" />
            <span className="agri-art-leaf agri-art-leaf-one">🌿</span>
            <span className="agri-art-leaf agri-art-leaf-two">🌱</span>
            <span className="agri-art-leaf agri-art-leaf-three">🌾</span>
          </div>

          <span className="agri-welcome-decoration" aria-hidden="true">
            ✳
          </span>
        </section>

        {/* Main module cards */}
        <section className="agri-modules-section">
          <div className="agri-section-heading">
            <div>
              <span className="agri-section-eyebrow">MADE FOR YOUR FARM</span>
              <h2>Your farming toolkit</h2>
              <p>Everything you need, all in one place.</p>
            </div>

            <span className="agri-module-count">04 TOOLS</span>
          </div>

          <div className="agri-modules-grid">
            {modules.map((module) => (
              <article
                key={module.path}
                className={`agri-module-card agri-${module.color}`}
              >
                <div className="agri-module-top">
                  <span className="agri-module-icon" aria-hidden="true">
                    {module.icon}
                  </span>
                  <span className="agri-module-number">
                    {module.number}
                  </span>
                </div>

                <h3>{module.title}</h3>
                <p>{module.description}</p>

                <button
                  type="button"
                  className="agri-module-link"
                  onClick={() => navigate(module.path)}
                >
                  {module.action}
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Profile progress */}
        <section className="agri-profile-card">
          <div className="agri-profile-symbol" aria-hidden="true">
            👨‍🌾
          </div>

          <div className="agri-profile-info">
            <span className="agri-section-eyebrow">YOUR FARM PROFILE</span>
            <h2>Every farm has its own story.</h2>
            <p>
              Keep your farming details updated to help personalize your
              AgriGuard experience.
            </p>

            <div
              className="agri-progress-track"
              role="progressbar"
              aria-label="Farmer profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileProgress}
            >
              <span style={{ width: `${profileProgress}%` }} />
            </div>

            <div className="agri-progress-caption">
              <span>
                {profileProgress === 100
                  ? "Your key profile details are complete."
                  : "Complete your details for a more personalized experience."}
              </span>
              <strong>{profileProgress}%</strong>
            </div>
          </div>

          <button
            type="button"
            className="agri-profile-link"
            onClick={openProfile}
            aria-label="Review your farmer profile"
          >
            →
          </button>
        </section>

        {/* Footer */}
        <footer className="agri-footer">
          <div className="agri-footer-brand">
            <span aria-hidden="true">🌿</span>
            <strong>AgriGuard</strong>
          </div>
          <span>Growing a smarter, greener tomorrow.</span>
        </footer>
      </div>
    </main>
  );
}

export default FarmerDashboard;
