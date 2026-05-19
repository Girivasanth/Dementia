import tensorflow as tf

# Build OCT encoder (EfficientNetB0)
def build_oct_encoder():
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
    outputs = tf.keras.layers.Dense(4, activation="softmax", dtype="float32")(x)
    
    return tf.keras.Model(inputs, outputs)

# Build MRI encoder (DenseNet121)
def build_mri_encoder():
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
    
    return tf.keras.Model(inputs, outputs)

oct_model = build_oct_encoder()
oct_model.load_weights(r"E:/Models/models/oct_encoder.h5")

mri_model = build_mri_encoder()
mri_model.load_weights(r"E:/Models/models/mri_encoder.h5")

oct_feat = tf.keras.Model(oct_model.input, oct_model.layers[-3].output)
mri_feat = tf.keras.Model(mri_model.input, mri_model.layers[-3].output)

oct_input = tf.keras.Input((224,224,3))
mri_input = tf.keras.Input((224,224,3))

o = oct_feat(oct_input)
m = mri_feat(mri_input)

x = tf.keras.layers.Concatenate()([o, m])
x = tf.keras.layers.Dense(512, activation="relu")(x)
x = tf.keras.layers.Dropout(0.4)(x)
x = tf.keras.layers.Dense(128, activation="relu")(x)
out = tf.keras.layers.Dense(4, activation="softmax")(x)

fusion = tf.keras.Model([oct_input, mri_input], out)

fusion.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

fusion.save_weights(r"E:/Models/models/fusion_model_weights.h5")