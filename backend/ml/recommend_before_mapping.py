
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

crop_model_data = joblib.load(CROP_MODEL_PATH)
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

    # These crops do not currently have
    # matching entries in the compatibility dataset.
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

    crop_lower = str(crop).lower().strip()

    return CROP_MAPPING.get(
        crop_lower,
        crop
    )


# ==================================================
# LOAD SOIL-CLIMATE DATA
# ==================================================

soil_climate_df = pd.read_csv(
    SOIL_CLIMATE_PATH
)

available_crops = set(
    soil_climate_df["Crop_Type"]
    .astype(str)
    .str.lower()
    .str.strip()
)


# ==================================================
# WATER SOURCE
# ==================================================

def normalize_water_source(data):

    water_source = data.get("water_source")

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

    crop = str(crop).lower().strip()

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
            return 85.0

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
# CLIMATE SUITABILITY
# ==================================================

def calculate_climate_score(
    temperature,
    humidity,
    rainfall,
    crop
):

    """
    Basic climate suitability.

    The current crop recommendation dataset does not
    contain explicit ideal ranges for every crop, so
    this function uses the ML confidence as the primary
    climate signal and applies only conservative checks.
    """

    score = 100.0
    reasons = []

    # Very broad agricultural sanity checks.
    if temperature < 10:
        score -= 25
        reasons.append(
            "Temperature is relatively low"
        )

    elif temperature > 40:
        score -= 25
        reasons.append(
            "Temperature is relatively high"
        )

    else:
        reasons.append(
            "Temperature is within a reasonable range"
        )

    if humidity < 20:
        score -= 15
        reasons.append(
            "Humidity is relatively low"
        )

    elif humidity > 95:
        score -= 10
        reasons.append(
            "Humidity is very high"
        )

    else:
        reasons.append(
            "Humidity is acceptable"
        )

    if rainfall < 200:
        score -= 10
        reasons.append(
            "Rainfall is relatively low"
        )

    elif rainfall > 3000:
        score -= 15
        reasons.append(
            "Rainfall is very high"
        )

    else:
        reasons.append(
            "Rainfall is within a broad agricultural range"
        )

    return max(0.0, min(100.0, score)), reasons


# ==================================================
# SOIL SUITABILITY
# ==================================================

def calculate_soil_score(
    compatibility_available,
    compatible_probability,
    ph
):

    reasons = []

    if compatibility_available:

        score = compatible_probability

        if score >= 70:
            reasons.append(
                "Strong soil compatibility"
            )

        elif score >= 50:
            reasons.append(
                "Moderate soil compatibility"
            )

        else:
            reasons.append(
                "Low soil compatibility"
            )

        return score, reasons

    # No compatibility training data.
    # Do NOT pretend this crop has 50% compatibility.
    #
    # Instead return a neutral score and clearly indicate
    # that compatibility could not be verified.

    reasons.append(
        "Soil compatibility could not be verified from the current dataset"
    )

    return 50.0, reasons


# ==================================================
# CONFIDENCE LABEL
# ==================================================

def confidence_label(score):

    if score >= 75:
        return "High"

    if score >= 50:
        return "Medium"

    return "Low"


# ==================================================
# MAIN RECOMMENDATION
# ==================================================

def recommend(data):

    # ------------------------------------------------
    # 1. WATER
    # ------------------------------------------------

    water_source = normalize_water_source(data)

    irrigation_available = (
        water_to_irrigation_value(
            water_source
        )
    )

    # ------------------------------------------------
    # 2. CROP MODEL INPUT
    # ------------------------------------------------

    crop_input = pd.DataFrame([{

        "N": data["nitrogen"],

        "P": data["phosphorus"],

        "K": data["potassium"],

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
    # 3. ML PROBABILITIES
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
    # 4. TOP ML CANDIDATES
    # ------------------------------------------------

    candidates = []

    for crop, probability in ranked:

        confidence = (
            float(probability) * 100
        )

        if confidence < 0.1:
            continue

        mapped_crop = map_crop_name(crop)

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
    # 5. SCORE EACH CROP
    # ------------------------------------------------

    recommendations = []

    for candidate in candidates:

        crop = candidate["crop"]

        dataset_crop = candidate["dataset_crop"]

        compatibility_available = (
            dataset_crop is not None
            and
            str(dataset_crop).lower().strip()
            in available_crops
        )

        compatible_probability = None
        not_compatible_probability = None

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
                    data["soil_organic_matter"],

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
            crop,
            water_source
        )

        # --------------------------------------------
        # CLIMATE SCORE
        # --------------------------------------------

        climate_score, climate_reasons = (
            calculate_climate_score(
                data["temperature"],
                data["humidity"],
                data["rainfall"],
                crop
            )
        )

        # --------------------------------------------
        # SOIL SCORE
        # --------------------------------------------

        soil_score, soil_reasons = (
            calculate_soil_score(
                compatibility_available,
                compatible_probability
                if compatible_probability is not None
                else 50.0,
                data["ph"]
            )
        )

        # --------------------------------------------
        # FINAL SCORE
        # --------------------------------------------

        ml_score = candidate["ml_confidence"]

        if compatibility_available:

            final_score = (
                ml_score * 0.45
                +
                soil_score * 0.25
                +
                climate_score * 0.15
                +
                water_score * 0.15
            )

        else:

            # Crops without compatibility evidence
            # receive less influence from the unknown
            # soil component.

            final_score = (
                ml_score * 0.55
                +
                climate_score * 0.20
                +
                water_score * 0.15
                +
                soil_score * 0.10
            )

        # --------------------------------------------
        # REASONS
        # --------------------------------------------

        reasons = []

        reasons.extend(
            soil_reasons
        )

        reasons.extend(
            climate_reasons
        )

        if water_score >= 80:

            reasons.append(
                "Water availability is suitable"
            )

        elif water_score < 50:

            reasons.append(
                "Water availability may be a limitation"
            )

        if ml_score >= 50:

            reasons.append(
                "Strong ML crop prediction"
            )

        elif ml_score >= 20:

            reasons.append(
                "Moderate ML crop prediction"
            )

        else:

            reasons.append(
                "Low ML crop prediction"
            )

        # Remove duplicate reasons
        reasons = list(
            dict.fromkeys(reasons)
        )

        # --------------------------------------------
        # RESULT
        # --------------------------------------------

        recommendation = {

            "crop":
                crop,

            "dataset_crop":
                dataset_crop,

            "ml_confidence":
                round(
                    ml_score,
                    2
                ),

            "compatibility_confidence":
                (
                    round(
                        compatible_probability,
                        2
                    )
                    if compatible_probability is not None
                    else None
                ),

            "not_compatible_confidence":
                (
                    round(
                        not_compatible_probability,
                        2
                    )
                    if not_compatible_probability is not None
                    else None
                ),

            "water_score":
                round(
                    water_score,
                    2
                ),

            "climate_score":
                round(
                    climate_score,
                    2
                ),

            "soil_score":
                round(
                    soil_score,
                    2
                ),

            "final_score":
                round(
                    final_score,
                    2
                ),

            "confidence":
                confidence_label(
                    final_score
                ),

            "compatible":
                (
                    compatible_probability >= 50
                    if compatibility_available
                    else None
                ),

            "compatibility_model_available":
                compatibility_available,

            "reasons":
                reasons

        }

        recommendations.append(
            recommendation
        )

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

    recommendations = recommendations[:5]

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
