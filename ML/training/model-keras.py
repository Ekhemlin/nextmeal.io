"""
Adapted from

https://keras.io/examples/structured_data/structured_data_classification_from_scratch/

"""

import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers
import tensorflowjs as tfjs

"""
## Preparing the data

Let's download the data and load it into a Pandas dataframe:
"""

file_url = "file://localhost/u7/ekhemlin/project/Serverless-Spoon/ML/training/final_recipe_data.csv"
dataframe = pd.read_csv(file_url)

print(dataframe.shape)

print(dataframe)

"""
Here's a preview of a few samples:
"""

dataframe.head()

"""
Let's split the data into a training and validation set:
"""

val_dataframe = dataframe.sample(frac=0.2, random_state=1337)
train_dataframe = dataframe.drop(val_dataframe.index)

print(
    "Using %d samples for training and %d for validation"
    % (len(train_dataframe), len(val_dataframe))
)

"""
Let's generate `tf.data.Dataset` objects for each dataframe:
"""

def dataframe_to_dataset(dataframe):
    dataframe = dataframe.copy()
    labels = dataframe.pop('veryHealthy')
    print("dataframe_to_dataset")
    print("EITAN")
    ds = tf.data.Dataset.from_tensor_slices((dict(dataframe), labels))
    print(ds)
    ds = ds.shuffle(buffer_size=len(dataframe))
    print(ds)
    return ds


train_ds = dataframe_to_dataset(train_dataframe)
val_ds = dataframe_to_dataset(val_dataframe)

"""
Each `Dataset` yields a tuple `(input, target)` where `input` is a dictionary of features
and `target` is the value `0` or `1`:
"""

for x, y in train_ds.take(1):
    print("Input:", x)
    print("Target:", y)

"""
Let's batch the datasets:
"""

train_ds = train_ds.batch(32)
val_ds = val_ds.batch(32)


from tensorflow.keras.layers.experimental.preprocessing import IntegerLookup
from tensorflow.keras.layers.experimental.preprocessing import Normalization
from tensorflow.keras.layers.experimental.preprocessing import StringLookup

def encode_numerical_feature(feature, name, dataset):
    # Create a Normalization layer for our feature
    normalizer = Normalization()

    # Prepare a Dataset that only yields our feature
    feature_ds = dataset.map(lambda x, y: x[name])
    feature_ds = feature_ds.map(lambda x: tf.expand_dims(x, -1))

    # Learn the statistics of the data
    normalizer.adapt(feature_ds)

    # Normalize the input feature
    encoded_feature = normalizer(feature)
    return encoded_feature


def encode_categorical_feature(feature, name, dataset, is_string):
    lookup_class = StringLookup if is_string else IntegerLookup
    # Create a lookup layer which will turn strings into integer indices
    lookup = lookup_class(output_mode="binary")

    # Prepare a Dataset that only yields our feature
    feature_ds = dataset.map(lambda x, y: x[name])
    feature_ds = feature_ds.map(lambda x: tf.expand_dims(x, -1))

    # Learn the set of possible string values and assign them a fixed integer index
    lookup.adapt(feature_ds)

    # Turn the string input into integer indices
    encoded_feature = lookup(feature)
    return encoded_feature


"""
## Build a model

With this done, we can create our end-to-end model:
"""


isHealthy = keras.Input(shape=(1,), name="veryHealthy", dtype="int64")

# # Numerical features
weightPerServing = keras.Input(shape=(1,), name="weightPerServing")
calories = keras.Input(shape=(1,), name="calories")
fat = keras.Input(shape=(1,), name="Fat/g")
carbs = keras.Input(shape=(1,), name="Carbohydrates/g")
chol = keras.Input(shape=(1,), name="Cholesterol/mg")
sodium = keras.Input(shape=(1,), name="Sodium/mg")
protein = keras.Input(shape=(1,), name="Protein/g")

#Food group features
meats = keras.Input(shape=(1,), name="meats")
prepared_meats = keras.Input(shape=(1,), name="prepared-meats")
dairies = keras.Input(shape=(1,), name="dairies")
snacks = keras.Input(shape=(1,), name="snacks")
plant_based = keras.Input(shape=(1,), name="plant-based-foods")
cereal_products = keras.Input(shape=(1,), name="cereals-and-their-products")
legumes = keras.Input(shape=(1,), name="legumes-and-their-products")
fruits = keras.Input(shape=(1,), name="fruits")
culinary_plants = keras.Input(shape=(1,), name="culinary-plants")



