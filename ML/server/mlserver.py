from flask import Flask, json
from flask import request
import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers

api = Flask(__name__)

@api.route('/predict', methods=['GET'])
def makePrediction():
  model = keras.models.load_model('./')

  calories = request.args.get('calories') 
  carbs = request.args.get('carbs')
  fat = request.args.get('fat')
  protein = request.args.get('protein')
  chol = request.args.get('chol')
  sodium = request.args.get('sodium')
  servingWeight = request.args.get('servingWeight') 

  meats = request.args.get('meats') 
  prepared_meats = request.args.get('prepared_meats') 
  dairies = request.args.get('dairies') 
  snacks = request.args.get('snacks') 
  plant_based = request.args.get('plant_based') 
  cereal_products = request.args.get('cereal_products') 
  legumes = request.args.get('legumes') 
  fruits = request.args.get('fruits') 
  culinary_plants = request.args.get('culinary_plants') 


  sample = {
    "calories": float(calories),
    "Fat/g": float(fat),
    "Carbohydrates/g" : float(carbs),
    "Protein/g" : float(protein),
    "Cholesterol/mg": float(chol),
    "Sodium/mg" : float(sodium),
    "weightPerServing" : float(servingWeight),
    "meats" : float(meats),
    "prepared-meats" : float(prepared_meats),
    "dairies" : float(dairies),
    "snacks" : float(snacks),
    "plant-based-foods" : float(plant_based),
    "cereals-and-their-products" : float(cereal_products),
    "legumes-and-their-products" : float(legumes),
    "fruits" : float(fruits),
    "culinary-plants" : float(culinary_plants)
  }

  input_dict = {name: tf.convert_to_tensor([value]) for name, value in sample.items()}
  predictions = model.predict(input_dict)

  print(
        "This recipe has a %.1f percent probability "
        "of being healthy according to the model" % (100 * predictions[0][0],))

  return json.dumps([{"percent" : (100 * predictions[0][0],)}])


if __name__ == '__main__':
    api.run(host= '0.0.0.0')