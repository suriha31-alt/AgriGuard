
import { useCallback, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import WeatherDashboard from "./pages/WeatherDashboard";
import CropRecommendation from "./pages/CropRecommendation";
import FarmerDashboard from "./pages/FarmerDashboard";
import DiseaseDashboard from "./pages/DiseaseDashboard";
import Auth from "./components/Auth";

import "./App.css";

const BACKEND_URL = "http://localhost:5000";

const EMPTY_AUTH_DATA = {
  name: "",
  email: "",
  password: "",
};

const EMPTY_PROFILE_DATA = {
  state: "",
  district: "",
  land_size: "",
  land_unit: "acres",
  crop_type: "",
  farming_type: "",
};

/* Safely read API responses. */
async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}).`
    );
  }
}

/* Extract schemes from supported API response formats. */
function getSchemeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.schemes)) return data.schemes;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

/* Create a useful error from an API response. */
async function fetchErrorMessage(response, fallback) {
  try {
    const data = await readResponse(response);

    return (
      data.message ||
      data.detail ||
      `${fallback} (HTTP ${response.status}).`
    );
  } catch {
    return `${fallback} (HTTP ${response.status}).`;
  }
}

/* Navigation */
function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "nav-link active"
      : "nav-link";

  return (
    <header className="header">
      <div>
        <h1>AgriGuard</h1>
        <p>Smart Agriculture Assistant for Farmers</p>
      </div>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/dashboard" className={isActive("/dashboard")}>
          Dashboard
        </Link>

        <Link
          to="/crop-recommendation"
          className={isActive("/crop-recommendation")}
        >
          Crop Recommendation
        </Link>

        <Link to="/disease" className={isActive("/disease")}>
          Disease Detection
        </Link>

        <Link to="/weather" className={isActive("/weather")}>
          Weather
        </Link>

        <Link
          to="/government-schemes"
          className={isActive("/government-schemes")}
        >
          Government Schemes
        </Link>

        <span style={{ marginLeft: "10px" }}>
          Welcome, {user?.name || user?.username || "Farmer"}
        </span>

        <button
          type="button"
          className="change-profile-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

/* Government Schemes */
function GovernmentSchemes({
  profile,
  schemes,
  loading,
  error,
  onRetry,
  onEditProfile,
}) {
  return (
    <main className="container">
      <section className="welcome-section">
        <h2>Government Schemes</h2>
        <p>
          Find government schemes relevant to your farming profile.
        </p>
      </section>

      {!profile && !loading && (
        <section className="profile-card">
          <h3>Complete Your Farmer Profile</h3>
          <p>
            Add your state, district, land size, crops, and farming
            type to discover relevant schemes.
          </p>

          <button
            type="button"
            className="change-profile-button"
            onClick={onEditProfile}
          >
            Create Farmer Profile
          </button>
        </section>
      )}

      {profile && (
        <section className="profile-card">
          <div className="profile-title-row">
            <h3>Your Farmer Profile</h3>

            <button
              type="button"
              className="change-profile-button"
              onClick={onEditProfile}
            >
              Change Profile
            </button>
          </div>

          <div className="profile-grid">
            <div>
              <span>State</span>
              <strong>{profile.state || "Not provided"}</strong>
            </div>

            <div>
              <span>District</span>
              <strong>{profile.district || "Not provided"}</strong>
            </div>

            <div>
              <span>Land Size</span>
              <strong>
                {profile.land_size ?? "Not provided"}{" "}
                {profile.land_unit || "acres"}
              </strong>
            </div>

            <div>
              <span>Crops</span>
              <strong>{profile.crop_type || "Not provided"}</strong>
            </div>

            <div>
              <span>Farming Type</span>
              <strong>
                {profile.farming_type || "Not provided"}
              </strong>
            </div>
          </div>
        </section>
      )}

      {loading && (
        <div className="status">
          <div className="loader" />
          <p>Loading government schemes...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-box">
          <p>{error}</p>

          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && profile && schemes.length === 0 && (
        <div className="status">
          <h3>No schemes available</h3>
          <p>
            No schemes are currently available for display. Try
            refreshing the list later.
          </p>

          <button type="button" onClick={onRetry}>
            Refresh Schemes
          </button>
        </div>
      )}

      {!loading && !error && schemes.length > 0 && (
        <section className="schemes-section">
          <div className="section-heading">
            <h2>Recommended Schemes</h2>
            <span>{schemes.length} schemes found</span>
          </div>

          <div className="scheme-grid">
            {schemes.map((scheme, index) => (
              <article
                className="scheme-card"
                key={
                  scheme._id ||
                  `${scheme.scheme_name || scheme.name || "scheme"}-${index}`
                }
              >
                <div className="scheme-header">
                  <span className="scheme-number">{index + 1}</span>
                  <span className="scheme-state">
                    {scheme.state || "Government Scheme"}
                  </span>
                </div>

                <h3>
                  {scheme.scheme_name || scheme.name || "Untitled Scheme"}
                </h3>

                <p className="description">
                  {scheme.description || "No description available."}
                </p>

                <div className="details">
                  {Array.isArray(scheme.benefits) &&
                    scheme.benefits.length > 0 && (
                      <div className="detail-section">
                        <h4>Benefits</h4>
                        <ul>
                          {scheme.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {Array.isArray(scheme.eligibility) &&
                    scheme.eligibility.length > 0 && (
                      <div className="detail-section">
                        <h4>Eligibility</h4>
                        <ul>
                          {scheme.eligibility.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {scheme.application_url ? (
                  <a
                    className="apply-button"
                    href={scheme.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {scheme.application_type === "myscheme_fallback"
                      ? "Find Scheme on myScheme"
                      : "Apply / Register"}
                  </a>
                ) : (
                  <div className="no-link">
                    Official application link unavailable
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* Main application */
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() =>
    localStorage.getItem("agriguard_token")
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("agriguard_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState(EMPTY_AUTH_DATA);

  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [error, setError] = useState("");
  const [schemeError, setSchemeError] = useState("");

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROFILE_DATA);

  /* Logout */
  const logout = useCallback(() => {
    localStorage.removeItem("agriguard_token");
    localStorage.removeItem("agriguard_user");

    setToken(null);
    setUser(null);
    setProfile(null);
    setSchemes([]);
    setShowProfileForm(false);
    setAuthData(EMPTY_AUTH_DATA);
    setFormData(EMPTY_PROFILE_DATA);
    setError("");
    setSchemeError("");
    setLoading(false);
    setSavingProfile(false);

    navigate("/", { replace: true });
  }, [navigate]);

  /* Authentication input */
  function handleAuthInputChange(event) {
    const { name, value } = event.target;

    setAuthData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* Login and registration */
  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setError("");

      const isLogin = authMode === "login";
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

      const body = isLogin
        ? {
            email: authData.email.trim(),
            password: authData.password,
          }
        : {
            name: authData.name.trim(),
            email: authData.email.trim(),
            password: authData.password,
          };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await readResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.detail ||
            "Authentication failed."
        );
      }

      if (!isLogin) {
        setAuthMode("login");
        setAuthData({
          ...EMPTY_AUTH_DATA,
          email: body.email,
        });

        alert("Registration successful. Please log in.");
        return;
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Login response is missing the user or authentication token."
        );
      }

      localStorage.setItem("agriguard_token", data.token);
      localStorage.setItem("agriguard_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setProfile(null);
      setSchemes([]);
      setAuthData(EMPTY_AUTH_DATA);
      setError("");
      setSchemeError("");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Authentication Error:", err);

      setError(
        err.message ||
          "Unable to authenticate. Check that the backend is running."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  /* Fetch government schemes */
  const fetchSchemes = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setSchemeError("");

      const response = await fetch(`${BACKEND_URL}/api/schemes/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await fetchErrorMessage(
            response,
            "Failed to fetch government schemes"
          )
        );
      }

      const data = await readResponse(response);

      if (data.success === false) {
        throw new Error(
          data.message || "Failed to fetch government schemes."
        );
      }

      setSchemes(getSchemeList(data));
    } catch (err) {
      console.error("Government Schemes Error:", err);
      setSchemes([]);
      setSchemeError(
        err.message || "Unable to load government schemes."
      );
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  /* Load farmer profile only */
  const loadProfile = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.status === 404) {
        setProfile(null);
        setSchemes([]);
        setSchemeError("");
        return;
      }

      if (!response.ok) {
        throw new Error(
          await fetchErrorMessage(
            response,
            "Failed to load farmer profile"
          )
        );
      }

      const data = await readResponse(response);

      if (data.success === false) {
        throw new Error(
          data.message || "Failed to load farmer profile."
        );
      }

      const loadedProfile = data.data || data.profile || null;

      setProfile(loadedProfile);

      if (!loadedProfile) {
        setSchemes([]);
        setSchemeError("");
      }
    } catch (err) {
      console.error("Profile Load Error:", err);
      setError(
        err.message || "Unable to load your farmer profile."
      );
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  /* Load profile when the session changes. */
  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token, loadProfile]);

  /* Fetch schemes when the schemes page is opened. */
  useEffect(() => {
    if (token && location.pathname === "/government-schemes" && profile) {
      fetchSchemes();
    }
  }, [token, location.pathname, profile, fetchSchemes]);

  /* Profile form input */
  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* Open profile form */
  function editProfile() {
    setFormData({
      state: profile?.state || "",
      district: profile?.district || "",
      land_size: profile?.land_size ?? "",
      land_unit: profile?.land_unit || "acres",
      crop_type: profile?.crop_type || "",
      farming_type: profile?.farming_type || "",
    });

    setError("");
    setShowProfileForm(true);
  }

  /* Save farmer profile */
  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    const landSize = Number(formData.land_size);

    if (!Number.isFinite(landSize) || landSize <= 0) {
      setError("Please enter a valid land size greater than zero.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");

      const isEditing = Boolean(profile);
      const endpoint = isEditing
        ? "/api/profile/me"
        : "/api/profile";

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          state: formData.state.trim(),
          district: formData.district.trim(),
          land_size: landSize,
          land_unit: formData.land_unit,
          crop_type: formData.crop_type.trim(),
          farming_type: formData.farming_type.trim(),
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await fetchErrorMessage(response, "Failed to save farmer profile")
        );
      }

      const data = await readResponse(response);

      if (data.success === false) {
        throw new Error(
          data.message || "Failed to save farmer profile."
        );
      }

      const savedProfile = data.data || data.profile || null;

      if (savedProfile) {
        setProfile(savedProfile);
      }

      setShowProfileForm(false);

      await loadProfile();

      navigate("/government-schemes");
    } catch (err) {
      console.error("Profile Save Error:", err);
      setError(err.message || "Unable to save farmer profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function cancelProfileForm() {
    setShowProfileForm(false);
    setError("");
  }

  /* Authentication screen */
  if (!token) {
    return (
      <Auth
        authMode={authMode}
        authData={authData}
        authLoading={authLoading}
        error={error}
        onAuthInputChange={handleAuthInputChange}
        onAuthSubmit={handleAuthSubmit}
        onSwitchMode={(mode) => {
          setAuthMode(mode);
          setError("");
        }}
      />
    );
  }

  /* Farmer profile form */
  if (showProfileForm) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>AgriGuard</h1>
            <p>Smart Agriculture Assistant for Farmers</p>
          </div>

          <button
            type="button"
            className="change-profile-button"
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <main className="container">
          <section className="welcome-section">
            <h2>
              {profile
                ? "Update Your Farmer Profile"
                : "Tell Us About Your Farm"}
            </h2>
            <p>
              Add your farming details to discover relevant government
              schemes.
            </p>
          </section>

          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Example: Tamil Nadu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Example: Coimbatore"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="land_size">Land Size</label>
                <input
                  id="land_size"
                  name="land_size"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.land_size}
                  onChange={handleInputChange}
                  placeholder="Example: 5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="land_unit">Land Unit</label>
                <select
                  id="land_unit"
                  name="land_unit"
                  value={formData.land_unit}
                  onChange={handleInputChange}
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="crop_type">Crops</label>
              <input
                id="crop_type"
                name="crop_type"
                type="text"
                value={formData.crop_type}
                onChange={handleInputChange}
                placeholder="Example: Rice, Coconut, Banana"
                required
              />
              <small>Enter multiple crops separated by commas.</small>
            </div>

            <div className="form-group">
              <label htmlFor="farming_type">Farming Type</label>
              <select
                id="farming_type"
                name="farming_type"
                value={formData.farming_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select farming type</option>
                <option value="Crop farming">Crop farming</option>
                <option value="Horticulture">Horticulture</option>
                <option value="Organic farming">Organic farming</option>
                <option value="Mixed farming">Mixed farming</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="save-profile-button"
                type="submit"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Saving Profile..."
                  : profile
                    ? "Update Profile & Find Schemes"
                    : "Save Profile & Find Schemes"}
              </button>

              <button
                type="button"
                className="change-profile-button"
                onClick={cancelProfileForm}
                disabled={savingProfile}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>

        <footer>
          <p>AgriGuard • Helping farmers make smarter decisions</p>
        </footer>
      </div>
    );
  }

  /* Logged-in pages */
  return (
    <div className="app">
      {location.pathname !== "/dashboard" && (
        <Navigation user={user} onLogout={logout} />
      )}

      {error && (
        <div className="container">
          <div className="error-box">
            <p>{error}</p>
            <button type="button" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<FarmerDashboard user={user} profile={profile} />}
        />

        <Route
          path="/crop-recommendation"
          element={<CropRecommendation />}
        />

        <Route
          path="/disease"
          element={<DiseaseDashboard />}
        />

        <Route
          path="/weather"
          element={<WeatherDashboard />}
        />

        <Route
          path="/government-schemes"
          element={
            <GovernmentSchemes
              profile={profile}
              schemes={schemes}
              loading={loading}
              error={schemeError}
              onRetry={fetchSchemes}
              onEditProfile={editProfile}
            />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>

      <footer>
        <p>AgriGuard • Helping farmers make smarter decisions</p>
      </footer>
    </div>
  );
}

export default App;
