import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

AUTOTUNE = tf.data.AUTOTUNE

# =========================
# MIXED PRECISION
# =========================
def enable_mixed_precision():
    from tensorflow.keras import mixed_precision
    mixed_precision.set_global_policy("mixed_float16")

# =========================
# DATA LOADER
# =========================
def load_dataset(path, img_size=(224,224), batch_size=32):
    ds = tf.keras.utils.image_dataset_from_directory(
        path,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="categorical"
    )
    return ds.cache().shuffle(1000).prefetch(AUTOTUNE)

# =========================
# AUGMENTATION
# =========================
def get_augmentation():
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
        tf.keras.layers.RandomContrast(0.1),
    ])

# =========================
# PLOTS
# =========================
def plot_training(history, name):
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title(name)
    plt.legend(['train','val'])
    plt.show()

# =========================
# EVALUATION
# =========================
def evaluate_model(model, ds, class_names):
    y_true, y_pred = [], []

    for x, y in ds:
        preds = model.predict(x)
        y_true.extend(np.argmax(y, axis=1))
        y_pred.extend(np.argmax(preds, axis=1))

    print(confusion_matrix(y_true, y_pred))
    print(classification_report(y_true, y_pred, target_names=class_names))