from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
import numpy as np
import cv2

app = FastAPI()

# Build OCT encoder matching train_oct.py
def build_oct_encoder():
    base = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(224,224,3)
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=(224,224,3), name="oct")
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(4, activation="softmax", dtype="float32")(x)
    return tf.keras.Model(inputs, outputs)

# Build MRI encoder matching train_mri.py
def build_mri_encoder():
    base = tf.keras.applications.DenseNet121(
        include_top=False,
        weights="imagenet",
        input_shape=(224,224,3)
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=(224,224,3), name="mri")
    x = tf.keras.applications.densenet.preprocess_input(inputs)
    x = base(x)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(512, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    outputs = tf.keras.layers.Dense(4, activation="softmax")(x)
    return tf.keras.Model(inputs, outputs)

# Rebuild fusion model and load encoder weights
oct_model = build_oct_encoder()
oct_model.load_weights(r"E:/Models/models/oct_encoder.h5")

mri_model = build_mri_encoder()
mri_model.load_weights(r"E:/Models/models/mri_encoder.h5")

oct_feat = tf.keras.Model(oct_model.input, oct_model.layers[-3].output)
mri_feat = tf.keras.Model(mri_model.input, mri_model.layers[-3].output)

oct_input = tf.keras.Input((224,224,3), name="oct")
mri_input = tf.keras.Input((224,224,3), name="mri")

o = oct_feat(oct_input)
m = mri_feat(mri_input)

x = tf.keras.layers.Concatenate()([o, m])
x = tf.keras.layers.Dense(512, activation="relu")(x)
x = tf.keras.layers.Dropout(0.4)(x)
x = tf.keras.layers.Dense(128, activation="relu")(x)
out = tf.keras.layers.Dense(4, activation="softmax")(x)

model = tf.keras.Model([oct_input, mri_input], out)

model.load_weights(r"E:/Models/models/fusion_model_weights.h5")

@app.get("/")
def read_root():
    return {"status": "running", "message": "Fusion inference server is ready."}

def preprocess(img):
    img = cv2.resize(img, (224,224))
    img = img / 255.0
    return np.expand_dims(img, 0)

@app.post("/predict/")
async def predict(oct: UploadFile = File(...), mri: UploadFile = File(...)):
    oct_img = cv2.imdecode(np.frombuffer(await oct.read(), np.uint8), 1)
    mri_img = cv2.imdecode(np.frombuffer(await mri.read(), np.uint8), 1)

    pred = model.predict([preprocess(oct_img), preprocess(mri_img)])
    return {"prediction": int(np.argmax(pred))}