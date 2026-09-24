import { useState } from "react";

import CropRecommendationForm
    from "./components/crop/CropRecommendationForm";

import CropRecommendationResults
    from "./components/crop/CropRecommendationResults";

import {
    getCropRecommendations
} from "./services/cropRecommendationApi";

import "./App.css";


function App() {

    const [result, setResult] = useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    const handleRecommendation =
        async (formData) => {

            try {

                setLoading(true);

                setError(null);

                setResult(null);


                const response =
                    await getCropRecommendations(
                        formData
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Unable to generate recommendations"
                    );
                }


                setResult(response);

            } catch (err) {

                console.error(
                    "Recommendation error:",
                    err
                );

                setError(
                    err.message ||
                    "Something went wrong"
                );

            } finally {

                setLoading(false);

            }
        };


    return (

        <div className="app">

            <header className="app-header">

                <div>

                    <p className="app-eyebrow">
                        SMART FARMING
                    </p>

                    <h1>
                        🌱 AgriGuard
                    </h1>

                    <p>
                        Smart Crop Recommendation System
                    </p>

                </div>

            </header>


            <main className="app-container">

                <section className="intro-section">

                    <h2>
                        Find the right crop for your farm
                    </h2>

                    <p>
                        Enter your soil, climate, farm and
                        water information to receive
                        personalized crop recommendations.
                    </p>

                </section>


                <section className="crop-section">

                    <CropRecommendationForm
                        onSubmit={handleRecommendation}
                        loading={loading}
                    />


                    {error && (

                        <div className="error-message">

                            <strong>
                                Recommendation Error
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    )}


                    {result && (

                        <CropRecommendationResults
                            result={result}
                        />

                    )}

                </section>

            </main>

        </div>
    );
}


export default App;