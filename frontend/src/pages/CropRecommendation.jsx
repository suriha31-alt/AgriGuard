
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CropRecommendationForm
    from "../components/crop/CropRecommendationForm";

import CropRecommendationResults
    from "../components/crop/CropRecommendationResults";

import {
    getCropRecommendations
} from "../services/cropRecommendationApi";

const CropRecommendation = () => {

    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData) => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getCropRecommendations(formData);

            if (!response.success) {
                throw new Error(
                    response.message ||
                    "Unable to generate recommendations"
                );
            }

            setResult(response);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="crop-page">

            {/* NAVIGATION */}

            <header className="crop-navbar">

                <div className="brand">

                    <div className="brand-icon">
                        🌱
                    </div>

                    <div>
                        <div className="brand-name">
                            AGRIGUARD
                        </div>

                        <div className="brand-subtitle">
                            SMART FARMING
                        </div>
                    </div>

                </div>

                <button
                    className="weather-nav-button"
                    onClick={() => navigate("/weather")}
                >
                    🌦️
                    <span>Weather</span>
                </button>

            </header>


            {/* HERO */}

            <section className="crop-hero">

                <div className="hero-content">

                    <span className="hero-badge">
                        🌾 SMART CROP PLANNING
                    </span>

                    <h1>
                        Find the right crop
                        <br />
                        <span>for your farm</span>
                    </h1>

                    <p>
                        Enter your soil, climate, water and farm
                        details. AgriGuard analyses your conditions
                        and generates suitable crop recommendations.
                    </p>

                </div>

                <div className="hero-illustration">
                    🌱
                </div>

            </section>


            {/* MAIN CONTENT */}

            <main className="crop-content">

                {/* FORM CARD */}

                <section className="farm-card">

                    <div className="section-heading">

                        <div className="section-icon">
                            🌾
                        </div>

                        <div>
                            <h2>Farm Information</h2>

                            <p>
                                Provide your current farm conditions
                            </p>
                        </div>

                    </div>

                    <CropRecommendationForm
                        onSubmit={handleSubmit}
                        loading={loading}
                    />

                </section>


                {/* ERROR */}

                {error && (

                    <div className="crop-error">
                        ⚠️ {error}
                    </div>

                )}


                {/* RESULTS */}

                {result && (

                    <section className="results-section">

                        <div className="section-heading">

                            <div className="section-icon">
                                📊
                            </div>

                            <div>
                                <h2>Recommended Crops</h2>

                                <p>
                                    Based on your farm conditions
                                </p>
                            </div>

                        </div>

                        <CropRecommendationResults
                            result={result}
                        />

                    </section>

                )}

            </main>


            {/* FOOTER */}

            <footer className="crop-footer">

                <span>🌱</span>

                AgriGuard — Smart farming for better decisions

            </footer>

        </div>

    );
};

export default CropRecommendation;