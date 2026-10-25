
import { Link } from "react-router-dom";
import "./FarmerDashboard.css";

const modules = [
  {
    icon: "🌱",
    title: "Crop Recommendation",
    description: "Find suitable crops based on your farming conditions.",
    path: "/crop-recommendation",
    color: "green",
  },
  {
    icon: "🦠",
    title: "Disease Detection",
    description: "Identify possible crop diseases and view detection results.",
    path: "/disease",
    color: "orange",
  },
  {
    icon: "🧪",
    title: "Pesticide Assistance",
    description: "Explore treatment recommendations for crop health.",
    path: "/disease",
    color: "blue",
  },
  {
    icon: "🏛️",
    title: "Government Schemes",
    description: "Discover schemes relevant to your farmer profile.",
    path: "/government-schemes",
    color: "purple",
  },
  {
    icon: "🌦️",
    title: "Weather Forecast",
    description: "Review weather information for farming decisions.",
    path: "/weather",
    color: "sky",
  },
];

export default function FarmerDashboard({ user, profile }) {
  const farmerName = user?.name || "Farmer";

  return (
    <main className="farmer-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            AGRIGUARD • SMART FARMING
          </span>

          <h1>Welcome back, {farmerName}!</h1>

          <p>
            Your farming tools, crop insights, weather updates,
            and government schemes in one place.
          </p>
        </div>

        <div className="welcome-icon" aria-hidden="true">
          🌾
        </div>
      </section>

      <section className="farm-summary">
        <article className="summary-item">
          <span className="summary-icon">📍</span>
          <div>
            <p>Farm location</p>
            <h3>
              {profile?.district || "Not provided"}
              {profile?.state ? `, ${profile.state}` : ""}
            </h3>
          </div>
        </article>

        <article className="summary-item">
          <span className="summary-icon">🌿</span>
          <div>
            <p>Your crops</p>
            <h3>{profile?.crop_type || "Not provided"}</h3>
          </div>
        </article>

        <article className="summary-item">
          <span className="summary-icon">📐</span>
          <div>
            <p>Farm size</p>
            <h3>
              {profile?.land_size
                ? `${profile.land_size} ${profile.land_unit || "acres"}`
                : "Not provided"}
            </h3>
          </div>
        </article>
      </section>

      <section className="module-section">
        <div className="section-heading">
          <div>
            <span className="dashboard-eyebrow">YOUR FARMING TOOLS</span>
            <h2>Explore AgriGuard</h2>
          </div>

          <span className="module-count">
            {modules.length} modules
          </span>
        </div>

        <div className="module-grid">
          {modules.map((module) => (
            <Link
              to={module.path}
              className="module-card"
              key={module.title}
            >
              <div className={`module-icon ${module.color}`}>
                <span aria-hidden="true">{module.icon}</span>
              </div>

              <h3>{module.title}</h3>
              <p>{module.description}</p>

              <span className="module-action">
                Open module <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-tip">
        <span aria-hidden="true">💡</span>
        <div>
          <h3>Smart farming starts here</h3>
          <p>
            Use crop recommendations, weather information, and plant
            health tools together to support informed farming decisions.
          </p>
        </div>
      </section>
    </main>
  );
}
