import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [profileId, setProfileId] = useState(
    localStorage.getItem("agriguard_profile_id")
  );

  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [error, setError] = useState("");

  const [showProfileForm, setShowProfileForm] = useState(
    !localStorage.getItem("agriguard_profile_id")
  );

  const [formData, setFormData] = useState({
    state: "",
    district: "",
    land_size: "",
    land_unit: "acres",
    crop_type: "",
    farming_type: ""
  });

  /*
    Fetch schemes using the actual farmer profile ID.
  */
  async function fetchSchemes(id) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/schemes/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch government schemes");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to fetch government schemes"
        );
      }

      setProfile(data.profile);
      setSchemes(data.schemes || []);

    } catch (error) {
      console.error("Scheme Fetch Error:", error);

      setError(
        "Unable to load government schemes. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  /*
    If a profile ID already exists in localStorage,
    automatically load the schemes.
  */
  useEffect(() => {
    const savedProfileId =
      localStorage.getItem("agriguard_profile_id");

    if (savedProfileId) {
      fetchSchemes(savedProfileId);
    }
  }, []);

  /*
    Handle profile form changes.
  */
  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  /*
    Create farmer profile.
  */
  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/profile`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save farmer profile"
        );
      }

      /*
        Store the newly created profile ID.
      */
      localStorage.setItem(
        "agriguard_profile_id",
        data.profileId
      );

      setProfileId(data.profileId);
      setShowProfileForm(false);

      /*
        Immediately fetch personalized schemes.
      */
      await fetchSchemes(data.profileId);

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
    Clear saved profile and show the form again.
  */
  function handleChangeProfile() {
    localStorage.removeItem("agriguard_profile_id");

    setProfileId(null);
    setProfile(null);
    setSchemes([]);

    setFormData({
      state: "",
      district: "",
      land_size: "",
      land_unit: "acres",
      crop_type: "",
      farming_type: ""
    });

    setShowProfileForm(true);
    setError("");
  }

  /*
    Profile form screen.
  */
  if (showProfileForm) {
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
            <h2>Tell Us About Your Farm</h2>

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
    Government schemes screen.
  */
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

          <h2>Government Schemes</h2>

          <p>
            Government schemes relevant to your farming profile
          </p>

        </section>

        {profile && (
          <section className="profile-card">

            <div className="profile-title-row">

              <h3>Your Farmer Profile</h3>

              <button
                className="change-profile-button"
                onClick={handleChangeProfile}
              >
                Change Profile
              </button>

            </div>

            <div className="profile-grid">

              <div>
                <span>State</span>
                <strong>{profile.state}</strong>
              </div>

              <div>
                <span>District</span>
                <strong>{profile.district}</strong>
              </div>

              <div>
                <span>Land Size</span>
                <strong>
                  {profile.land_size} {profile.land_unit}
                </strong>
              </div>

              <div>
                <span>Crops</span>
                <strong>{profile.crop_type}</strong>
              </div>

              <div>
                <span>Farming Type</span>
                <strong>{profile.farming_type}</strong>
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

            <button
              onClick={() => fetchSchemes(profileId)}
            >
              Try Again
            </button>

          </div>
        )}

        {!loading &&
          !error &&
          schemes.length === 0 && (
            <div className="status">

              <h3>No schemes found</h3>

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

                <h2>Recommended Schemes</h2>

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

                          <h4>Benefits</h4>

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

                          <h4>Eligibility</h4>

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