# Serverless-Spoon ML 

A Keras model for predicting a health score for a recipe given its nutritional and ingredient information. 

## Getting Started

The projet is divided into 3 directories: 

- `processing` contains scripts needed to turn the recipe's ingredient data into normalized food group scores
- `training` contains the script and data to train the Keras model  
- `server` contains the code to load and deploy the model on an HTTP server


### Requirements: 

To build and run the project, you need to have python3, Tensorflow, and Keras installed.   


### Quick Setup instructions: 

- Clone the repository.  
- `cd Serverless-spoon/ML`
- run `python3 keras-model.py`
- The model will be trained and then saved in the directory as saved_model.pb. A diagram will be available in model.png
- run `python3 mlserver.py`
- The server will accept requests on port 5000

### Setup instructions from scratch 

- inside `processing`, run `python3 process_ingredients.py`. This script looks up every ingredient in the recipe dataset on the OpenFoodFacts API, so it should take 4-5 hours to run.
- Run `python3 splitFoodGroupVector.py`. This should result in the creation of the file `final_recipe_data.csv`. 
- Move `final_recipe_data.csv` to the `training/` directory, and follow the quick setup instructions above. 



