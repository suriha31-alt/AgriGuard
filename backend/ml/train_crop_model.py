import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "crop_recommendation.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "crop_recommendation_model.pkl"
)


# --------------------------------------------------
# CREATE MODEL DIRECTORY
# --------------------------------------------------

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# LOAD DATASET
# --------------------------------------------------

print("Loading dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset rows: {len(df)}")
print(f"Dataset columns: {list(df.columns)}")


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

TARGET = "label"


X = df[FEATURES]
y = df[TARGET]


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
# MODEL
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)


print("Training model...")

model.fit(X_train, y_train)


# --------------------------------------------------
# EVALUATION
# --------------------------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n================================")
print("CROP MODEL RESULTS")
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
# FEATURE IMPORTANCE
# --------------------------------------------------

print("\nFeature Importance:")

for feature, importance in zip(
    FEATURES,
    model.feature_importances_
):
    print(
        f"{feature}: {importance:.4f}"
    )


# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "classes": list(model.classes_)
    },
    MODEL_PATH
)


print("\nModel saved successfully:")
print(MODEL_PATH)