const CropRecommendationResults = ({ result }) => {

    if (!result?.recommendations?.length) {
        return (
            <div className="crop-results">
                <p>No crop recommendations available.</p>
            </div>
        );
    }

    return (
        <div className="crop-results">

            <h2>Recommended Crops</h2>

            {result.recommendations.map((crop, index) => (

                <div
                    key={`${crop.crop}-${index}`}
                    className="crop-card"
                >

                    <div className="crop-card-header">
                        <h3>
                            {index + 1}.{" "}
                            {crop.crop.toUpperCase()}
                        </h3>

                        <strong>
                            {crop.final_score}%
                        </strong>
                    </div>

                    <p>
                        Confidence:{" "}
                        <strong>
                            {crop.confidence}
                        </strong>
                    </p>

                    <p>
                        ML Prediction:{" "}
                        {crop.ml_confidence}%
                    </p>

                    <p>
                        Climate Score:{" "}
                        {crop.climate_score}%
                    </p>

                    <p>
                        Water Score:{" "}
                        {crop.water_score}%
                    </p>

                    <p>
                        Soil Score:{" "}
                        {crop.soil_score}%
                    </p>

                    <h4>Why this crop?</h4>

                    <ul>
                        {crop.reasons?.map(
                            (reason, reasonIndex) => (
                                <li key={reasonIndex}>
                                    {reason}
                                </li>
                            )
                        )}
                    </ul>

                </div>

            ))}

        </div>
    );
};

export default CropRecommendationResults;