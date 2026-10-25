import json
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

MODEL_PATH = "backend/models/disease_model.keras"
CLASS_PATH = "backend/models/disease_class_indices.json"
IMAGE_PATH = "test_leaf.jpg"

# Load model
model = load_model(MODEL_PATH)

# Load class mapping
with open(CLASS_PATH, "r") as f:
    class_indices = json.load(f)

# Load and prepare image
image = Image.open(IMAGE_PATH).convert("RGB")
image = image.resize((224, 224))

image_array = np.array(image, dtype=np.float32)
image_array = np.expand_dims(image_array, axis=0)

# Predict
predictions = model.predict(image_array, verbose=0)

predicted_index = int(np.argmax(predictions[0]))
confidence = float(predictions[0][predicted_index]) * 100

predicted_class = class_indices[str(predicted_index)]

# Split crop and disease
crop, disease = predicted_class.split("___", 1)

crop = crop.replace("_", " ")
disease = disease.replace("_", " ")

print("\n==============================")
print("AGRIGUARD DISEASE PREDICTION")
print("==============================")
print(f"Crop       : {crop}")
print(f"Disease    : {disease}")
print(f"Confidence : {confidence:.2f}%")
print("==============================")