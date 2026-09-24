import os
import joblib
import pandas as pd


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CROP_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "crop_recommendation_model.pkl"
)

COMPATIBILITY_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "soil_compatibility_model.pkl"
)


# Load models once
crop_model_data = joblib.load(CROP_MODEL_PATH)
compatibility_model_data = joblib.load(COMPATIBILITY_MODEL_PATH)

crop_model = crop_model_data["model"]
compatibility_model = compatibility_model_data["model"]


def predict_crop(
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall
):
    """
    Predict the most suitable crop using the
    crop recommendation ML model.
    """

    input_data = pd.DataFrame([{
        "N": nitrogen,
        "P": phosphorus,
        "K": potassium,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall
    }])

    prediction = crop_model.predict(input_data)[0]

    probabilities = crop_model.predict_proba(input_data)[0]

    classes = crop_model.classes_

    ranked = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True
    )

    top_crops = [
        {
            "crop": crop,
            "confidence": round(float(probability) * 100, 2)
        }
        for crop, probability in ranked[:5]
    ]

    return {
        "predicted_crop": prediction,
        "confidence": round(
            float(max(probabilities)) * 100,
            2
        ),
        "top_crops": top_crops
    }


def check_crop_compatibility(
    crop_type,
    soil_type,
    farm_size_acres,
    irrigation_available,
    soil_ph,
    soil_nitrogen,
    soil_organic_matter,
    temperature,
    rainfall,
    humidity
):
    """
    Check whether a selected crop is compatible
    with the farmer's soil, farm and climate conditions.
    """

    input_data = pd.DataFrame([{
        "Crop_Type": crop_type,
        "Soil_Type": soil_type,
        "Farm_Size_Acres": farm_size_acres,
        "Irrigation_Available": irrigation_available,
        "Soil_pH": soil_ph,
        "Soil_Nitrogen": soil_nitrogen,
        "Soil_Organic_Matter": soil_organic_matter,
        "Temperature": temperature,
        "Rainfall": rainfall,
        "Humidity": humidity
    }])

    prediction = compatibility_model.predict(input_data)[0]

    probabilities = compatibility_model.predict_proba(
        input_data
    )[0]

    classes = compatibility_model.classes_

    probability_map = {
        int(cls): float(probability)
        for cls, probability in zip(
            classes,
            probabilities
        )
    }

    return {
        "compatible": bool(prediction == 1),
        "confidence": round(
            probability_map.get(
                int(prediction),
                0
            ) * 100,
            2
        ),
        "probabilities": {
            "not_compatible": round(
                probability_map.get(0, 0) * 100,
                2
            ),
            "compatible": round(
                probability_map.get(1, 0) * 100,
                2
            )
        }
    }