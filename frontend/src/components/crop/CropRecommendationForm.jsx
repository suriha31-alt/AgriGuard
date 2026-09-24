import { useState } from "react";

const CropRecommendationForm = ({ onSubmit, loading }) => {
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
                    : Number(value)
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="crop-form">

            <h2>Crop Recommendation</h2>

            <p>
                Enter your farm and soil information to get
                suitable crop recommendations.
            </p>

            <div className="form-grid">

                <label>
                    Nitrogen (N)
                    <input
                        type="number"
                        name="nitrogen"
                        value={form.nitrogen}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Phosphorus (P)
                    <input
                        type="number"
                        name="phosphorus"
                        value={form.phosphorus}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Potassium (K)
                    <input
                        type="number"
                        name="potassium"
                        value={form.potassium}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Temperature (°C)
                    <input
                        type="number"
                        name="temperature"
                        value={form.temperature}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Humidity (%)
                    <input
                        type="number"
                        name="humidity"
                        value={form.humidity}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Soil pH
                    <input
                        type="number"
                        step="0.1"
                        name="ph"
                        value={form.ph}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Rainfall (mm)
                    <input
                        type="number"
                        name="rainfall"
                        value={form.rainfall}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Soil Type
                    <select
                        name="soil_type"
                        value={form.soil_type}
                        onChange={handleChange}
                    >
                        <option>Alluvial soils</option>
                        <option>Black soils</option>
                        <option>Red soils</option>
                        <option>Clay soils</option>
                        <option>Sandy soils</option>
                        <option>Loamy soils</option>
                    </select>
                </label>

                <label>
                    Farm Size (acres)
                    <input
                        type="number"
                        step="0.1"
                        name="farm_size_acres"
                        value={form.farm_size_acres}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Irrigation Available
                    <select
                        name="irrigation_available"
                        value={form.irrigation_available}
                        onChange={handleChange}
                    >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                    </select>
                </label>

                <label>
                    Water Source
                    <select
                        name="water_source"
                        value={form.water_source}
                        onChange={handleChange}
                    >
                        <option value="borewell">Borewell</option>
                        <option value="well">Well</option>
                        <option value="canal">Canal</option>
                        <option value="rainwater">Rainwater</option>
                        <option value="river">River</option>
                        <option value="none">None</option>
                    </select>
                </label>

                <label>
                    Soil Organic Matter
                    <input
                        type="number"
                        step="0.1"
                        name="soil_organic_matter"
                        value={form.soil_organic_matter}
                        onChange={handleChange}
                        required
                    />
                </label>

            </div>

            <button type="submit" disabled={loading}>
                {loading
                    ? "Generating Recommendations..."
                    : "Get Crop Recommendations"}
            </button>

        </form>
    );
};

export default CropRecommendationForm;