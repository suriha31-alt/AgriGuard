import sys
import json
import os

import pandas as pd
import joblib


# ==================================================
# PATHS
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

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

SOIL_CLIMATE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "soil_climate.csv"
)


# ==================================================
# LOAD MODELS
# ==================================================

crop_model_data = joblib.load(
    CROP_MODEL_PATH
)

compatibility_model_data = joblib.load(
    COMPATIBILITY_MODEL_PATH
)

crop_model = crop_model_data["model"]

compatibility_model = compatibility_model_data["model"]


# ==================================================
# CROP NAME MAPPING
# ==================================================

CROP_MAPPING = {
    "rice": "Rice",
    "maize": "Maize",
    "pigeonpeas": "Arhar",
    "mungbean": "Moong",
    "blackgram": "Urd",
    "lentil": "Masoor",
    "chickpea": "Gram",

    # Additional mappings
    "kidneybeans": None,
    "mothbeans": None,
    "pomegranate": None,
    "banana": None,
    "mango": None,
    "grapes": None,
    "watermelon": None,
    "muskmelon": None,
    "apple": None,
    "orange": None,
    "papaya": None,
    "coconut": None,
    "cotton": None,
    "jute": None,
    "coffee": None
}


def map_crop_name(crop):

    crop_lower = str(crop).lower()

    if crop_lower in CROP_MAPPING:

        return CROP_MAPPING[crop_lower]

    return crop


# ==================================================
# LOAD SOIL-CLIMATE DATASET
# ==================================================

soil_climate_df = pd.read_csv(
    SOIL_CLIMATE_PATH
)

available_crops = set(
    soil_climate_df["Crop_Type"]
    .astype(str)
    .str.lower()
)


# ==================================================
# WATER SOURCE NORMALIZATION
# ==================================================

def normalize_water_source(data):

    water_source = data.get(
        "water_source"
    )

    if water_source is None:

        irrigation = data.get(
            "irrigation_available",
            0
        )

        return (
            "irrigated"
            if int(irrigation) == 1
            else "rainfed"
        )

    water_source = str(
        water_source
    ).lower().strip()

    if water_source in [
        "bore",
        "borewell",
        "bore well"
    ]:
        return "borewell"

    if water_source in [
        "canal",
        "canal water"
    ]:
        return "canal"

    if water_source in [
        "rainfed",
        "rain",
        "rain fed"
    ]:
        return "rainfed"

    return water_source


def water_to_irrigation_value(
    water_source
):

    if water_source == "rainfed":

        return 0

    return 1


# ==================================================
# WATER SUITABILITY
# ==================================================

def calculate_water_score(
    crop,
    water_source
):

    """
    Initial rule-based water suitability.

    This is intentionally kept separate from
    the ML model because the current datasets
    do not contain Borewell/Canal/Rainfed
    as crop-specific training features.
    """

    crop = str(crop).lower()

    # Crops generally suitable under
    # irrigated conditions.
    irrigated_crops = {
        "rice",
        "banana",
        "sugarcane",
        "maize",
        "cotton",
        "jute",
        "wheat",
        "blackgram",
        "mungbean",
        "lentil",
        "chickpea"
    }

    # Crops that can tolerate comparatively
    # lower irrigation.
    rainfed_crops = {
        "millets",
        "sorghum",
        "maize",
        "chickpea",
        "pigeonpeas",
        "blackgram",
        "mungbean",
        "mothbeans",
        "groundnut",
        "cotton"
    }

    if water_source == "rainfed":

        if crop in rainfed_crops:

            return 80.0

        if crop in irrigated_crops:

            return 45.0

        return 60.0

    if water_source in [
        "borewell",
        "canal",
        "irrigated"
    ]:

        if crop in irrigated_crops:

            return 85.0

        return 70.0

    return 60.0


# ==================================================
# MAIN RECOMMENDATION
# ==================================================

