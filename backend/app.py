from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from backend.services.pesticide_recommendation_service import (
    get_pesticide_recommendation
)
from backend.database import (
    get_db_connection,
    save_disease_progress,
    get_disease_progress
)
from PIL import Image

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

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "disease_model.keras"
)

CLASS_PATH = os.path.join(
    BASE_DIR,
    "models",
    "disease_class_indices.json"
)


# =========================================================
# LOAD AI MODEL
# =========================================================

model = load_model(MODEL_PATH)


# =========================================================
# LOAD DISEASE CLASS MAPPING
# =========================================================

with open(
    CLASS_PATH,
    "r",
    encoding="utf-8"
) as f:

    class_indices = json.load(f)


# =========================================================
# DISEASE PROGRESS REQUEST MODEL
# =========================================================

class DiseaseProgressRequest(BaseModel):

    crop: str

    disease: str

    severity: str

    farmer_notes: str = ""

    location: str = ""

    # New MySQL-supported observation date
    observation_date: Optional[date] = None

    # Supports the existing frontend if it sends "date"
    date: Optional[date] = None


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():

    return {
        "message":
        "AgriGuard Disease Detection API is running"
    }


# =========================================================
# DISEASE PREDICTION API
# =========================================================

@app.post("/api/disease/predict")
async def predict_disease(
    file: UploadFile = File(...)
):

    # -----------------------------------------------------
    # CHECK FILE TYPE
    # -----------------------------------------------------

    if (
        not file.content_type
        or not file.content_type.startswith("image/")
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    try:

        # -------------------------------------------------
        # READ IMAGE
        # -------------------------------------------------

        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")


        # -------------------------------------------------
        # RESIZE IMAGE
        # -------------------------------------------------

        image = image.resize(
            (224, 224)
        )


        # -------------------------------------------------
        # CONVERT IMAGE TO NUMPY
        # -------------------------------------------------

        image_array = np.array(
            image,
            dtype=np.float32
        )

        image_array = np.expand_dims(
            image_array,
            axis=0
        )


        # -------------------------------------------------
        # AI PREDICTION
        # -------------------------------------------------

        predictions = model.predict(
            image_array,
            verbose=0
        )


        predicted_index = int(
            np.argmax(predictions[0])
        )


        confidence = (
            float(
                predictions[0][predicted_index]
            ) * 100
        )


        # -------------------------------------------------
        # GET PREDICTED CLASS
        # -------------------------------------------------

        predicted_class = class_indices[
            str(predicted_index)
        ]


        # -------------------------------------------------
        # SEPARATE CROP AND DISEASE
        # -------------------------------------------------

        crop, disease = predicted_class.split(
            "___",
            1
        )


        crop = crop.replace(
            "_",
            " "
        )

        disease = disease.replace(
            "_",
            " "
        )


        # -------------------------------------------------
        # GET DISEASE-SPECIFIC TREATMENT
        # -------------------------------------------------

        recommendation = get_pesticide_recommendation(
            crop=crop,
            disease=disease,
            raw_class=predicted_class
        )


        # -------------------------------------------------
        # RETURN RESULT
        # -------------------------------------------------

        return {

            "success": True,

            "crop": crop,

            "disease": disease,

            "confidence": round(
                confidence,
                2
            ),

            "pesticide_recommendation":
                recommendation
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# =========================================================
# SAVE DISEASE PROGRESS TO MYSQL
# =========================================================

@app.post("/api/disease/progress")
async def save_disease_progress_api(
    progress: DiseaseProgressRequest
):

    try:

        # -------------------------------------------------
        # SELECT OBSERVATION DATE
        # -------------------------------------------------
        # Supports both:
        # observation_date
        # date
        #
        # If neither is supplied, today's date is used.

        observation_date = (
            progress.observation_date
            or progress.date
            or datetime.now().date()
        )


        # -------------------------------------------------
        # SAVE TO MYSQL
        # -------------------------------------------------

        record_id = save_disease_progress(

            crop=progress.crop,

            disease=progress.disease,

            severity=progress.severity,

            observation_date=observation_date,

            farmer_notes=progress.farmer_notes,

            location=progress.location
        )


        # -------------------------------------------------
        # CHECK DATABASE RESULT
        # -------------------------------------------------

        if record_id is None:

            raise HTTPException(
                status_code=500,
                detail="Failed to save disease progress to MySQL."
            )


        # -------------------------------------------------
        # RETURN SUCCESS
        # -------------------------------------------------

        new_record = {

            "id": record_id,

            "crop": progress.crop,

            "disease": progress.disease,

            "severity": progress.severity,

            "observation_date":
                observation_date.isoformat(),

            "farmer_notes":
                progress.farmer_notes,

            "location":
                progress.location
        }


        return {

            "success": True,

            "message":
                "Disease progress record saved successfully.",

            "data":
                new_record
        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save progress: "
                f"{str(e)}"
            )
        )


# =========================================================
# GET DISEASE PROGRESS HISTORY FROM MYSQL
# =========================================================

@app.get("/api/disease/progress")
async def get_disease_progress_api():

    try:

        logs = get_disease_progress()


        # -------------------------------------------------
        # CONVERT MYSQL DATE/DATETIME OBJECTS TO JSON
        # -------------------------------------------------

        for log in logs:

            if isinstance(
                log.get("observation_date"),
                date
            ):

                log["observation_date"] = (
                    log["observation_date"].isoformat()
                )


            if isinstance(
                log.get("created_at"),
                datetime
            ):

                log["created_at"] = (
                    log["created_at"].strftime(
                        "%Y-%m-%d %H:%M"
                    )
                )


        return {

            "success": True,

            "data": logs
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load progress records: "
                f"{str(e)}"
            )
        )


