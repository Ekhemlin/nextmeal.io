import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers


model = keras.models.load_model('./')

sample = {
    "calories": 404,
    "Fat/g": 10,
    "Carbohydrates/g" : 44,
    "Protein/g" : 35,
    "Cholesterol/mg": 80,
    "Sodium/mg" : 707,
    "weightPerServing" : 500
}

input_dict = {name: tf.convert_to_tensor([value]) for name, value in sample.items()}
predictions = model.predict(input_dict)
print(
    "This recipe has a %.1f percent probability "
    "of being healthy according to the model" % (100 * predictions[0][0],)
)
