\
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from backend.services.pesticide_recommendation_service import (
    get_pesticide_recommendation,
)
from backend.database import (
    get_db_connection,
    save_disease_progress,
    get_disease_progress,
)
from PIL import Image, UnidentifiedImageError

import numpy as np
import json
import io
import os


# =========================================================
# AGRIGUARD FASTAPI APPLICATION
# =========================================================

app = FastAPI(title="AgriGuard API")


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# FILE PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "disease_model.keras",
)

CLASS_PATH = os.path.join(
    BASE_DIR,
    "models",
    "disease_class_indices.json",
)


# =========================================================
# LOAD AI MODEL SAFELY
# =========================================================

model = None

if os.path.isfile(MODEL_PATH):
    try:
        model = load_model(MODEL_PATH)
        print("Disease model loaded successfully.")
    except Exception as exc:
        print(f"WARNING: Failed to load disease model: {exc}")
        print("Disease prediction is unavailable.")
else:
    print(f"WARNING: Disease model not found: {MODEL_PATH}")
    print("Disease prediction is unavailable until a trained model is installed.")


# =========================================================
# LOAD DISEASE CLASS MAPPING
# =========================================================

class_indices = {}

if os.path.isfile(CLASS_PATH):
    try:
        with open(CLASS_PATH, "r", encoding="utf-8") as f:
            class_indices = json.load(f)

        if not isinstance(class_indices, dict):
            raise ValueError("Disease class mapping must be a JSON object.")

    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"WARNING: Failed to load disease class mapping: {exc}")
else:
    print(f"WARNING: Disease class mapping not found: {CLASS_PATH}")


# =========================================================
# DISEASE PROGRESS REQUEST MODEL
# =========================================================

class DiseaseProgressRequest(BaseModel):
    crop: str
    disease: str
    severity: str
    farmer_notes: str = ""
    location: str = ""

    # Supports both observation_date and date from the frontend.
    observation_date: Optional[date] = None
    date: Optional[date] = None


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "AgriGuard Disease Detection API is running",
        "disease_model_available": model is not None,
    }


# =========================================================
# DISEASE PREDICTION API
# =========================================================

@app.post("/api/disease/predict")
async def predict_disease(file: UploadFile = File(...)):

    # Do not attempt predictions without a trained model.
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Disease prediction is unavailable because the trained "
                "disease model is missing or could not be loaded."
            ),
        )

    if not class_indices:
        raise HTTPException(
            status_code=503,
            detail="Disease class mapping is missing or invalid.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file.",
        )

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded image is empty.",
            )

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except (UnidentifiedImageError, OSError):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid image.",
            )

        # Resize to the model's expected input dimensions.
        image = image.resize((224, 224))

        image_array = np.asarray(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)

        # The preprocessing must match the training script.
        predictions = model.predict(image_array, verbose=0)

        if (
            predictions.ndim != 2
            or predictions.shape[0] != 1
            or predictions.shape[1] == 0
        ):
            raise ValueError("The model returned an invalid prediction shape.")

        predicted_index = int(np.argmax(predictions[0]))

        predicted_class = class_indices.get(str(predicted_index))

        if not isinstance(predicted_class, str):
            raise ValueError(
                f"No disease class mapping exists for index {predicted_index}."
            )

        if "___" not in predicted_class:
            raise ValueError(
                f"Invalid disease class format: {predicted_class}"
            )

        crop, disease = predicted_class.split("___", 1)
        crop = crop.replace("_", " ")
        disease = disease.replace("_", " ")

        confidence = float(predictions[0][predicted_index]) * 100

        recommendation = get_pesticide_recommendation(
            crop=crop,
            disease=disease,
            raw_class=predicted_class,
        )

        return {
            "success": True,
            "crop": crop,
            "disease": disease,
            "confidence": round(confidence, 2),
            "pesticide_recommendation": recommendation,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        ) from exc

    finally:
        await file.close()


# =========================================================
# SAVE DISEASE PROGRESS TO MYSQL
# =========================================================

@app.post("/api/disease/progress")
async def save_disease_progress_api(
    progress: DiseaseProgressRequest,
):
    observation_date = (
        progress.observation_date
        or progress.date
        or datetime.now().date()
    )

    try:
        record_id = save_disease_progress(
            crop=progress.crop,
            disease=progress.disease,
            severity=progress.severity,
            observation_date=observation_date,
            farmer_notes=progress.farmer_notes,
            location=progress.location,
        )

        if record_id is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to save disease progress to MySQL.",
            )

        new_record = {
            "id": record_id,
            "crop": progress.crop,
            "disease": progress.disease,
            "severity": progress.severity,
            "observation_date": observation_date.isoformat(),
            "farmer_notes": progress.farmer_notes,
            "location": progress.location,
        }

        return {
            "success": True,
            "message": "Disease progress record saved successfully.",
            "data": new_record,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save progress: {str(exc)}",
        ) from exc


# =========================================================
# GET DISEASE PROGRESS HISTORY FROM MYSQL
# =========================================================

@app.get("/api/disease/progress")
async def get_disease_progress_api():
    try:
        logs = get_disease_progress()

        for log in logs:
            if isinstance(log.get("observation_date"), (date, datetime)):
                log["observation_date"] = (
                    log["observation_date"].isoformat()
                )

            if isinstance(log.get("created_at"), datetime):
                log["created_at"] = log["created_at"].strftime(
                    "%Y-%m-%d %H:%M"
                )

        return {
            "success": True,
            "data": logs,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load progress records: {str(exc)}",
        ) from exc


# =========================================================
# AGRIGUARD ALERTS API
# =========================================================

@app.get("/api/alerts")
async def get_agriguard_alerts():
    try:
        logs = get_disease_progress()
        alerts = []
        disease_groups = {}

        # Detect repeated disease reports.
        for log in logs:
            crop = str(log.get("crop") or "").strip()
            disease = str(log.get("disease") or "").strip()

            if not crop or not disease:
                continue

            key = (crop.lower(), disease.lower())

            if key not in disease_groups:
                disease_groups[key] = {
                    "crop": crop,
                    "disease": disease,
                    "location": log.get("location") or "",
                    "count": 0,
                }

            disease_groups[key]["count"] += 1

        alert_id = 1

        for item in disease_groups.values():
            if item["count"] >= 2:
                alerts.append({
                    "id": alert_id,
                    "type": "Repeated Disease Pattern",
                    "severity": "High",
                    "crop": item["crop"],
                    "disease": item["disease"],
                    "location": item["location"],
                    "report_count": item["count"],
                    "message": (
                        f"Repeated {item['disease']} reports detected "
                        f"for {item['crop']}. {item['count']} observations "
                        "have been recorded."
                    ),
                })

                alert_id += 1

        # Detect severe disease observations.
        for log in logs:
            severity = str(log.get("severity") or "").strip().lower()

            if severity == "severe":
                alerts.append({
                    "id": alert_id,
                    "type": "Severe Disease Observation",
                    "severity": "Critical",
                    "crop": log.get("crop") or "",
                    "disease": log.get("disease") or "",
                    "location": log.get("location") or "",
                    "report_count": 1,
                    "message": (
                        "Severe disease condition recorded for "
                        f"{log.get('crop', '')} - "
                        f"{log.get('disease', '')}."
                    ),
                })

                alert_id += 1

        return {
            "success": True,
            "data": alerts,
            "total_alerts": len(alerts),
            "notice": (
                "These are automated AgriGuard pattern warnings based on "
                "recorded observations and are not official government "
                "advisories."
            ),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate alerts: {str(exc)}",
        ) from exc
