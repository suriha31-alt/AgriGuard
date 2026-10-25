import os
import json

KNOWLEDGE_BASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "pesticide_knowledge.json"
)

def load_pesticide_knowledge():
    """Load pesticide knowledge base JSON."""
    if os.path.exists(KNOWLEDGE_BASE_PATH):
        with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

PESTICIDE_DATA = load_pesticide_knowledge()

def get_pesticide_recommendation(crop, disease, raw_class=None):
    """
    Retrieve disease-specific pesticide & treatment recommendation based on crop and disease.
    """
    # Try exact raw_class key match first (e.g. 'Tomato___Early_Blight')
    if raw_class and raw_class in PESTICIDE_DATA:
        return PESTICIDE_DATA[raw_class]

    # Otherwise search by matching crop and disease strings
    crop_str = str(crop).strip().lower()
    disease_str = str(disease).strip().lower()

    for key, item in PESTICIDE_DATA.items():
        if (item["crop"].lower() in crop_str or crop_str in item["crop"].lower()) and \
           (item["disease"].lower() in disease_str or disease_str in item["disease"].lower()):
            return item

    # Generic fallback if specific entry not found
    return {
        "crop": crop,
        "disease": disease,
        "treatment_category": "Integrated Disease Management & Hygiene",
        "active_ingredient": "Copper-based protective spray / Neem formulation",
        "safety_precautions": "Wear personal protective equipment (gloves, mask, goggles). Do not spray during wind or before rain. Keep out of reach of children.",
        "dosage_guidelines": "Consult local Krishi Vigyan Kendra (KVK) or product label for exact crop dosage.",
        "organic_alternatives": "Neem oil 1500 ppm (5 ml/L), Trichoderma viride bio-control agent, crop rotation, sanitation.",
        "disclaimer": "Always follow product label instructions and local state agricultural university / ICAR extension guidance.",
        "reference_sources": "ICAR Extension Advisory Services, TNAU Agritech Portal"
    }
