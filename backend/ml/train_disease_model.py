import os
import json
import argparse
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint


# =========================
# CONFIGURATION
# =========================

DEFAULT_DATASET = r"D:\CollegeProjects\AgriGuard_Master_Dataset"

MODEL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models"
)

MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.keras")
CLASS_INDEX_PATH = os.path.join(
    MODEL_DIR,
    "disease_class_indices.json"
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42
VALIDATION_SPLIT = 0.20


# =========================
# ARGUMENTS
# =========================

parser = argparse.ArgumentParser()

parser.add_argument(
    "--dataset",
    default=DEFAULT_DATASET,
    help="Path to disease dataset"
)

parser.add_argument(
    "--epochs",
    type=int,
    default=8,
    help="Number of training epochs"
)

args = parser.parse_args()

DATASET_DIR = args.dataset


# =========================
# CHECK DATASET
# =========================

if not os.path.exists(DATASET_DIR):
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_DIR}"
    )

print("\n======================================")
print(" AGRIGUARD DISEASE MODEL TRAINING")
print("======================================")
print(f"Dataset : {DATASET_DIR}")
print(f"Epochs  : {args.epochs}")
print("======================================\n")


# =========================
# LOAD DATASET
# =========================

print("Loading dataset...")

train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_dataset.class_names
num_classes = len(class_names)

print(f"\nNumber of classes: {num_classes}")

for i, class_name in enumerate(class_names):
    print(f"{i}: {class_name}")


# =========================
# SAVE CLASS MAPPING
# =========================

os.makedirs(MODEL_DIR, exist_ok=True)

class_indices = {
    str(i): class_name
    for i, class_name in enumerate(class_names)
}

with open(CLASS_INDEX_PATH, "w", encoding="utf-8") as f:
    json.dump(
        class_indices,
        f,
        indent=2,
        ensure_ascii=False
    )

print(
    f"\nClass mapping saved to:\n{CLASS_INDEX_PATH}"
)


# =========================
# PERFORMANCE
# =========================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    AUTOTUNE
)

validation_dataset = validation_dataset.prefetch(
    AUTOTUNE
)


# =========================
# DATA AUGMENTATION
# =========================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
], name="data_augmentation")


# =========================
# EFFICIENTNETB0
# =========================

print("\nLoading EfficientNetB0...")

base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(224, 224, 3)
)

base_model.trainable = False


# =========================
# BUILD MODEL
# =========================

inputs = layers.Input(
    shape=(224, 224, 3)
)

x = data_augmentation(inputs)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    num_classes,
    activation="softmax"
)(x)

model = models.Model(
    inputs,
    outputs
)


# =========================
# COMPILE
# =========================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()


# =========================
# CALLBACKS
# =========================

callbacks = [

    EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True
    ),

    ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True
    )
]


# =========================
# TRAIN
# =========================

print("\n======================================")
print("STARTING TRAINING")
print("======================================\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=args.epochs,
    callbacks=callbacks
)


# =========================
# FINAL RESULTS
# =========================

best_val_accuracy = max(
    history.history["val_accuracy"]
)

best_train_accuracy = max(
    history.history["accuracy"]
)

print("\n======================================")
print("TRAINING COMPLETED")
print("======================================")

print(
    f"Best training accuracy   : "
    f"{best_train_accuracy * 100:.2f}%"
)

print(
    f"Best validation accuracy : "
    f"{best_val_accuracy * 100:.2f}%"
)

print(
    f"\nModel saved to:\n{MODEL_PATH}"
)

print(
    f"\nClass mapping saved to:\n"
    f"{CLASS_INDEX_PATH}"
)

print("\n======================================")
print("AGRIGUARD MODEL READY")
print("======================================")