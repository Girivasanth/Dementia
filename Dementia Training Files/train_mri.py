import tensorflow as tf
import numpy as np
import os
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

from utils import *
# enable_mixed_precision()  # Disabled: causes JSON serialization errors during model checkpointing

raw_train = tf.keras.utils.image_dataset_from_directory(
    r"E:/Models/dataset/mri/train",
    image_size=(224,224),
    batch_size=8,
    label_mode="categorical"
)

raw_val = tf.keras.utils.image_dataset_from_directory(
    r"E:/Models/dataset/mri/val",
    image_size=(224,224),
    batch_size=8,
    label_mode="categorical"
)

# ✅ SAVE CLASS NAMES BEFORE PREFETCH
CLASS_NAMES = raw_train.class_names

# now optimize pipeline
train = raw_train.cache().shuffle(1000).prefetch(tf.data.AUTOTUNE)
val = raw_val.cache().prefetch(tf.data.AUTOTUNE)

# =========================
# FOCAL LOSS
# =========================
def focal_loss(gamma=2., alpha=0.25):
    def loss(y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0)
        ce = tf.keras.losses.categorical_crossentropy(y_true, y_pred)
        pt = tf.reduce_sum(y_true * y_pred, axis=-1)
        return alpha * tf.pow((1-pt), gamma) * ce
    return loss

# =========================
# MODEL
# =========================
base = tf.keras.applications.DenseNet121(
    include_top=False,
    input_shape=(224,224,3),
    weights="imagenet"
)
base.trainable = False

inputs = tf.keras.Input((224,224,3))
x = tf.keras.applications.densenet.preprocess_input(inputs)
x = base(x)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dense(512, activation="relu")(x)
x = tf.keras.layers.Dropout(0.4)(x)
outputs = tf.keras.layers.Dense(4, activation="softmax")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss=focal_loss(),
    metrics=[
        "accuracy",
        tf.keras.metrics.Precision(name="precision"),
        tf.keras.metrics.Recall(name="recall"),
        tf.keras.metrics.AUC(name="auc")
    ]
)

# =========================
# CALLBACKS
# =========================
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        r"E:/Models/models/mri_encoder.h5",
        save_best_only=True,
        monitor="val_accuracy",
        save_weights_only=True
    ),
    tf.keras.callbacks.EarlyStopping(patience=6, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.3)
]

# =========================
# TRAIN
# =========================
history = model.fit(train, validation_data=val, epochs=25, callbacks=callbacks)

model.save_weights(r"E:/Models/models/mri_encoder.h5")

# =========================
# CREATE OUTPUT FOLDER
# =========================
plot_dir = r"E:/Models/outputs/plots"
os.makedirs(plot_dir, exist_ok=True)

# =========================
# PLOT FUNCTION
# =========================
def save_plot(history, metric, path):
    plt.figure()
    plt.plot(history.history[metric])
    plt.plot(history.history["val_" + metric])
    plt.title(metric.upper())
    plt.xlabel("Epoch")
    plt.ylabel(metric)
    plt.legend(["train", "val"])
    plt.savefig(path)
    plt.close()

# =========================
# SAVE ALL METRIC GRAPHS
# =========================
save_plot(history, "accuracy", f"{plot_dir}/mri_accuracy.png")
save_plot(history, "loss", f"{plot_dir}/mri_loss.png")
save_plot(history, "precision", f"{plot_dir}/mri_precision.png")
save_plot(history, "recall", f"{plot_dir}/mri_recall.png")
save_plot(history, "auc", f"{plot_dir}/mri_auc.png")