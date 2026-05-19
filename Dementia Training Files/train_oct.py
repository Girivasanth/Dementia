import tensorflow as tf
import os
import matplotlib.pyplot as plt

from utils import *

# ======================================================
# GPU + MIXED PRECISION
# ======================================================
gpus = tf.config.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

# mixed_precision causes JSON serialization errors during model checkpointing
# from tensorflow.keras import mixed_precision
# mixed_precision.set_global_policy("mixed_float16")

# ======================================================
# CONFIG
# ======================================================
IMG_SIZE = (224, 224)
BATCH = 8

TRAIN_PATH = r"E:/Models/dataset/oct/train"
VAL_PATH   = r"E:/Models/dataset/oct/val"

MODEL_PATH = r"E:/Models/models/oct_encoder"
PLOT_DIR = r"E:/Models/outputs/plots"

os.makedirs(PLOT_DIR, exist_ok=True)

# ======================================================
# DATA
# ======================================================
raw_train = tf.keras.utils.image_dataset_from_directory(
    TRAIN_PATH,
    image_size=IMG_SIZE,
    batch_size=BATCH,
    label_mode="categorical"
)

raw_val = tf.keras.utils.image_dataset_from_directory(
    VAL_PATH,
    image_size=IMG_SIZE,
    batch_size=BATCH,
    label_mode="categorical"
)

CLASS_NAMES = raw_train.class_names
print("Classes:", CLASS_NAMES)

AUTOTUNE = tf.data.AUTOTUNE

def augment(x, y):
    x = tf.image.random_flip_left_right(x)
    x = tf.image.random_brightness(x, 0.1)
    x = tf.image.random_contrast(x, 0.9, 1.1)
    x = tf.cast(x, tf.float32)
    return x, y

train = raw_train.map(augment).prefetch(AUTOTUNE)
val = raw_val.prefetch(AUTOTUNE)

# ======================================================
# MODEL
# ======================================================
base = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(224,224,3)
)
base.trainable = False

inputs = tf.keras.Input(shape=(224,224,3))
x = tf.keras.applications.efficientnet.preprocess_input(inputs)
x = base(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dense(128, activation="relu")(x)
x = tf.keras.layers.Dropout(0.3)(x)

# IMPORTANT: force float32 output
outputs = tf.keras.layers.Dense(4, activation="softmax", dtype="float32")(x)

model = tf.keras.Model(inputs, outputs)

# ======================================================
# COMPILE (NO COMPLEX METRICS)
# ======================================================
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss="categorical_crossentropy",
    metrics=[tf.keras.metrics.CategoricalAccuracy(name="accuracy")]
)

# ======================================================
# CALLBACKS (SAVE WEIGHTS ONLY TO AVOID JSON SERIALIZATION)
# ======================================================
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH + "_weights.h5",
        monitor="val_accuracy",
        save_best_only=True,
        save_weights_only=True
    )
]
# ======================================================
# TRAIN
# ======================================================
history = model.fit(
    train,
    validation_data=val,
    epochs=5,
    callbacks=callbacks
)

# 1. WEIGHTS ONLY (avoid JSON serialization error with SavedModel format)
model.save_weights("E:/Models/models/oct_encoder.h5")

# 2. BACKUP
model.save_weights("E:/Models/models/oct_weights.h5")

# ======================================================
# PLOTS (SAFE - NO JSON INVOLVED)
# ======================================================
def save_plot(metric):
    plt.figure()
    plt.plot(history.history[metric])
    plt.plot(history.history["val_" + metric])
    plt.title(metric)
    plt.legend(["train", "val"])
    plt.grid()
    plt.savefig(f"{PLOT_DIR}/{metric}.png")
    plt.close()

save_plot("accuracy")
save_plot("loss")

print("Training complete without JSON/TensorBoard issues.")