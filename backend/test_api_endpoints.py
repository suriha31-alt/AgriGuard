import os
import sys
import io
import json
from PIL import Image

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_all():
    print("--- Testing AgriGuard FastAPI Endpoints ---")

    # 1. Test Root
    res = client.get("/")
    assert res.status_code == 200
    print("1. Root Endpoint GET /: OK", res.json())

    # 2. Test Image Upload Predict
    # Create sample RGB image in memory
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
    data = {"notes": "Test leaf with brown spots"}
    res = client.post("/api/disease/predict", files=files, data=data)
    assert res.status_code == 200
    pred_data = res.json()
    print("2. Disease Predict POST /api/disease/predict: OK", json.dumps(pred_data, indent=2))
    assert "crop" in pred_data
    assert "disease" in pred_data
    assert "confidence" in pred_data
    assert "pesticide_recommendation" in pred_data

    # 3. Test Pesticide Recommendation Endpoint
    res = client.post("/api/pesticide/recommend", json={"crop": "Tomato", "disease": "Early Blight"})
    assert res.status_code == 200
    pesticide_data = res.json()
    print("3. Pesticide Recommend POST /api/pesticide/recommend: OK", json.dumps(pesticide_data, indent=2))

    # 4. Test Disease Progress Log
    res = client.post("/api/disease/progress", json={
        "crop": "Tomato",
        "disease": "Early Blight",
        "severity": "Moderate",
        "farmer_notes": "First observation in Block A"
    })
    assert res.status_code == 200
    print("4. Save Disease Progress POST /api/disease/progress: OK", res.json())

    # Save second progress record to trigger pattern alert
    res2 = client.post("/api/disease/progress", json={
        "crop": "Tomato",
        "disease": "Early Blight",
        "severity": "Severe",
        "farmer_notes": "Second observation, spreading to adjacent rows"
    })
    assert res2.status_code == 200
    print("4b. Save Second Progress Log: OK", res2.json())

    # 5. Test Get Progress Logs
    res = client.get("/api/disease/progress")
    assert res.status_code == 200
    logs = res.json()
    print("5. Get Progress GET /api/disease/progress: OK", f"Total logs: {logs.get('count')}")

    # 6. Test AgriGuard System Alerts
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    print("6. Get Alerts GET /api/alerts: OK", json.dumps(alerts, indent=2))

    # 7. Test Weather Endpoint
    res = client.get("/api/weather?lat=11.0168&lon=76.9558")
    assert res.status_code == 200
    weather = res.json()
    print("7. Get Weather GET /api/weather: OK", json.dumps(weather, indent=2))

    print("\n=== ALL ENDPOINTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_all()

