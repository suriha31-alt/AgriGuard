import { useState } from "react";

const CropRecommendationForm = ({ onSubmit, loading }) => {
    const [npkKnown, setNpkKnown] = useState(true);

    const [form, setForm] = useState({
        nitrogen: 90,
        phosphorus: 42,
        potassium: 43,
        temperature: 25,
        humidity: 80,
        ph: 6.5,
        rainfall: 200,
        soil_type: "Alluvial soils",
        farm_size_acres: 5,
        irrigation_available: 1,
        water_source: "borewell",
        soil_organic_matter: 3
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                name === "soil_type" || name === "water_source"
                    ? value
                    : value === ""
                        ? null
                        : Number(value)
        }));
    };

    const handleNpkModeChange = (event) => {
        const known = event.target.value === "known";

        setNpkKnown(known);

        setForm((previous) => ({
            ...previous,
            nitrogen: known ? 90 : null,
            phosphorus: known ? 42 : null,
            potassium: known ? 43 : null
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const submission = {
            ...form,

            nitrogen: npkKnown ? form.nitrogen : null,
            phosphorus: npkKnown ? form.phosphorus : null,
            potassium: npkKnown ? form.potassium : null
        };

        console.log("Crop recommendation request:", submission);

        onSubmit(submission);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="crop-form"
        >

            {/* HEADER */}

            <div className="form-header">

                <div>
                    <span className="form-label">
                        SMART FARMING
                    </span>

                    <h2>
                        Find the right crop for your farm
                    </h2>

                    <p>
                        Enter your soil, climate, water and
                        farm details to receive suitable crop
                        recommendations.
                    </p>
                </div>

            </div>


            {/* NPK MODE */}

            <div className="npk-mode-card">

                <div className="npk-mode-icon">
                    🌱
                </div>

                <div className="npk-mode-content">

                    <h3>
                        Do you know your soil NPK values?
                    </h3>

                    <p>
                        NPK values normally come from a soil
                        test report.
                    </p>

                    <div className="npk-options">

                        <label
                            className={
                                npkKnown
                                    ? "npk-option active"
                                    : "npk-option"
                            }
                        >

                            <input
                                type="radio"
                                name="npkMode"
                                value="known"
                                checked={npkKnown}
                                onChange={handleNpkModeChange}
                            />

                            <span>
                                Yes, I know my NPK values
                            </span>

                        </label>


                        <label
                            className={
                                !npkKnown
                                    ? "npk-option active"
                                    : "npk-option"
                            }
                        >

                            <input
                                type="radio"
                                name="npkMode"
                                value="unknown"
                                checked={!npkKnown}
                                onChange={handleNpkModeChange}
                            />

                            <span>
                                No, I don't know my NPK values
                            </span>

                        </label>

                    </div>

                </div>

            </div>


            {/* NPK SECTION */}

            <section className="form-section">

                <div className="section-heading">

                    <span className="section-icon">
                        🧪
                    </span>

                    <div>
                        <h3>
                            Soil Nutrients
                        </h3>

                        <p>
                            {npkKnown
                                ? "Enter the values from your soil test report."
                                : "NPK values will be left empty for now."
                            }
                        </p>
                    </div>

                </div>


                <div className="form-grid">

                    <label className="input-card">

                        <span>
                            Nitrogen (N)
                        </span>

                        <input
                            type="number"
                            name="nitrogen"
                            value={
                                form.nitrogen ?? ""
                            }
                            onChange={handleChange}
                            disabled={!npkKnown}
                            placeholder="Example: 90"
                        />

                        <small>
                            kg/ha
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Phosphorus (P)
                        </span>

                        <input
                            type="number"
                            name="phosphorus"
                            value={
                                form.phosphorus ?? ""
                            }
                            onChange={handleChange}
                            disabled={!npkKnown}
                            placeholder="Example: 42"
                        />

                        <small>
                            kg/ha
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Potassium (K)
                        </span>

                        <input
                            type="number"
                            name="potassium"
                            value={
                                form.potassium ?? ""
                            }
                            onChange={handleChange}
                            disabled={!npkKnown}
                            placeholder="Example: 43"
                        />

                        <small>
                            kg/ha
                        </small>

                    </label>

                </div>


                {!npkKnown && (

                    <div className="info-message">

                        <span>
                            ℹ️
                        </span>

                        <p>
                            No problem! You can continue without
                            NPK values. We will use the other farm,
                            soil and weather information.
                        </p>

                    </div>

                )}

            </section>


            {/* CLIMATE */}

            <section className="form-section">

                <div className="section-heading">

                    <span className="section-icon">
                        🌦️
                    </span>

                    <div>

                        <h3>
                            Climate Conditions
                        </h3>

                        <p>
                            Enter the current conditions of your farm.
                        </p>

                    </div>

                </div>


                <div className="form-grid">

                    <label className="input-card">

                        <span>
                            Temperature
                        </span>

                        <input
                            type="number"
                            name="temperature"
                            value={form.temperature ?? ""}
                            onChange={handleChange}
                            required
                        />

                        <small>
                            °C
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Humidity
                        </span>

                        <input
                            type="number"
                            name="humidity"
                            value={form.humidity ?? ""}
                            onChange={handleChange}
                            required
                        />

                        <small>
                            %
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Rainfall
                        </span>

                        <input
                            type="number"
                            name="rainfall"
                            value={form.rainfall ?? ""}
                            onChange={handleChange}
                            required
                        />

                        <small>
                            mm
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Soil pH
                        </span>

                        <input
                            type="number"
                            step="0.1"
                            name="ph"
                            value={form.ph ?? ""}
                            onChange={handleChange}
                            required
                        />

                        <small>
                            pH
                        </small>

                    </label>

                </div>

            </section>


            {/* SOIL */}

            <section className="form-section">

                <div className="section-heading">

                    <span className="section-icon">
                        🌍
                    </span>

                    <div>

                        <h3>
                            Soil Information
                        </h3>

                        <p>
                            Tell us about the soil on your farm.
                        </p>

                    </div>

                </div>


                <div className="form-grid">

                    <label className="input-card">

                        <span>
                            Soil Type
                        </span>

                        <select
                            name="soil_type"
                            value={form.soil_type}
                            onChange={handleChange}
                            required
                        >

                            <option>
                                Alluvial soils
                            </option>

                            <option>
                                Black soils
                            </option>

                            <option>
                                Red soils
                            </option>

                            <option>
                                Clay soils
                            </option>

                            <option>
                                Sandy soils
                            </option>

                            <option>
                                Loamy soils
                            </option>

                        </select>

                    </label>


                    <label className="input-card">

                        <span>
                            Soil Organic Matter
                        </span>

                        <input
                            type="number"
                            step="0.1"
                            name="soil_organic_matter"
                            value={
                                form.soil_organic_matter ?? ""
                            }
                            onChange={handleChange}
                            required
                        />

                        <small>
                            %
                        </small>

                    </label>

                </div>

            </section>


            {/* FARM */}

            <section className="form-section">

                <div className="section-heading">

                    <span className="section-icon">
                        🚜
                    </span>

                    <div>

                        <h3>
                            Farm & Water
                        </h3>

                        <p>
                            Provide information about your farm resources.
                        </p>

                    </div>

                </div>


                <div className="form-grid">

                    <label className="input-card">

                        <span>
                            Farm Size
                        </span>

                        <input
                            type="number"
                            step="0.1"
                            name="farm_size_acres"
                            value={
                                form.farm_size_acres ?? ""
                            }
                            onChange={handleChange}
                            required
                        />

                        <small>
                            acres
                        </small>

                    </label>


                    <label className="input-card">

                        <span>
                            Irrigation Available
                        </span>

                        <select
                            name="irrigation_available"
                            value={
                                form.irrigation_available
                            }
                            onChange={handleChange}
                        >

                            <option value={1}>
                                Yes
                            </option>

                            <option value={0}>
                                No
                            </option>

                        </select>

                    </label>


                    <label className="input-card">

                        <span>
                            Water Source
                        </span>

                        <select
                            name="water_source"
                            value={form.water_source}
                            onChange={handleChange}
                        >

                            <option value="borewell">
                                Borewell
                            </option>

                            <option value="well">
                                Well
                            </option>

                            <option value="canal">
                                Canal
                            </option>

                            <option value="rainwater">
                                Rainwater
                            </option>

                            <option value="river">
                                River
                            </option>

                            <option value="none">
                                None
                            </option>

                        </select>

                    </label>

                </div>

            </section>


            {/* SUBMIT */}

            <div className="form-submit-area">

                <button
                    type="submit"
                    className="recommend-button"
                    disabled={loading}
                >

                    {loading ? (
                        <>
                            <span className="button-spinner"></span>
                            Analysing your farm...
                        </>
                    ) : (
                        <>
                            🌾 Get Crop Recommendations
                        </>
                    )}

                </button>

                <p>
                    AgriGuard analyses your farm conditions
                    before generating recommendations.
                </p>

            </div>

        </form>
    );
};

export default CropRecommendationForm;