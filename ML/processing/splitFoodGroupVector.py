from csv import writer
from csv import reader
import openfoodfacts
import numpy

foodgroups = ['en:meats', 'en:prepared-meats', 'en:dairies', 'en:snacks', 'en:plant-based-foods',
  'en:cereals-and-potatoes', 'en:cereals-and-their-products', 'en:legumes-and-their-products','en:fruits', 'en:culinary-plants'] 

with open('processed_recipe_data.csv', 'r') as read_obj, \
        open('final_recipe_data.csv', 'w', newline='') as write_obj:
    # Create a csv.reader object from the input file object
    csv_reader = reader(read_obj)
    # Create a csv.writer object from the output file object
    csv_writer = writer(write_obj)
    # Read each row of the input csv file as list
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            for foodGroup in foodgroups:
                foodGroupStr = foodGroup.split(":")[1]
                row.append(foodGroupStr)
            del row[9]
        else:
            print(line_count)
            del row[8] #Fixing issue with duplicate commas between col8 and 9        
            foodGroupVector = row[9].split(",")
            del foodGroupVector[-1] # Fixing issue with extra comma ta the end of vector
            for i in foodGroupVector:
                row.append(i)
            del row[9]      #remove food group vector   
        csv_writer.writerow(row)
        line_count+=1


