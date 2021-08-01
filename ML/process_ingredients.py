#script to add food group vector to recipe_data
from csv import writer
from csv import reader
import openfoodfacts

def getFoodGroupVector(ingredients):
  foodgroups = ['en:meats', 'en:prepared-meats', 'en:dairies', 'en:snacks', 'en:plant-based-foods',
  'en:cereals-and-potatoes', 'en:cereals-and-their-products', 'en:legumes-and-their-products','en:fruits', 'en:culinary-plants'] 
  food_group_dictionary = {}
  for group in foodgroups:
    food_group_dictionary[group] = 0

  # print(food_group_dictionary)

  for ingridient in ingredients:
    # print(ingridient['name'])
    search_result = openfoodfacts.products.advanced_search({
      "search_terms": ingridient,
      "sort_by":"unique_scans_n",
    "json" : 1
    })
    # print("searching for ingridient " + ingridient)
    # print(search_result)
    if(len(search_result['products'])==0):
        print("search for ingredient " + ingridient + " returned empty")
        continue
    ingridient_categories = search_result['products'][0]['categories_hierarchy']
    num_categories = len(ingridient_categories)
    for i in range(len(ingridient_categories)): #maybe cap at first 5 categories? 
      ingridient_category = ingridient_categories[i]
      if ingridient_category in food_group_dictionary:
        food_group_dictionary[ingridient_category]+=num_categories-i+1 #make sure last category gets assigned one point 
  # print(food_group_dictionary)

  #normalizing vector 
  food_group_vector = list(food_group_dictionary.values())
  food_group_sum = 0 
  for value in food_group_vector:
    food_group_sum+=value 
  for i in range(len(food_group_vector)):
    food_group_vector[i] = float(food_group_vector[i])/ food_group_sum
  print(food_group_vector) 
  return(food_group_vector)

# with open('recipe_data2.csv') as csv_file:
#     csv_reader = csv.reader(csv_file, delimiter=',')
#     line_count = 0
#     for row in csv_reader:
#         if line_count == 0:
#             line_count += 1
#         else:
#             ingredients = row[2]
#             ingredients_list = ingredients.split(',')
#             print(ingredients_list)
#             line_count += 1
#             break
 

 
 
with open('recipe_data2.csv', 'r') as read_obj, \
        open('processed_recipe_data.csv', 'w', newline='') as write_obj:
    # Create a csv.reader object from the input file object
    csv_reader = reader(read_obj)
    # Create a csv.writer object from the output file object
    csv_writer = writer(write_obj)
    # Read each row of the input csv file as list
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
        else:        
            ingredients = row[2]
            ingredients_list = ingredients.split(',')
            print(ingredients_list)
            foodGroupVector = getFoodGroupVector(ingredients_list)
            vectorStr = ""
            for val in foodGroupVector:
                vectorStr += str(round(val, 3)) + ','
            row.append(vectorStr)
            csv_writer.writerow(row)
            line_count+=1