# =========================================================
# AGRIGUARD ALERTS API
# =========================================================
#
# Alerts are now generated from MySQL disease_progress
# records instead of the JSON file.
#
# =========================================================

@app.get("/api/alerts")
async def get_agriguard_alerts():

    try:

        # -------------------------------------------------
        # LOAD PROGRESS RECORDS FROM MYSQL
        # -------------------------------------------------

        logs = get_disease_progress()

        alerts = []


        # =================================================
        # 1. DETECT REPEATED DISEASE REPORTS
        # =================================================

        disease_groups = {}


        for log in logs:

            crop = str(
                log.get(
                    "crop",
                    ""
                )
            ).strip()


            disease = str(
                log.get(
                    "disease",
                    ""
                )
            ).strip()


            # Ignore incomplete records

            if not crop or not disease:

                continue


            # Create grouping key

            key = (
                f"{crop.lower()}|||"
                f"{disease.lower()}"
            )


            if key not in disease_groups:

                disease_groups[key] = {

                    "crop": crop,

                    "disease": disease,

                    "location":
                        log.get(
                            "location",
                            ""
                        ),

                    "count": 0
                }


            disease_groups[key]["count"] += 1


        # =================================================
        # CREATE REPEATED DISEASE ALERTS
        # =================================================

        alert_id = 1


        for item in disease_groups.values():

            if item["count"] >= 2:

                alerts.append({

                    "id": alert_id,

                    "type":
                        "Repeated Disease Pattern",

                    "severity":
                        "High",

                    "crop":
                        item["crop"],

                    "disease":
                        item["disease"],

                    "location":
                        item["location"],

                    "report_count":
                        item["count"],

                    "message": (
                        f"Repeated "
                        f"{item['disease']} reports "
                        f"detected for "
                        f"{item['crop']}. "
                        f"{item['count']} observations "
                        f"have been recorded."
                    )
                })


                alert_id += 1


        # =================================================
        # 2. DETECT SEVERE DISEASE OBSERVATIONS
        # =================================================

        for log in logs:

            severity = str(
                log.get(
                    "severity",
                    ""
                )
            ).strip().lower()


            if severity == "severe":

                alerts.append({

                    "id": alert_id,

                    "type":
                        "Severe Disease Observation",

                    "severity":
                        "Critical",

                    "crop":
                        log.get(
                            "crop",
                            ""
                        ),

                    "disease":
                        log.get(
                            "disease",
                            ""
                        ),

                    "location":
                        log.get(
                            "location",
                            ""
                        ),

                    "report_count": 1,

                    "message": (
                        "Severe disease condition "
                        "recorded for "
                        f"{log.get('crop', '')} - "
                        f"{log.get('disease', '')}."
                    )
                })


                alert_id += 1


        # =================================================
        # RETURN ALERT RESULTS
        # =================================================

        return {

            "success": True,

            "data": alerts,

            "total_alerts":
                len(alerts),

            "notice": (
                "These are automated AgriGuard "
                "pattern warnings based on "
                "recorded observations and are "
                "not official government advisories."
            )
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate alerts: "
                f"{str(e)}"
            )
        )