all_inputs = [
    protein,sodium,chol,carbs,fat,calories,weightPerServing,meats,prepared_meats,dairies,snacks,plant_based,cereal_products,legumes,fruits,culinary_plants
]

# Numerical features encoded
weightPerServingEncoded = encode_numerical_feature(weightPerServing, "weightPerServing", train_ds)
calories_encoded = encode_numerical_feature(calories, "calories", train_ds)
fat_encoded = encode_numerical_feature(fat, "Fat/g", train_ds)
carbs_encoded = encode_numerical_feature(carbs, "Carbohydrates/g", train_ds)
chol_encoded = encode_numerical_feature(chol, "Cholesterol/mg", train_ds)
sodium_encoded = encode_numerical_feature(sodium, "Sodium/mg", train_ds)
protein_encoded = encode_numerical_feature(protein, "Protein/g", train_ds)

#Food group features encoded 

meats_encoded = encode_numerical_feature(meats, "meats", train_ds)
prepared_meats_encoded = encode_numerical_feature(prepared_meats, "prepared-meats", train_ds)
dairies_encoded = encode_numerical_feature(dairies, "dairies", train_ds)
snacks_encoded = encode_numerical_feature(snacks, "snacks", train_ds)
plant_based_encoded = encode_numerical_feature(plant_based, "plant-based-foods", train_ds)
cereal_encoded = encode_numerical_feature(cereal_products, "cereals-and-their-products", train_ds)
legumes_encoded = encode_numerical_feature(legumes, "legumes-and-their-products", train_ds)
fruits_encoded = encode_numerical_feature(fruits, "fruits", train_ds)
culinary_plants_encoded = encode_numerical_feature(culinary_plants, "culinary-plants", train_ds)



all_features = layers.concatenate(
    [
        weightPerServingEncoded,
        calories_encoded,
        fat_encoded,
        carbs_encoded,
        chol_encoded,
        sodium_encoded,
        protein_encoded,
        meats_encoded,
        prepared_meats_encoded,
        dairies_encoded,
        snacks_encoded,
        plant_based_encoded,
        cereal_encoded,
        legumes_encoded,
        fruits_encoded,
        culinary_plants_encoded
    ]
)


x = layers.Dense(32, activation="relu")(all_features)
x = layers.Dropout(0.5)(x)
output = layers.Dense(1, activation="sigmoid")(x)
model = keras.Model(all_inputs, output)
model.compile("adam", "binary_crossentropy", metrics=["accuracy"])

"""
Let's visualize our connectivity graph:
"""

# `rankdir='LR'` is to make the graph horizontal.
keras.utils.plot_model(model, show_shapes=True, rankdir="LR")

"""
## Train the model
"""

model.fit(train_ds, epochs=50, validation_data=val_ds)


"""
## Inference on new data

To get a prediction for a new sample, you can simply call `model.predict()`. There are
just two things you need to do:

1. wrap scalars into a list so as to have a batch dimension (models only process batches
of data, not single samples)
2. Call `convert_to_tensor` on each feature
"""

sample = {
    "calories": 404,
    "Fat/g": 10,
    "Carbohydrates/g" : 44,
    "Protein/g" : 35,
    "Cholesterol/mg": 80,
    "Sodium/mg" : 707,
    "weightPerServing" : 500,
    "meats" : 0.2,
    "prepared-meats" : 0.0,
    "dairies" : 0.03,
    "snacks" : 0.0,
    "plant-based-foods" : 0.27,
    "cereals-and-their-products" : 0.2,
    "legumes-and-their-products" : 0.1,
    "fruits" : 0.05,
    "culinary-plants" : 0.5
}


input_dict = {name: tf.convert_to_tensor([value]) for name, value in sample.items()}
predictions = model.predict(input_dict)

print(
    "This recipe has a %.1f percent probability "
    "of being healthy according to the model" % (100 * predictions[0][0],)
)

# tfjs.converters.save_keras_model(model, "./")

model_json = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(model_json)