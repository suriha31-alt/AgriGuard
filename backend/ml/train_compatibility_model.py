import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "soil_climate.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "soil_compatibility_model.pkl"
)

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading soil-climate dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset rows: {len(df)}")
print(f"Dataset columns: {list(df.columns)}")


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

FEATURES = [
    "Crop_Type",
    "Soil_Type",
    "Farm_Size_Acres",
    "Irrigation_Available",
    "Soil_pH",
    "Soil_Nitrogen",
    "Soil_Organic_Matter",
    "Temperature",
    "Rainfall",
    "Humidity"
]

TARGET = "Compatible"

X = df[FEATURES]
y = df[TARGET]


# --------------------------------------------------
# CATEGORICAL / NUMERICAL FEATURES
# --------------------------------------------------

CATEGORICAL_FEATURES = [
    "Crop_Type",
    "Soil_Type"
]

NUMERICAL_FEATURES = [
    "Farm_Size_Acres",
    "Irrigation_Available",
    "Soil_pH",
    "Soil_Nitrogen",
    "Soil_Organic_Matter",
    "Temperature",
    "Rainfall",
    "Humidity"
]


# --------------------------------------------------
# PREPROCESSING
# --------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            CATEGORICAL_FEATURES
        ),
        (
            "numerical",
            "passthrough",
            NUMERICAL_FEATURES
        )
    ]
)


# --------------------------------------------------
# MODEL
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)


# --------------------------------------------------
# PIPELINE
# --------------------------------------------------

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# --------------------------------------------------
# TRAIN / TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# --------------------------------------------------
# TRAIN
# --------------------------------------------------

print("Training compatibility model...")

pipeline.fit(
    X_train,
    y_train
)


# --------------------------------------------------
# EVALUATION
# --------------------------------------------------

predictions = pipeline.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n================================")
print("COMPATIBILITY MODEL RESULTS")
print("================================")

print(f"Accuracy: {accuracy:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions
    )
)


# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------

joblib.dump(
    {
        "model": pipeline,
        "features": FEATURES
    },
    MODEL_PATH
)

print("\nModel saved successfully:")
print(MODEL_PATH)