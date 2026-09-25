import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("agriguard_token")
  );

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [error, setError] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [formData, setFormData] = useState({
    state: "",
    district: "",
    land_size: "",
    land_unit: "acres",
    crop_type: "",
    farming_type: ""
  });

  /*
   * Save JWT token and logged-in user.
   */
  function saveToken(newToken, userData) {
    localStorage.setItem("agriguard_token", newToken);

    setToken(newToken);
    setUser(userData);
  }

  /*
   * Login / Register input changes.
   */
  function handleAuthInputChange(event) {
    const { name, value } = event.target;

    setAuthData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  /*
   * Login or Register.
   */
  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setError("");

      const endpoint =
        authMode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const body =
        authMode === "login"
          ? {
              email: authData.email.trim(),
              password: authData.password
            }
          : {
              name: authData.name.trim(),
              email: authData.email.trim(),
              password: authData.password
            };

      const response = await fetch(
        `${BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Authentication failed"
        );
      }

      /*
       * Registration successful.
       * Switch back to login.
       */
      if (authMode === "register") {
        setAuthMode("login");

        setAuthData({
          name: "",
          email: body.email,
          password: ""
        });

        alert(
          "Registration successful. Please login with your account."
        );

        return;
      }

      /*
       * Login successful.
       */
      saveToken(data.token, data.user);

      setAuthData({
        name: "",
        email: "",
        password: ""
      });

    } catch (error) {
      console.error("Authentication Error:", error);

      setError(
        error.message ||
          "Unable to authenticate. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  /*
   * Load logged-in user's profile.
   */
  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/profile/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      /*
       * No profile yet.
       */
      if (response.status === 404) {
        setProfile(null);
        setSchemes([]);
        setShowProfileForm(true);
        return;
      }

      /*
       * Token invalid or expired.
       */
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load farmer profile"
        );
      }

      setProfile(data.data);
      setShowProfileForm(false);

      await fetchSchemes();

    } catch (error) {
      console.error("Profile Load Error:", error);

      setError(
        error.message ||
          "Unable to load your farmer profile."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Fetch personalized government schemes.
   */
  async function fetchSchemes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/schemes/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.status === 404) {
        setProfile(null);
        setSchemes([]);
        setShowProfileForm(true);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch government schemes"
        );
      }

      setProfile(data.profile);
      setSchemes(data.schemes || []);
      setShowProfileForm(false);

    } catch (error) {
      console.error("Scheme Fetch Error:", error);

      setError(
        error.message ||
          "Unable to load government schemes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Farmer profile form changes.
   */
  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  /*
   * Save or update farmer profile.
   */
  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");

      const method = profile ? "PUT" : "POST";

      const endpoint = profile
        ? "/api/profile/me"
        : "/api/profile";

      const response = await fetch(
        `${BACKEND_URL}${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            state: formData.state.trim(),
            district: formData.district.trim(),
            land_size: Number(formData.land_size),
            land_unit: formData.land_unit,
            crop_type: formData.crop_type.trim(),
            farming_type: formData.farming_type.trim()
          })
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save farmer profile"
        );
      }

      await loadProfile();

    } catch (error) {
      console.error("Profile Save Error:", error);

      setError(
        error.message ||
          "Unable to save farmer profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  /*
   * Edit existing profile.
   */
  function editProfile() {
    if (!profile) {
      return;
    }

    setFormData({
      state: profile.state || "",
      district: profile.district || "",
      land_size: profile.land_size || "",
      land_unit: profile.land_unit || "acres",
      crop_type: profile.crop_type || "",
      farming_type: profile.farming_type || ""
    });

    setShowProfileForm(true);
    setError("");
  }

  /*
   * Logout.
   */
  function logout() {
    localStorage.removeItem("agriguard_token");

    setToken(null);
    setUser(null);
    setProfile(null);
    setSchemes([]);

    setShowProfileForm(false);

    setAuthData({
      name: "",
      email: "",
      password: ""
    });

    setFormData({
      state: "",
      district: "",
      land_size: "",
      land_unit: "acres",
      crop_type: "",
      farming_type: ""
    });

    setError("");
  }

  /*
   * When token exists, load profile.
   */
  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  /*
   * ============================
   * LOGIN / REGISTER SCREEN
   * ============================
   */
  if (!token) {
    return (
      <div className="app">

        <header className="header">
          <div>
            <h1>AgriGuard</h1>
            <p>Government Schemes for Farmers</p>
          </div>
        </header>

        <main className="container">

          <section className="welcome-section">

            <h2>
              {authMode === "login"
                ? "Welcome Back"
                : "Create Your Account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Login to discover government schemes relevant to your farm."
                : "Create an account to save your farmer profile and discover relevant schemes."}
            </p>

          </section>

          <form
            className="profile-form"
            onSubmit={handleAuthSubmit}
          >

            {authMode === "register" && (
              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={authData.name}
                  onChange={handleAuthInputChange}
                  required
                />

              </div>
            )}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={authData.email}
                onChange={handleAuthInputChange}
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={authData.password}
                onChange={handleAuthInputChange}
                minLength="6"
                required
              />

            </div>

            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

            <button
              className="save-profile-button"
              type="submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Create Account"}
            </button>

            <div className="auth-switch">

              {authMode === "login" ? (
                <>
                  <span>
                    Don't have an account?
                  </span>

                  <button
                    type="button"
                    className="auth-switch-button"
                    onClick={() => {
                      setAuthMode("register");
                      setError("");
                    }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    className="auth-switch-button"
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                  >
                    Login
                  </button>
                </>
              )}

            </div>

          </form>

        </main>

        <footer>
          <p>
            AgriGuard • Helping farmers discover relevant
            government schemes
          </p>
        </footer>

      </div>
    );
  }

  /*
   * ============================
   * LOADING SCREEN
   * ============================
   */
  if (loading && !profile && !showProfileForm) {
    return (
      <div className="app">

        <header className="header">

          <div>
            <h1>AgriGuard</h1>
            <p>Government Schemes for Farmers</p>
          </div>

        </header>

        <main className="container">

          <div className="status">

            <div className="loader"></div>

            <p>
              Loading your farmer profile...
            </p>

          </div>

        </main>

      </div>
    );
  }

  /*
   * ============================
   * FARMER PROFILE SCREEN
   * ============================
   */
  if (showProfileForm) {
    return (
      <div className="app">

        <header className="header">

          <div>
            <h1>AgriGuard</h1>
            <p>Government Schemes for Farmers</p>
          </div>

          <button
            className="change-profile-button"
            onClick={logout}
          >
            Logout
          </button>

        </header>

        <main className="container">

          <section className="welcome-section">

            <h2>
              Tell Us About Your Farm
            </h2>

            <p>
              Enter your farming details so we can find
              relevant government schemes for you.
            </p>

          </section>

          <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
          >

            <div className="form-group">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="Example: Tamil Nadu"
                value={formData.state}
                onChange={handleInputChange}
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="district">
                District
              </label>

              <input
                id="district"
                name="district"
                type="text"
                placeholder="Example: Dindigul"
                value={formData.district}
                onChange={handleInputChange}
                required
              />

            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="land_size">
                  Land Size
                </label>

                <input
                  id="land_size"
                  name="land_size"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Example: 5"
                  value={formData.land_size}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="land_unit">
                  Land Unit
                </label>

                <select
                  id="land_unit"
                  name="land_unit"
                  value={formData.land_unit}
                  onChange={handleInputChange}
                >

                  <option value="acres">
                    Acres
                  </option>

                  <option value="hectares">
                    Hectares
                  </option>

                </select>

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="crop_type">
                Crops
              </label>

              <input
                id="crop_type"
                name="crop_type"
                type="text"
                placeholder="Example: Rice, Coconut, Banana"
                value={formData.crop_type}
                onChange={handleInputChange}
                required
              />

              <small>
                You can enter multiple crops separated by commas.
              </small>

            </div>

            <div className="form-group">

              <label htmlFor="farming_type">
                Farming Type
              </label>

              <select
                id="farming_type"
                name="farming_type"
                value={formData.farming_type}
                onChange={handleInputChange}
                required
              >

                <option value="">
                  Select farming type
                </option>

                <option value="Crop farming">
                  Crop farming
                </option>

                <option value="Horticulture">
                  Horticulture
                </option>

                <option value="Organic farming">
                  Organic farming
                </option>

                <option value="Mixed farming">
                  Mixed farming
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

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

          </form>

        </main>

        <footer>
          <p>
            AgriGuard • Helping farmers discover relevant
            government schemes
          </p>
        </footer>

      </div>
    );
  }

  /*
   * ============================
   * GOVERNMENT SCHEMES SCREEN
   * ============================
   */
  return (
    <div className="app">

      <header className="header">

        <div>
          <h1>AgriGuard</h1>
          <p>Government Schemes for Farmers</p>
        </div>

        <div className="header-user">

          {user && (
            <span>
              Welcome, {user.name}
            </span>
          )}

          <button
            className="change-profile-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="container">

        <section className="welcome-section">

          <h2>
            Government Schemes
          </h2>

          <p>
            Government schemes relevant to your farming profile
          </p>

        </section>

        {profile && (
          <section className="profile-card">

            <div className="profile-title-row">

              <h3>
                Your Farmer Profile
              </h3>

              <button
                className="change-profile-button"
                onClick={editProfile}
              >
                Change Profile
              </button>

            </div>

            <div className="profile-grid">

              <div>
                <span>State</span>
                <strong>
                  {profile.state}
                </strong>
              </div>

              <div>
                <span>District</span>
                <strong>
                  {profile.district}
                </strong>
              </div>

              <div>
                <span>Land Size</span>
                <strong>
                  {profile.land_size} {profile.land_unit}
                </strong>
              </div>

              <div>
                <span>Crops</span>
                <strong>
                  {profile.crop_type}
                </strong>
              </div>

              <div>
                <span>Farming Type</span>
                <strong>
                  {profile.farming_type}
                </strong>
              </div>

            </div>

          </section>
        )}

        {loading && (
          <div className="status">

            <div className="loader"></div>

            <p>
              Finding relevant government schemes...
            </p>

          </div>
        )}

        {error && !loading && (
          <div className="error-box">

            <p>{error}</p>

            <button onClick={fetchSchemes}>
              Try Again
            </button>

          </div>
        )}

        {!loading &&
          !error &&
          schemes.length === 0 && (
            <div className="status">

              <h3>
                No schemes found
              </h3>

              <p>
                No relevant government schemes were found
                for your current profile.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          schemes.length > 0 && (

            <section className="schemes-section">

              <div className="section-heading">

                <h2>
                  Recommended Schemes
                </h2>

                <span>
                  {schemes.length} schemes found
                </span>

              </div>

              <div className="scheme-grid">

                {schemes.map((scheme, index) => (

                  <article
                    className="scheme-card"
                    key={`${scheme.scheme_name}-${index}`}
                  >

                    <div className="scheme-header">

                      <span className="scheme-number">
                        {index + 1}
                      </span>

                      <span className="scheme-state">
                        {scheme.state}
                      </span>

                    </div>

                    <h3>
                      {scheme.scheme_name}
                    </h3>

                    <p className="description">
                      {scheme.description}
                    </p>

                    <div className="details">

                      {scheme.benefits?.length > 0 && (
                        <div className="detail-section">

                          <h4>
                            Benefits
                          </h4>

                          <ul>

                            {scheme.benefits.map(
                              (benefit, benefitIndex) => (
                                <li key={benefitIndex}>
                                  {benefit}
                                </li>
                              )
                            )}

                          </ul>

                        </div>
                      )}

                      {scheme.eligibility?.length > 0 && (
                        <div className="detail-section">

                          <h4>
                            Eligibility
                          </h4>

                          <ul>

                            {scheme.eligibility.map(
                              (item, eligibilityIndex) => (
                                <li key={eligibilityIndex}>
                                  {item}
                                </li>
                              )
                            )}

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
                        Apply / Register
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

      <footer>
        <p>
          AgriGuard • Helping farmers discover relevant
          government schemes
        </p>
      </footer>

    </div>
  );
}

export default App;