def recommend(data):

    # ------------------------------------------------
    # 1. NORMALIZE WATER
    # ------------------------------------------------

    water_source = normalize_water_source(
        data
    )

    irrigation_available = (
        water_to_irrigation_value(
            water_source
        )
    )

    # ------------------------------------------------
    # 2. CROP MODEL INPUT
    # ------------------------------------------------

    crop_input = pd.DataFrame([{

        "N":
            data["nitrogen"],

        "P":
            data["phosphorus"],

        "K":
            data["potassium"],

        "temperature":
            data["temperature"],

        "humidity":
            data["humidity"],

        "ph":
            data["ph"],

        "rainfall":
            data["rainfall"]

    }])

    # ------------------------------------------------
    # 3. ML CROP PROBABILITIES
    # ------------------------------------------------

    probabilities = (
        crop_model
        .predict_proba(
            crop_input
        )[0]
    )

    classes = crop_model.classes_

    ranked = sorted(
        zip(
            classes,
            probabilities
        ),
        key=lambda x: x[1],
        reverse=True
    )

    # ------------------------------------------------
    # 4. TAKE TOP ML CANDIDATES
    # ------------------------------------------------

    candidates = []

    for crop, probability in ranked:

        confidence = (
            float(probability) * 100
        )

        if confidence < 0.1:

            continue

        mapped_crop = map_crop_name(
            crop
        )

        candidates.append({

            "crop":
                str(crop),

            "dataset_crop":
                mapped_crop,

            "ml_confidence":
                round(
                    confidence,
                    2
                )

        })

        if len(candidates) >= 10:

            break

    # ------------------------------------------------
    # 5. COMPATIBILITY + WATER SCORING
    # ------------------------------------------------

    recommendations = []

    for candidate in candidates:

        dataset_crop = (
            candidate["dataset_crop"]
        )

        compatibility_available = (
            dataset_crop is not None
            and
            str(dataset_crop).lower()
            in available_crops
        )

        compatible_probability = 50.0
        not_compatible_probability = 50.0

        # --------------------------------------------
        # COMPATIBILITY MODEL
        # --------------------------------------------

        if compatibility_available:

            compatibility_input = pd.DataFrame([{

                "Crop_Type":
                    dataset_crop,

                "Soil_Type":
                    data["soil_type"],

                "Farm_Size_Acres":
                    data["farm_size_acres"],

                "Irrigation_Available":
                    irrigation_available,

                "Soil_pH":
                    data["ph"],

                "Soil_Nitrogen":
                    data["nitrogen"],

                "Soil_Organic_Matter":
                    data[
                        "soil_organic_matter"
                    ],

                "Temperature":
                    data["temperature"],

                "Rainfall":
                    data["rainfall"],

                "Humidity":
                    data["humidity"]

            }])

            compatibility_probabilities = (
                compatibility_model
                .predict_proba(
                    compatibility_input
                )[0]
            )

            compatibility_classes = (
                compatibility_model.classes_
            )

            probability_map = {

                int(cls):
                    float(prob)

                for cls, prob in zip(
                    compatibility_classes,
                    compatibility_probabilities
                )

            }

            compatible_probability = (
                probability_map.get(
                    1,
                    0
                ) * 100
            )

            not_compatible_probability = (
                probability_map.get(
                    0,
                    0
                ) * 100
            )

        # --------------------------------------------
        # WATER SCORE
        # --------------------------------------------

        water_score = calculate_water_score(
            candidate["crop"],
            water_source
        )

        # --------------------------------------------
        # FINAL SCORE
        # --------------------------------------------

        ml_score = (
            candidate["ml_confidence"]
        )

        final_score = (
            ml_score * 0.60
            +
            compatible_probability * 0.25
            +
            water_score * 0.15
        )

        recommendations.append({

            "crop":
                candidate["crop"],

            "dataset_crop":
                dataset_crop,

            "ml_confidence":
                candidate[
                    "ml_confidence"
                ],

            "compatibility_confidence":
                round(
                    compatible_probability,
                    2
                ),

            "not_compatible_confidence":
                round(
                    not_compatible_probability,
                    2
                ),

            "water_score":
                round(
                    water_score,
                    2
                ),

            "final_score":
                round(
                    final_score,
                    2
                ),

            "compatible":
                (
                    compatible_probability >= 50
                    if compatibility_available
                    else None
                ),

            "compatibility_model_available":
                compatibility_available

        })

    # ------------------------------------------------
    # 6. SORT
    # ------------------------------------------------

    recommendations.sort(
        key=lambda x:
            x["final_score"],
        reverse=True
    )

    # ------------------------------------------------
    # 7. TOP 5
    # ------------------------------------------------

    recommendations = (
        recommendations[:5]
    )

    # ------------------------------------------------
    # 8. RETURN
    # ------------------------------------------------

    return {

        "input":
            data,

        "water_source":
            water_source,

        "irrigation_available":
            irrigation_available,

        "recommendations":
            recommendations

    }


# ==================================================
# PROGRAM ENTRY
# ==================================================

if __name__ == "__main__":

    try:

        input_json = sys.stdin.read()

        if not input_json.strip():

            raise ValueError(
                "No JSON input received"
            )

        data = json.loads(
            input_json
        )

        result = recommend(
            data
        )

        print(
            json.dumps(
                result,
                indent=2
            )
        )

    except Exception as error:

        print(
            json.dumps({
                "error":
                    str(error)
            })
        )