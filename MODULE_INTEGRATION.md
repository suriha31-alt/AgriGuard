# AgriGuard - AI Crop Disease Detection & Pesticide Recommendation Module

## 📌 Module Overview
This module provides an AI-powered Crop Disease Diagnosis and Disease-Specific Treatment Recommendation system for the **AgriGuard** college team application.

It supports **7 crops** and **35 total disease/healthy classes** represented in the master dataset:
- **Rice** (Bacterial Leaf Blight, Brown Spot, Healthy, Leaf Blast, Leaf Scald, Sheath Blight)
- **Banana** (Healthy, Panama Disease, Yellow/Black Sigatoka)
- **Cotton** (Bacterial Blight, Curl Virus, Fusarium Wilt, Healthy)
- **Eggplant/Brinjal** (Healthy, Insect Pest, Leaf Spot, Mosaic Virus, Small Leaf, White Mold, Wilt)
- **Bell Pepper** (Bacterial Spot, Healthy)
- **Potato** (Early Blight, Healthy, Late Blight)
- **Tomato** (Bacterial Spot, Early Blight, Healthy, Late Blight, Leaf Mold, Mosaic Virus, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus)

---

## 🚀 Key Features

1. **AI Disease Detection**: Image classification using EfficientNetB0 Keras transfer learning.
2. **Standardized Prediction Structure**:
   ```json
   {
     "crop": "Tomato",
     "disease": "Early Blight",
     "confidence": 91.25
   }
   ```
3. **Disease-Specific Pesticide & Treatment Recommendations**:
   - Active ingredient (e.g., Copper Oxychloride, Mancozeb, Imidacloprid, Streptocycline)
   - Treatment category
   - Safety precautions & pre-harvest interval (PHI)
   - Product label compliance warning
   - Sustainable/organic/biological alternatives (e.g., *Trichoderma viride*, *Pseudomonas fluorescens*, Neem oil)
   - Source references (ICAR, TNAU Agritech)
4. **Bilingual Support (Tamil & English)**: Complete UI and follow-up translation.
5. **Web Speech API Voice-to-Text**: Voice input in Tamil (`ta-IN`) and English (`en-IN`).
6. **Rule-Based Clarification Questions**: Tailored questions to help farmers evaluate severity and spread.
7. **Disease Progress Tracking**: Log observations (date, crop, disease, severity, notes).
8. **AgriGuard System Alerts**: Automated pattern warning triggered on repeated disease reports (labeled as AgriGuard system alerts, NOT official government advisories).
9. **Weather & Spraying Advisory Integration**: Open-Meteo weather integration for pesticide application safety.

---

## 📂 Architecture & File Structure

```
AgriGuard/
├── backend/
│   ├── app.py                         # Main FastAPI REST API server (Port 8000)
│   ├── server.js                      # Express server proxying /api/disease, /api/pesticide, /api/alerts (Port 5000)
│   ├── db.py                          # MySQL connection handler with SQLite fallback
│   ├── data/
│   │   └── pesticide_knowledge.json   # Knowledge base for all 35 disease classes
│   ├── ml/
│   │   ├── train_disease_model.py     # EfficientNetB0 Keras training pipeline
│   │   └── disease_predict.py         # AI inference & preprocessing service
│   ├── services/
│   │   ├── clarification_service.py   # Rule-based farmer follow-up questions
│   │   ├── pesticide_recommendation_service.py # Treatment advisory lookup
│   │   └── weather_service.py         # Open-Meteo weather & spraying advisory
│   └── scripts/
│       └── schema.sql                 # MySQL schema DDL script
├── frontend/
│   ├── src/
│   │   ├── components/disease/
│   │   │   ├── DiseaseDetection.jsx   # Image upload & voice input component
│   │   │   ├── DiseaseResult.jsx      # Diagnosis & clarification UI
│   │   │   ├── PesticideRecommendation.jsx # Treatment & safety advisory UI
│   │   │   ├── DiseaseProgress.jsx    # Observation logging & history timeline
│   │   │   └── AgriGuardAlerts.jsx    # Automated pattern system alerts UI
│   │   ├── pages/
│   │   │   └── DiseaseDashboard.jsx   # Master Disease Module page view
│   │   ├── services/
│   │   │   └── diseaseApi.js          # API client for disease backend
│   │   └── utils/
│   │       └── speechRecognition.js   # Web Speech API voice-to-text helper
```

---

## 🛠️ Environment Variables & Configurable Paths

Create or update `.env` in `backend/`:

```env
# Dataset Path (Do NOT hardcode in production logic)
DATASET_PATH=D:\CollegeProjects\AgriGuard_Master_Dataset

# Model Paths
DISEASE_MODEL_PATH=backend/models/disease_model.keras
CLASS_INDICES_PATH=backend/models/disease_class_indices.json

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=agriguard_db

# Port Configuration
PORT=5000
FASTAPI_URL=http://127.0.0.1:8000
```

---

## 🗄️ Database Tables (MySQL)

Execute `backend/scripts/schema.sql` to initialize MySQL:

1. `disease_records`: Stores raw image predictions (`id`, `crop`, `disease`, `confidence`, `image_filename`, `farmer_notes`, `created_at`).
2. `disease_progress`: Stores farmer observations (`id`, `crop`, `disease`, `severity`, `farmer_notes`, `location`, `created_at`).
3. `alerts`: Stores system pattern alerts (`id`, `crop`, `disease`, `alert_level`, `message`, `occurrence_count`, `is_acknowledged`, `created_at`).
4. `pesticide_knowledge`: Knowledge base table for offline/database lookups.

*(Note: `backend/db.py` automatically falls back to an embedded SQLite database if MySQL server is not running locally).*

---

## 📡 REST API Endpoints

### 1. `POST /api/disease/predict`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (image file), `notes` (optional text)
- **Response**:
  ```json
  {
    "success": true,
    "crop": "Tomato",
    "disease": "Early Blight",
    "confidence": 91.25,
    "raw_class": "Tomato___Early_Blight",
    "is_healthy": false,
    "pesticide_recommendation": {
      "treatment_category": "Fungicide Spray",
      "active_ingredient": "Mancozeb 75% WP / Chlorothalonil",
      "safety_precautions": "Wear personal protective equipment (mask, gloves). Observe 7-day PHI.",
      "organic_alternatives": "Mulching soil to prevent spore splash, pruning lower foliage, Neem oil 1%.",
      "disclaimer": "Follow product label instructions and local agricultural guidance."
    },
    "clarification_questions": [...]
  }
  ```

### 2. `POST /api/pesticide/recommend`
- **Body**: `{"crop": "Tomato", "disease": "Early Blight"}`

### 3. `POST /api/disease/progress`
- **Body**: `{"crop": "Tomato", "disease": "Early Blight", "severity": "Moderate", "farmer_notes": "Spreading on Block A"}`

### 4. `GET /api/disease/progress`
- Returns previous observation records.

### 5. `GET /api/alerts`
- Returns AgriGuard system alerts generated on repeated occurrences.

### 6. `GET /api/weather`
- **Query Params**: `lat=11.0168&lon=76.9558`
- Returns Open-Meteo weather and pesticide spraying suitability.

---

## 💻 How Teammates Can Run & Test

### 1. Install Dependencies
```bash
# Python backend virtual environment
.venv\Scripts\python.exe -m pip install -r requirements.txt

# Node frontend dependencies
cd frontend
npm install
```

### 2. Run Model Training (Optional / Quick Mode)
```bash
.venv\Scripts\python.exe backend/ml/train_disease_model.py --quick
```

### 3. Start Backend Servers
```bash
# Start FastAPI Server (Port 8000)
.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

# Start Node Express Proxy Server (Port 5000)
cd backend
npm start
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Run Backend Verification Test Suite
```bash
.venv\Scripts\python.exe backend/test_api_endpoints.py
```
